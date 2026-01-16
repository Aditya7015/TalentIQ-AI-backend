const express = require("express");
const { createJob, getCompanyJobs, getAllJobs } = require("../controllers/jobController");
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


module.exports = router;
