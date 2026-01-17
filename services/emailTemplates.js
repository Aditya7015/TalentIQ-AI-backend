/**
 * TalentIQ AI – NEXT LEVEL EMAIL TEMPLATES
 * Ultra-premium SaaS design
 * Gmail / Outlook / Mobile safe
 */

const baseTemplate = ({ title, preheader, body }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>

<body style="margin:0; padding:0; background:#0f172a; font-family:Arial,Helvetica,sans-serif;">
  <span style="display:none; font-size:1px; color:#0f172a;">
    ${preheader}
  </span>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:50px 0;">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#020617; border-radius:18px; overflow:hidden;
                 box-shadow:0 25px 80px rgba(0,0,0,0.6);">

          <!-- HERO -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#22d3ee);
                       padding:38px; text-align:center;">
              <h1 style="margin:0; font-size:34px; color:#ffffff;">
                TalentIQ AI
              </h1>
              <p style="margin:10px 0 0; color:#e0f2fe; font-size:15px;">
                AI-Powered Hiring • Faster • Smarter • Better
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:38px; color:#e5e7eb;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#020617; padding:24px; text-align:center;
                       font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} TalentIQ AI  
              <br/>
              Smart Hiring. Real Results.
              <br/><br/>
              <span style="font-size:11px;">
                This is an automated email. Do not reply.
              </span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;


// ======================================================
// 🎉 WELCOME EMAIL
// ======================================================
exports.welcomeEmail = (name, role) => ({
  subject: "🚀 Welcome to TalentIQ AI — Your Hiring Upgrade Starts Now",
  html: baseTemplate({
    title: "Welcome to TalentIQ AI",
    preheader: "Your AI-powered hiring journey starts now",
    body: `
      <h2 style="margin-top:0; font-size:26px;">Welcome, ${name} 👋</h2>

      <p style="font-size:16px; line-height:1.6;">
        You’ve officially joined <b>TalentIQ AI</b> as a
        <span style="color:#38bdf8;"><b>${role}</b></span>.
      </p>

      <div style="margin:28px 0; padding:26px;
                  background:rgba(255,255,255,0.05);
                  border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <h3 style="margin:0 0 12px;">⚡ What makes TalentIQ powerful?</h3>
        <ul style="padding-left:18px; margin:0; line-height:1.7;">
          <li>AI resume intelligence</li>
          <li>Instant candidate matching</li>
          <li>Automated shortlisting</li>
          <li>Data-driven hiring decisions</li>
        </ul>
      </div>

      <a href="https://talentiq-ai.vercel.app"
        style="display:inline-block; padding:16px 36px;
               background:#6366f1; color:#ffffff;
               text-decoration:none; border-radius:12px;
               font-weight:bold; font-size:16px;">
        🚀 Launch Dashboard
      </a>

      <p style="margin-top:32px; color:#9ca3af;">
        Let’s build smarter teams together.  
        <br/>— Team TalentIQ AI
      </p>
    `,
  }),
});


// ======================================================
// 🔐 LOGIN ALERT EMAIL (CRAZY SECURITY STYLE)
// ======================================================
exports.loginAlertEmail = (name, location, device) => ({
  subject: "🔐 New Login Detected — Was this you?",
  html: baseTemplate({
    title: "Security Alert",
    preheader: "New login detected on your TalentIQ AI account",
    body: `
      <h2 style="margin-top:0;">🔔 Security Alert</h2>

      <p style="font-size:16px;">
        Hi <b>${name}</b>,  
        We detected a new login to your TalentIQ AI account.
      </p>

      <div style="margin:24px 0; padding:22px;
                  background:#020617; border-radius:14px;
                  border:1px solid #334155;">
        <p style="margin:6px 0;">📍 <b>Location:</b> ${location}</p>
        <p style="margin:6px 0;">💻 <b>Device:</b> ${device}</p>
        <p style="margin:6px 0;">⏰ <b>Time:</b> ${new Date().toLocaleString()}</p>
      </div>

      <p style="color:#9ca3af;">
        If this was you, no action is needed.  
        If not, please secure your account immediately.
      </p>

      <a href="https://talentiq-ai.vercel.app/reset-password"
        style="display:inline-block; margin-top:20px;
               padding:14px 30px; background:#ef4444;
               color:#ffffff; text-decoration:none;
               border-radius:12px; font-weight:bold;">
        🔒 Secure My Account
      </a>
    `,
  }),
});


// ======================================================
// 📄 JOB APPLIED EMAIL
// ======================================================
exports.jobAppliedEmail = (jobTitle) => ({
  subject: "✅ Application Submitted — AI Analysis Started",
  html: baseTemplate({
    title: "Application Submitted",
    preheader: "Your job application is now under AI review",
    body: `
      <h2 style="margin-top:0;">🎯 Application Received</h2>

      <p style="font-size:16px;">
        You’ve successfully applied for:
      </p>

      <div style="margin:22px 0; padding:20px;
                  background:rgba(34,211,238,0.12);
                  border-left:6px solid #22d3ee;
                  border-radius:12px;">
        <h3 style="margin:0;">${jobTitle}</h3>
      </div>

      <p>
        Our AI is currently analyzing your resume and skills.
        You’ll be notified as soon as there’s an update 🚀
      </p>
    `,
  }),
});


// ======================================================
// 📢 STATUS UPDATE EMAIL
// ======================================================
exports.statusUpdateEmail = (jobTitle, status) => ({
  subject: `📢 Application Update — ${status.toUpperCase()}`,
  html: baseTemplate({
    title: "Application Update",
    preheader: `Your application status is now ${status}`,
    body: `
      <h2 style="margin-top:0;">📊 Status Update</h2>

      <p>Your application for:</p>
      <h3 style="color:#38bdf8;">${jobTitle}</h3>

      <div style="margin:24px 0; padding:22px;
                  background:rgba(255,255,255,0.06);
                  border-radius:14px; text-align:center;">
        <span style="font-size:22px; font-weight:bold;">
          ${status.toUpperCase()}
        </span>
      </div>

      ${
        status === "rejected"
          ? `<p style="color:#9ca3af;">
              This wasn’t the right match, but more opportunities are coming 💪
            </p>`
          : `<p>
              Great news! Stay ready — the recruiter may contact you soon 🚀
            </p>`
      }
    `,
  }),
});


// ======================================================
// 👤 NEW APPLICANT (RECRUITER)
// ======================================================
exports.newApplicantEmail = (candidateName, jobTitle) => ({
  subject: "👤 New Applicant — AI Match Ready",
  html: baseTemplate({
    title: "New Applicant",
    preheader: "A new candidate has applied for your job",
    body: `
      <h2 style="margin-top:0;">📥 New Application</h2>

      <p>
        <b>${candidateName}</b> has applied for:
      </p>

      <div style="margin:20px 0; padding:18px;
                  background:rgba(34,197,94,0.12);
                  border-left:6px solid #22c55e;
                  border-radius:12px;">
        <h3 style="margin:0;">${jobTitle}</h3>
      </div>

      <a href="https://talentiq-ai.vercel.app/recruiter/applications"
        style="display:inline-block; margin-top:22px;
               padding:14px 34px; background:#22c55e;
               color:#ffffff; text-decoration:none;
               border-radius:14px; font-weight:bold;">
        🔍 Review Candidate
      </a>
    `,
  }),
});
