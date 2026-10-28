const jwt = require("jsonwebtoken");
const User = require("./models/user");

// NOTE: must be the exact same secret used in userSchema.methods.getJWT (models/user.js)
const JWT_SECRET = "DEV@tinder#123";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login");
    }

    const decodedObj = jwt.verify(token, JWT_SECRET);
    const { _id } = decodedObj;

    // never load the password hash into req.user
    const user = await User.findById(_id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user; // makes the user available to the route handlers
    next();
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = {
  userAuth,
};