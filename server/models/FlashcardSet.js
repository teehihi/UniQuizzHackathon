const mongoose = require('mongoose');

// Schema cho một flashcard (không phải là model riêng)
const flashcardSchema = new mongoose.Schema(
  { front: String, back: String, hint: String, tags: [String] },
  { _id: false } // Không tạo _id cho từng flashcard riêng lẻ
);

// Schema cho một bộ flashcard
const flashcardSetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseCode: { type: String },
    flashcards: { type: [flashcardSchema], default: [] }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Tạo model
const FlashcardSet = mongoose.models.FlashcardSet || mongoose.model('FlashcardSet', flashcardSetSchema);

module.exports = FlashcardSet;