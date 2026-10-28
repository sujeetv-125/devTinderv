const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validations");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // validate data
    validateSignUpData(req);

    // encrypt the password
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // creating a new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("user added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // must pass the password and await the bcrypt comparison
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days, same as the JWT
      httpOnly: true,
    });

    res.send("login successful");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;