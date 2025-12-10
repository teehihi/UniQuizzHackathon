// server/services/ragService.js - RAG Implementation
const Document = require('../models/Document');

class RAGService {
  
  /**
   * Chia văn bản thành chunks nhỏ để xử lý
   */
  static chunkText(text, chunkSize = 1000, overlap = 200) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 50) { // Bỏ qua chunks quá ngắn
        chunks.push({
          content: chunk.trim(),
          chunkIndex: chunks.length,
          metadata: {
            wordCount: chunk.split(/\s+/).length,
            startWord: i,
            endWord: Math.min(i + chunkSize, words.length)
          }
        });
      }
    }
    
    return chunks;
  }
  
  /**
   * Lưu document vào database với chunking
   */
  static async storeDocument(userId, title, content, metadata = {}) {
    try {
      // Chia nhỏ nội dung
      const chunks = this.chunkText(content);
      
      // Tạo document mới
      const document = new Document({
        userId,
        title,
        originalFileName: metadata.fileName || title,
        fileType: metadata.fileType || 'txt',
        sourceUrl: metadata.sourceUrl,
        fullContent: content,
        chunks,
        metadata: {
          totalWords: content.split(/\s+/).length,
          totalChunks: chunks.length,
          language: metadata.language || 'vi'
        },
        tags: metadata.tags || []
      });
      
      await document.save();
      console.log(`[RAG] ✅ Đã lưu document: ${title} (${chunks.length} chunks)`);
      
      return document;
    } catch (error) {
      console.error('[RAG] ❌ Lỗi lưu document:', error);
      throw error;
    }
  }
  
  /**
   * Tìm kiếm documents liên quan đến query
   */
  static async searchDocuments(userId, query, options = {}) {
    const {
      limit = 10,
      fileTypes = [],
      tags = [],
      includePublic = false
    } = options;
    
    try {
      // Build search filter
      const searchFilter = {
        $or: [
          { userId },
          ...(includePublic ? [{ isPublic: true }] : [])
        ]
      };
      
      if (fileTypes.length > 0) {
        searchFilter.fileType = { $in: fileTypes };
      }
      
      if (tags.length > 0) {
        searchFilter.tags = { $in: tags };
      }
      
      // Text search
      const documents = await Document.find({
        ...searchFilter,
        $text: { $search: query }
      })
      .select('title fileType tags metadata.totalWords createdAt usageStats')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(limit);
      
      console.log(`[RAG] 🔍 Tìm thấy ${documents.length} documents cho query: "${query}"`);
      
      return documents;
    } catch (error) {
      console.error('[RAG] ❌ Lỗi tìm kiếm documents:', error);
      throw error;
    }
  }
  
  /**
   * Lấy context liên quan cho RAG generation
   */
  static async getRelevantContext(userId, query, options = {}) {
    const {
      maxChunks = 5,
      maxContextLength = 3000,
      includePublic = false
    } = options;
    
    try {
      // Tìm documents liên quan
      const documents = await this.searchDocuments(userId, query, {
        limit: 10,
        includePublic
      });
      
      if (documents.length === 0) {
        console.log('[RAG] ⚠️ Không tìm thấy documents liên quan');
        return {
          context: '',
          sources: [],
          totalChunks: 0
        };
      }
      
      // Lấy full documents để search chunks
      const fullDocuments = await Document.find({
        _id: { $in: documents.map(d => d._id) }
      });
      
      // Tìm chunks liên quan từ mỗi document
      let allRelevantChunks = [];
      
      for (const doc of fullDocuments) {
        const relevantChunks = doc.searchRelevantChunks(query, 3);
        
        relevantChunks.forEach(chunk => {
          allRelevantChunks.push({
            ...chunk,
            documentTitle: doc.title,
            documentId: doc._id,
            fileType: doc.fileType
          });
        });
      }
      
      // Sắp xếp theo relevance score và giới hạn
      allRelevantChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
      allRelevantChunks = allRelevantChunks.slice(0, maxChunks);
      
      // Tạo context string
      let context = '';
      let currentLength = 0;
      const sources = [];
      
      for (const chunk of allRelevantChunks) {
        const chunkText = `[Từ: ${chunk.documentTitle}]\n${chunk.content}\n\n`;
        
        if (currentLength + chunkText.length > maxContextLength) {
          break;
        }
        
        context += chunkText;
        currentLength += chunkText.length;
        
        // Track sources
        if (!sources.find(s => s.documentId.equals(chunk.documentId))) {
          sources.push({
            documentId: chunk.documentId,
            title: chunk.documentTitle,
            fileType: chunk.fileType
          });
        }
      }
      
      console.log(`[RAG] 📚 Tạo context từ ${allRelevantChunks.length} chunks, ${sources.length} documents`);
      
      return {
        context: context.trim(),
        sources,
        totalChunks: allRelevantChunks.length,
        relevantChunks: allRelevantChunks
      };
      
    } catch (error) {
      console.error('[RAG] ❌ Lỗi lấy context:', error);
      throw error;
    }
  }
  
  /**
   * Cập nhật thống kê sử dụng cho documents
   */
  static async recordDocumentUsage(documentIds, usageType) {
    try {
      await Document.updateMany(
        { _id: { $in: documentIds } },
        { 
          $inc: { [`usageStats.${usageType}`]: 1 },
          $set: { 'usageStats.lastUsed': new Date() }
        }
      );
      
      console.log(`[RAG] 📊 Cập nhật usage stats cho ${documentIds.length} documents`);
    } catch (error) {
      console.error('[RAG] ❌ Lỗi cập nhật usage stats:', error);
    }
  }
  
  /**
   * Lấy danh sách documents của user
   */
  static async getUserDocuments(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1,
      fileType = null,
      search = null
    } = options;
    
    try {
      const filter = { userId };
      
      if (fileType) {
        filter.fileType = fileType;
      }
      
      if (search) {
        filter.$text = { $search: search };
      }
      
      const documents = await Document.find(filter)
        .select('title fileType tags metadata usageStats createdAt')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Document.countDocuments(filter);
      
      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[RAG] ❌ Lỗi lấy user documents:', error);
      throw error;
    }
  }
}

module.exports = RAGService;