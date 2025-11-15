// server.js (PHIÊN BẢN HOÀN CHỈNH)

require('dotenv').config(); // Phải ở dòng đầu tiên
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const jwt = require('jsonwebtoken');

// --- CẬP NHẬT REQUIRE ---
// Import hàm AI (cả 2 hàm)
const { generateQuizFromText, generateWordsFromTopic, listAvailableModels } = require('./geminiService'); 
// Import 3 Models
const Deck = require('./models/Deck'); 
const User = require('./models/User'); 
const Topic = require('./models/Topic'); // <-- Model mới
// ------------------------

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Cài đặt Middleware (Code của bạn)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('⚠️  CẢNH BÁO: Không tìm thấy MONGO_URI trong file .env');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Kết nối MongoDB thành công!');
        seedDatabase(); // <-- GỌI HÀM SEED 6 CHỦ ĐỀ GỐC
    })
    .catch(err => {
      console.error('❌ Lỗi kết nối MongoDB:', err.message);
    });
}

// --- THÊM MỚI: HÀM SEEDDATABASE ---
// 3. HÀM TỰ ĐỘNG THÊM 6 CHỦ ĐỀ GỐC (nếu DB trống)
async function seedDatabase() {
  try {
    const count = await Topic.countDocuments({ isSystem: true });
    if (count > 0) {
      console.log('Database đã có chủ đề gốc, không cần seed.');
      return;
    }

    console.log('Database trống, đang thêm 6 chủ đề gốc (ví dụ)...');
    // BẠN TỰ ĐIỀN 6 CHỦ ĐỀ CỦA MÌNH VÀO ĐÂY
    const defaultTopics = [
      {
        title: "Technology (Hệ thống)",
        isSystem: true,
        words: [
          { word: "Algorithm", definition: "Thuật toán", example: "This is a complex algorithm." },
          { word: "Database", definition: "Cơ sở dữ liệu", example: "We store data in a database." },
          { word: "Innovation", definition: "Sự đổi mới", example: "We must encourage innovation." },
          { word: "Cybersecurity", definition: "An ninh mạng", example: "Cybersecurity is crucial for online safety." },
          { word: "Artificial Intelligence", definition: "Trí tuệ nhân tạo", example: "AI is transforming many industries." },
          { word: "Software", definition: "Phần mềm", example: "He is developing a new software." },
          { word: "Hardware", definition: "Phần cứng", example: "The computer hardware needs an upgrade." },
          { word: "Network", definition: "Mạng lưới", example: "The office network is down." },
          { word: "Cloud Computing", definition: "Điện toán đám mây", example: "We store our files using cloud computing." },
          { word: "Programming", definition: "Lập trình", example: "She is learning programming in Python." }
        ]
      },
      {
        title: "Environment (Hệ thống)",
        isSystem: true,
        words: [
          { word: "Pollution", definition: "Ô nhiễm", example: "Air pollution is a serious problem." },
          { word: "Recycle", definition: "Tái chế", example: "You should recycle plastic bottles." },
          { word: "Climate Change", definition: "Biến đổi khí hậu", example: "Climate change affects the entire planet." },
          { word: "Renewable Energy", definition: "Năng lượng tái tạo", example: "Solar power is a form of renewable energy." },
          { word: "Deforestation", definition: "Nạn phá rừng", example: "Deforestation destroys animal habitats." },
          { word: "Conservation", definition: "Bảo tồn", example: "Wildlife conservation is very important." },
          { word: "Ecosystem", definition: "Hệ sinh thái", example: "A coral reef is a diverse ecosystem." },
          { word: "Sustainability", definition: "Sự bền vững", example: "Sustainability is key to our future." },
          { word: "Emission", definition: "Khí thải", example: "We need to reduce carbon emissions." },
          { word: "Habitat", definition: "Môi trường sống", example: "The panda's natural habitat is bamboo forest." }
        ]
      },
      // ... (Thêm 4 chủ đề gốc của bạn ở đây)
    ];
    
    await Topic.insertMany(defaultTopics);
    console.log('✅ Đã thêm các chủ đề gốc thành công!');

  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
  }
}
// ----------------------------------

// 4. Cấu hình Multer (Code của bạn)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 5. Middleware để verify JWT token (Code của bạn)
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

// 6. Test endpoint (Code của bạn)
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server đang chạy!',
    timestamp: new Date().toISOString()
  });
});

// 7. Auth Routes - Đăng ký (Code của bạn)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    // ... (Toàn bộ code Đăng ký của bạn giữ nguyên) ...
    // ...
     if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
     if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
     const existingUser = await User.findOne({ email });
     if (existingUser) return res.status(400).json({ message: 'Email này đã được sử dụng' });
     const user = new User({ email, password, fullName: fullName || '' });
     await user.save();
     const token = jwt.sign( { userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' } );
     console.log('✅ Đăng ký thành công:', email);
     res.status(201).json({ message: 'Đăng ký thành công', token, user: { id: user._id, email: user.email, fullName: user.fullName || '' } });
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// 8. Auth Routes - Đăng nhập (Code của bạn)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // ... (Toàn bộ code Đăng nhập của bạn giữ nguyên) ...
    // ...
     if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
     const user = await User.findOne({ email: email.toLowerCase() });
     if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
     const isPasswordValid = await user.comparePassword(password);
     if (!isPasswordValid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
     const token = jwt.sign( { userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' } );
     console.log('✅ Đăng nhập thành công:', email);
     res.json({ message: 'Đăng nhập thành công', token, user: { id: user._id, email: user.email, fullName: user.fullName || '' } });
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// 9. API Endpoint "Ma thuật" (Upload và Tạo Quiz) (Code của bạn)
app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/upload...');
  try {
    // A. Kiểm tra file và data
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa upload file.' });
    }
    const { title, courseCode, questionCount } = req.body;
    const numQuestions = parseInt(questionCount) || 10;
    if (!title) {
      return res.status(400).json({ message: 'Thiếu title.' });
    }
    if (numQuestions < 1 || numQuestions > 50) {
      return res.status(400).json({ message: 'Số lượng câu hỏi phải từ 1 đến 50.' });
    }

    // B. Đọc file .docx
    console.log('Đang đọc file .docx...');
    let text;
    try {
      const mammothResult = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = mammothResult.value;
    } catch (mammothError) {
      return res.status(400).json({ message: 'Không thể đọc file .docx.' });
    }
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn (cần ít nhất 50 ký tự).' });
    }

    // C. Gọi AI (đã truyền numQuestions)
    console.log(`Đang gọi AI (Quiz) để tạo ${numQuestions} câu hỏi...`);
    let aiData;
    try {
      // GỌI HÀM generateQuizFromText
      aiData = await generateQuizFromText(text, numQuestions); 
      if (!aiData || !aiData.summary || !aiData.questions) {
        throw new Error('AI trả về dữ liệu không hợp lệ');
      }
    } catch (aiError) {
      return res.status(500).json({ message: 'Lỗi khi tạo quiz từ AI: ' + aiError.message });
    }

    // D. Lưu vào MongoDB
    console.log('Đang lưu vào MongoDB...');
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB chưa được kết nối.');
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
      return res.status(500).json({ message: 'Lỗi khi lưu quiz vào database: ' + dbError.message });
    }

  } catch (error) {
    console.error('Lỗi không xác định trong quá trình /api/upload:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + (error.message || 'Lỗi không xác định') });
  }
});

// 10. API Endpoint (Lấy tất cả Quiz của user hiện tại) (Code của bạn)
app.get('/api/decks', verifyToken, async (req, res) => {
  try {
    const decks = await Deck.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quiz:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 11. API Endpoint (Lấy 1 Quiz để làm) (Code của bạn)
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

// 12. API Endpoint (Xóa Quiz) (Code của bạn)
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


// --- THÊM MỚI: TÍNH NĂNG "HỌC TỪ VỰNG" ---

// 13. API LẤY TẤT CẢ CHỦ ĐỀ (của user và của hệ thống)
app.get('/api/topics', verifyToken, async (req, res) => {
  try {
    const topics = await Topic.find({
      $or: [
        { isSystem: true }, // Lấy chủ đề của hệ thống
        { author: req.userId } // Lấy chủ đề của user này
      ]
    }).sort({ isSystem: -1, createdAt: -1 }); // Ưu tiên chủ đề hệ thống
    
    res.json(topics);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách chủ đề:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 14. API TẠO CHỦ ĐỀ MỚI BẰNG AI (Của riêng user)
app.post('/api/topics/generate', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Thiếu "title" của chủ đề.' });
    }

    console.log(`Đang gọi AI (Vocab) tạo chủ đề: ${title}`);
    // GỌI HÀM generateWordsFromTopic
    const aiData = await generateWordsFromTopic(title); // { words: [...] }

    // Lưu vào DB
    const newTopic = new Topic({
      title: title,
      words: aiData.words,
      isSystem: false, // Đây là chủ đề do người dùng tạo
      author: req.userId, // Gán tác giả (từ middleware)
    });
    const savedTopic = await newTopic.save();
    
    console.log('✅ Tạo chủ đề AI thành công! ID:', savedTopic._id);
    res.status(201).json(savedTopic);

  } catch (error) {
    console.error('Lỗi trong quá trình /api/topics/generate:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

// 15. API (DEBUG): Lấy danh sách model
app.get('/api/debug/models', async (req, res) => {
    console.log("Đang debug model list...");
    const models = await listAvailableModels();
    res.json(models);
});
// ------------------------------------

// 16. Khởi chạy Server (Code của bạn)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server đang chạy ở cổng http://localhost:${PORT}`);
  console.log(`📡 API endpoint (Test): http://localhost:${PORT}/api/test\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} đã được sử dụng. Hãy thay đổi PORT trong file .env hoặc dừng process đang sử dụng port này.`);
  } else {
    console.error('❌ Lỗi khi khởi động server:', err.message);
  }
  process.exit(1);
});