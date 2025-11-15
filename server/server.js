// server.js (ĐÃ ĐƯỢC DỌN DẸP)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 1. IMPORT CÁC FILE TÁCH ---
const apiRoutes = require('./apiRoutes'); // <-- Import file API
const Topic = require('./models/Topic'); // <-- Chỉ cần Topic để Seed

const app = express();
const PORT = process.env.PORT || 3001;

// --- 2. CÀI ĐẶT MIDDLEWARE ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. KẾT NỐI MONGODB & SEED ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('⚠️  CẢNH BÁO: Không tìm thấy MONGO_URI trong file .env');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Kết nối MongoDB thành công!');
        seedDatabase(); // Gọi hàm seed 6 chủ đề gốc
    })
    .catch(err => {
      console.error('❌ Lỗi kết nối MongoDB:', err.message);
    });
}

async function seedDatabase() {
  try {
    const count = await Topic.countDocuments({ isSystem: true });
    if (count > 0) {
      console.log('Database đã có chủ đề gốc, không cần seed.');
      return;
    }
    console.log('Database trống, đang thêm 6 chủ đề gốc (ví dụ)...');
    const defaultTopics = [
      {
        title: "Technology (Hệ thống)",
        isSystem: true,
        words: [
          { word: "Algorithm", definition: "Thuật toán", example: "This is a complex algorithm." },
          { word: "Database", definition: "Cơ sở dữ liệu", example: "We store data in a database." },
          // ... (thêm 8 từ)
        ]
      },
      {
        title: "Environment (Hệ thống)",
        isSystem: true,
        words: [
          { word: "Pollution", definition: "Ô nhiễm", example: "Air pollution is a serious problem." },
          { word: "Recycle", definition: "Tái chế", example: "You should recycle plastic bottles." },
          // ... (thêm 8 từ)
        ]
      },
      // ... (4 chủ đề còn lại)
    ];
    await Topic.insertMany(defaultTopics);
    console.log('✅ Đã thêm các chủ đề gốc thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
  }
}

// --- 4. CHỈ ĐƯỜNG (ROUTING) ---
// Tất cả các API bắt đầu bằng /api/ sẽ được xử lý bởi file 'apiRoutes.js'
app.use('/api', apiRoutes); 

// --- 5. KHỞI CHẠY SERVER ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server đang chạy ở cổng http://localhost:${PORT}`);
  console.log(`📡 API endpoint (Test): http://localhost:${PORT}/api/test\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} đã được sử dụng.`);
  } else {
    console.error('❌ Lỗi khi khởi động server:', err.message);
  }
  process.exit(1);
});