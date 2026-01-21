const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const connect = require("./src/lib/mongoose");
const session = require("express-session");
const passport = require("./src/lib/passport");
const compression = require("compression");
const helmet = require("helmet");
const User = require("./src/models/user");
connect().then(async () => {
  try {
    await User.updateMany({}, { status: "offline" });
    console.log("All users status reset to offline");
  } catch (error) {
    console.error("Error resetting user status:", error);
  }
});

const http = require("http");

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for development
  }),
);

// Compression middleware - compress all responses
app.use(
  compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin:[ "http://localhost:3000" , "https://realtime-chat-app-jxhf.onrender.com"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

// Cache headers for static assets
app.use(
  "/uploads",
  express.static("uploads", {
    maxAge: "1d", // Cache static files for 1 day
    etag: true,
    lastModified: true,
  }),
);

// Session for passport (required for OAuth flow)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require("./src/routes/user.routes");
const messageRoutes = require("./src/routes/message.routes");
const authRoutes = require("./src/routes/auth.routes");
const { initIO } = require("./src/lib/socket");

app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/auth", authRoutes);

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
