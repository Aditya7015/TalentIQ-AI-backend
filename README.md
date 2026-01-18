🧠 TalentIQ-AI Backend
⚙️ AI-Powered Recruitment Engine
<div align="center">

🚀 Production-Ready Backend for Intelligent Hiring
Built to scale. Designed for reliability. Powered by AI.

</div>
🎯 What Is This Backend?

The TalentIQ-AI Backend is the core engine that powers the entire platform — handling:

🔐 Authentication & authorization

📄 Resume uploads & storage

🤖 AI resume analysis

📬 Email notifications (API-based, cloud-safe)

📊 Job & application lifecycle management

This is real SaaS backend architecture, not a demo server.

🧨 What Makes This Backend Different?

❌ No blocking SMTP
❌ No insecure auth
❌ No monolithic mess

✅ API-based email delivery
✅ Role-based access control
✅ Clean service architecture
✅ Cloud-deployment safe
✅ AI-ready design

⚙️ Core Features
🔐 Authentication & Security

JWT-based authentication

Role-based access:

candidate

recruiter

admin

Secure password hashing

Login alert emails

📄 Resume & Application Engine

Resume uploads via Cloudinary

AI-powered resume parsing

ATS-style resume scoring

Application status lifecycle:

Applied

Shortlisted

Interview

Rejected

🤖 AI Services

Resume analysis & scoring

Job-skill matching

AI chatbot integration

Modular AI service layer

📬 Email System (Production-Grade)

Welcome emails

Login security alerts

Job application confirmation

Application status updates

💡 Uses Brevo Email API (HTTPS)
✔ No SMTP
✔ Works on Render / Vercel
✔ Reliable delivery

🛠️ Tech Stack (Backend)
Tech	Purpose
🟢 Node.js	Runtime
⚡ Express.js	API Framework
🍃 MongoDB	Database
🧩 Mongoose	ODM
🔐 JWT	Auth
☁️ Cloudinary	Resume Storage
📬 Brevo API	Email Service
🤖 AI APIs	Resume & Chatbot
🚀 Render	Deployment
🗂️ Backend Architecture
backend/
│
├── controllers/
│   ├── authController.js
│   ├── jobController.js
│   ├── applicationController.js
│
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Application.js
│
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│
├── services/
│   ├── aiService.js
│   ├── emailService.js
│   └── emailTemplates.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
│
├── config/
│   └── db.js
│
└── server.js

🔐 Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Email (Brevo API)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

🚀 Running the Backend Locally
cd backend
npm install
npm run dev


Server starts at:

http://localhost:5000

🌍 Deployment (Render)

Environment variables added via dashboard

No SMTP ports required

Stateless, cloud-safe deployment

✔ Auto redeploy on push
✔ HTTPS API only
✔ Production-grade reliability

🧠 Design Philosophy

“Backends should be invisible — fast, secure, and reliable.”

This backend is built to:

Scale with users

Handle AI workloads

Avoid infra pitfalls

Support real startup growth

📈 Planned Enhancements

📊 Advanced analytics endpoints

🔁 Email retry & queue system

🧠 AI interview scoring

💳 Subscription & billing APIs

📁 Resume version history

👨‍💻 Author

Aditya Tiwari
Full-Stack Developer | AI & SaaS Builder

Building real products, not just APIs.

⭐ Like This Backend?

If this backend helped you:

⭐ Star the repository

🍴 Fork it

🧠 Share feedback

<div align="center">

🔥 TalentIQ-AI Backend

Powering intelligent hiring at scale.
</div>
