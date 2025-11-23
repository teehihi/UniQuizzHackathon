import React from "react";
import { Link } from "react-router-dom";
import ShareButton from "./ShareButton";

// Component này nhận 'quiz' làm prop, chứa thông tin như title, questionCount
export default function QuizCard({ quiz, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa quiz "${quiz.title}"?`)) {
      onDelete?.(quiz.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-50 dark:border-gray-700 overflow-visible flex flex-col hover:shadow-xl transition-shadow relative">
      {/* Ảnh bìa (tùy chọn, bạn có thể thêm sau) */}
      {/* <img src="/quiz-placeholder.jpg" alt="Quiz cover" className="h-40 w-full object-cover" /> */}
      
      <div className="p-5 flex flex-col grow">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1">
            {quiz.title}
          </h4>
          <div className="ml-2">
            <ShareButton quiz={{ _id: quiz.id, title: quiz.title }} type="quiz" />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {quiz.questionCount} câu hỏi
        </p>

        {/* Đẩy các nút xuống dưới cùng */}
        <div className="mt-auto flex gap-3">
          <Link
            to={`/quiz/${quiz.id}`} // Đường dẫn để làm quiz
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white font-semibold text-center hover:bg-red-700 dark:hover:bg-red-600 transition"
          >
            Làm ngay
          </Link>
          <button
            onClick={handleDelete}
            title="Xóa"
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-200 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-300 transition"
          >
            {/* Icon thùng rác */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}