// backend/middlewares/uploadProfilePicture.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "talentiqai/profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
    public_id: (req, file) => `profile_${req.user._id}_${Date.now()}`,
  },
});

const uploadProfilePicture = multer({
  storage: profilePicStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadProfilePicture;