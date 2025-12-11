// client/src/components/RAGDocuments.jsx - Quản lý tài liệu RAG
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile, faFileText, faFilePdf, faFileWord, faFileImage,
  faSearch, faTrash, faEdit, faEye, faGlobe, faLock,
  faChartBar, faCalendar, faTag
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const RAGDocuments = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch documents
  const fetchDocuments = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedFileType) params.append('fileType', selectedFileType);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rag/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        setPagination(data.pagination);
      } else {
        throw new Error('Lỗi tải documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Lỗi tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage, searchQuery, selectedFileType]);

  // Delete document
  const handleDelete = async (documentId) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rag/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Đã xóa tài liệu');
        fetchDocuments(currentPage);
      } else {
        throw new Error('Lỗi xóa tài liệu');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Lỗi xóa tài liệu');
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return faFilePdf;
      case 'docx': return faFileWord;
      case 'txt': return faFileText;
      case 'url': case 'youtube': return faGlobe;
      default: return faFile;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Thư viện tài liệu RAG
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Quản lý tài liệu để tăng cường AI với RAG (Retrieval-Augmented Generation)
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
            />
          </div>
          
          {/* File Type Filter */}
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
          >
            <option value="">Tất cả loại file</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="txt">Text</option>
            <option value="url">Website</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faFile} className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Chưa có tài liệu nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Tải lên tài liệu và bật "Lưu vào RAG" khi tạo quiz để bắt đầu xây dựng thư viện kiến thức của bạn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {documents.map((doc) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl 
                       border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
                       transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <FontAwesomeIcon 
                    icon={getFileIcon(doc.fileType)} 
                    className="text-xl sm:text-2xl text-blue-500 dark:text-blue-400 mt-1"
                  />
                  <div className="flex items-center gap-2">
                    {doc.isPublic ? (
                      <FontAwesomeIcon icon={faGlobe} className="text-green-500 dark:text-green-400" title="Công khai" />
                    ) : (
                      <FontAwesomeIcon icon={faLock} className="text-gray-400 dark:text-gray-500" title="Riêng tư" />
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base">
                  {doc.title}
                </h3>
                
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faFileText} className="text-xs" />
                    {doc.metadata?.totalWords || 0} từ
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faChartBar} className="text-xs" />
                    {doc.metadata?.totalChunks || 0} chunks
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {doc.usageStats?.quizGenerated || 0}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Quiz</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {doc.usageStats?.flashcardsGenerated || 0}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Flashcard</div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 dark:text-purple-400">
                      {doc.usageStats?.mentorQuestions || 0}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Mentor</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-4 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                  <span className="hidden sm:inline">{formatDate(doc.createdAt)}</span>
                  <span className="sm:hidden">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                             rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                                 text-xs rounded-full flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faTag} className="text-xs" />
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400
                                     text-xs rounded-full">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RAGDocuments;