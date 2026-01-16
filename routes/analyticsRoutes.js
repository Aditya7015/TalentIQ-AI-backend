const express = require("express");
const {
  recruiterAnalytics,
  adminAnalytics,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/recruiter",
  protect,
  authorize("recruiter"),
  recruiterAnalytics
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  adminAnalytics
);

module.exports = router;
