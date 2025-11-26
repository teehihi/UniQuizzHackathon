// const express = require('express');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const mammoth = require('mammoth');
// const mongoose = require('mongoose'); // ⭐️ PHẢI IMPORT MONGOOSE

// // Import mọi thứ cần thiết
// const { 
//   generateQuizFromText, 
//   generateWordsFromTopic, 
//   generateSingleWordFromTopic,

//   generateFlashcardsFromText, 
//   listAvailableModels 
// } = require('./geminiService'); 
// const Deck = require('./models/Deck'); 
// const User = require('./models/User'); 
// const Topic = require('./models/Topic');
// const FlashcardSet = require('./models/FlashcardSet'); 

// const router = express.Router();

// // --- 1. MIDDLEWARE (Giữ nguyên) ---
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
//   if (!token) {
//     return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     req.userEmail = decoded.email;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Token không hợp lệ' });
//   }
// };

// // --- 2. MULTER (Giữ nguyên) ---
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
// });

// // --- 3. API ROUTES ---

// // A. AUTH ROUTES (Giữ nguyên)
// router.post('/auth/register', async (req, res) => {
//   try {
//       const { email, password, fullName } = req.body;
//       if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
//       if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
//       const existingUser = await User.findOne({ email });
//       if (existingUser) return res.status(400).json({ message: 'Email này đã được sử dụng' });
//       const user = new User({ email, password, fullName: fullName || '' });
//       await user.save();
//       const token = jwt.sign( { userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' } );
//       console.log('✅ Đăng ký thành công:', email);
//       res.status(201).json({ message: 'Đăng ký thành công', token, user: { id: user._id, email: user.email, fullName: user.fullName || '' } });
//   } catch (error) {
//     console.error('❌ Lỗi khi đăng ký:', error);
//     res.status(500).json({ message: 'Lỗi server: ' + error.message });
//   }
// });

// router.post('/auth/login', async (req, res) => {
//   try {
//       const { email, password } = req.body;
//       if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
//       const user = await User.findOne({ email: email.toLowerCase() });
//       if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
//       const isPasswordValid = await user.comparePassword(password);
//       if (!isPasswordValid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
//       const token = jwt.sign( { userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' } );
//       console.log('✅ Đăng nhập thành công:', email);
//       res.json({ message: 'Đăng nhập thành công', token, user: { id: user._id, email: user.email, fullName: user.fullName || '' } });
//   } catch (error) {
//     console.error('❌ Lỗi khi đăng nhập:', error);
//     res.status(500).json({ message: 'Lỗi server: ' + error.message });
//   }
// });

// // B. DECK ROUTES (Đã sửa ép kiểu)
// router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
//   console.log('Đã nhận request /api/upload...');
//   try {
//     if (!req.file) return res.status(400).json({ message: 'Chưa upload file.' });
//     const { title, courseCode, questionCount } = req.body;
//     const numQuestions = parseInt(questionCount) || 10;
//     if (!title) return res.status(400).json({ message: 'Thiếu title.' });
//     if (numQuestions < 1 || numQuestions > 50) return res.status(400).json({ message: 'Số lượng câu hỏi phải từ 1 đến 50.' });

//     let text;
//     try {
//       const mammothResult = await mammoth.extractRawText({ buffer: req.file.buffer });
//       text = mammothResult.value;
//     } catch (mammothError) {
//       return res.status(400).json({ message: 'Không thể đọc file .docx.' });
//     }
//     if (!text || text.trim().length < 50) return res.status(400).json({ message: 'File .docx rỗng hoặc quá ngắn.' });

//     console.log(`Đang gọi AI (Quiz) để tạo ${numQuestions} câu hỏi...`);
//     const aiData = await generateQuizFromText(text, numQuestions); 
//     if (!aiData || !aiData.summary || !aiData.questions) throw new Error('AI trả về dữ liệu không hợp lệ');

//     const newDeck = new Deck({
//       title: title,
//       courseCode: courseCode || '',
//       summary: aiData.summary,
//       questions: aiData.questions,
//       userId: req.userId,
//     }); 
//     const savedDeck = await newDeck.save();
//     console.log('✅ Tạo quiz thành công! ID:', savedDeck._id);
//     res.status(201).json(savedDeck);
//   } catch (error) {
//     console.error('Lỗi /api/upload:', error);
//     res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
//   }
// });

// router.get('/decks', verifyToken, async (req, res) => {
//   try {
//     const decks = await Deck.find({ userId: new mongoose.Types.ObjectId(req.userId) }).sort({ createdAt: -1 });
//     res.json(decks);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// router.get('/decks/:id', verifyToken, async (req, res) => {
//   try {
//     const deck = await Deck.findOne({ _id: req.params.id, userId: new mongoose.Types.ObjectId(req.userId) });
//     if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz' });
//     res.json(deck);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// router.delete('/decks/:id', verifyToken, async (req, res) => {
//   try {
//     const deck = await Deck.findOne({ _id: req.params.id, userId: new mongoose.Types.ObjectId(req.userId) });
//     if (!deck) return res.status(404).json({ message: 'Không tìm thấy bộ quiz để xóa' });
//     await Deck.findByIdAndDelete(req.params.id);
//     console.log('✅ Đã xóa quiz:', deck._id);
//     res.json({ message: 'Đã xóa quiz thành công', deletedId: deck._id });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server: ' + error.message });
//   }
// });


// // C. FLASHCARD ROUTES (ĐÃ SỬA LỖI)

// // AI generate flashcards
// router.post('/flashcards/generate', verifyToken, upload.single('file'), async (req, res) => {
//   console.log('Đã nhận request /api/flashcards/generate...');
//   try {
//     const { title, courseCode, text, count } = req.body;
//     if (!title) return res.status(400).json({ message: 'Thiếu title' });

//     let sourceText = '';
//     if (text && String(text).trim().length > 0) {
//       sourceText = String(text);
//     } else if (req.file) {
//       const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
//       sourceText = value || '';
//     } else {
//       return res.status(400).json({ message: 'Thiếu text hoặc file' });
//     }

//     if (sourceText.trim().length < 50) {
//       return res.status(400).json({ message: 'Nội dung quá ngắn (>= 50 ký tự)' });
//     }

//     console.log(`Đang gọi AI (Flashcard) tạo ${count || 'mặc định'} flashcards...`);
//     const ai = await generateFlashcardsFromText(sourceText, { count });

//     // Đảm bảo AI trả về đúng key 'flashcards'
//     if (!ai || !Array.isArray(ai.flashcards)) {
//         console.error("Lỗi: geminiService.generateFlashcardsFromText không trả về { flashcards: [...] }");
//         throw new Error("AI không trả về dữ liệu flashcards hợp lệ.");
//     }

//     const setDoc = await FlashcardSet.create({
//       title,
//       courseCode: courseCode || '',
//       flashcards: ai.flashcards,
//       userId: req.userId 
//     });

//     console.log('✅ Tạo flashcard set thành công! ID:', setDoc._id);
//     return res.status(201).json(setDoc);
//   } catch (e) {
//     console.error('Lỗi /api/flashcards/generate:', e);
//     return res.status(500).json({ message: 'Lỗi nội bộ: ' + e.message });
//   }
// });

// // Tạo flashcard set thủ công
// router.post('/flashcards', verifyToken, async (req, res) => {
//   console.log('Đã nhận request POST /api/flashcards...');
//   try {
//     const { title, courseCode, flashcards } = req.body;
//     if (!title) return res.status(400).json({ message: 'Thiếu title' });
//     if (!Array.isArray(flashcards) || flashcards.length === 0) {
//       return res.status(400).json({ message: 'Thiếu flashcards' });
//     }
//     const cleaned = flashcards
//       .filter(fc => fc && fc.front && fc.back)
//       .map(fc => ({
//         front: String(fc.front).trim(),
//         back: String(fc.back).trim(),
//         hint: fc.hint ? String(fc.hint).trim() : undefined,
//         tags: Array.isArray(fc.tags) ? fc.tags.map(String) : undefined
//       }));

//     const setDoc = await FlashcardSet.create({ 
//         title, 
//         courseCode: courseCode || '', 
//         flashcards: cleaned, 
//         userId: req.userId 
//     });
//     console.log('✅ Tạo flashcard set thủ công thành công! ID:', setDoc._id);
//     return res.status(201).json(setDoc);
//   } catch (e) {
//     console.error('Lỗi POST /api/flashcards:', e);
//     return res.status(500).json({ message: 'Lỗi nội bộ: ' + e.message });
//   }
// });

// // Danh sách flashcard sets
// router.get('/flashcards', verifyToken, async (req, res) => {
//   try {
//     const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
//     // Chỉ tìm các set CÓ userId khớp
//     const sets = await FlashcardSet.find({
//         userId: currentUserId 
//     }).sort({ createdAt: -1 });
    
//     console.log(`✅ Flashcards fetched for User ID: ${req.userId}. Count: ${sets.length}`);
    
//     res.json(sets);
//   } catch (error) {
//      console.error('❌ Lỗi khi lấy danh sách flashcard sets:', error);
//      res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// // ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
// // ⭐️ ĐÂY LÀ CHỖ SỬA (LỖI TYPO CỦA TÔI) ⭐️
// // ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

// // Chi tiết 1 set
// router.get('/flashcards/:id', verifyToken, async (req, res) => {
//     try {
//         const setId = req.params.id;
        
//         // ⭐️ BƯỚC 1: Ép kiểu req.userId sang ObjectId ⭐️
//         const currentUserId = new mongoose.Types.ObjectId(req.userId);

//         // Đảm bảo chỉ lấy của user hiện tại
//         const set = await FlashcardSet.findOne({ 
//             _id: setId, 
//             userId: currentUserId // ⭐️ BƯỚC 2: Dùng biến 'currentUserId' đã tạo (ĐÂY LÀ CHỖ SỬA) ⭐️
//         });

//         if (!set) {
//             return res.status(404).json({ message: 'Không tìm thấy bộ Flashcard này.' });
//         }
        
//         res.json(set);
//     } catch (error) {
//         console.error('Lỗi khi lấy chi tiết Flashcard Set:', error);
//         res.status(500).json({ message: 'Lỗi server khi truy vấn chi tiết Flashcard Set.' });
//     }
// });
// // ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
// // ⭐️ KẾT THÚC CHỖ SỬA ⭐️
// // ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

// // Xóa 1 set flashcard
// router.delete('/flashcards/:id', verifyToken, async (req, res) => {
//     try {
//         // ⭐️ Đã sửa đúng (giữ nguyên)
//         const setDoc = await FlashcardSet.findOne({ 
//             _id: req.params.id, 
//             userId: new mongoose.Types.ObjectId(req.userId) 
//         });
//         if (!setDoc) return res.status(404).json({ message: 'Không tìm thấy bộ flashcard để xóa' });
        
//         await FlashcardSet.findByIdAndDelete(req.params.id);
//         console.log('✅ Đã xóa flashcard set:', setDoc._id);
//         res.json({ message: 'Đã xóa flashcard set thành công', deletedId: setDoc._id });
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi server: ' + error.message });
//     }
// });


// // D. TOPIC ROUTES (Đã sửa để dùng ép kiểu)
// router.get('/topics', verifyToken, async (req, res) => {
//   try {
//     const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
//     const topics = await Topic.find({
//       $or: [ 
//         { isSystem: true },           // Lấy Chủ đề Hệ thống
//         { author: currentUserId }     // Lấy Chủ đề do người dùng hiện tại tạo
//       ]
//     }).sort({ isSystem: -1, createdAt: -1 });
    
//     console.log(`✅ Topics fetched for User ID: ${req.userId}. Count: ${topics.length}`);
    
//     res.json(topics);
//   } catch (error) {
//     console.error('❌ Lỗi khi lấy danh sách topics:', error);
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// router.get('/topics/:id', verifyToken, async (req, res) => {
//   try {
//     const topic = await Topic.findById(req.params.id);
    
//     const currentUserId = new mongoose.Types.ObjectId(req.userId);
    
//     if (!topic) {
//         return res.status(404).json({ message: 'Không tìm thấy chủ đề.' });
//     }
    
//     // Kiểm tra quyền truy cập (Dùng .equals() để so sánh ObjectId)
//     if (topic.isSystem === false && topic.author.equals(currentUserId) === false) {
//       return res.status(403).json({ message: 'Bạn không có quyền truy cập chủ đề này.' });
//     }
    
//     res.json(topic);
//   } catch (error) {
//     console.error('❌ Lỗi khi lấy chi tiết chủ đề:', error);
//     res.status(500).json({ message: 'Lỗi server: ' + error.message });
//   }
// });

// router.post('/topics/generate', verifyToken, async (req, res) => {
//   try {
//     const { title } = req.body;
//     if (!title || title.trim().length === 0) {
//       return res.status(400).json({ message: 'Thiếu "title" của chủ đề.' });
//     }
//     console.log(`Đang gọi AI (Vocab) tạo chủ đề: ${title}`);
//     const aiData = await generateWordsFromTopic(title);

//     // Đảm bảo AI trả về đúng key 'words'
//      if (!aiData || !Array.isArray(aiData.words)) {
//         console.error("Lỗi: geminiService.generateWordsFromTopic không trả về { words: [...] }");
//         throw new Error("AI không trả về dữ liệu words hợp lệ.");
//     }

//     const newTopic = new Topic({
//       title: title,
//       words: aiData.words,
//       isSystem: false,
//       author: req.userId,
//     });
//     const savedTopic = await newTopic.save();
//     console.log('✅ Tạo chủ đề AI thành công! ID:', savedTopic._id);
//     res.status(201).json(savedTopic);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
//   }
// });

// // Thay đổi endpoint này để CHỈ GỌI AI và trả về word data (KHÔNG LƯU DB)
// router.post('/topics/generate-single', verifyToken, async (req, res) => {
//   try {
//     const { title } = req.body;
//     if (!title || title.trim().length === 0) {
//       return res.status(400).json({ message: 'Thiếu "title" của chủ đề.' });
//     }

//     console.log(`Đang gọi AI (Single Word) tạo từ cho chủ đề: ${title}`);
//     const aiWord = await generateSingleWordFromTopic(title);

//     if (!aiWord || !aiWord.word || !aiWord.definition || !aiWord.example) {
//       console.error("Lỗi: AI không trả về từ hợp lệ:", aiWord);
//       throw new Error("AI không trả về dữ liệu từ vựng hợp lệ.");
//     }

//     // ⭐️ SỬA LỖI: CHỈ TRẢ VỀ WORD DATA, KHÔNG TẠO NEW TOPIC ⭐️
//     // Endpoint này chỉ dùng để gợi ý nghĩa/ví dụ cho client
//     res.status(200).json(aiWord); 

//   } catch (error) {
//     console.error("Lỗi trong /topics/generate-single:", error.message);
//     res.status(500).json({ message: 'Lỗi từ server: ' + error.message });
//   }
// });

// // Endpoint MỚI: Thêm 1 từ vào Topic đã tồn tại (ĐƯỢC GỌI KHI NHẤN LƯU)
// router.post('/topics/:topicId/words', verifyToken, async (req, res) => {
//     try {
//         const { topicId } = req.params;
//         const { word, definition, example } = req.body;

//         if (!word || !definition) {
//             return res.status(400).json({ message: 'Từ và Định nghĩa là bắt buộc.' });
//         }

//         const currentUserId = new mongoose.Types.ObjectId(req.userId);

//         // Tìm topic (chỉ cho phép author sửa)
//         const topic = await Topic.findOne({ 
//             _id: topicId,
//             author: currentUserId 
//         });

//         if (!topic) {
//             return res.status(404).json({ message: 'Không tìm thấy Topic hoặc bạn không có quyền sửa.' });
//         }

//         // Tạo đối tượng từ mới
//         const newWordEntry = { 
//             word: word.trim(), 
//             definition: definition.trim(), 
//             example: example ? example.trim() : ''
//         };

//         // Thêm từ mới vào mảng 'words'
//         topic.words.push(newWordEntry);
//         await topic.save();

//         console.log(`✅ Đã thêm từ '${word}' vào Topic ID: ${topicId}`);
//         res.status(200).json(topic);

//     } catch (error) {
//         console.error('Lỗi khi thêm từ vào topic:', error);
//         res.status(500).json({ message: 'Lỗi server: ' + error.message });
//     }
// });

// // E. DEBUG ROUTES (Giữ nguyên)
// router.get('/test', (req, res) => {
//   res.json({ status: 'OK', message: 'API Routes đang chạy!' });
// });

// router.get('/debug/models', async (req, res) => {
//     console.log("Đang debug model list...");
//     const models = await listAvailableModels();
//     res.json(models);
// });

// module.exports = router;


// server/apiRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

// Import services
const { 
  generateQuizFromText, 
  generateWordsFromTopic,
  generateSingleWordFromTopic,
  generateFlashcardsFromText,
  generateLectureFromFile,
  generateMentorResponse,
  listAvailableModels
} = require('./geminiService');

const { synthesizeWithGoogleTranslate } = require('./services/ttsService');
const ContentExtractor = require('./utils/contentExtractor');

// Import models
const Deck = require('./models/Deck');
const User = require('./models/User');
const Topic = require('./models/Topic');
const FlashcardSet = require('./models/FlashcardSet');
const Voice = require('./models/voice');

const router = express.Router();

/* =======================================================
   1. MIDDLEWARE CHECK TOKEN
======================================================= */
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

/* =======================================================
   2. MULTER UPLOAD
======================================================= */
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng file không được hỗ trợ'));
    }
  }
});

/* =======================================================
   3. AUTH ROUTES
======================================================= */

// REGISTER
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email này đã được sử dụng' });

    const user = new User({ email, password, fullName: fullName || '' });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// LOGIN
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const check = await user.comparePassword(password);
    if (!check) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

/* =======================================================
   4. CONTENT EXTRACTION ROUTES
======================================================= */

// Extract content từ nhiều định dạng (PDF, DOCX, URL, YouTube, Image)
router.post('/extract-content', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { url, text, type } = req.body;
    
    let extractedContent;
    
    // Case 1: File upload (PDF, DOCX, PPTX, Image)
    if (req.file) {
      const fileType = type || 'auto';
      console.log(`[Content Extraction] Processing file: ${req.file.originalname}, type: ${fileType}`);
      
      extractedContent = await ContentExtractor.extractContent(req.file.buffer, fileType);
    }
    // Case 2: URL (Web scraping hoặc YouTube)
    else if (url) {
      console.log(`[Content Extraction] Processing URL: ${url}`);
      
      const urlType = url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'url';
      
      extractedContent = await ContentExtractor.extractContent(url, urlType);
    }
    // Case 3: Plain text
    else if (text) {
      console.log(`[Content Extraction] Processing plain text (${text.length} chars)`);
      extractedContent = await ContentExtractor.extractFromText(text);
    }
    else {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp file, URL, hoặc text' 
      });
    }
    
    // Validate extracted content
    const validation = ContentExtractor.validateContent(extractedContent);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.error 
      });
    }
    
    res.json({
      success: true,
      content: extractedContent.text,
      metadata: extractedContent.metadata
    });
    
  } catch (error) {
    console.error('[Content Extraction] Error:', error);
    res.status(500).json({ 
      message: 'Lỗi khi trích xuất nội dung: ' + error.message 
    });
  }
});

/* =======================================================
   5. QUIZ / DECK ROUTES
======================================================= */

// UPLOAD MULTI-FORMAT → QUIZ (Hỗ trợ PDF, DOCX, URL, YouTube)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, courseCode, questionCount, url, text } = req.body;
    const numQuestions = parseInt(questionCount) || 10;

    if (!title)
      return res.status(400).json({ message: 'Thiếu title.' });

    let extractedText;
    
    // Extract content từ nhiều nguồn
    if (req.file) {
      // File upload (PDF, DOCX, etc.)
      console.log(`[Quiz Upload] Processing file: ${req.file.originalname}`);
      const result = await ContentExtractor.extractContent(req.file.buffer, 'auto');
      extractedText = result.text;
    } 
    else if (url) {
      // URL hoặc YouTube
      console.log(`[Quiz Upload] Processing URL: ${url}`);
      const urlType = url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'url';
      const result = await ContentExtractor.extractContent(url, urlType);
      extractedText = result.text;
    }
    else if (text) {
      // Plain text
      extractedText = text;
    }
    else {
      return res.status(400).json({ message: 'Vui lòng cung cấp file, URL, hoặc text.' });
    }

    if (!extractedText || extractedText.trim().length < 50)
      return res.status(400).json({ message: 'Nội dung quá ngắn (tối thiểu 50 ký tự).' });

    console.log(`[Quiz Upload] Extracted ${extractedText.length} characters, generating ${numQuestions} questions...`);

    const ai = await generateQuizFromText(extractedText, numQuestions);
    if (!ai.summary || !ai.questions)
      throw new Error('AI trả về dữ liệu không hợp lệ');

    const deck = new Deck({
      title,
      courseCode,
      summary: ai.summary,
      questions: ai.questions,
      userId: req.userId
    });

    const saved = await deck.save();
    res.status(201).json(saved);

  } catch (error) {
    console.error('[Quiz Upload] Error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// GET ALL DECKS
router.get('/decks', verifyToken, async (req, res) => {
  try {
    const decks = await Deck.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .sort({ createdAt: -1 });

    res.json(decks);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET SINGLE DECK (Authenticated - for owner)
router.get('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId)
    });

    if (!deck)
      return res.status(404).json({ message: 'Không tìm thấy deck' });

    res.json(deck);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET PUBLIC DECK (No authentication required - for shared links)
router.get('/decks/public/:id', async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      isPublic: true
    });

    if (!deck)
      return res.status(404).json({ message: 'Quiz không tồn tại hoặc chưa được chia sẻ công khai' });

    res.json(deck);
  } catch (error) {
    console.error('Error fetching public deck:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// UPDATE DECK PUBLIC STATUS
router.patch('/decks/:id/public', verifyToken, async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId)
    });

    if (!deck)
      return res.status(404).json({ message: 'Không tìm thấy deck' });

    deck.isPublic = isPublic;
    await deck.save();

    res.json({ 
      message: isPublic ? 'Quiz đã được chia sẻ công khai' : 'Quiz đã được đặt về riêng tư',
      deck 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// DELETE DECK
router.delete('/decks/:id', verifyToken, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId)
    });

    if (!deck)
      return res.status(404).json({ message: 'Không tìm thấy deck để xóa' });

    await Deck.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa thành công', deletedId: deck._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

/* =======================================================
   6. TOPICS ROUTES
======================================================= */

router.get('/topics', verifyToken, async (req, res) => {
  try {
    const topics = await Topic.find({
      $or: [{ isSystem: true }, { author: req.userId }]
    }).sort({ isSystem: -1, createdAt: -1 });

    res.json(topics);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/topics/:id', verifyToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic || (!topic.isSystem && topic.author.toString() !== req.userId))
      return res.status(404).json({ message: 'Không có quyền truy cập' });

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// CREATE TOPIC BY AI
router.post('/topics/generate', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title)
      return res.status(400).json({ message: 'Thiếu title' });

    const ai = await generateWordsFromTopic(title);

    const topic = new Topic({
      title,
      words: ai.words,
      isSystem: false,
      author: req.userId
    });

    const saved = await topic.save();
    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
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

/* =======================================================
   7. FLASHCARDS ROUTES
======================================================= */

// AI generate flashcards (Hỗ trợ multi-format)
router.post('/flashcards/generate', verifyToken, upload.single('file'), async (req, res) => {
  console.log('Đã nhận request /api/flashcards/generate...');
  try {
    const { title, courseCode, text, count, url } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu title' });

    let sourceText = '';
    
    // Extract từ nhiều nguồn
    if (text && String(text).trim().length > 0) {
      sourceText = String(text);
    } 
    else if (req.file) {
      console.log(`[Flashcard Generate] Processing file: ${req.file.originalname}`);
      const result = await ContentExtractor.extractContent(req.file.buffer, 'auto');
      sourceText = result.text;
    }
    else if (url) {
      console.log(`[Flashcard Generate] Processing URL: ${url}`);
      const urlType = url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'url';
      const result = await ContentExtractor.extractContent(url, urlType);
      sourceText = result.text;
    }
    else {
      return res.status(400).json({ message: 'Thiếu text, file, hoặc URL' });
    }

    if (sourceText.trim().length < 50) {
      return res.status(400).json({ message: 'Nội dung quá ngắn (>= 50 ký tự)' });
    }

    console.log(`[Flashcard Generate] Extracted ${sourceText.length} chars, generating ${count || 'default'} flashcards...`);
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

// GET PUBLIC FLASHCARD SET (No authentication required - for shared links)
router.get('/flashcards/public/:id', async (req, res) => {
  try {
    const set = await FlashcardSet.findOne({
      _id: req.params.id,
      isPublic: true
    });

    if (!set)
      return res.status(404).json({ message: 'Flashcard set không tồn tại hoặc chưa được chia sẻ công khai' });

    res.json(set);
  } catch (error) {
    console.error('Error fetching public flashcard set:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// UPDATE FLASHCARD SET PUBLIC STATUS
router.patch('/flashcards/:id/public', verifyToken, async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    const set = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId)
    });

    if (!set)
      return res.status(404).json({ message: 'Không tìm thấy flashcard set' });

    set.isPublic = isPublic;
    await set.save();

    res.json({ 
      message: isPublic ? 'Flashcard set đã được chia sẻ công khai' : 'Flashcard set đã được đặt về riêng tư',
      set 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

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

/* =======================================================
   8. MENTOR + LECTURE ROUTES
======================================================= */

// Upload tài liệu → sinh bài giảng (Hỗ trợ multi-format)
router.post('/mentor/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { url, text } = req.body;
    
    let extractedText;
    
    if (req.file) {
      console.log(`[Lecture Upload] Processing file: ${req.file.originalname}`);
      const result = await ContentExtractor.extractContent(req.file.buffer, 'auto');
      extractedText = result.text;
    }
    else if (url) {
      console.log(`[Lecture Upload] Processing URL: ${url}`);
      const urlType = url.includes('youtube.com') || url.includes('youtu.be') 
        ? 'youtube' 
        : 'url';
      const result = await ContentExtractor.extractContent(url, urlType);
      extractedText = result.text;
    }
    else if (text) {
      extractedText = text;
    }
    else {
      return res.status(400).json({ message: 'Vui lòng cung cấp file, URL, hoặc text.' });
    }

    if (!extractedText || extractedText.trim().length < 50)
      return res.status(400).json({ message: 'Nội dung quá ngắn' });

    console.log(`[Lecture Upload] Generating lecture from ${extractedText.length} characters...`);
    const ai = await generateLectureFromFile(extractedText);

    res.status(201).json(ai);
  } catch (error) {
    console.error('[Lecture Upload] Error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// Mentor Chat
router.post('/mentor/chat', verifyToken, async (req, res) => {
  try {
    const { question, lectureContext } = req.body;

    if (!question)
      return res.status(400).json({ message: 'Thiếu câu hỏi' });

    const answer = await generateMentorResponse(question, lectureContext || '');
    res.json({ response: answer });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

/* =======================================================
   9. VOICE CONFIG + TTS ROUTES
======================================================= */

// Get voice config
router.get('/mentor/voice-config', verifyToken, async (req, res) => {
  try {
    let v = await Voice.findOne({ userId: req.userId });

    if (!v) {
      v = new Voice({
        userId: req.userId,
        gender: 'female',
        language: 'vi',
        rate: 1.0,
        volume: 1.0
      });
      await v.save();
    }

    res.json(v);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server: ' + e.message });
  }
});

// Update voice config
router.put('/mentor/voice-config', verifyToken, async (req, res) => {
  try {
    const { gender, language, rate, volume } = req.body;

    let v = await Voice.findOne({ userId: req.userId });
    if (!v) v = new Voice({ userId: req.userId });

    if (gender !== undefined) v.gender = gender;
    if (language !== undefined) v.language = language;
    if (rate !== undefined) v.rate = rate;
    if (volume !== undefined) v.volume = volume;

    await v.save();
    res.json(v);

  } catch (e) {
    res.status(500).json({ message: 'Lỗi server: ' + e.message });
  }
});

// TTS generate - Google Translate (Fallback)
router.post('/mentor/tts/synthesize', verifyToken, async (req, res) => {
  try {
    const { text, options } = req.body;

    if (!text)
      return res.status(400).json({ message: 'Thiếu text' });

    const maxLength = 5000;
    const processedText =
      text.length > maxLength ? text.substring(0, maxLength) : text;

    const opts = {
      language: options?.language || 'vi',
      gender: options?.gender || 'female',
      rate: options?.rate || 1.0,
      volume: options?.volume || 1.0
    };

    const audio = await synthesizeWithGoogleTranslate(processedText, opts);

    const buffer = Buffer.isBuffer(audio)
      ? audio
      : Buffer.from(audio);

    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// TTS generate - Google Cloud TTS (Premium)
const googleTTSService = require('./services/googleTTSService');

router.post('/mentor/tts/google-synthesize', verifyToken, async (req, res) => {
  try {
    const { text, options } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Kiểm tra Google Cloud TTS có sẵn không
    if (!googleTTSService.isAvailable()) {
      return res.status(503).json({ 
        message: 'Google Cloud TTS not available. Please check credentials.',
        fallback: true 
      });
    }

    const maxLength = 5000;
    const processedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Cấu hình TTS
    const ttsOptions = {
      language: options?.language || 'vi-VN',
      gender: options?.gender || 'FEMALE',
      voiceName: options?.voiceName || null,
      rate: options?.rate || 1.0,
      pitch: options?.pitch || 0.0,
      volume: options?.volume || 0.0,
    };

    // Synthesize với Google Cloud TTS
    const audioBuffer = await googleTTSService.synthesizeSpeech(processedText, ttsOptions);

    // Trả về audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache 1 hour
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('❌ Google Cloud TTS Error:', error);
    res.status(500).json({
      message: 'Lỗi khi tạo giọng đọc',
      error: error.message,
      fallback: true // Client có thể fallback về Google Translate TTS
    });
  }
});

// Lấy danh sách giọng đọc
router.get('/mentor/tts/voices', verifyToken, async (req, res) => {
  try {
    if (!googleTTSService.isAvailable()) {
      return res.status(503).json({ 
        message: 'Google Cloud TTS not available',
        voices: [] 
      });
    }

    const { language = 'vi-VN' } = req.query;
    const voices = await googleTTSService.listVoices(language);
    
    // Sắp xếp: WaveNet/Neural2 trước, Standard sau
    const sortedVoices = voices.sort((a, b) => {
      const aScore = a.name.includes('Wavenet') ? 3 : a.name.includes('Neural') ? 2 : 1;
      const bScore = b.name.includes('Wavenet') ? 3 : b.name.includes('Neural') ? 2 : 1;
      return bScore - aScore;
    });

    res.json({ 
      voices: sortedVoices,
      count: sortedVoices.length 
    });
  } catch (error) {
    console.error('❌ Error listing voices:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách giọng',
      error: error.message 
    });
  }
});

// Kiểm tra trạng thái Google Cloud TTS
router.get('/mentor/tts/status', verifyToken, (req, res) => {
  const isAvailable = googleTTSService.isAvailable();
  res.json({
    googleCloudTTS: isAvailable,
    fallbackTTS: true, // Google Translate TTS luôn có
    message: isAvailable 
      ? 'Google Cloud TTS is available' 
      : 'Using fallback TTS (Google Translate)'
  });
});

/* =======================================================
   10. DEBUG ROUTES
======================================================= */

router.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'API Routes đang chạy!' });
});

router.get('/debug/models', async (req, res) => {
  const models = await listAvailableModels();
  res.json(models);
});

// User Dashboard Routes
const userRoutes = require('./routes/userRoutes');
router.use('/user', userRoutes);

// Email Verification Routes
const emailRoutes = require('./routes/emailRoutes');
router.use('/email', emailRoutes);

module.exports = router;
