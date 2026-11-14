const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validations");

const authRouter = express.Router();
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req.body);
    const emailId = req.body.emailId.trim().toLowerCase();
    const existingUser = await User.findOne({ emailId }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      firstName: req.body.firstName.trim(),
      lastName: (req.body.lastName || "").trim(),
      emailId,
      password,
    });

    return res.status(201).json({ message: "Your DevBridge account has been created.", user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body || {};
    if (typeof emailId !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ emailId: emailId.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = user.getJWT();
    return res.cookie("token", token, cookieOptions()).json({ message: "Login successful.", user });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to log in right now." });
  }
});

authRouter.post("/logout", (_req, res) => {
  return res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  }).json({ message: "Logged out successfully." });
});

module.exports = authRouter;
