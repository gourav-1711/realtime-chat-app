const { Server } = require("socket.io");
const { decodeToken } = require("./jwt");
const User = require("../models/user");
const Message = require("../models/message");
const mongoose = require("mongoose");
let io;
const onlineUsers = new Map();

function initIO(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
  });

  io.on("connection", async (socket) => {
    socket.on("add-user", async (userId) => {
      if (!userId) {
        return;
      }
      const decodedId = decodeToken(userId);
      if (!decodedId) {
        return;
      }

      // Store user's socket id and their decoded id
      socket.userId = decodedId;
      onlineUsers.set(decodedId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));

      await User.findByIdAndUpdate(decodedId, { status: "online" });

      io.emit("user-status", { userId: decodedId, status: "online" });
    });

    // Handle send message via socket
    socket.on("send-message", async (data) => {
      if (!socket.userId) return;

      const { receiverId, message, tempId } = data; // Expect tempId from frontend for tracking
      if (!receiverId || !message?.trim()) return;

      // Generate a valid MongoDB ObjectId immediately
      const messageId = new mongoose.Types.ObjectId();
      const createdAt = new Date().toISOString();

      // Payload with the REAL final ID
      const messageData = {
        _id: messageId,
        sender_id: socket.userId,
        receiver_id: receiverId,
        message: message.trim(),
        createdAt: createdAt,
        isRead: false,
      };

      // 1. Emit to receiver IMMEDIATELY with the REAL ID
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", messageData);
      }

      try {
        // 2. Save to DB with the SAME ID
        await Message.create({
          _id: messageId, // Explicitly set the ID
          sender_id: socket.userId,
          receiver_id: receiverId,
          message: message.trim(),
          isRead: false,
          createdAt: createdAt, // Ensure timestamp matches
        });

        // 3. Confirm to sender (mapping their tempId to the realId)
        const confirmedMessageData = {
          ...messageData,
          tempId: tempId,
        };

        socket.emit("message-sent", confirmedMessageData);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message-error", {
          error: "Failed to send message",
          tempId: tempId,
        });
      }
    });

    // Handle mark messages as read via socket
    socket.on("mark-as-read", async (data) => {
      if (!socket.userId) return;

      const { messageId, senderId } = data;
      if (!messageId) return;

      try {
        await Message.findByIdAndUpdate(messageId, { isRead: true });

        // Notify sender that message was read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("update-message", {
            messageId,
            isRead: true,
          });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Typing indicator
    socket.on("typing", ({ receiverId, typing }) => {
      if (!socket.userId || !receiverId) return;

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          userId: socket.userId,
          typing,
        });
      }
    });

    socket.on("disconnect", async () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user-offline", userId);
          if (userId) {
            await User.findByIdAndUpdate(userId, { status: "offline" });
          }
          io.emit("user-status", { userId: userId, status: "offline" });
          break;
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initIO, getIO, onlineUsers };
