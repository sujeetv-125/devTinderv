const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../auth");

const userRouter = express.Router(); // Router must be called with ()

// only these fields can be changed through PATCH /users
const ALLOWED_UPDATES = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "about",
  "skills",
];

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // only return public fields (never the password hash)
    const users = await User.find({}).select(
      "firstName lastName photoUrl age gender about skills"
    );
    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// deletes the logged-in user's own account
userRouter.delete("/users", userAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie("token");
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// updates the logged-in user's own profile
userRouter.patch("/users", userAuth, async (req, res) => {
  try {
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (!ALLOWED_UPDATES.includes(key)) {
        throw new Error("Update not allowed for field: " + key);
      }
      updates[key] = req.body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true, // run schema validators (age, gender, photoUrl, ...) on updates too
    }).select("-password");

    res.send(updatedUser);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;