const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  try {
    const { title, description, skills, experience, location } = req.body;

    if (!req.user.companyId) {
      return res.status(400).json({ message: "Create company first" });
    }

    const job = await Job.create({
      title,
      description,
      skills,
      experience,
      location,
      companyId: req.user.companyId,
      createdBy: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      companyId: req.user.companyId,
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "name");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
