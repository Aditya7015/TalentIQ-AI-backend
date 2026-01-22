const Job = require("../models/Job");
const Application = require("../models/Application");

// KEEP ALL EXISTING FUNCTIONS EXACTLY AS THEY ARE
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
    const jobs = await Job.find({ status: "active" }).populate("companyId", "name");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "companyId",
      "name"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ NEW FUNCTIONS ADDED BELOW ============

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["active", "paused", "closed", "draft"];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: id,
        companyId: req.user.companyId,
      },
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      success: true,
      data: job,
      message: `Job ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Also delete related applications
    await Application.deleteMany({ jobId: id });

    await job.deleteOne();

    res.json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job details
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skills, experience, location } = req.body;

    const job = await Job.findOneAndUpdate(
      {
        _id: id,
        companyId: req.user.companyId,
      },
      {
        title,
        description,
        skills,
        experience,
        location,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      success: true,
      data: job,
      message: "Job updated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job by ID for editing
exports.getJobForEdit = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job statistics
exports.getJobStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    const totalJobs = await Job.countDocuments({ companyId });
    const activeJobs = await Job.countDocuments({ companyId, status: "active" });
    const pausedJobs = await Job.countDocuments({ companyId, status: "paused" });
    const draftJobs = await Job.countDocuments({ companyId, status: "draft" });
    const closedJobs = await Job.countDocuments({ companyId, status: "closed" });
    
    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        pausedJobs,
        draftJobs,
        closedJobs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};