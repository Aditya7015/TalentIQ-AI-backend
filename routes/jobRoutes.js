const express = require("express");
const {
  createJob,
  getCompanyJobs,
  getAllJobs,
  getJobById,
  updateJobStatus,
  deleteJob,
  updateJob,
  getJobForEdit,
  getJobStats
} = require("../controllers/jobController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllJobs);

// IMPORTANT: Static routes must come BEFORE dynamic routes
router.get("/company", protect, authorize("recruiter"), getCompanyJobs);
router.get("/company/stats", protect, authorize("recruiter"), getJobStats);

// Dynamic routes come AFTER static routes
router.get("/:id", getJobById);

// Protected recruiter routes
router.post("/", protect, authorize("recruiter"), createJob);

// NEW routes for job management
router.patch("/:id/status", protect, authorize("recruiter"), updateJobStatus);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.get("/:id/edit", protect, authorize("recruiter"), getJobForEdit);

module.exports = router;