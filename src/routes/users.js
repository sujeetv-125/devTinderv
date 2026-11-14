const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../auth");
const { scoreCompatibility } = require("../utils/matchingService");

const userRouter = express.Router();
const SAFE_USER_FIELDS = "firstName lastName photoUrl about skills skillsWanted lookingFor availability preferredProjects";

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

    const interactions = await ConnectionRequest.find({
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    }).select("fromUserId toUserId").lean();

    const excludedIds = new Set([req.user._id.toString()]);
    for (const interaction of interactions) {
      excludedIds.add(interaction.fromUserId.toString());
      excludedIds.add(interaction.toUserId.toString());
    }

    const query = {
      _id: { $nin: [...excludedIds].map((id) => new mongoose.Types.ObjectId(id)) },
    };

    if (typeof req.query.skill === "string" && req.query.skill.trim()) {
      query.skills = req.query.skill.trim();
    }
    if (typeof req.query.lookingFor === "string" && req.query.lookingFor.trim()) {
      query.lookingFor = req.query.lookingFor.trim();
    }
    if (typeof req.query.availability === "string" && req.query.availability.trim()) {
      query.availability = req.query.availability.trim();
    }

    const candidates = await User.find(query)
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    const ranked = candidates
      .map((candidate) => ({ ...candidate, ...scoreCompatibility(req.user, candidate) }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const total = ranked.length;
    const data = ranked.slice((page - 1) * limit, page * limit);

    return res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

userRouter.delete("/users", userAuth, async (req, res) => {
  try {
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    });
    await User.findByIdAndDelete(req.user._id);

    return res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    }).json({ message: "Account and its connection activity deleted." });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to delete account right now." });
  }
});

module.exports = userRouter;
