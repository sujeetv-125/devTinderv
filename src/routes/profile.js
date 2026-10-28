const express = require("express");
const { userAuth } = require("../auth");
const {validateEditProfileData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

// userAuth already verifies the token and loads the user into req.user
profileRouter.get("/profile/view", userAuth, (req, res) => {
  try{
    const user = req.user;
    res.send(user); 
  }catch(err){
    res.status(400).send("Error :"+ err.message);
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try{
    if(!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const loggedInUser= req.user;
    Object.keys(req.body).forEach((key)=> (loggedInUser[key]= req.body[key]));
     await loggedInUser.save();

    console.log(loggedInUser);
    res.send("profile updated successfully");
  }catch(err){
    res.status(400).send("Error :"+ err.message);
  }
});
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Check whether both passwords are provided
    if (!currentPassword || !newPassword) {
      throw new Error("Both current and new passwords are required");
    }

    // 2. Get the logged-in user
    const loggedInUser = req.user;

    // 3. Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      loggedInUser.password
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // 4. Validate the new password's strength
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("New password is not strong enough");
    }

    // 5. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update and save the password
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();

    res.send("Password changed successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});


module.exports = profileRouter;