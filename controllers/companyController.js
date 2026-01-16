const Company = require("../models/Company");
const User = require("../models/User");

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

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
