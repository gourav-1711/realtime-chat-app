const { Server } = require("socket.io");
const { decodeToken } = require("./jwt");
const User = require("../models/user");
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
       if(!userId){
        return;
       }
      const decodedId = decodeToken(userId);

      onlineUsers.set(decodedId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));

      await User.findByIdAndUpdate(decodedId, { status: "online" });

      io.emit("user-status", { userId: decodedId, status: "online" });
    });

    socket.on("disconnect", async () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user-offline", userId);
          if(userId){
            await User.findByIdAndUpdate(userId, { status : "offline" });
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

module.exports = { initIO, getIO ,onlineUsers};
