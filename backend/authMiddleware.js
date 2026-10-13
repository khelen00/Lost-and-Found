
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./User");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing.",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      success: false,
      message: "Authentication service is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded ||
      typeof decoded.userId !== "string" ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // Verify that the account still exists in MongoDB.
    const user = await User.findById(decoded.userId)
      .select("_id")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your account no longer exists. Please log in again.",
      });
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired login token.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not verify your account. Please try again.",
    });
  }
}

module.exports = authMiddleware;
