// server/apiRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose');
const Voice = require('./models/voice');
const { synthesizeWithGoogleTranslate } = require('./services/ttsService');

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
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
      $or: [{ isSystem: true }, { author: req.userId }]
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

// F. TTS ROUTES (Private - Phải có Token) - Chỉ sử dụng Google Translate TTS
// Lấy hoặc tạo cấu hình voice của user
router.get('/mentor/voice-config', verifyToken, async (req, res) => {
  try {
    let voiceConfig = await Voice.findOne({ userId: req.userId });
    if (!voiceConfig) {
      voiceConfig = new Voice({
        userId: req.userId,
        gender: 'female',
        language: 'vi',
        rate: 1.0,
        volume: 1.0
      });
      await voiceConfig.save();
    }
    res.json(voiceConfig);
  } catch (error) {
    console.error('Lỗi khi lấy voice config:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// Cập nhật cấu hình voice
router.put('/mentor/voice-config', verifyToken, async (req, res) => {
  try {
    const { gender, language, rate, volume } = req.body;

    let voiceConfig = await Voice.findOne({ userId: req.userId });
    if (!voiceConfig) {
      voiceConfig = new Voice({ userId: req.userId });
    }

    // Cập nhật các trường
    if (gender !== undefined) voiceConfig.gender = gender;
    if (language !== undefined) voiceConfig.language = language;
    if (rate !== undefined) voiceConfig.rate = rate;
    if (volume !== undefined) voiceConfig.volume = volume;

    await voiceConfig.save();
    res.json(voiceConfig);
  } catch (error) {
    console.error('Lỗi khi cập nhật voice config:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// Chuyển text sang audio bằng Google Translate TTS
// options: { language, gender, rate, volume }
router.post('/mentor/tts/synthesize', verifyToken, async (req, res) => {
  try {
    const { text, options } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Thiếu text' });
    }

    // Kiểm tra độ dài text
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text không hợp lệ' });
    }

    // Giới hạn độ dài text - Google Translate TTS: ~200 ký tự (tự động chia nhỏ)
    const maxTextLength = 5000;
    const textToProcess = text.length > maxTextLength ? text.substring(0, maxTextLength) : text;

    // Merge options với defaults
    const ttsOptions = {
      language: options?.language || 'vi',
      gender: options?.gender || 'female', // 'male' hoặc 'female'
      rate: options?.rate || 1.0,
      volume: options?.volume || 1.0
    };

    // Sử dụng Google Translate TTS
    const audioBuffer = await synthesizeWithGoogleTranslate(textToProcess, ttsOptions);

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).json({ message: 'Không thể tạo audio từ text' });
    }

    // Đảm bảo audioBuffer là Buffer
    const buffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);

    // Kiểm tra buffer hợp lệ
    if (!buffer || buffer.length === 0) {
      return res.status(500).json({ message: 'Audio buffer không hợp lệ' });
    }

    // Set headers cho audio response - Google Translate TTS trả về audio/webm
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');

    // Gửi buffer
    res.send(buffer);
  } catch (error) {
    console.error('Lỗi khi synthesize TTS:', error);
    const errorMessage = error.message || 'Lỗi không xác định';
    res.status(500).json({ message: 'Lỗi server: ' + errorMessage });
  }
});

module.exports = router; // Phải export router
