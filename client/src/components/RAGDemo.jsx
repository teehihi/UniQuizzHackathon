// client/src/components/RAGDemo.jsx - Demo RAG functionality
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faSearch, faLightbulb, faSpinner, faCheckCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const RAGDemo = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testRAGContext = async () => {
    if (!query.trim()) {
      toast.error('Vui lòng nhập câu hỏi');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rag/context`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          maxChunks: 3,
          maxContextLength: 1500,
          includePublic: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success('Đã tìm thấy context liên quan!');
      } else {
        throw new Error('Lỗi tìm kiếm context');
      }
    } catch (error) {
      console.error('Error testing RAG:', error);
      toast.error('Lỗi test RAG: ' + error.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faRobot} className="text-blue-500" />
            RAG Demo - Test Context Retrieval
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Nhập câu hỏi để test khả năng tìm kiếm context từ thư viện tài liệu RAG
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Câu hỏi test:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: JavaScript closures và React hooks"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && testRAGContext()}
            />
            <button
              onClick={testRAGContext}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                       text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
              {loading ? 'Đang tìm...' : 'Test RAG'}
            </button>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hoặc thử các câu hỏi mẫu:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'JavaScript functions và promises',
              'React hooks cơ bản',
              'ES6 features',
              'async await trong JavaScript'
            ].map((sampleQuery) => (
              <button
                key={sampleQuery}
                onClick={() => setQuery(sampleQuery)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                {sampleQuery}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.totalChunks}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Chunks tìm thấy</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.sources.length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Tài liệu nguồn</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.context.length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Ký tự context</div>
              </div>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                  Tài liệu nguồn được sử dụng:
                </h3>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {source.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Loại: {source.fileType.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Preview */}
            {result.context ? (
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
                  Context được trích xuất:
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {result.context}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
                <span className="text-yellow-700 dark:text-yellow-300">
                  Không tìm thấy context liên quan. Hãy thử upload tài liệu trước.
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
            Hướng dẫn sử dụng RAG:
          </h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Vào "Tạo Quiz" và upload tài liệu với tùy chọn "Lưu vào RAG"</li>
            <li>2. Quay lại đây và test tìm kiếm context</li>
            <li>3. Khi tạo quiz/chat với mentor, bật RAG để có kết quả chính xác hơn</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RAGDemo;