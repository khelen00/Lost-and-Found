
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must contain at least 2 characters."],
      maxlength: [100, "Title cannot exceed 100 characters."],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Category must contain at least 2 characters."],
      maxlength: [50, "Category cannot exceed 50 characters."],
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Location must contain at least 2 characters."],
      maxlength: [150, "Location cannot exceed 150 characters."],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Description must contain at least 5 characters."],
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Lost", "Found"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Searching", "Pending verification", "Resolved"],
      default: "Searching",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
