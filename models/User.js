// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    
    // ============== ADD THESE PROFILE FIELDS ==============
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    
    // Professional Info
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
      currentlyStudying: Boolean
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      description: String
    }],
    
    // Resume
    resumeUrl: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    
    // Social Links
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    
    // Profile completion
    profileCompletion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);