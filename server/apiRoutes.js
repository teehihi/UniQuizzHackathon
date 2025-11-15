// server/apiRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

// Import mọi thứ cần thiết
const { generateQuizFromText, generateWordsFromTopic, generateLectureFromFile, generateMentorResponse, listAvailableModels } = require('./geminiService'); 
const Deck = require('./models/Deck'); 
const User = require('./models/User'); 
const Topic = require('./models/Topic');

const router = express.Router();

// --- 1. MIDDLEWARE (Nằm luôn ở đây) ---
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// --- 2. MULTER (Cấu hình Upload) ---
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- 3. API ROUTES ---

// A. AUTH ROUTES (Public)
router.post('/auth/register', async (req, res) => {
  try {
     const { email, password, fullName } = req.body;
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

router.post('/auth/login', async (req, res) => {
  try {
     const { email, password } = req.body;
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

// B. DECK ROUTES (Private - Phải có Token)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/upload...');
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa upload file.' });
    const { title, courseCode, questionCount } = req.body;
    const numQuestions = parseInt(questionCount) || 10;
    if (!title) return res.status(400).json({ message: 'Thiếu title.' });
    if (numQuestions < 1 || numQuestions > 50) return res.status(400).json({ message: 'Số lượng câu hỏi phải từ 1 đến 50.' });

    let text;
    try {
      const mammothResult = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = mammothResult.value;
    } catch (mammothError) {
      return res.status(400).json({ message: 'Không thể đọc file .docx.' });
    }
    if (!text || text.trim().length < 50) return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn.' });

    console.log(`Đang gọi AI (Quiz) để tạo ${numQuestions} câu hỏi...`);
    const aiData = await generateQuizFromText(text, numQuestions); 
    if (!aiData || !aiData.summary || !aiData.questions) throw new Error('AI trả về dữ liệu không hợp lệ');

    const newDeck = new Deck({
      title: title,
      courseCode: courseCode || '',
      summary: aiData.summary,
      questions: aiData.questions,
      userId: req.userId,
    }); 
    const savedDeck = await newDeck.save();
    console.log('✅ Tạo quiz thành công! ID:', savedDeck._id);
    res.status(201).json(savedDeck);
  } catch (error) {
    console.error('Lỗi /api/upload:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

router.get('/decks', verifyToken, async (req, res) => {
  try {
    const decks = await Deck.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz' });
    res.json(deck);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz để xóa' });
    await Deck.findByIdAndDelete(req.params.id);
    console.log('✅ Đã xóa quiz:', deck._id);
    res.json({ message: 'Đã xóa quiz thành công', deletedId: deck._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// C. TOPIC ROUTES (Private - Phải có Token)
router.get('/topics', verifyToken, async (req, res) => {
  try {
    const topics = await Topic.find({
      $or: [ { isSystem: true }, { author: req.userId } ]
    }).sort({ isSystem: -1, createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/topics/:id', verifyToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    // Kiểm tra quyền truy cập: System hoặc Author
    if (!topic || (!topic.isSystem && topic.author.toString() !== req.userId)) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề hoặc bạn không có quyền truy cập.' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết chủ đề:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

router.post('/topics/generate', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Thiếu "title" của chủ đề.' });
    }
    console.log(`Đang gọi AI (Vocab) tạo chủ đề: ${title}`);
    const aiData = await generateWordsFromTopic(title);

    const newTopic = new Topic({
      title: title,
      words: aiData.words,
      isSystem: false,
      author: req.userId,
    });
    const savedTopic = await newTopic.save();
    console.log('✅ Tạo chủ đề AI thành công! ID:', savedTopic._id);
    res.status(201).json(savedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});


// D. DEBUG ROUTES
router.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'API Routes đang chạy!' });
});

router.get('/debug/models', async (req, res) => {
    console.log("Đang debug model list...");
    const models = await listAvailableModels();
    res.json(models);
});

// E. MENTOR ROUTES (Private - Phải có Token)
router.post('/mentor/upload', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/mentor/upload...');
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa upload file.' });

    let text;
    try {
      const mammothResult = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = mammothResult.value;
    } catch (mammothError) {
      return res.status(400).json({ message: 'Không thể đọc file .docx.' });
    }
    if (!text || text.trim().length < 50) return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn.' });

    console.log('Đang gọi AI (Lecture) để tạo bài giảng...');
    const lectureData = await generateLectureFromFile(text);
    if (!lectureData || !lectureData.title || !lectureData.sections) {
      throw new Error('AI trả về dữ liệu không hợp lệ');
    }

    console.log('✅ Tạo bài giảng thành công!');
    res.status(201).json(lectureData);
  } catch (error) {
    console.error('Lỗi /api/mentor/upload:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

router.post('/mentor/chat', verifyToken, async (req, res) => {
  console.log('Đã nhận request /api/mentor/chat...');
  try {
    const { question, lectureContext } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Thiếu câu hỏi.' });
    }

    console.log('Đang gọi AI (Mentor Response)...');
    const response = await generateMentorResponse(question, lectureContext || '');

    console.log('✅ Tạo phản hồi mentor thành công!');
    res.status(200).json({ response });
  } catch (error) {
    console.error('Lỗi /api/mentor/chat:', error);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

module.exports = router; // Phải export router