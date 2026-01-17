const Application = require("../models/Application");
const Job = require("../models/Job");
const { analyzeResume } = require("../services/aiService");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const {
  jobAppliedEmail,
  newApplicantEmail,
  statusUpdateEmail,
} = require("../services/emailTemplates");



exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      candidateId: req.user._id,
      jobId: job._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      candidateId: req.user._id,
      jobId: job._id,
      companyId: job.companyId,
      resumeUrl: req.file.path,
    });

    const candidate = await User.findById(req.user._id);
    const recruiter = await User.findOne({ companyId: job.companyId });

    // Candidate email
    await sendEmail({
      to: candidate.email,
      ...jobAppliedEmail(job.title),
    });

    // Recruiter email
    if (recruiter) {
      await sendEmail({
        to: recruiter.email,
        ...newApplicantEmail(candidate.name, job.title),
      });
    }

    // Run AI in background
    analyzeResume(application);


    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getJobApplicants = async (req, res) => {
  try {
    const applications = await Application.find({
      jobId: req.params.jobId,
      companyId: req.user.companyId,
    })
      .populate("candidateId", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getApplicationAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      applicationId: req.params.applicationId,
    });

    if (!analysis) {
      return res.json({ message: "Analysis pending" });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "shortlisted",
      "interview",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.applicationId,
        companyId: req.user.companyId,
      },
      { status },
      { new: true }
    );


    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const user = await User.findById(application.candidateId);
    const job = await Job.findById(application.jobId);

    await sendEmail({
      to: user.email,
      ...statusUpdateEmail(job.title, status),
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({
      candidateId: req.user._id,
    }).populate("jobId", "title");

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
