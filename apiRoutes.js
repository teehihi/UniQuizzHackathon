const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

// Import mọi thứ cần thiết
const { 
  generateQuizFromText, 
  generateWordsFromTopic, 
  generateFlashcardsFromText, // Đã thêm lại import này
  listAvailableModels 
} = require('./geminiService'); 
const Deck = require('./models/Deck'); 
const User = require('./models/User'); 
const Topic = require('./models/Topic');
const FlashcardSet = require('./models/FlashcardSet'); // Đã thêm lại import này

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


// C. FLASHCARD ROUTES (Private - Phải có Token)
// --- Đã thêm lại từ file cũ và nâng cấp bảo mật ---

// AI generate flashcards từ text hoặc file .docx
router.post('/flashcards/generate', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/flashcards/generate...');
  try {
    const { title, courseCode, text, count } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu title' });

    let sourceText = '';
    if (text && String(text).trim().length > 0) {
      sourceText = String(text);
    } else if (req.file) {
      const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
      sourceText = value || '';
    } else {
      return res.status(400).json({ message: 'Thiếu text hoặc file' });
    }

    if (sourceText.trim().length < 50) {
      return res.status(400).json({ message: 'Nội dung quá ngắn (>= 50 ký tự)' });
    }

    console.log(`Đang gọi AI (Flashcard) tạo ${count || 'mặc định'} flashcards...`);
    const ai = await generateFlashcardsFromText(sourceText, { count });

    const setDoc = await FlashcardSet.create({
      title,
      courseCode: courseCode || '',
      flashcards: ai.flashcards,
      userId: req.userId // Thêm userId
    });

    console.log('✅ Tạo flashcard set thành công! ID:', setDoc._id);
    return res.status(201).json(setDoc);
  } catch (e) {
    console.error('Lỗi /api/flashcards/generate:', e);
    return res.status(500).json({ message: 'Lỗi nội bộ: ' + e.message });
  }
});

// Tạo flashcard set thủ công
router.post('/flashcards', verifyToken, async (req, res) => {
  console.log('Đã nhận request POST /api/flashcards...');
  try {
    const { title, courseCode, flashcards } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu title' });
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ message: 'Thiếu flashcards' });
    }
    const cleaned = flashcards
      .filter(fc => fc && fc.front && fc.back)
      .map(fc => ({
        front: String(fc.front).trim(),
        back: String(fc.back).trim(),
        hint: fc.hint ? String(fc.hint).trim() : undefined,
        tags: Array.isArray(fc.tags) ? fc.tags.map(String) : undefined
      }));

    const setDoc = await FlashcardSet.create({ 
        title, 
        courseCode: courseCode || '', 
        flashcards: cleaned, 
        userId: req.userId // Thêm userId
    });
    console.log('✅ Tạo flashcard set thủ công thành công! ID:', setDoc._id);
    return res.status(201).json(setDoc);
  } catch (e) {
    console.error('Lỗi POST /api/flashcards:', e);
    return res.status(500).json({ message: 'Lỗi nội bộ: ' + e.message });
  }
});

// Danh sách flashcard sets
router.get('/flashcards', verifyToken, async (req, res) => {
  try {
    // Chỉ lấy flashcards của người dùng đã đăng nhập
    const sets = await FlashcardSet.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sets);
  } catch (error) {
     res.status(500).json({ message: 'Lỗi server' });
  }
});

// Chi tiết 1 set
router.get('/flashcards/:id', verifyToken, async (req, res) => {
  try {
    // Chỉ lấy nếu đúng ID và đúng userId
    const setDoc = await FlashcardSet.findOne({ _id: req.params.id, userId: req.userId });
    if (!setDoc) return res.status(404).json({ message: 'Không tìm thấy bộ flashcard' });
    res.json(setDoc);
  } catch (error) {
    res.status(500).json({ message: 'ID không hợp lệ hoặc lỗi server: ' + error.message });
  }
});

// Xóa 1 set flashcard
router.delete('/flashcards/:id', verifyToken, async (req, res) => {
    try {
        const setDoc = await FlashcardSet.findOne({ _id: req.params.id, userId: req.userId });
        if (!setDoc) return res.status(404).json({ message: 'Không tìm thấy bộ flashcard để xóa' });
        
        await FlashcardSet.findByIdAndDelete(req.params.id);
        console.log('✅ Đã xóa flashcard set:', setDoc._id);
        res.json({ message: 'Đã xóa flashcard set thành công', deletedId: setDoc._id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});


// D. TOPIC ROUTES (Private - Phải có Token)
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


// E. DEBUG ROUTES
router.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'API Routes đang chạy!' });
});

router.get('/debug/models', async (req, res) => {
    console.log("Đang debug model list...");
    const models = await listAvailableModels();
    res.json(models);
});

module.exports = router; // Phải export router