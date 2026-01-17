const { extractTextFromPDF } = require("../utils/resumeParser");
const { calculateMatchScore } = require("../utils/resumeMatcher");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const Job = require("../models/Job");

exports.analyzeResume = async (application) => {
  const resumeText = await extractTextFromPDF(application.resumeUrl);

  const job = await Job.findById(application.jobId);

  const matchScore = calculateMatchScore(
    resumeText,
    job.description
  );

  await ResumeAnalysis.create({
    applicationId: application._id,
    resumeText,
    jobText: job.description,
    matchScore,
  });
};