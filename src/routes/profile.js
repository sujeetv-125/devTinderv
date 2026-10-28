const express = require("express");
const { userAuth } = require("../auth");

const profileRouter = express.Router();

// userAuth already verifies the token and loads the user into req.user
profileRouter.get("/profile", userAuth, (req, res) => {
  res.send(req.user);
});

module.exports = profileRouter;