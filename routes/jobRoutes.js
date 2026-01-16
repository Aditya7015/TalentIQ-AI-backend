const express = require("express");
const { createJob, getCompanyJobs, getAllJobs, getJobById } = require("../controllers/jobController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("recruiter"),
  createJob
);

router.get(
  "/company",
  protect,
  authorize("recruiter"),
  getCompanyJobs
);

router.get("/", getAllJobs);

// GET SINGLE JOB (FOR DETAILS PAGE)
router.get("/:id", getJobById);


module.exports = router;
