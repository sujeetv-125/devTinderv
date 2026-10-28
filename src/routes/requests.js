const express = require("express");
const { userAuth } = require("../auth");

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    console.log("sending a connection request");

    res.send(user.firstName + " sent the connection request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = requestRouter;