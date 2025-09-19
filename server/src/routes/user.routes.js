const express = require("express");
const router = express.Router();
const { register, login, profile, updateProfile, findUsers, selectedUser } = require("../controller/user.controller");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/register",upload.none(), register);
router.post("/login", upload.none(), login);
router.post("/profile", protect, upload.none(), profile);
router.post("/update-profile", protect, upload.single("avatar"), updateProfile);
router.post("/find-users", protect, upload.none(), findUsers);
router.post("/selected-user", protect, upload.none(), selectedUser);

module.exports = router;
