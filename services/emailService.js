const axios = require("axios");

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      BREVO_URL,
      {
        sender: {
          name: "TalentIQ AI",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API to:", to);
  } catch (error) {
    console.error(
      "❌ Brevo API Error:",
      error.response?.data || error.message
    );
  }
};
