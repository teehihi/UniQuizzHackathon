require("dotenv").config(); // Phải ở dòng đầu tiên
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const apiRoutes = require("./apiRoutes"); // Import file routes mới
const socketHandler = require("./socketHandler"); // Import socket handler

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// 1. Cài đặt CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://uniquizzdom.vercel.app",
  "https://uniquizzhackathon.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.IO handlers
socketHandler(io);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(express.json());

// 2. Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("Không tìm thấy MONGO_URI trong file .env");
}
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// 4. Root & Health Check Endpoints (Cho UptimeRobot và Frontend Warm-up)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "UniQuizz Backend Server is running!",
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? "connected" : "connecting"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    dbState: mongoose.connection.readyState === 1 ? "connected" : "connecting"
  });
});

// Gắn tất cả các routes từ file apiRoutes vào prefix /api
app.use("/api", apiRoutes);

// Tất cả logic app.get, app.post đã được chuyển sang apiRoutes.js
// Tất cả logic định nghĩa Schema đã được chuyển sang models/FlashcardSet.js

// 7. Khởi chạy Server
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ở cổng http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for realtime connections`);
});
