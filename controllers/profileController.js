// backend/controllers/profileController.js
const User = require("../models/User");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      city,
      state,
      country,
      headline,
      bio,
      skills,
      education,
      experience,
      linkedin,
      github,
      portfolio
    } = req.body;
    
    const updateData = {
      phone,
      address,
      city,
      state,
      country,
      headline,
      bio,
      skills,
      education,
      experience,
      linkedin,
      github,
      portfolio
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    // Calculate profile completion (simple version)
    let completion = 0;
    if (user.name) completion += 10;
    if (user.phone) completion += 10;
    if (user.headline) completion += 10;
    if (user.bio) completion += 10;
    if (user.skills?.length > 0) completion += 20;
    if (user.education?.length > 0) completion += 20;
    if (user.experience?.length > 0) completion += 20;
    
    user.profileCompletion = completion;
    await user.save();
    
    res.json({ 
      message: "Profile updated successfully", 
      user,
      profileCompletion: user.profileCompletion 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update skills only
exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Skills updated", 
      skills: user.skills
    });
  } catch (error) {
    console.error("Update skills error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update education
exports.updateEducation = async (req, res) => {
  try {
    const { education } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { education },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Education updated", 
      education: user.education
    });
  } catch (error) {
    console.error("Update education error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  try {
    const { experience } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { experience },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Experience updated", 
      experience: user.experience
    });
  } catch (error) {
    console.error("Update experience error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.skills = user.skills.filter((_, index) => index !== parseInt(skillId));
    await user.save();
    
    res.json({ 
      message: "Skill deleted", 
      skills: user.skills
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete education
exports.deleteEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.education = user.education.filter((_, index) => index !== parseInt(eduId));
    await user.save();
    
    res.json({ 
      message: "Education deleted", 
      education: user.education
    });
  } catch (error) {
    console.error("Delete education error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const { expId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.experience = user.experience.filter((_, index) => index !== parseInt(expId));
    await user.save();
    
    res.json({ 
      message: "Experience deleted", 
      experience: user.experience
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload resume to Cloudinary
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl: req.file.path },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Resume uploaded successfully", 
      resumeUrl: user.resumeUrl
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Add this function to your EXISTING profileController.js
// AFTER line 120 (after the uploadResume function)

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: req.file.path },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Profile picture uploaded successfully", 
      profilePicture: user.profilePicture 
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Add this function to your profileController.js

// Get candidate profile for recruiter view with both resumes
exports.getCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Verify the recruiter has access to this candidate's data
    const candidate = await User.findById(candidateId).select("-password");
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    // Get the application resume for this specific job
    const Application = require("../models/Application");
    const application = await Application.findOne({
      candidateId: candidateId,
      companyId: req.user.companyId
    });
    
    if (!application) {
      return res.status(403).json({ 
        message: "Access denied. Candidate has not applied to your company's jobs."
      });
    }
    
    // Format the response to include both resumes
    const formattedCandidate = {
      ...candidate._doc,
      location: candidate.city || candidate.state || candidate.country || "Location not specified",
      // Include application resume (resume uploaded during application)
      applicationResumeUrl: application.resumeUrl,
      appliedAt: application.createdAt,
      applicationStatus: application.status,
      // Profile resume is already in candidate.resumeUrl
      hasApplicationResume: !!application.resumeUrl,
      hasProfileResume: !!candidate.resumeUrl
    };
    
    res.json(formattedCandidate);
  } catch (error) {
    console.error("Get candidate profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};