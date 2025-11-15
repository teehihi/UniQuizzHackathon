const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose'); // ⭐️ PHẢI IMPORT MONGOOSE

// Import mọi thứ cần thiết
const { 
  generateQuizFromText, 
  generateWordsFromTopic, 
  generateSingleWordFromTopic,

  generateFlashcardsFromText, 
  listAvailableModels 
} = require('./geminiService'); 
const Deck = require('./models/Deck'); 
const User = require('./models/User'); 
const Topic = require('./models/Topic');
const FlashcardSet = require('./models/FlashcardSet'); 

const router = express.Router();

// --- 1. MIDDLEWARE (Giữ nguyên) ---
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

// --- 2. MULTER (Giữ nguyên) ---
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- 3. API ROUTES ---

// A. AUTH ROUTES (Giữ nguyên)
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

// B. DECK ROUTES (Đã sửa ép kiểu)
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
    const decks = await Deck.find({ userId: new mongoose.Types.ObjectId(req.userId) }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: new mongoose.Types.ObjectId(req.userId) });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz' });
    res.json(deck);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: new mongoose.Types.ObjectId(req.userId) });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz để xóa' });
    await Deck.findByIdAndDelete(req.params.id);
    console.log('✅ Đã xóa quiz:', deck._id);
    res.json({ message: 'Đã xóa quiz thành công', deletedId: deck._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});


// C. FLASHCARD ROUTES (ĐÃ SỬA LỖI)

// AI generate flashcards
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

    // Đảm bảo AI trả về đúng key 'flashcards'
    if (!ai || !Array.isArray(ai.flashcards)) {
        console.error("Lỗi: geminiService.generateFlashcardsFromText không trả về { flashcards: [...] }");
        throw new Error("AI không trả về dữ liệu flashcards hợp lệ.");
    }

    const setDoc = await FlashcardSet.create({
      title,
      courseCode: courseCode || '',
      flashcards: ai.flashcards,
      userId: req.userId 
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
        userId: req.userId 
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
    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
    // Chỉ tìm các set CÓ userId khớp
    const sets = await FlashcardSet.find({
        userId: currentUserId 
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Flashcards fetched for User ID: ${req.userId}. Count: ${sets.length}`);
    
    res.json(sets);
  } catch (error) {
     console.error('❌ Lỗi khi lấy danh sách flashcard sets:', error);
     res.status(500).json({ message: 'Lỗi server' });
  }
});

// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
// ⭐️ ĐÂY LÀ CHỖ SỬA (LỖI TYPO CỦA TÔI) ⭐️
// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

// Chi tiết 1 set
router.get('/flashcards/:id', verifyToken, async (req, res) => {
    try {
        const setId = req.params.id;
        
        // ⭐️ BƯỚC 1: Ép kiểu req.userId sang ObjectId ⭐️
        const currentUserId = new mongoose.Types.ObjectId(req.userId);

        // Đảm bảo chỉ lấy của user hiện tại
        const set = await FlashcardSet.findOne({ 
            _id: setId, 
            userId: currentUserId // ⭐️ BƯỚC 2: Dùng biến 'currentUserId' đã tạo (ĐÂY LÀ CHỖ SỬA) ⭐️
        });

        if (!set) {
            return res.status(404).json({ message: 'Không tìm thấy bộ Flashcard này.' });
        }
        
        res.json(set);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết Flashcard Set:', error);
        res.status(500).json({ message: 'Lỗi server khi truy vấn chi tiết Flashcard Set.' });
    }
});
// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
// ⭐️ KẾT THÚC CHỖ SỬA ⭐️
// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

// Xóa 1 set flashcard
router.delete('/flashcards/:id', verifyToken, async (req, res) => {
    try {
        // ⭐️ Đã sửa đúng (giữ nguyên)
        const setDoc = await FlashcardSet.findOne({ 
            _id: req.params.id, 
            userId: new mongoose.Types.ObjectId(req.userId) 
        });
        if (!setDoc) return res.status(404).json({ message: 'Không tìm thấy bộ flashcard để xóa' });
        
        await FlashcardSet.findByIdAndDelete(req.params.id);
        console.log('✅ Đã xóa flashcard set:', setDoc._id);
        res.json({ message: 'Đã xóa flashcard set thành công', deletedId: setDoc._id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});


// D. TOPIC ROUTES (Đã sửa để dùng ép kiểu)
router.get('/topics', verifyToken, async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
    const topics = await Topic.find({
      $or: [ 
        { isSystem: true },           // Lấy Chủ đề Hệ thống
        { author: currentUserId }     // Lấy Chủ đề do người dùng hiện tại tạo
      ]
    }).sort({ isSystem: -1, createdAt: -1 });
    
    console.log(`✅ Topics fetched for User ID: ${req.userId}. Count: ${topics.length}`);
    
    res.json(topics);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách topics:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/topics/:id', verifyToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
    if (!topic) {
        return res.status(404).json({ message: 'Không tìm thấy chủ đề.' });
    }
    
    // Kiểm tra quyền truy cập (Dùng .equals() để so sánh ObjectId)
    if (topic.isSystem === false && topic.author.equals(currentUserId) === false) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chủ đề này.' });
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

    // Đảm bảo AI trả về đúng key 'words'
     if (!aiData || !Array.isArray(aiData.words)) {
        console.error("Lỗi: geminiService.generateWordsFromTopic không trả về { words: [...] }");
        throw new Error("AI không trả về dữ liệu words hợp lệ.");
    }

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

// Thay đổi endpoint này để CHỈ GỌI AI và trả về word data (KHÔNG LƯU DB)
router.post('/topics/generate-single', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Thiếu "title" của chủ đề.' });
    }

    console.log(`Đang gọi AI (Single Word) tạo từ cho chủ đề: ${title}`);
    const aiWord = await generateSingleWordFromTopic(title);

    if (!aiWord || !aiWord.word || !aiWord.definition || !aiWord.example) {
      console.error("Lỗi: AI không trả về từ hợp lệ:", aiWord);
      throw new Error("AI không trả về dữ liệu từ vựng hợp lệ.");
    }

    // ⭐️ SỬA LỖI: CHỈ TRẢ VỀ WORD DATA, KHÔNG TẠO NEW TOPIC ⭐️
    // Endpoint này chỉ dùng để gợi ý nghĩa/ví dụ cho client
    res.status(200).json(aiWord); 

  } catch (error) {
    console.error("Lỗi trong /topics/generate-single:", error.message);
    res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
  }
});

// Endpoint MỚI: Thêm 1 từ vào Topic đã tồn tại (ĐƯỢC GỌI KHI NHẤN LƯU)
router.post('/topics/:topicId/words', verifyToken, async (req, res) => {
    try {
        const { topicId } = req.params;
        const { word, definition, example } = req.body;

        if (!word || !definition) {
            return res.status(400).json({ message: 'Từ và Định nghĩa là bắt buộc.' });
        }

        const currentUserId = new mongoose.Types.ObjectId(req.userId);

        // Tìm topic (chỉ cho phép author sửa)
        const topic = await Topic.findOne({ 
            _id: topicId,
            author: currentUserId 
        });

        if (!topic) {
            return res.status(404).json({ message: 'Không tìm thấy Topic hoặc bạn không có quyền sửa.' });
        }

        // Tạo đối tượng từ mới
        const newWordEntry = { 
            word: word.trim(), 
            definition: definition.trim(), 
            example: example ? example.trim() : ''
        };

        // Thêm từ mới vào mảng 'words'
        topic.words.push(newWordEntry);
        await topic.save();

        console.log(`✅ Đã thêm từ '${word}' vào Topic ID: ${topicId}`);
        res.status(200).json(topic);

    } catch (error) {
        console.error('Lỗi khi thêm từ vào topic:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// E. DEBUG ROUTES (Giữ nguyên)
router.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'API Routes đang chạy!' });
});

router.get('/debug/models', async (req, res) => {
    console.log("Đang debug model list...");
    const models = await listAvailableModels();
    res.json(models);
});

module.exports = router;