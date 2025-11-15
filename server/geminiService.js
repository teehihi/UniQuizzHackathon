// require('dotenv').config();
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// // Sửa 'gemini-2.5-flash-lite' thành 'gemini-1.5-flash-latest' hoặc model mới hơn nếu cần
// const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

// if (!GEMINI_API_KEY) {
//   throw new Error('Không tìm thấy GEMINI_API_KEY trong file .env');
// }

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// // Danh sách model ưu tiên (có fallback)
// const FALLBACK_MODELS = [
//   PREFERRED_MODEL,
//   'gemini-1.5-flash', // Đảm bảo model này tồn tại
//   'gemini-1.5-pro' // Đảm bảo model này tồn tại
// ].filter(Boolean);

// async function generateWordsFromTopic(topic) {
//   const prompt = `
// Tạo 10 từ vựng tiếng Anh quan trọng về chủ đề "${topic}".
// YÊU CẦU:
// - Trả về MỘT đối tượng JSON duy nhất (không dùng markdown).
// - Định nghĩa (definition) phải BẰNG TIẾNG VIỆT.
// - Câu ví dụ (example) phải BẰNG TIẾNG ANH.
// - Cấu trúc:
// { "words": [ { "word": "...", "definition": "...", "example": "..." } ] }
// `.trim();

//   let modelName = PREFERRED_MODEL;
//   let modelClient;
//   try {
//     modelClient = genAI.getGenerativeModel({ model: modelName });
//   } catch (err) {
//     console.warn('Lỗi khi tạo model client với', modelName, err);
//   }

//   try {
//     // ... (Copy-paste code try...catch y hệt hàm trên) ...
//     if (!modelClient) throw new Error('Không tạo được model client');
//     const generation = await modelClient.generateContent(prompt);
//     const response = await generation.response;
//     let textResp = await response.text();
//     textResp = textResp.replace(/```json|```/g, '').trim();
//     let jsonData;
//     try { jsonData = JSON.parse(textResp); } catch (e) {
//       const match = textResp.match(/\{[\s\S]*\}$/);
//       if (!match) throw new Error('AI (Vocab) trả về định dạng không parse được JSON');
//       jsonData = JSON.parse(match[0]);
//     }
//     if (!Array.isArray(jsonData.words)) {
//       throw new Error('Định dạng AI (Vocab) trả về không hợp lệ');
//     }
//     return jsonData;

//   } catch (error) {
//     // ... (Copy-paste code xử lý lỗi y hệt hàm trên) ...
//     const errMsg = error?.message || String(error);
//     console.error('Lỗi khi gọi Gemini API (Vocab):', errMsg);
//     if (/not found|404|invalid/i.test(errMsg)) {
//       const models = await listAvailableModels();
//       console.error('CÓ LỖI MODEL:', `Model "${modelName}" không khả dụng.`);
//       console.error(models.slice(0, 30).map(m => m.name).join('\n'));
//       throw new Error(`Model "${modelName}" không khả dụng.`);
//     }
//     throw new Error('Không thể tạo bộ từ vựng từ AI: ' + errMsg);
//   }
// }

// // Tạo 1 từ mới
// async function generateSingleWordFromTopic(topic) {
//   const prompt = `
// Tạo 1 từ vựng tiếng Anh DUY NHẤT về chủ đề "${topic}".
// YÊU CẦU:
// - Tuyệt đối KHÔNG tạo danh sách.
// - Tuyệt đối KHÔNG trả về nhiều từ.
// - Chỉ trả về MỘT đối tượng JSON DUY NHẤT (không dùng markdown).
// - Định nghĩa (definition) phải BẰNG TIẾNG VIỆT.
// - Câu ví dụ (example) phải BẰNG TIẾNG ANH.
// - Cấu trúc trả về:
// {
//   "word": "...",
//   "definition": "...",
//   "example": "..."
// }
//   `.trim();

//   let modelName = PREFERRED_MODEL;
//   let modelClient;

//   try {
//     modelClient = genAI.getGenerativeModel({ model: modelName });
//   } catch (err) {
//     console.warn("Lỗi tạo model client:", err);
//   }

//   try {
//     if (!modelClient) throw new Error("Không tạo được model client");

//     const generation = await modelClient.generateContent(prompt);
//     const response = generation.response;
//     let textResp = await response.text();

//     // Xóa markdown nếu có
//     textResp = textResp.replace(/```json|```/g, "").trim();

//     let jsonData;

//     try {
//       jsonData = JSON.parse(textResp);
//     } catch (e) {
//       // fallback tìm đoạn JSON đầu tiên
//       const match = textResp.match(/\{[\s\S]*\}$/);
//       if (!match) throw new Error("AI trả về sai format JSON");
//       jsonData = JSON.parse(match[0]);
//     }

//     // Kiểm tra đúng cấu trúc (1 từ)
//     if (!jsonData.word || !jsonData.definition || !jsonData.example) {
//       throw new Error("AI trả về sai cấu trúc cho SINGLE WORD");
//     }

//     return jsonData; // chỉ 1 từ duy nhất

//   } catch (error) {
//     const errMsg = error?.message || String(error);
//     console.error("Lỗi gọi Gemini API (Single Word):", errMsg);

//     if (/404|not found|invalid/i.test(errMsg)) {
//       const models = await listAvailableModels();
//       console.error("MODEL KHÔNG HỢP LỆ:", modelName);
//       console.error(models.slice(0, 30).map(m => m.name).join("\n"));
//       throw new Error(`Model "${modelName}" không khả dụng.`);
//     }

//     throw new Error("Không thể tạo từ vựng từ AI: " + errMsg);
//   }
// }

// /**
//  * Tạo client model với logic fallback.
//  */
// async function getModelClient() {
//   for (const name of FALLBACK_MODELS) {
//     try {
//       const client = genAI.getGenerativeModel({ model: name });
//       // Thêm log để biết model nào đang được dùng
//       console.log(`Using Gemini model: ${name}`);
//       return { client, name };
//     } catch (e) {
//       console.warn(`Model ${name} không khả dụng, thử model tiếp theo...`);
//     }
//   }
//   throw new Error('Không tạo được model client. Thử đặt GEMINI_MODEL=gemini-1.5-flash trong .env');
// }

// /**
//  * helper: gọi list models (debug/log)
//  * Cập nhật để sử dụng API v1beta
//  */
// async function listAvailableModels() {
//   try {
//     // Dùng REST API để lấy danh sách models
//     const fetch = global.fetch || (await import('node-fetch')).default;
//     const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
//     const r = await fetch(url);

//     if (!r.ok) {
//       const errorText = await r.text();
//       throw new Error(`API call failed with status ${r.status}: ${errorText}`);
//     }

//     const data = await r.json();
//     return data.models || [];
//   } catch (err) {
//     console.warn('Không thể lấy model list:', err.message);
//     return [];
//   }
// }

// /**
//  * Helper: Cấu hình bắt buộc để model trả về JSON
//  */
// const jsonGenerationConfig = {
//   responseMimeType: "application/json",
// };

// /**
//  * Helper: Trích xuất JSON an toàn từ phản hồi của AI
//  */
// function extractJsonFromResponse(response) {
//   let textResp = response.text();
//   textResp = textResp.replace(/```json|```/g, '').trim();

//   try {
//     return JSON.parse(textResp);
//   } catch (e) {
//     // Thử tìm JSON lồng bên trong
//     const match = textResp.match(/\{[\s\S]*\}$/);
//     if (match && match[0]) {
//       try {
//         return JSON.parse(match[0]);
//       } catch (e2) {
//         console.error('Không thể parse JSON từ text (lần 2):', textResp);
//         throw new Error('AI trả về định dạng không parse được JSON (lần 2)');
//       }
//     }
//     console.error('AI trả về không phải JSON:', textResp);
//     throw new Error('AI trả về định dạng không parse được JSON');
//   }
// }

// /**
//  * Hàm chính: generate quiz
//  */
// // ⭐️ SỬA 1: Thêm 'numQuestions' làm tham số
// async function generateQuizFromText(text, numQuestions = 10) {
//   // build prompt
//   const prompt = `
// Dựa vào văn bản sau đây, hãy thực hiện 2 yêu cầu:
// 1) Tóm tắt nội dung chính trong 3 gạch đầu dòng (summary).
// // ⭐️ SỬA 2: Dùng biến 'numQuestions' để prompt linh hoạt hơn
// 2) Tạo ${numQuestions} câu hỏi trắc nghiệm (questions) chỉ tập trung vào nội dung văn bản.

// YÊU CẦU:
// - Trả về duy nhất 1 đối tượng JSON (không dùng markdown).

// // ⭐️ SỬA 3: Thêm chỉ dẫn RẤT RÕ RÀNG về trường "answer"
// - Trong mỗi câu hỏi, trường "answer" PHẢI là chữ cái (A, B, C, hoặc D) tương ứng với đáp án ĐÚNG.
// - Đáp án đúng PHẢI nằm trong mảng "options".

// - Cấu trúc:
// {
//   "summary": ["...","...","..."],
//   "questions": [
//     // ⭐️ SỬA 4: Cung cấp một ví dụ rõ ràng và không dùng "A"
//     {
//         "question": "Nội dung câu hỏi 1 là gì?",
//         "options": [
//             "nội dung 1",
//             "nội dung 2",
//             "nội dung 3",
//             "nội dung 4"
//         ],
//         "answer": random trong 4 nội dung của 4 đáp án phía trên
//     }
//   ]
// }

// Văn bản:
// ---
// ${text}
// ---
// `.trim();

//   let modelName = PREFERRED_MODEL;
//   let modelClient;

//   try {
//     const picked = await getModelClient();
//     modelClient = picked.client;
//     modelName = picked.name;
//   } catch (err) {
//     console.error('Lỗi khi tạo model client:', err);
//     throw new Error('Không tạo được model client. Kiểm tra tên model trong .env');
//   }

//   try {
//     // Gửi prompt và yêu cầu JSON
//     const generation = await modelClient.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: jsonGenerationConfig
//     });

//     const response = await generation.response;
//     const jsonData = extractJsonFromResponse(response);

//     if (!jsonData || !Array.isArray(jsonData.summary) || !Array.isArray(jsonData.questions)) {
//       console.error('Định dạng JSON không đúng:', jsonData);
//       throw new Error('Định dạng AI trả về không hợp lệ');
//     }

//     // ⭐️ SỬA 5 (Tùy chọn): Thêm kiểm tra logic đáp án (nếu cẩn thận)
//     for (const q of jsonData.questions) {
//       const validAnswers = ['A', 'B', 'C', 'D'];
//       if (!q.answer || !validAnswers.includes(String(q.answer).toUpperCase())) {
//         console.warn(`AI trả về đáp án không hợp lệ: "${q.answer}" cho câu hỏi: "${q.question}"`);
//         // Có thể gán tạm một đáp án mặc định nếu muốn, hoặc báo lỗi
//         // q.answer = 'A'; 
//       }
//       if (!q.options || q.options.length !== 4) {
//         console.warn(`AI trả về số lượng options không hợp lệ cho câu hỏi: "${q.question}"`);
//       }
//     }

//     return jsonData;
//   } catch (error) {
//     const errMsg = error?.message || String(error);
//     console.error(`Lỗi khi gọi Gemini API (model: ${modelName}):`, errMsg);

//     // nếu là lỗi liên quan model not found => show available models (gỡ lỗi)
//     if (/not found|404|invalid api key/i.test(errMsg)) {
//       const models = await listAvailableModels();
//       console.error('Có vẻ model', modelName, 'không khả dụng hoặc API key có vấn đề. Models có sẵn (một vài mục):');
//       console.error(models.slice(0, 30).map(m => m.name).join('\n'));
//       throw new Error(`Model "${modelName}" không khả dụng hoặc API key sai. Xem log server để biết danh sách model khả dụng.`);
//     }

//     // default: ném lỗi tổng quát
//     throw new Error('Không thể tạo quiz từ AI: ' + errMsg);
//   }
// }

// /**
//  * Sinh flashcards từ văn bản.
//  */
// async function generateFlashcardsFromText(text, options = {}) {
//   const count = Math.max(8, Math.min(50, parseInt(options.count || 20, 10) || 20));

//   try {
//     const prompt = `
// Hãy tạo ${count} flashcard từ văn bản sau. Mỗi flashcard phải bám sát nội dung, ngắn gọn, hữu ích để học nhanh.

// YÊU CẦU BẮT BUỘC:
// - CHỈ trả về MỘT đối tượng JSON, KHÔNG dùng markdown hay \`\`\`.
// - Cấu trúc JSON:
// {
//   "flashcards": [
//     { "front": "Thuật ngữ hoặc câu hỏi", "back": "Định nghĩa hoặc đáp án", "hint": "Gợi ý ngắn (tùy chọn)" }
//   ]
// }

// VĂN BẢN:
// ---
// ${text}
// ---
// `.trim();

//     const { client: modelClient, name: modelName } = await getModelClient();

//     const result = await modelClient.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: jsonGenerationConfig
//     });

//     const response = await result.response;
//     const data = extractJsonFromResponse(response);

//     if (!data || !Array.isArray(data.flashcards)) {
//       throw new Error('Định dạng AI trả về không hợp lệ (thiếu flashcards)');
//     }

//     const flashcards = data.flashcards
//       .filter(fc => fc && fc.front && fc.back)
//       .map(fc => ({
//         front: String(fc.front).trim(),
//         back: String(fc.back).trim(),
//         hint: fc.hint ? String(fc.hint).trim() : undefined,
//         tags: Array.isArray(fc.tags) ? fc.tags.map(String) : undefined
//       }));

//     if (flashcards.length === 0) {
//       console.warn("AI đã trả về JSON hợp lệ nhưng không có flashcard nào bên trong.");
//       // Trả về mảng rỗng thay vì ném lỗi
//       return { flashcards: [] };
//     }

//     return { flashcards };
//   } catch (err) {
//     console.error('Lỗi khi gọi Gemini API (flashcards):', err.message);
//     throw new Error('Không thể tạo flashcards từ AI: ' + err.message);
//   }
// }

// module.exports = {
//   generateQuizFromText,
//   generateFlashcardsFromText,
//   listAvailableModels,
//   generateWordsFromTopic,
//   generateSingleWordFromTopic
// };

// server/geminiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Cấu hình Ban Đầu ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Sử dụng model có tốc độ tốt và khả năng theo format JSON
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

if (!GEMINI_API_KEY) {
    throw new Error('Không tìm thấy GEMINI_API_KEY trong file .env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Danh sách model ưu tiên (có fallback)
const FALLBACK_MODELS = [
    PREFERRED_MODEL,
    'gemini-1.5-flash',
    'gemini-1.5-pro'
].filter(Boolean);

console.log(`[Khởi tạo AI] Đang cố gắng sử dụng model: ${PREFERRED_MODEL}`);

// --- Helpers ---

/**
 * Helper: Cấu hình bắt buộc để model trả về JSON
 */
const jsonGenerationConfig = {
    responseMimeType: "application/json",
};

/**
 * Tạo client model với logic fallback.
 */
async function getModelClient() {
    for (const name of FALLBACK_MODELS) {
        try {
            const client = genAI.getGenerativeModel({ model: name });
            // Thêm log để biết model nào đang được dùng
            // console.log(`Using Gemini model: ${name}`);
            return { client, name };
        } catch (e) {
            // console.warn(`Model ${name} không khả dụng, thử model tiếp theo...`);
        }
    }
    throw new Error('Không tạo được model client. Thử đặt GEMINI_MODEL=gemini-1.5-flash trong .env');
}

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
 * helper: gọi list models (debug/log)
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

// --- Hàm Chính ---

/**
 * Hàm 1: generate quiz
 * @param {string} text - Văn bản nguồn.
 * @param {number} numQuestions - Số lượng câu hỏi cần tạo (mặc định 10).
 */
async function generateQuizFromText(text, numQuestions = 10) {
    numQuestions = Math.max(1, Math.min(20, parseInt(numQuestions, 10) || 10));

    const prompt = `
Dựa vào văn bản sau đây, hãy thực hiện 2 yêu cầu:
1) Tóm tắt nội dung chính trong 3 gạch đầu dòng (summary).
2) Tạo chính xác ${numQuestions} câu hỏi trắc nghiệm (questions) chỉ tập trung vào nội dung văn bản.

YÊU CẦU BẮT BUỘC:
- Trả về duy nhất 1 đối tượng JSON (không dùng markdown).
- Trong mỗi câu hỏi, trường "answer" PHẢI là một trong bốn nội dung của trường "options".
- Trường "options" phải là một mảng (array) chứa 4 chuỗi (string) nội dung câu trả lời.
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

    let modelName = PREFERRED_MODEL;

    try {
        const picked = await getModelClient();
        const modelClient = picked.client;
        modelName = picked.name;

        const generation = await modelClient.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: jsonGenerationConfig
        });

        const jsonData = extractJsonFromResponse(generation.response);

        if (!jsonData || !Array.isArray(jsonData.summary) || !Array.isArray(jsonData.questions)) {
            throw new Error('Định dạng AI trả về không hợp lệ');
        }

        return jsonData;
    } catch (error) {
        const errMsg = error?.message || String(error);
        console.error(`Lỗi khi gọi Gemini API (Quiz - model: ${modelName}):`, errMsg);

        if (/not found|404|invalid api key/i.test(errMsg)) {
            await listAvailableModels(); // Log available models for debugging
            throw new Error(`Model "${modelName}" không khả dụng.`);
        }

        throw new Error('Không thể tạo quiz từ AI: ' + errMsg);
    }
}

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

// Tạo 1 từ mới
async function generateSingleWordFromTopic(topic) {
  const prompt = `
Tạo 1 từ vựng tiếng Anh DUY NHẤT về chủ đề "${topic}".
YÊU CẦU:
- Tuyệt đối KHÔNG tạo danh sách.
- Tuyệt đối KHÔNG trả về nhiều từ.
- Chỉ trả về MỘT đối tượng JSON DUY NHẤT (không dùng markdown).
- Định nghĩa (definition) phải BẰNG TIẾNG VIỆT.
- Câu ví dụ (example) phải BẰNG TIẾNG ANH.
- Cấu trúc trả về:
{
  "word": "...",
  "definition": "...",
  "example": "..."
}
  `.trim();

  let modelName = PREFERRED_MODEL;
  let modelClient;

  try {
    modelClient = genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn("Lỗi tạo model client:", err);
  }

  try {
    if (!modelClient) throw new Error("Không tạo được model client");

    const generation = await modelClient.generateContent(prompt);
    const response = generation.response;
    let textResp = await response.text();

    // Xóa markdown nếu có
    textResp = textResp.replace(/```json|```/g, "").trim();

    let jsonData;

    try {
      jsonData = JSON.parse(textResp);
    } catch (e) {
      // fallback tìm đoạn JSON đầu tiên
      const match = textResp.match(/\{[\s\S]*\}$/);
      if (!match) throw new Error("AI trả về sai format JSON");
      jsonData = JSON.parse(match[0]);
    }

    // Kiểm tra đúng cấu trúc (1 từ)
    if (!jsonData.word || !jsonData.definition || !jsonData.example) {
      throw new Error("AI trả về sai cấu trúc cho SINGLE WORD");
    }

    return jsonData; // chỉ 1 từ duy nhất

  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error("Lỗi gọi Gemini API (Single Word):", errMsg);

    if (/404|not found|invalid/i.test(errMsg)) {
      const models = await listAvailableModels();
      console.error("MODEL KHÔNG HỢP LỆ:", modelName);
      console.error(models.slice(0, 30).map(m => m.name).join("\n"));
      throw new Error(`Model "${modelName}" không khả dụng.`);
    }

    throw new Error("Không thể tạo từ vựng từ AI: " + errMsg);
  }
}
/**
 * Hàm 4: generate lecture từ file
 * @param {string} text - Nội dung file nguồn.
 */
async function generateLectureFromFile(text) {
    const prompt = `
Chuyển đổi nội dung sau đây thành một bài giảng dễ hiểu, tự nhiên như một giảng viên thật đang giảng bài.

YÊU CẦU:
- Trả về MỘT đối tượng JSON duy nhất (không dùng markdown).
- Bài giảng phải được chia thành các phần (sections) logic, dễ theo dõi.
- Ngôn ngữ tự nhiên, thân thiện, như một giáo viên đang nói chuyện với học sinh.
- Cấu trúc:
{
  "title": "Tiêu đề bài giảng",
  "sections": [
    {
      "title": "Tiêu đề phần",
      "content": "Nội dung phần này, viết như đang nói chuyện, tự nhiên"
    }
  ]
}

Nội dung:
---
${text}
---
`.trim();

    let modelName = PREFERRED_MODEL;

    try {
        const picked = await getModelClient();
        const modelClient = picked.client;
        modelName = picked.name;
        
        const generation = await modelClient.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: jsonGenerationConfig
        });
        
        const jsonData = extractJsonFromResponse(generation.response);

        if (!jsonData.title || !Array.isArray(jsonData.sections)) {
            throw new Error('Định dạng AI (Lecture) trả về không hợp lệ');
        }
        return jsonData;
    } catch (error) {
        const errMsg = error?.message || String(error);
        console.error('Lỗi khi gọi Gemini API (Lecture):', errMsg);
        if (/not found|404|invalid api key/i.test(errMsg)) {
            await listAvailableModels();
            throw new Error(`Model "${modelName}" không khả dụng.`);
        }
        throw new Error('Không thể tạo bài giảng từ AI: ' + errMsg);
    }
}

/**
 * Hàm 5: generate mentor response (Hàm mới cho chat)
 * @param {string} question - Câu hỏi của học sinh.
 * @param {string} lectureContext - Ngữ cảnh bài giảng (tùy chọn).
 */
async function generateMentorResponse(question, lectureContext = '') {
    const prompt = `
Bạn là một giảng viên thân thiện, nhiệt tình và có kiến thức sâu rộng. Học sinh của bạn vừa hỏi một câu hỏi trong lúc bạn đang giảng bài.

YÊU CẦU:
- Trả lời câu hỏi một cách rõ ràng, dễ hiểu, như một giáo viên thật đang giải thích.
- Sử dụng ngôn ngữ tự nhiên, thân thiện.
- Nếu câu hỏi liên quan đến bài giảng, hãy tham khảo ngữ cảnh bài giảng.
- Trả về CHỈ nội dung câu trả lời (không cần JSON, không cần markdown, chỉ văn bản thuần).

${lectureContext ? `Ngữ cảnh bài giảng hiện tại:\n${lectureContext}\n\n` : ''}
Câu hỏi của học sinh: ${question}

Trả lời:
`.trim();

    let modelName = PREFERRED_MODEL;

    try {
        const picked = await getModelClient();
        const modelClient = picked.client;
        modelName = picked.name;
        
        const generation = await modelClient.generateContent(prompt);
        const response = await generation.response;
        
        return response.text().trim();
    } catch (error) {
        const errMsg = error?.message || String(error);
        console.error('Lỗi khi gọi Gemini API (Mentor Response):', errMsg);
        if (/not found|404|invalid api key/i.test(errMsg)) {
            throw new Error(`Model "${modelName}" không khả dụng.`);
        }
        throw new Error('Không thể tạo phản hồi từ mentor: ' + errMsg);
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
// --- Exports ---
module.exports = {
    generateQuizFromText,
    generateWordsFromTopic,
    generateSingleWordFromTopic,
    generateLectureFromFile,
    generateMentorResponse,
    generateFlashcardsFromText,
    listAvailableModels
};