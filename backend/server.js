
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Report = require("./Report");
const Claim = require("./Claim");
const User = require("./User");
const authMiddleware = require("./authMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Check required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET in backend/.env");
  process.exit(1);
}

// ===============================
// HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Lost & Found API is running",
  });
});

// ===============================
// STUDENT REGISTRATION
// ===============================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this  already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// ===============================
// STUDENT LOGIN
// ===============================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ===============================
// GET ALL REPORTS
// ===============================
app.get("/api/reports", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name");

    return res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Fetch reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch reports.",
    });
  }
});

// ===============================
// GET MY REPORTS
// ===============================
app.get("/api/reports/mine", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Fetch my reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch your reports.",
    });
  }
});

// ===============================
// CREATE REPORT
// ===============================
app.post("/api/reports", authMiddleware, async (req, res) => {
  try {
    const { title, category, location, description, type } = req.body;

    if (
      typeof title !== "string" ||
      typeof category !== "string" ||
      typeof location !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !category.trim() ||
      !location.trim() ||
      !description.trim() ||
      !["Lost", "Found"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required report details.",
      });
    }

    const report = await Report.create({
  title: title.trim(),
  category: category.trim(),
  location: location.trim(),
  description: description.trim(),
  type,
  userId: req.userId,
});

    return res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Create report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create report.",
    });
  }
});

// ===============================
// DELETE MY REPORT
// ===============================
app.delete(
  "/api/reports/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report ID.",
        });
      }

      const report = await Report.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found or you do not own this report.",
        });
      }

      return res.json({
        success: true,
        message: "Report deleted successfully.",
      });
    } catch (error) {
      console.error("Delete report error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not delete report.",
      });
    }
  }
);

// ===============================
// SUBMIT A CLAIM
// ===============================
app.post("/api/claims", authMiddleware, async (req, res) => {
  try {
    const { reportId, explanation } = req.body;

    if (
      !mongoose.isValidObjectId(reportId) ||
      typeof explanation !== "string" ||
      !explanation.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid report ID and explanation are required.",
      });
    }

    if (explanation.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Explanation must be 1000 characters or fewer.",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (report.type !== "Found") {
      return res.status(400).json({
        success: false,
        message: "You can only claim an item reported as Found.",
      });
    }

    // Ensure the report has an owner.
    if (!report.userId) {
      return res.status(400).json({
        success: false,
        message:
          "This report has no owner assigned. Please check the report data.",
      });
    }

    // Prevent users from claiming their own reports.
    const reportOwnerId = report.userId.toString();
    const claimantId = req.userId?.toString();

    if (!claimantId) {
      return res.status(401).json({
        success: false,
        message: "Please log in again to submit a claim.",
      });
    }

    if (reportOwnerId === claimantId) {
      return res.status(400).json({
        success: false,
        message: "You cannot claim your own report.",
      });
    }

    // Prevent duplicate claims.
    const existingClaim = await Claim.findOne({
      reportId,
      claimantId: req.userId,
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a claim for this item.",
      });
    }

    const claim = await Claim.create({
      reportId,
      claimantId: req.userId,
      explanation: explanation.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully.",
      claim,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a claim for this item.",
      });
    }

    console.error("Submit claim error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not submit your claim.",
    });
  }
});

// ===============================
// VIEW MY CLAIMS
// ===============================
app.get("/api/claims/mine", authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({
      claimantId: req.userId,
    })
      .populate("reportId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Fetch claims error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch your claims.",
    });
  }
});

// ===============================
// CONNECT TO MONGODB AND START
// ===============================
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB successfully.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
