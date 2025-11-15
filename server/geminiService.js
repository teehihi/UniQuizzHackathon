// server/geminiService.js (Đã cập nhật numQuestions)
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

if (!GEMINI_API_KEY) {
  throw new Error('Không tìm thấy GEMINI_API_KEY trong file .env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log(`[Khởi tạo AI] Đang cố gắng sử dụng model: ${PREFERRED_MODEL}`);

// (Hàm listAvailableModels của bạn... giữ nguyên)
async function listAvailableModels() {
  // ... (code của bạn) ...
}

// Hàm 1: generate quiz (ĐÃ CẬP NHẬT)
async function generateQuizFromText(text, numQuestions = 10) { // <-- ĐÃ NHẬN numQuestions
  // bên trong hàm generateQuizFromText(text, numQuestions = 10)

  const prompt = `
Dựa vào văn bản sau đây, hãy thực hiện 2 yêu cầu:
1) Tóm tắt nội dung chính trong 3 gạch đầu dòng (summary).
2) Tạo chính xác ${numQuestions} câu hỏi trắc nghiệm (questions) chỉ tập trung vào nội dung văn bản.

YÊU CẦU BẮT BUỘC:
- Trả về duy nhất 1 đối tượng JSON (không dùng markdown).
- "options" phải là một mảng (array) chứa 4 chuỗi (string) nội dung câu trả lời.
- "answer" phải là NỘI DUNG của 1 trong 4 câu trả lời đó.
- Cấu trúc:
{
  "summary": ["Nội dung tóm tắt 1", "Nội dung tóm tắt 2", "..."],
  "questions": [
    {
      "question": "Nội dung câu hỏi 1?",
      "options": [
        "Nội dung câu trả lời 1",
        "Nội dung câu trả lời 2",
        "Nội dung câu trả lời 3",
        "Nội dung câu trả lời 4"
      ],
      "answer": "Nội dung câu trả lời đúng"
    }
  ]
}

Văn bản:
---
${text}
---
`.trim();

// ... (phần code gọi AI và parse JSON giữ nguyên) ...

  let modelName = PREFERRED_MODEL;
  let modelClient;
  try {
    modelClient = genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn('Lỗi khi tạo model client với', modelName, err);
  }

  try {
    // ... (Toàn bộ code try...catch của bạn giữ nguyên) ...
    // ... (Code gọi modelClient.generateContent(prompt))
    // ... (Code xử lý JSON an toàn)
    
    // (Chỉ cần copy-paste phần code này từ file cũ của bạn)
     if (!modelClient) throw new Error('Không tạo được model client');
     const generation = await modelClient.generateContent(prompt);
     const response = await generation.response;
     let textResp = await response.text();
     textResp = textResp.replace(/```json|```/g, '').trim();
     let jsonData;
     try { jsonData = JSON.parse(textResp); } catch (e) {
       const match = textResp.match(/\{[\s\S]*\}$/);
       if (!match) throw new Error('AI (Quiz) trả về định dạng không parse được JSON');
       jsonData = JSON.parse(match[0]);
     }
     if (!Array.isArray(jsonData.summary) || !Array.isArray(jsonData.questions)) {
       throw new Error('Định dạng AI (Quiz) trả về không hợp lệ');
     }
     return jsonData;

  } catch (error) {
    // ... (Toàn bộ code xử lý lỗi và list models của bạn giữ nguyên) ...
     const errMsg = error?.message || String(error);
     console.error('Lỗi khi gọi Gemini API (Quiz):', errMsg);
     if (/not found|404|invalid/i.test(errMsg)) {
       const models = await listAvailableModels();
       console.error('CÓ LỖI MODEL:', `Model "${modelName}" không khả dụng.`);
       console.error(models.slice(0, 30).map(m => m.name).join('\n'));
       throw new Error(`Model "${modelName}" không khả dụng. Đổi GEMINI_MODEL trong .env (ví dụ: 'models/gemini-pro' hoặc 'models/gemini-1.5-flash-latest').`);
     }
    throw new Error('Không thể tạo quiz từ AI: ' + errMsg);
  }
}

// Hàm 2: generate words (Hàm mới)
async function generateWordsFromTopic(topic) {
  const prompt = `
Tạo 10 từ vựng tiếng Anh quan trọng về chủ đề "${topic}".
YÊU CẦU:
- Trả về MỘT đối tượng JSON duy nhất (không dùng markdown).
- Định nghĩa (definition) phải BẰNG TIẾNG VIỆT.
- Câu ví dụ (example) phải BẰNG TIẾNG ANH.
- Cấu trúc:
{ "words": [ { "word": "...", "definition": "...", "example": "..." } ] }
`.trim();

  let modelName = PREFERRED_MODEL;
  let modelClient;
  try {
    modelClient = genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn('Lỗi khi tạo model client với', modelName, err);
  }

  try {
    // ... (Copy-paste code try...catch y hệt hàm trên) ...
     if (!modelClient) throw new Error('Không tạo được model client');
     const generation = await modelClient.generateContent(prompt);
     const response = await generation.response;
     let textResp = await response.text();
     textResp = textResp.replace(/```json|```/g, '').trim();
     let jsonData;
     try { jsonData = JSON.parse(textResp); } catch (e) {
       const match = textResp.match(/\{[\s\S]*\}$/);
       if (!match) throw new Error('AI (Vocab) trả về định dạng không parse được JSON');
       jsonData = JSON.parse(match[0]);
     }
     if (!Array.isArray(jsonData.words)) {
       throw new Error('Định dạng AI (Vocab) trả về không hợp lệ');
     }
     return jsonData;
     
  } catch (error) {
    // ... (Copy-paste code xử lý lỗi y hệt hàm trên) ...
     const errMsg = error?.message || String(error);
     console.error('Lỗi khi gọi Gemini API (Vocab):', errMsg);
     if (/not found|404|invalid/i.test(errMsg)) {
       const models = await listAvailableModels();
       console.error('CÓ LỖI MODEL:', `Model "${modelName}" không khả dụng.`);
       console.error(models.slice(0, 30).map(m => m.name).join('\n'));
       throw new Error(`Model "${modelName}" không khả dụng.`);
     }
    throw new Error('Không thể tạo bộ từ vựng từ AI: ' + errMsg);
  }
}

module.exports = { 
  generateQuizFromText, 
  generateWordsFromTopic, // <-- Thêm hàm này
  listAvailableModels 
};