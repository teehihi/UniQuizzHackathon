// server.js
require('dotenv').config(); // Phải ở dòng đầu tiên
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const jwt = require('jsonwebtoken');
const { generateQuizFromText } = require('./geminiService');
const Deck = require('./models/Deck'); // Import Model
const User = require('./models/User'); // Import User Model

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Cài đặt Middleware
// CORS: Cho phép tất cả origin trong development
app.use(cors({
  origin: true, // Cho phép tất cả origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('⚠️  CẢNH BÁO: Không tìm thấy MONGO_URI trong file .env');
  console.error('⚠️  Server vẫn sẽ chạy nhưng không thể lưu dữ liệu vào MongoDB');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Kết nối MongoDB thành công!'))
    .catch(err => {
      console.error('❌ Lỗi kết nối MongoDB:', err.message);
      console.error('⚠️  Server vẫn sẽ chạy nhưng không thể lưu dữ liệu');
    });
}

// 3. Cấu hình Multer (lưu file trong bộ nhớ)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 4. Middleware để verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// 5. Test endpoint (để kiểm tra server có chạy không)
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server đang chạy!',
    timestamp: new Date().toISOString()
  });
});

// 6. Auth Routes - Đăng ký
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    // Tạo user mới
    const user = new User({ 
      email, 
      password,
      fullName: fullName || ''
    });
    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    console.log('✅ Đăng ký thành công:', email);
    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName || ''
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// 7. Auth Routes - Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    console.log('✅ Đăng nhập thành công:', email);
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName || ''
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// 8. API Endpoint "Ma thuật" (Upload và Tạo Quiz) - Yêu cầu đăng nhập
app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/upload...');
  console.log('Body:', req.body);
  console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'Không có file');
  
  try {
    // A. Kiểm tra file và data
    if (!req.file) {
      console.log('Lỗi: Chưa upload file');
      return res.status(400).json({ message: 'Chưa upload file.' });
    }
    const { title, courseCode, questionCount } = req.body;
    const numQuestions = parseInt(questionCount) || 10; // Mặc định 10 nếu không có hoặc không hợp lệ
    console.log('Title:', title, 'CourseCode:', courseCode, 'QuestionCount:', numQuestions);
    if (!title) {
      console.log('Lỗi: Thiếu title');
      return res.status(400).json({ message: 'Thiếu title.' });
    }

    // Validate số lượng câu hỏi
    if (numQuestions < 1 || numQuestions > 50) {
      return res.status(400).json({ message: 'Số lượng câu hỏi phải từ 1 đến 50.' });
    }

    // B. Đọc file .docx
    console.log('Đang đọc file .docx...');
    let text;
    try {
      const mammothResult = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      text = mammothResult.value;
    } catch (mammothError) {
      console.error('Lỗi khi đọc file .docx:', mammothError);
      return res.status(400).json({ message: 'Không thể đọc file .docx. Vui lòng kiểm tra file có đúng định dạng không.' });
    }

    if (!text || text.trim().length < 50) { // Kiểm tra có nội dung không
      console.log('File quá ngắn hoặc rỗng');
      return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn (cần ít nhất 50 ký tự).' });
    }

    // C. Gọi AI để tạo Quiz (Đây là bước có thể mất thời gian)
    console.log(`Đang gọi AI để tạo ${numQuestions} câu hỏi... (Vui lòng chờ...)`);
    let aiData;
    try {
      aiData = await generateQuizFromText(text, numQuestions); // aiData là { summary, questions }
      if (!aiData || !aiData.summary || !aiData.questions) {
        throw new Error('AI trả về dữ liệu không hợp lệ');
      }
    } catch (aiError) {
      console.error('Lỗi khi gọi AI:', aiError);
      return res.status(500).json({ message: 'Lỗi khi tạo quiz từ AI: ' + aiError.message });
    }

    // D. Lưu vào MongoDB
    console.log('Đang lưu vào MongoDB...');
    try {
      // Kiểm tra MongoDB đã kết nối chưa
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB chưa được kết nối. Vui lòng kiểm tra MONGO_URI trong file .env');
      }

      const newDeck = new Deck({
        title: title,
        courseCode: courseCode || '',
        summary: aiData.summary,
        questions: aiData.questions,
        userId: req.userId, // Lưu userId của user đang tạo quiz
      }); 
      const savedDeck = await newDeck.save();

      // E. Trả về thành công
      console.log('✅ Tạo quiz thành công! ID:', savedDeck._id);
      res.status(201).json(savedDeck);
    } catch (dbError) {
      console.error('❌ Lỗi khi lưu vào MongoDB:', dbError);
      return res.status(500).json({ message: 'Lỗi khi lưu quiz vào database: ' + dbError.message });
    }

  } catch (error) {
    console.error('Lỗi không xác định trong quá trình /api/upload:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + (error.message || 'Lỗi không xác định') });
  }
});

// 9. API Endpoint (Lấy tất cả Quiz của user hiện tại) - Yêu cầu đăng nhập
app.get('/api/decks', verifyToken, async (req, res) => {
  try {
    // Chỉ lấy quiz của user hiện tại
    const decks = await Deck.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quiz:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 10. API Endpoint (Lấy 1 Quiz để làm) - Yêu cầu đăng nhập
app.get('/api/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy bộ quiz hoặc bạn không có quyền truy cập' });
    }
    res.json(deck);
  } catch (error) {
    console.error('Lỗi khi lấy quiz:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 11. API Endpoint (Xóa Quiz) - Yêu cầu đăng nhập và chỉ xóa quiz của chính user
app.delete('/api/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy bộ quiz để xóa hoặc bạn không có quyền xóa' });
    }
    
    await Deck.findByIdAndDelete(req.params.id);
    console.log('✅ Đã xóa quiz:', deck._id);
    res.json({ message: 'Đã xóa quiz thành công', deletedId: deck._id });
  } catch (error) {
    console.error('❌ Lỗi khi xóa quiz:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// 12. Khởi chạy Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server đang chạy ở cổng http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/upload\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} đã được sử dụng. Hãy thay đổi PORT trong file .env hoặc dừng process đang sử dụng port này.`);
  } else {
    console.error('❌ Lỗi khi khởi động server:', err.message);
  }
  process.exit(1);
});