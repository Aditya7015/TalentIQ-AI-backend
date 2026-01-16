const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  applyToJob,
  getJobApplicants,
  getApplicationAnalysis,
  updateApplicationStatus,
  getMyApplications
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Candidate applies to a job
router.post(
  "/apply/:jobId",
  protect,
  authorize("candidate"),
  upload.single("resume"),
  applyToJob
);

// Recruiter views applicants for a job
router.get(
  "/job/:jobId",
  protect,
  authorize("recruiter"),
  getJobApplicants
);

// Recruiter Gets Analysis of the Job Application
router.get(
  "/analysis/:applicationId",
  protect,
  authorize("recruiter"),
  getApplicationAnalysis
);


// Recruiter Updates the Application Status
router.patch(
  "/:applicationId/status",
  protect,
  authorize("recruiter"),
  updateApplicationStatus
);

//get my applications for candidate
router.get(
  "/my",
  protect,
  authorize("candidate"),
  getMyApplications
);


module.exports = router;
