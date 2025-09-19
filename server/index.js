const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const { Server } = require("socket.io");
const connect = require("./src/lib/mongoose");
connect();

const http = require("http");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require("./src/routes/user.routes");
const messageRoutes = require("./src/routes/message.routes");
const { initIO } = require("./src/lib/socket");

app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("Chat App Server is running!");
});

const server = http.createServer(app);

// Socket.IO setup
initIO(server);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
