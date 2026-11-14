const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const requestRouter = express.Router();
const SEND_STATUSES = ["interested", "ignored"];
const REVIEW_STATUSES = ["accepted", "rejected"];
const SAFE_USER_FIELDS = "firstName lastName photoUrl about skills skillsWanted lookingFor availability preferredProjects";

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id;
    if (!SEND_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be interested or ignored." });
    }
    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "Invalid developer ID." });
    }
    if (fromUserId.equals(toUserId)) {
      return res.status(400).json({ message: "You cannot connect with yourself." });
    }

    const recipient = await User.findById(toUserId).select("_id firstName");
    if (!recipient) return res.status(404).json({ message: "Developer not found." });

    const existing = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    }).lean();
    if (existing) {
      return res.status(409).json({ message: "You have already interacted with this developer." });
    }

    const request = await ConnectionRequest.create({ fromUserId, toUserId, status });
    return res.status(201).json({
      message: status === "interested" ? "Connection request sent." : "Developer skipped.",
      request,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An interaction with this developer already exists." });
    }
    return res.status(400).json({ message: error.message });
  }
});

requestRouter.patch("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be accepted or rejected." });
    }
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await ConnectionRequest.findOneAndUpdate(
      { _id: requestId, toUserId: req.user._id, status: "interested" },
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ message: "Pending request not found." });
    return res.json({ message: "Connection request " + status + ".", request });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

requestRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "interested",
    })
      .populate("fromUserId", SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ data: requests });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load received requests." });
  }
});

requestRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    })
      .populate("fromUserId", SAFE_USER_FIELDS)
      .populate("toUserId", SAFE_USER_FIELDS)
      .sort({ updatedAt: -1 })
      .lean();

    const connections = requests.map((request) =>
      request.fromUserId._id.toString() === req.user._id.toString()
        ? request.toUserId
        : request.fromUserId
    );
    return res.json({ data: connections });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load connections." });
  }
});

module.exports = requestRouter;
