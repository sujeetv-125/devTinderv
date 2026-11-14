const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { userAuth } = require("../auth");
const { validateProfileUpdates } = require("../utils/validations");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, (req, res) => {
  return res.json({ user: req.user });
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileUpdates(req.body);
    const user = req.user;
    for (const [field, value] of Object.entries(req.body)) {
      user[field] = Array.isArray(value)
        ? value.map((item) => item.trim())
        : typeof value === "string" ? value.trim() : value;
    }
    await user.save();
    return res.json({ message: "Profile updated successfully.", user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }
    if (!(await bcrypt.compare(currentPassword, req.user.password))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "New password does not meet the strength requirements." });
    }

    req.user.password = await bcrypt.hash(newPassword, 12);
    req.user.passwordChangedAt = new Date();
    await req.user.save();
    return res.json({ message: "Password changed. Log in again to start a new session." });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to change password right now." });
  }
});

module.exports = profileRouter;
