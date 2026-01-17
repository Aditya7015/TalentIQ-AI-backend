const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { sendEmail } = require("../services/emailService");
const { welcomeEmail } = require("../services/emailTemplates");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashed = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  await sendEmail({
  to: user.email,
  ...welcomeEmail(user.name, user.role),
  } );


  res.status(201).json({ message: "User registered" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await sendEmail({
  to: user.email,
  subject: "New Login Detected 🔐",
  html: `<p>You logged into TalentIQ AI successfully.</p>`,
  });


  res.json({ token, role: user.role });
};
