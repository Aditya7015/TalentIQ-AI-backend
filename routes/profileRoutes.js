const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware"); // Make sure authorize is imported
const { 
  getProfile,
  updateProfile,
  updateSkills,
  updateEducation,
  updateExperience,
  uploadResume,
  uploadProfilePicture,
  getCandidateProfile, // Add this import
  deleteEducation,
  deleteExperience,
  deleteSkill
} = require("../controllers/profileController");

// All routes require authentication
router.use(protect);

// Profile CRUD
router.get("/", getProfile);
router.patch("/", updateProfile);
router.patch("/skills", updateSkills);
router.delete("/skills/:skillId", deleteSkill);
router.patch("/education", updateEducation);
router.delete("/education/:eduId", deleteEducation);
router.patch("/experience", updateExperience);
router.delete("/experience/:expId", deleteExperience);

// NEW: Get candidate profile for recruiter - FIXED SYNTAX
router.get(
  "/candidate/:candidateId",
  authorize("recruiter"), // This should work now
  getCandidateProfile
);

// File uploads - using Cloudinary
const upload = require("../middlewares/uploadMiddleware");
const uploadProfilePictureMiddleware = require("../middlewares/uploadProfilePicture");

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/upload-profile-picture", uploadProfilePictureMiddleware.single("profilePicture"), uploadProfilePicture);

module.exports = router;