// server/models/Document.js - RAG Document Store
const mongoose = require('mongoose');

// Schema cho document chunks (phần nhỏ của tài liệu)
const DocumentChunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    index: 'text' // Text search index
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  metadata: {
    startPage: Number,
    endPage: Number,
    section: String,
    wordCount: Number
  }
}, { _id: false });

// Schema chính cho document
const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'pptx', 'txt', 'url', 'youtube'],
    required: true
  },
  sourceUrl: String, // Nếu là từ URL hoặc YouTube
  
  // Nội dung gốc
  fullContent: {
    type: String,
    required: true
  },
  
  // Chia nhỏ thành chunks để RAG
  chunks: [DocumentChunkSchema],
  
  // Metadata
  metadata: {
    totalWords: Number,
    totalChunks: Number,
    language: {
      type: String,
      default: 'vi'
    },
    extractedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Thống kê sử dụng
  usageStats: {
    quizGenerated: {
      type: Number,
      default: 0
    },
    flashcardsGenerated: {
      type: Number,
      default: 0
    },
    mentorQuestions: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  },
  
  // Tags để phân loại
  tags: [String],
  
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes để tìm kiếm nhanh
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ title: 'text', 'chunks.content': 'text' });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ fileType: 1 });

// Method để tìm kiếm chunks liên quan
DocumentSchema.methods.searchRelevantChunks = function(query, limit = 5) {
  // Simple text matching - có thể nâng cấp thành vector search sau
  const searchTerms = query.toLowerCase().split(' ');
  
  const scoredChunks = this.chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    
    // Tính điểm dựa trên số lượng từ khóa xuất hiện
    searchTerms.forEach(term => {
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    });
    
    return {
      ...chunk.toObject(),
      relevanceScore: score
    };
  });
  
  // Sắp xếp theo điểm và trả về top chunks
  return scoredChunks
    .filter(chunk => chunk.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
};

// Method để cập nhật thống kê sử dụng
DocumentSchema.methods.recordUsage = function(type) {
  this.usageStats[type] = (this.usageStats[type] || 0) + 1;
  this.usageStats.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('Document', DocumentSchema);