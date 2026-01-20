const express = require("express");
const { 
  createCompany, 
  getCompany,
  getMyCompany,
  updateCompany,
  deleteCompany 
} = require("../controllers/companyController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// All routes require authentication and recruiter role
router.use(protect);
router.use(authorize("recruiter"));

// Get current user's company
router.get("/my-company", getMyCompany);

// Create company
router.post("/", createCompany);

// Get, update, delete specific company
router.get("/:id", getCompany);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

module.exports = router;