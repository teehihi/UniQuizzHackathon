require('dotenv').config(); // Phải ở dòng đầu tiên
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Xóa các import không còn dùng ở đây (multer, mammoth, geminiService, Deck)

const apiRoutes = require('./apiRoutes'); // Import file routes mới

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Cài đặt Middleware
app.use(cors());
app.use(express.json());

// 2. Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('Không tìm thấy MONGO_URI trong file .env');
}
mongoose.connect(MONGO_URI)
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// 3. Cấu hình Multer -> Đã chuyển sang apiRoutes.js

// 4. API Endpoints
// Gắn tất cả các routes từ file apiRoutes vào prefix /api
app.use('/api', apiRoutes);

// Tất cả logic app.get, app.post đã được chuyển sang apiRoutes.js
// Tất cả logic định nghĩa Schema đã được chuyển sang models/FlashcardSet.js

// 7. Khởi chạy Server
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng http://localhost:${PORT}`);
});