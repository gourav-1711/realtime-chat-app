const Message = require("../models/message");
const cloudinary = require("../lib/cloudinary");
const fs = require("fs");
const { getIO, onlineUsers } = require("../lib/socket");

const sendMessage = async (req, res) => {
  const { receiver_id, message } = req.body;
  const sender_id = req.user.id;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const messageData = await Message.create({
      sender_id,
      receiver_id,
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Message sent successfully",
      data: messageData,
    });

    const receiverSocketId = onlineUsers.get(receiver_id);
    const senderSocketId = onlineUsers.get(sender_id);

    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("receive-message", messageData);
    }
    if (senderSocketId) {
      getIO().to(senderSocketId).emit("receive-message", messageData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const sendImage = async (req, res) => {
  const image = req.file;

  const { receiver_id } = req.body;
  const sender_id = req.user.id;
  let imageUrl;

  console.log(image, sender_id, receiver_id);
  if (!image || !sender_id || !receiver_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await cloudinary.uploader.upload(image.path, {
      folder: "chat-app",
    });

    imageUrl = result.secure_url;

    const messageData = await Message.create({
      sender_id,
      receiver_id,
      image: imageUrl,
    });
    res.status(200).json({
      status: "success",
      message: "Image sent successfully",
      data: messageData,
    });
    const receiverSocketId = onlineUsers.get(receiver_id);
    const senderSocketId = onlineUsers.get(sender_id);

    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("receive-message", messageData);
    }
    if (senderSocketId) {
      getIO().to(senderSocketId).emit("receive-message", messageData);
    }
    fs.unlinkSync(image.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const markAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Update the message
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true } // return updated document
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Message marked as read",
      data: message,
    });

    getIO().emit("update-message", { messageId: messageId, isRead: true });
    console.log("Message marked as read");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.id; // logged-in user
  const withUserId = req.params.withUserId; // other user

  try {
    const result = await Message.updateMany(
      {
        sender_id: withUserId, // messages sent by the other user
        receiver_id: userId, // to the logged-in user
        isRead: false, // only unread messages
      },
      { isRead: true } // mark as read
    );

    res.status(200).json({
      status: "success",
      message: `Marked ${result.modifiedCount} messages as read`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getAllMsg = async (req, res) => {
  const userId = req.user.id;
  const withUserId = req.body.withUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: withUserId },
        { sender_id: withUserId, receiver_id: userId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      status: "success",
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getConversationWithOther = async (req, res) => {
  const userId = req.user.id;

  try {
    const message = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("sender_id receiver_id", "name email")
      .sort({ createdAt: 1 });

    const chatUsers = new Set();

    message.forEach((msg) => {
      if (msg.sender_id._id.toString() !== userId.toString()) {
        chatUsers.add(JSON.stringify(msg.sender_id));
      }
      if (msg.receiver_id._id.toString() !== userId.toString()) {
        chatUsers.add(JSON.stringify(msg.receiver_id));
      }
    });

    // Convert back to objects
    const uniqueUsers = Array.from(chatUsers).map((user) => JSON.parse(user));

    return res.status(200).json({
      status: "success",
      message: "Conversations fetched successfully",
      data: uniqueUsers,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  sendImage,
  markAsRead,
  markAllAsRead,
  getAllMsg,
  getConversationWithOther,
};
