// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { 
  getProfile,
  updateProfile,
  updateSkills,
  updateEducation,
  updateExperience,
  uploadResume,
  uploadProfilePicture, // Add this
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

// File uploads - using Cloudinary
const upload = require("../middlewares/uploadMiddleware");
const uploadProfilePictureMiddleware = require("../middlewares/uploadProfilePicture"); // Add this

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/upload-profile-picture", uploadProfilePictureMiddleware.single("profilePicture"), uploadProfilePicture); // Add this

module.exports = router;