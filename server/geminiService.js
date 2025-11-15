require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Sửa 'gemini-2.5-flash-lite' thành 'gemini-1.5-flash-latest' hoặc model mới hơn nếu cần
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

if (!GEMINI_API_KEY) {
  throw new Error('Không tìm thấy GEMINI_API_KEY trong file .env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Danh sách model ưu tiên (có fallback)
const FALLBACK_MODELS = [
  PREFERRED_MODEL,
  'gemini-1.5-flash', // Đảm bảo model này tồn tại
  'gemini-1.5-pro' // Đảm bảo model này tồn tại
].filter(Boolean);

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
/**
 * Tạo client model với logic fallback.
 */
async function getModelClient() {
  for (const name of FALLBACK_MODELS) {
    try {
      const client = genAI.getGenerativeModel({ model: name });
      // Thêm log để biết model nào đang được dùng
      console.log(`Using Gemini model: ${name}`);
      return { client, name };
    } catch (e) {
      console.warn(`Model ${name} không khả dụng, thử model tiếp theo...`);
    }
  }
  throw new Error('Không tạo được model client. Thử đặt GEMINI_MODEL=gemini-1.5-flash trong .env');
}

/**
 * helper: gọi list models (debug/log)
 * Cập nhật để sử dụng API v1beta
 */
async function listAvailableModels() {
  try {
    // Dùng REST API để lấy danh sách models
    const fetch = global.fetch || (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const r = await fetch(url);

    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`API call failed with status ${r.status}: ${errorText}`);
    }

    const data = await r.json();
    return data.models || [];
  } catch (err) {
    console.warn('Không thể lấy model list:', err.message);
    return [];
  }
}

/**
 * Helper: Cấu hình bắt buộc để model trả về JSON
 */
const jsonGenerationConfig = {
  responseMimeType: "application/json",
};

/**
 * Helper: Trích xuất JSON an toàn từ phản hồi của AI
 */
function extractJsonFromResponse(response) {
  let textResp = response.text();
  textResp = textResp.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(textResp);
  } catch (e) {
    // Thử tìm JSON lồng bên trong
    const match = textResp.match(/\{[\s\S]*\}$/);
    if (match && match[0]) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        console.error('Không thể parse JSON từ text (lần 2):', textResp);
        throw new Error('AI trả về định dạng không parse được JSON (lần 2)');
      }
    }
    console.error('AI trả về không phải JSON:', textResp);
    throw new Error('AI trả về định dạng không parse được JSON');
  }
}

/**
 * Hàm chính: generate quiz
 */
// ⭐️ SỬA 1: Thêm 'numQuestions' làm tham số
async function generateQuizFromText(text, numQuestions = 10) {
  // build prompt
  const prompt = `
Dựa vào văn bản sau đây, hãy thực hiện 2 yêu cầu:
1) Tóm tắt nội dung chính trong 3 gạch đầu dòng (summary).
// ⭐️ SỬA 2: Dùng biến 'numQuestions' để prompt linh hoạt hơn
2) Tạo ${numQuestions} câu hỏi trắc nghiệm (questions) chỉ tập trung vào nội dung văn bản.

YÊU CẦU:
- Trả về duy nhất 1 đối tượng JSON (không dùng markdown).

// ⭐️ SỬA 3: Thêm chỉ dẫn RẤT RÕ RÀNG về trường "answer"
- Trong mỗi câu hỏi, trường "answer" PHẢI là chữ cái (A, B, C, hoặc D) tương ứng với đáp án ĐÚNG.
- Đáp án đúng PHẢI nằm trong mảng "options".

- Cấu trúc:
{
  "summary": ["...","...","..."],
  "questions": [
    // ⭐️ SỬA 4: Cung cấp một ví dụ rõ ràng và không dùng "A"
    {
        "question": "Nội dung câu hỏi 1 là gì?",
        "options": [
            "nội dung 1",
            "nội dung 2",
            "nội dung 3",
            "nội dung 4"
        ],
        "answer": random trong 4 cái trong option
    }
  ]
}

Văn bản:
---
${text}
---
`.trim();

  let modelName = PREFERRED_MODEL;
  let modelClient;

  try {
    const picked = await getModelClient();
    modelClient = picked.client;
    modelName = picked.name;
  } catch (err) {
    console.error('Lỗi khi tạo model client:', err);
    throw new Error('Không tạo được model client. Kiểm tra tên model trong .env');
  }

  try {
    // Gửi prompt và yêu cầu JSON
    const generation = await modelClient.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: jsonGenerationConfig
    });

    const response = await generation.response;
    const jsonData = extractJsonFromResponse(response);

    if (!jsonData || !Array.isArray(jsonData.summary) || !Array.isArray(jsonData.questions)) {
      console.error('Định dạng JSON không đúng:', jsonData);
      throw new Error('Định dạng AI trả về không hợp lệ');
    }

    // ⭐️ SỬA 5 (Tùy chọn): Thêm kiểm tra logic đáp án (nếu cẩn thận)
    for (const q of jsonData.questions) {
      const validAnswers = ['A', 'B', 'C', 'D'];
      if (!q.answer || !validAnswers.includes(String(q.answer).toUpperCase())) {
        console.warn(`AI trả về đáp án không hợp lệ: "${q.answer}" cho câu hỏi: "${q.question}"`);
        // Có thể gán tạm một đáp án mặc định nếu muốn, hoặc báo lỗi
        // q.answer = 'A'; 
      }
      if (!q.options || q.options.length !== 4) {
        console.warn(`AI trả về số lượng options không hợp lệ cho câu hỏi: "${q.question}"`);
      }
    }

    return jsonData;
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error(`Lỗi khi gọi Gemini API (model: ${modelName}):`, errMsg);

    // nếu là lỗi liên quan model not found => show available models (gỡ lỗi)
    if (/not found|404|invalid api key/i.test(errMsg)) {
      const models = await listAvailableModels();
      console.error('Có vẻ model', modelName, 'không khả dụng hoặc API key có vấn đề. Models có sẵn (một vài mục):');
      console.error(models.slice(0, 30).map(m => m.name).join('\n'));
      throw new Error(`Model "${modelName}" không khả dụng hoặc API key sai. Xem log server để biết danh sách model khả dụng.`);
    }

    // default: ném lỗi tổng quát
    throw new Error('Không thể tạo quiz từ AI: ' + errMsg);
  }
}

/**
 * Sinh flashcards từ văn bản.
 */
async function generateFlashcardsFromText(text, options = {}) {
  const count = Math.max(8, Math.min(50, parseInt(options.count || 20, 10) || 20));

  try {
    const prompt = `
Hãy tạo ${count} flashcard từ văn bản sau. Mỗi flashcard phải bám sát nội dung, ngắn gọn, hữu ích để học nhanh.

YÊU CẦU BẮT BUỘC:
- CHỈ trả về MỘT đối tượng JSON, KHÔNG dùng markdown hay \`\`\`.
- Cấu trúc JSON:
{
  "flashcards": [
    { "front": "Thuật ngữ hoặc câu hỏi", "back": "Định nghĩa hoặc đáp án", "hint": "Gợi ý ngắn (tùy chọn)" }
  ]
}

VĂN BẢN:
---
${text}
---
`.trim();

    const { client: modelClient, name: modelName } = await getModelClient();

    const result = await modelClient.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: jsonGenerationConfig
    });

    const response = await result.response;
    const data = extractJsonFromResponse(response);

    if (!data || !Array.isArray(data.flashcards)) {
      throw new Error('Định dạng AI trả về không hợp lệ (thiếu flashcards)');
    }

    const flashcards = data.flashcards
      .filter(fc => fc && fc.front && fc.back)
      .map(fc => ({
        front: String(fc.front).trim(),
        back: String(fc.back).trim(),
        hint: fc.hint ? String(fc.hint).trim() : undefined,
        tags: Array.isArray(fc.tags) ? fc.tags.map(String) : undefined
      }));

    if (flashcards.length === 0) {
      console.warn("AI đã trả về JSON hợp lệ nhưng không có flashcard nào bên trong.");
      // Trả về mảng rỗng thay vì ném lỗi
      return { flashcards: [] };
    }

    return { flashcards };
  } catch (err) {
    console.error('Lỗi khi gọi Gemini API (flashcards):', err.message);
    throw new Error('Không thể tạo flashcards từ AI: ' + err.message);
  }
}

module.exports = {
  generateQuizFromText,
  generateFlashcardsFromText,
  listAvailableModels,
  generateWordsFromTopic // export thêm để tiện debug bên ngoài
};