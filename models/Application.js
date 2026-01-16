const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "interview"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index(
  { candidateId: 1, jobId: 1 },
  { unique: true }
);


module.exports = mongoose.model("Application", applicationSchema);
