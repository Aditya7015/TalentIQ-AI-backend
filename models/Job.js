const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: [String],
    experience: String,
    location: String,

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW: Status field for job management
    status: {
      type: String,
      enum: ["active", "paused", "closed", "draft"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);