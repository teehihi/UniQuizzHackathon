// config/api.js
// Cấu hình API endpoint

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  // --- File/Upload ---
  UPLOAD: `${API_BASE_URL}/api/upload`,
  
  // --- Deck/Flashcard Endpoints ---
  // ⭐️ FLASHCARD_SETS (Sửa từ DECK nếu backend dùng Flashcards) ⭐️
  FLASHCARD_SETS: `${API_BASE_URL}/api/flashcards`, 
  // ⭐️ TẠO FLASHCARD TỪ FILE (Cần cho trang CreateFlashcardPage) ⭐️
  FLASHCARD_GENERATE: `${API_BASE_URL}/api/flashcards/generate`,
  
  // Các Deck/Flashcard cũ đã có
  DECKS: `${API_BASE_URL}/api/decks`,
  DECK_BY_ID: (id) => `${API_BASE_URL}/api/decks/${id}`,
  DELETE_DECK: (id) => `${API_BASE_URL}/api/decks/${id}`,

  // --- Topic/Vocabulary Endpoints ---
  // ⭐️ LẤY TẤT CẢ TOPICS (Cần cho trang VocabularyPage) ⭐️
  TOPICS: `${API_BASE_URL}/api/topics`,
  // ⭐️ TẠO TOPIC BẰNG AI (Cần cho trang VocabularyPage) ⭐️
  TOPIC_GENERATE: `${API_BASE_URL}/api/topics/generate`,
  TOPIC_BY_ID: (id) => `${API_BASE_URL}/api/topics/${id}`,

  TEST: `${API_BASE_URL}/api/test`,
  
  // --- Auth endpoints ---
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
};

export default API_BASE_URL;