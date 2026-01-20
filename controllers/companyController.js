const Company = require("../models/Company");
const User = require("../models/User");

// Create company
exports.createCompany = async (req, res) => {
  try {
    const { name, website, industry, size } = req.body;

    // Check if recruiter already has a company
    if (req.user.companyId) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const company = await Company.create({
      name,
      website,
      industry,
      size,
      owner: req.user.id,
    });

    // Attach company to recruiter
    await User.findByIdAndUpdate(req.user.id, {
      companyId: company._id,
    });

    // Return both company and user with populated company
    const updatedUser = await User.findById(req.user.id)
      .select("-password")
      .populate("companyId");

    res.status(201).json({
      message: "Company created successfully",
      company,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company by ID
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company by owner (current user's company)
exports.getMyCompany = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(404).json({ message: "No company found" });
    }

    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const { name, website, industry, size } = req.body;

    // Check if user owns this company
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, website, industry, size },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Company updated successfully",
      company: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove company from owner
    await User.findByIdAndUpdate(req.user.id, {
      companyId: null
    });

    await company.deleteOne();

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};