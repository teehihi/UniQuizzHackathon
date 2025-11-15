// config/api.js
// Cấu hình API endpoint

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  DECKS: `${API_BASE_URL}/api/decks`,
  DECK_BY_ID: (id) => `${API_BASE_URL}/api/decks/${id}`,
  DELETE_DECK: (id) => `${API_BASE_URL}/api/decks/${id}`,
  TEST: `${API_BASE_URL}/api/test`,
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,

  TOPIC_BY_ID: (id) => `${API_BASE_URL}/api/topics/${id}`,
};

export default API_BASE_URL;

