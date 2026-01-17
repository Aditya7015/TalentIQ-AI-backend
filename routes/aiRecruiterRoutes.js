// backend/routes/aiRecruiterRoutes.js
const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

// Import your models
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// SIMPLIFIED MIDDLEWARE - Remove isRecruiter check temporarily
// const isRecruiter = (req, res, next) => {
//   console.log('User role:', req.user?.role); // Add logging
//   if (!req.user || req.user.role !== 'recruiter') {
//     return res.status(403).json({ error: 'Access denied. Recruiters only.' });
//   }
//   next();
// };

// Get AI-generated email templates
router.post('/email-template', async (req, res) => { // Removed isRecruiter middleware
  try {
    console.log('Email template request received:', req.body);
    
    const { applicationId, templateType = 'shortlisted' } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'applicationId is required' });
    }

    const application = await Application.findById(applicationId)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const analysis = await ResumeAnalysis.findOne({ applicationId });

    // Simple prompt for testing
    const prompt = `Generate a professional email for a recruiter to send to a candidate.

Candidate: ${application.candidateId?.name || 'Candidate'}
Position: ${application.jobId?.title || 'the position'}
Email Type: ${templateType}

${analysis ? `AI Match Score: ${analysis.matchScore}%` : ''}

Generate a simple email with subject and body. Return as JSON:
{
  "subject": "Email subject",
  "body": "Email body here",
  "type": "${templateType}"
}`;

    console.log('Sending request to Groq...');
    
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Groq response received');

    let emailTemplate;
    try {
      emailTemplate = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.log('Failed to parse JSON, using default');
      emailTemplate = {
        subject: `Regarding Your Application for ${application.jobId?.title}`,
        body: `Dear ${application.candidateId?.name},\n\nThank you for your application.\n\nBest regards,\nRecruiter`,
        type: templateType
      };
    }

    res.json({
      success: true,
      email: emailTemplate,
      candidate: {
        name: application.candidateId?.name || 'Candidate',
        email: application.candidateId?.email || ''
      }
    });

  } catch (error) {
    console.error('Email template error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate email template',
      details: error.message 
    });
  }
});

// Get AI interview questions for candidate - SIMPLIFIED VERSION
router.post('/interview-questions', async (req, res) => {
  try {
    console.log('Interview questions request received:', req.body);
    
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'applicationId is required' });
    }

    const application = await Application.findById(applicationId)
      .populate('candidateId', 'name')
      .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Simple prompt
    const prompt = `Generate 5 interview questions for ${application.candidateId?.name} applying for ${application.jobId?.title}.
    
    Return as JSON: {
      "candidateName": "${application.candidateId?.name || 'Candidate'}",
      "jobTitle": "${application.jobId?.title || 'Job'}",
      "questions": [
        {"type": "technical", "question": "Question 1", "purpose": "Assess technical skills"},
        {"type": "behavioral", "question": "Question 2", "purpose": "Assess teamwork"}
      ]
    }`;

    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    let questions;
    try {
      questions = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.log('Failed to parse JSON, using default questions');
      questions = {
        candidateName: application.candidateId?.name || 'Candidate',
        jobTitle: application.jobId?.title || 'Job',
        questions: [
          {
            type: "technical",
            question: "What experience do you have with relevant technologies?",
            purpose: "Assess technical skills"
          },
          {
            type: "behavioral",
            question: "Tell me about a time you worked in a team.",
            purpose: "Assess teamwork skills"
          }
        ]
      };
    }

    res.json({
      success: true,
      ...questions
    });

  } catch (error) {
    console.error('Interview questions error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate interview questions',
      details: error.message 
    });
  }
});

// Simple rank candidates
router.post('/rank-candidates', async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email')
      .limit(10); // Limit for testing

    const analyses = await ResumeAnalysis.find({
      applicationId: { $in: applications.map(app => app._id) }
    });

    // Create a simple ranking based on matchScore
    const ranking = applications.map(app => {
      const analysis = analyses.find(a => a.applicationId.toString() === app._id.toString());
      return {
        applicationId: app._id,
        candidateName: app.candidateId?.name || 'Unknown',
        candidateEmail: app.candidateId?.email || '',
        score: analysis?.matchScore || 50,
        rank: 1,
        status: app.status
      };
    });

    // Sort by score
    ranking.sort((a, b) => b.score - a.score);
    
    // Add rank numbers
    ranking.forEach((item, index) => {
      item.rank = index + 1;
    });

    res.json({
      success: true,
      jobTitle: applications[0]?.jobId?.title || 'Job',
      ranking: ranking.slice(0, 5), // Top 5 only
      topCandidate: ranking[0]?.candidateName || 'None',
      totalCandidates: applications.length
    });

  } catch (error) {
    console.error('Ranking error:', error.message);
    res.status(500).json({ 
      error: 'Failed to rank candidates',
      details: error.message 
    });
  }
});

// Simple comparison
router.post('/compare-candidates', async (req, res) => {
  try {
    const { candidateIds } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 candidateIds required' });
    }

    const applications = await Application.find({ _id: { $in: candidateIds } })
      .populate('candidateId', 'name email')
      .limit(5);

    const analyses = await ResumeAnalysis.find({
      applicationId: { $in: candidateIds }
    });

    const comparison = applications.map(app => {
      const analysis = analyses.find(a => a.applicationId.toString() === app._id.toString());
      return {
        candidateId: app._id,
        candidateName: app.candidateId?.name || 'Unknown',
        score: analysis?.matchScore || 50,
        strengths: ['Experience', 'Skills match'],
        weaknesses: ['Could use more specific examples'],
        recommendation: analysis?.matchScore > 70 ? 'Interview' : 'Review'
      };
    });

    res.json({
      success: true,
      comparison,
      summary: `Comparing ${comparison.length} candidates`
    });

  } catch (error) {
    console.error('Comparison error:', error.message);
    res.status(500).json({ 
      error: 'Failed to compare candidates',
      details: error.message 
    });
  }
});

// Simple send email simulation
router.post('/send-email', async (req, res) => {
  try {
    const { applicationId, emailData } = req.body;

    const application = await Application.findById(applicationId)
      .populate('candidateId', 'name email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Simulate success
    res.json({
      success: true,
      message: 'Email would be sent in production',
      simulated: true,
      to: application.candidateId?.email || 'candidate@example.com',
      subject: emailData?.subject || 'No subject',
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send email error:', error.message);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

module.exports = router;