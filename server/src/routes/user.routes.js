const express = require("express");
const router = express.Router();
const { register, login, profile, updateProfile, findUsers, selectedUser, forgotPassword, resetPassword, verifyOtp } = require("../controller/user.controller");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/register",upload.none(), register);
router.post("/login", upload.none(), login);
router.post("/profile", protect, upload.none(), profile);
router.post("/update-profile", protect, upload.single("avatar"), updateProfile);
router.post("/find-users", protect, upload.none(), findUsers);
router.post("/selected-user", protect, upload.none(), selectedUser);
router.post("/forgot-password", protect, upload.none(), forgotPassword);
router.post("/verify-otp", protect, upload.none(), verifyOtp);
router.post("/reset-password", protect, upload.none(), resetPassword);

module.exports = router;
