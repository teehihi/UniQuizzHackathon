import React from "react";
import { Link } from "react-router-dom";

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
    <div className="bg-white rounded-xl shadow-lg border border-red-50 overflow-hidden flex flex-col">
      {/* Ảnh bìa (tùy chọn, bạn có thể thêm sau) */}
      {/* <img src="/quiz-placeholder.jpg" alt="Quiz cover" className="h-40 w-full object-cover" /> */}
      
      <div className="p-5 flex flex-col grow">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          {quiz.title}
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          {quiz.questionCount} câu hỏi
        </p>

        {/* Đẩy các nút xuống dưới cùng */}
        <div className="mt-auto flex gap-3">
          <Link
            to={`/quiz/${quiz.id}`} // Đường dẫn để làm quiz
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-center hover:bg-red-700 transition"
          >
            Làm ngay
          </Link>
          <button
            onClick={handleDelete}
            title="Xóa"
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-red-200 hover:text-red-800 transition"
          >
            {/* Icon thùng rác */}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}