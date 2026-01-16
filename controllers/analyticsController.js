const Job = require("../models/Job");
const Application = require("../models/Application");

exports.recruiterAnalytics = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalJobs = await Job.countDocuments({ companyId });
    const totalApplications = await Application.countDocuments({ companyId });

    const statusStats = await Application.aggregate([
      { $match: { companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      totalJobs,
      totalApplications,
      statusStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const User = require("../models/User");

exports.adminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalCandidates = await User.countDocuments({ role: "candidate" });

    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      totalUsers,
      totalRecruiters,
      totalCandidates,
      totalJobs,
      totalApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
