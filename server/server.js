// server.js
require('dotenv').config(); // Phải ở dòng đầu tiên
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const { generateQuizFromText } = require('./geminiService');
const Deck = require('./models/Deck'); // Import Model

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

// 3. Cấu hình Multer (lưu file trong bộ nhớ)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 4. API Endpoint "Ma thuật" (Upload và Tạo Quiz)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/upload...');
  try {
    // A. Kiểm tra file và data
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa upload file.' });
    }
    const { title, courseCode } = req.body;
    if (!title || !courseCode) {
      return res.status(400).json({ message: 'Thiếu title hoặc courseCode.' });
    }

    // B. Đọc file .docx
    console.log('Đang đọc file .docx...');
    const mammothResult = await mammoth.extractRawText({
      buffer: req.file.buffer,
    });
    const text = mammothResult.value;

    if (!text || text.trim().length < 50) { // Kiểm tra có nội dung không
      return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn.' });
    }

    // C. Gọi AI để tạo Quiz (Đây là bước có thể mất thời gian)
    console.log('Đang gọi AI... (Vui lòng chờ...)');
    const aiData = await generateQuizFromText(text); // aiData là { summary, questions }

    // D. Lưu vào MongoDB
    console.log('Đang lưu vào MongoDB...');
    const newDeck = new Deck({
      title: title,
      courseCode: courseCode,
      summary: aiData.summary,
      questions: aiData.questions,
    }); 
    const savedDeck = await newDeck.save();

    // E. Trả về thành công
    console.log('Tạo quiz thành công!');
    res.status(201).json(savedDeck);

  } catch (error) {
    console.error('Lỗi trong quá trình /api/upload:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

// 5. API Endpoint (Lấy tất cả Quiz)
app.get('/api/decks', async (req, res) => {
  try {
    const decks = await Deck.find().sort({ createdAt: -1 }); // Lấy mới nhất
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 6. API Endpoint (Lấy 1 Quiz để làm)
app.get('/api/decks/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy bộ quiz' });
    }
    res.json(deck);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 7. Khởi chạy Server
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng http://localhost:${PORT}`);
});