const { hashPassword, comparePassword } = require("../lib/bycrpt");
const User = require("../models/user");
const {genrateToken} = require("../lib/jwt");
const cloudinary = require("../lib/cloudinary");
const fs = require("fs");

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
      userData.password
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
    const selectedUser = await User.findById(selectedUserId).select("-password");

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

module.exports = { register, login, profile, findUsers, updateProfile , selectedUser};
