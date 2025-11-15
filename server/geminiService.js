// geminiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

if (!GEMINI_API_KEY) {
  throw new Error('Không tìm thấy GEMINI_API_KEY trong file .env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// helper: gọi list models (debug/log)
async function listAvailableModels() {
  try {
    const res = await genAI.listModels(); // nếu SDK hỗ trợ method này
    // nếu SDK không có, dùng fallback: gọi REST
    return res?.models || [];
  } catch (e) {
    // fallback: fetch trực tiếp REST (sử dụng node fetch)
    try {
      const fetch = global.fetch || (await import('node-fetch')).default;
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      const data = await r.json();
      return data.models || [];
    } catch (err) {
      console.warn('Không thể lấy model list:', err);
      return [];
    }
  }
}

// Hàm chính: generate quiz
async function generateQuizFromText(text, questionCount = 10) {
  // Đảm bảo questionCount hợp lệ
  const numQuestions = Math.max(1, Math.min(50, parseInt(questionCount) || 10));
  
  // build prompt
  const prompt = `
Dựa vào văn bản sau đây, hãy thực hiện 2 yêu cầu:
1) Tóm tắt nội dung chính trong 3 gạch đầu dòng (summary).
2) Tạo ${numQuestions} câu hỏi trắc nghiệm (questions) chỉ tập trung vào nội dung văn bản.

YÊU CẦU:
- Trả về duy nhất 1 đối tượng JSON (không dùng markdown).
- Cấu trúc:
{
  "summary": ["...","...","..."],
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}

Văn bản:
---
${text}
---
`.trim();

  // Try preferred model, nếu 404 => log listModels và ném lỗi có hướng dẫn
  let modelName = PREFERRED_MODEL;
  // create model client via SDK getGenerativeModel (cách bạn dùng trước đó)
  let modelClient;
  try {
    modelClient = genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn('Lỗi khi tạo model client với', modelName, err);
    // tiếp tục, để khi gọi generate sẽ bắt lỗi
  }

  try {
    if (!modelClient) {
      throw new Error('Không tạo được model client. Kiểm tra tên model trong .env');
    }

    const generation = await modelClient.generateContent(prompt);
    const response = await generation.response;
    let textResp = await response.text();

    // strip fences và parse JSON an toàn
    textResp = textResp.replace(/```json|```/g, '').trim();
    let jsonData;
    try {
      jsonData = JSON.parse(textResp);
    } catch (e) {
      const match = textResp.match(/\{[\s\S]*\}$/);
      if (!match) {
        console.error('AI trả về không phải JSON:', textResp);
        throw new Error('AI trả về định dạng không parse được JSON');
      }
      jsonData = JSON.parse(match[0]);
    }

    if (!Array.isArray(jsonData.summary) || !Array.isArray(jsonData.questions)) {
      console.error('Định dạng JSON không đúng:', jsonData);
      throw new Error('Định dạng AI trả về không hợp lệ');
    }

    return jsonData;
  } catch (error) {
    // Nếu là lỗi 404 của model => lấy list và log cho dev
    const errMsg = error?.message || String(error);
    console.error('Lỗi khi gọi Gemini API:', errMsg);

    // nếu là lỗi liên quan model not found => show available models (gỡ lỗi)
    if (/not found|404/i.test(errMsg)) {
      const models = await listAvailableModels();
      console.error('Có vẻ model', modelName, 'không khả dụng với key này. Models có sẵn (một vài mục):');
      console.error(models.slice(0, 30).map(m => (m.name || m)).join('\n'));
      throw new Error(`Model "${modelName}" không khả dụng cho key này. Xem log server để biết danh sách model khả dụng (hoặc chạy curl "https://generativelanguage.googleapis.com/v1beta/models?key=...").`);
    }

    // default: ném lỗi tổng quát
    throw new Error('Không thể tạo quiz từ AI: ' + errMsg);
  }
}

module.exports = { generateQuizFromText, listAvailableModels };