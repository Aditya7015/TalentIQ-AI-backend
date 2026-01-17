// // const nodemailer = require("nodemailer");

// // const transporter = nodemailer.createTransport({
// //   service: process.env.EMAIL_SERVICE,
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// // exports.sendEmail = async ({ to, subject, html }) => {
// //   await transporter.sendMail({
// //     from: process.env.EMAIL_FROM,
// //     to,
// //     subject,
// //     html,
// //   });
// // };


// const nodemailer = require("nodemailer");

// let transporter = null;

// // Create transporter ONLY if env vars exist
// if (
//   process.env.EMAIL_SERVICE &&
//   process.env.EMAIL_USER &&
//   process.env.EMAIL_PASS
// ) {
//   transporter = nodemailer.createTransport({
//     service: process.env.EMAIL_SERVICE,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
// } else {
//   console.log("⚠️ Email service disabled (env missing)");
// }

// exports.sendEmail = async ({ to, subject, html }) => {
//   if (!transporter) return; // ⛔ DO NOTHING if email not ready

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.log("⚠️ Email failed:", err.message);
//   }
// };



const nodemailer = require("nodemailer");

let transporter = null;

if (
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 🔥 REQUIRED for cloud servers
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.log("⚠️ Email disabled: missing env");
}

exports.sendEmail = async ({ to, subject, html }) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // 🔥 MUST MATCH
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
};
