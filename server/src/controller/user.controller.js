const { hashPassword, comparePassword } = require("../lib/bycrpt");
const User = require("../models/user");
const { genrateToken, generateOtpToken, refreshToken } = require("../lib/jwt");
const cloudinary = require("../lib/cloudinary");
const fs = require("fs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bycrpt = require("bcrypt");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const bycrptPassword = await hashPassword(password);

  try {
    const userData = await User.create({
      name,
      email,
      password: bycrptPassword,
    });

    const token = genrateToken(userData);

    res.status(200).json({
      status: "success",
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordMatched = await comparePassword(
      password,
      userData.password,
    );

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = genrateToken(userData);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const profile = async (req, res) => {
  const token = req.user;

  try {
    const userData = await User.findById(token.id);

    if (!userData) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User profile Found successfully",
      data: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;

  if (!req.body && !req.file) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const data = {};

  if (req.body.name) data.name = req.body.name;
  if (req.body.description) data.description = req.body.description;
  if (req.body.mobile) data.mobile = req.body.mobile;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat-app/avatar",
    });
    data.avatar = result.secure_url;
    fs.unlinkSync(req.file.path);
  }

  try {
    const userData = await User.findByIdAndUpdate(userId, data, {
      new: true,
    });

    if (!userData) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "User profile updated successfully",
      userData,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const findUsers = async (req, res) => {
  try {
    const { search } = req.body; // or req.body if you're sending JSON

    // Build dynamic conditions
    const conditions = [];

    if (search) {
      conditions.push({ name: { $regex: search, $options: "i" } });
      conditions.push({ email: { $regex: search, $options: "i" } });
      conditions.push({ mobile: { $regex: search, $options: "i" } });
    }

    if (conditions.length === 0) {
      return res.status(400).json({ message: "Please provide a search field" });
    }

    const users = await User.find({ $or: conditions }).select("-password");

    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const selectedUser = async (req, res) => {
  const selectedUserId = req.body.selectedUserId;

  if (!selectedUserId) {
    return res.status(400).json({ message: "Please provide a selectedUserId" });
  }

  try {
    const selectedUser =
      await User.findById(selectedUserId).select("-password");

    if (!selectedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User profile Found successfully",
      data: selectedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body; // better take from body, not req.user

  try {
    const { otp, token } = generateOtpToken(email);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_GMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"My Chat App" <${process.env.MY_GMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      token, // send back token so frontend can send it later
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, token } = req.body;

  if (!email || !otp || !token) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== email || decoded.otp !== otp) {
      return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword, token } = req.body;

  try {
    // Hash new password
    const hashedPassword = await bycrpt.hash(newPassword, 10);

    // Update user in DB
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "error",
      message: error.message.includes("expired")
        ? "OTP expired"
        : "Invalid token",
    });
  }
};

/**
 * Refresh JWT token before it expires
 */
const refreshTokenHandler = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required",
    });
  }

  try {
    const result = refreshToken(token);

    if (!result.success) {
      return res.status(401).json({
        status: "error",
        message: result.error,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      token: result.token,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  register,
  login,
  profile,
  findUsers,
  updateProfile,
  selectedUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshTokenHandler,
};
