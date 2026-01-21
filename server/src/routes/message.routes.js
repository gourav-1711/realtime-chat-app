const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  sendImage,
  markAsRead,
  markAllAsRead,
  getAllMsg,
  getConversationWithOther,
  deleteConversation,
} = require("../controller/message.controller");

router.post("/send-message", protect, upload.none(), sendMessage);
router.post("/send-image", protect, upload.single("image"), sendImage);
router.post("/mark-as-read/:messageId", protect, upload.none(), markAsRead);
router.post(
  "/mark-all-as-read/:withUserId",
  protect,
  upload.none(),
  markAllAsRead,
);
router.post("/get-all-msg", protect, upload.none(), getAllMsg);
router.post(
  "/get-conversation-with-other",
  protect,
  upload.none(),
  getConversationWithOther,
);
router.post("/delete-conversation", protect, upload.none(), deleteConversation);
module.exports = router;
