const express = require("express");
const { createCompany } = require("../controllers/companyController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("recruiter"),
  createCompany
);

module.exports = router;
