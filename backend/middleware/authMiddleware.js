const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }
    console.log("Received Token:", token);
console.log("JWT Secret:", process.env.JWT_SECRET);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get user details
    req.user = await User.findById(decoded.id).select("-password");

    next();

  } catch (error) {
    res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

module.exports = { protect };