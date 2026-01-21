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
      { new: true }, // return updated document
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
      { isRead: true }, // mark as read
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
    // Get all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("sender_id receiver_id", "name email avatar status description")
      .sort({ createdAt: -1 }); // Sort by newest first

    // Map to store unique users with their conversation data
    const chatUsersMap = new Map();

    messages.forEach((msg) => {
      // Determine the other user in this conversation
      const otherUser =
        msg.sender_id._id.toString() === userId.toString()
          ? msg.receiver_id
          : msg.sender_id;

      const otherUserId = otherUser._id.toString();

      // If we haven't seen this user yet, store their data
      if (!chatUsersMap.has(otherUserId)) {
        chatUsersMap.set(otherUserId, {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.avatar,
          status: otherUser.status,
          description: otherUser.description,
          lastMessage: msg.image ? "📷 Image" : msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages (messages sent TO the current user that are unread)
      if (msg.receiver_id._id.toString() === userId.toString() && !msg.isRead) {
        const userData = chatUsersMap.get(otherUserId);
        userData.unreadCount++;
        chatUsersMap.set(otherUserId, userData);
      }
    });

    // Convert map to array and sort by last message time
    const uniqueUsers = Array.from(chatUsersMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
    );

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

const deleteConversation = async (req, res) => {
  const userId = req.user.id;
  const { withUserId } = req.body;

  if (!withUserId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const result = await Message.deleteMany({
      $or: [
        { sender_id: userId, receiver_id: withUserId },
        { sender_id: withUserId, receiver_id: userId },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: `Deleted ${result.deletedCount} messages`,
      data: { deletedCount: result.deletedCount },
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
  deleteConversation,
};
