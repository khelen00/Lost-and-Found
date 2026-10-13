
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


const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");

const Notification = require("./Notification");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const uploadDir = path.join(__dirname, "uploads");
const fs = require("fs");

fs.mkdirSync(uploadDir, { recursive: true });

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      callback(
        null,
        `${randomUUID()}${imageExtensions[file.mimetype]}`
      );
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!imageExtensions[file.mimetype]) {
      return callback(
        new Error("Only JPG, PNG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

app.use("/uploads", express.static(uploadDir));

function uploadReportImage(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (error) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller."
          : error.message || "Image upload failed.";

      return res.status(400).json({
        success: false,
        message,
      });
    }

    next();
  });
}


if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET in backend/.env");
  process.exit(1);
}

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Lost & Found API is running",
  });
});

// STUDENT REGISTRATION
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

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password exactly once.
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// STUDENT LOGIN
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

    if (email.trim().length > 254 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password format.",
      });
    }

    // Explicitly retrieve the password hash because User.js
    // excludes this field from ordinary queries.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
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

// GET ALL REPORTS
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

// GET MY REPORTS
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

// CREATE REPORT
app.post("/api/reports",authMiddleware,uploadReportImage,async (req, res) => {
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

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanLocation = location.trim();
    const cleanDescription = description.trim();

    if (
      cleanTitle.length < 2 ||
      cleanTitle.length > 100 ||
      cleanCategory.length < 2 ||
      cleanCategory.length > 50 ||
      cleanLocation.length < 2 ||
      cleanLocation.length > 150 ||
      cleanDescription.length < 5 ||
      cleanDescription.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title must be 2–100 characters, category 2–50, location 2–150, and description 5–2000.",
      });
    }

    // Never accept the report owner from the request body.
    const report = await Report.create({
      title: cleanTitle,
      category: cleanCategory,
      location: cleanLocation,
      description: cleanDescription,
      type,
      userId: req.userId,
      imageUrl: req.file
  ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  : "",
      
    });

    return res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create your report.",
    });
  }
});

// DELETE MY REPORT

app.delete("/api/reports/:id", authMiddleware, async (req, res) => {
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

    // Remove the image associated with this deleted report.
    console.log("Image URL saved in report:", report.imageUrl);
    if (report.imageUrl) {
      try {
        const imagePath = new URL(report.imageUrl).pathname;

        if (imagePath.startsWith("/uploads/")) {
          const filename = path.basename(imagePath);
          const filePath = path.join(uploadDir, filename);
          console.log("Image file path:", filePath);
          console.log("Image file exists:", fs.existsSync(filePath));

          await fs.promises.unlink(filePath).catch((error) => {
            if (error.code !== "ENOENT") {
              throw error;
            }
          });
        }
      } catch (error) {
        console.error("Could not remove report image:", error.message);
      }
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
});


// SUBMIT A CLAIM
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

    const cleanExplanation = explanation.trim();

    if (cleanExplanation.length > 1000) {
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

    if (!report.userId) {
      return res.status(400).json({
        success: false,
        message: "This report has no owner assigned.",
      });
    }

    if (report.userId.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot claim your own report.",
      });
    }

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
      explanation: cleanExplanation,
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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Submit claim error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not submit your claim.",
    });
  }
});

// VIEW MY CLAIMS
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

// VIEW CLAIMS ON MY FOUND REPORTS
app.get("/api/claims/received", authMiddleware, async (req, res) => {
  try {
    const myReports = await Report.find({
      userId: req.userId,
      type: "Found",
    }).select("_id");

    const reportIds = myReports.map((report) => report._id);

    const claims = await Claim.find({
      reportId: { $in: reportIds },
    })
      .populate("reportId")
      .populate("claimantId", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Received claims error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch received claims.",
    });
  }
});

// APPROVE OR REJECT A CLAIM
app.patch("/api/claims/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Approved or Rejected.",
      });
    }

    const claim = await Claim.findById(req.params.id).populate("reportId");

    if (!claim || !claim.reportId) {
      return res.status(404).json({
        success: false,
        message: "Claim or associated report not found.",
      });
    }

    const report = claim.reportId;
    const ownerId = report.userId?.toString();
    const currentUserId = req.userId?.toString();

    if (
      report.type !== "Found" ||
      !ownerId ||
      ownerId !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the owner of this found-item report can review this claim.",
      });
    }

    const updatedClaim = await Claim.findOneAndUpdate(
      {
        _id: claim._id,
        status: "Pending",
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("reportId")
      .populate("claimantId", "name email");

    if (!updatedClaim) {
      return res.status(409).json({
        success: false,
        message: "This claim has already been reviewed.",
      });
    }
    
    try {
      const approved = status === "Approved";

      await Notification.create({
        userId: claim.claimantId,
        claimId: claim._id,
        reportId: report._id,
        type: approved ? "ClaimApproved" : "ClaimRejected",
        message: approved
          ? `Your claim for "${report.title}" has been approved.`
          : `Your claim for "${report.title}" has been rejected.`,
      });
    } catch (notificationError) {
      console.error(
        "Could not create claim notification:",
        notificationError.message
      );
    }


    return res.json({
      success: true,
      message: `Claim ${status.toLowerCase()} successfully.`,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Update claim status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update claim status.",
    });
  }
});

/* NOTIFICATIONS */

// Get notifications for the logged-in student
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
    })
      .populate("reportId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load notifications.",
    });
  }
});

// Mark one of the logged-in student's notifications as read
app.patch(
  "/api/notifications/:id/read",
  authMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID.",
        });
      }

      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId,
        },
        {
          $set: { isRead: true },
        },
        {
          new: true,
        }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.json({
        success: true,
        message: "Notification marked as read.",
        notification,
      });
    } catch (error) {
      console.error("Mark notification read error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not update notification.",
      });
    }
  }
);

// CONNECT TO MONGODB AND START SERVER
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
