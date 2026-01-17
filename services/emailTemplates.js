exports.welcomeEmail = (name, role) => ({
  subject: "Welcome to TalentIQ AI 🚀",
  html: `
    <h2>Welcome ${name}!</h2>
    <p>Your <b>${role}</b> account has been created successfully.</p>
    <p>Start hiring smarter with <b>TalentIQ AI</b>.</p>
  `,
});

exports.jobAppliedEmail = (jobTitle) => ({
  subject: "Job Application Submitted ✅",
  html: `
    <p>You have successfully applied for <b>${jobTitle}</b>.</p>
    <p>We’ll notify you about updates.</p>
  `,
});

exports.statusUpdateEmail = (jobTitle, status) => ({
  subject: `Application ${status.toUpperCase()} 📢`,
  html: `
    <p>Your application for <b>${jobTitle}</b> is now <b>${status}</b>.</p>
  `,
});

exports.newApplicantEmail = (candidateName, jobTitle) => ({
  subject: "New Job Applicant 👤",
  html: `
    <p><b>${candidateName}</b> applied for <b>${jobTitle}</b>.</p>
    <p>Login to review candidate.</p>
  `,
});
