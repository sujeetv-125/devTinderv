const jwt = require("jsonwebtoken");
const User = require("./models/user");

async function userAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: "Authentication required." });
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");

    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: "devbridge-api" });
    const user = await User.findById(payload.sub).select("+password +passwordChangedAt");
    if (!user) return res.status(401).json({ message: "Session is no longer valid." });

    // Changing a password invalidates tokens issued before that change.
    if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({ message: "Your password changed. Please log in again." });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = { userAuth };
