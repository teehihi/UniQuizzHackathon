const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // Để React Frontend có thể gọi API

// Tải biến môi trường
dotenv.config();

// Kết nối Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Cho phép server đọc body JSON từ request

// Routes
// (Tạm thời là placeholder, sẽ được thêm ở bước tiếp theo)
app.get('/', (req, res) => {
  res.send('API is running for GreenTrust Ledger...');
});

// Định nghĩa cổng
const PORT = process.env.PORT || 5000;

// Khởi động server
app.listen(PORT, console.log(`Server running on port ${PORT}`));