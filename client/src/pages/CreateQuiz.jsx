import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_ENDPOINTS } from "../config/api.js";
import { getAuthToken } from "../utils/auth.js";

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [questionCount, setQuestionCount] = useState(10); // Số lượng câu hỏi, mặc định 10
  const [file, setFile] = useState(null); // Để lưu file .docx
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hàm validate và set file (dùng chung cho cả click và drag)
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    // Chỉ chấp nhận file .docx
    if (!selectedFile.name.endsWith(".docx")) {
      setError("Chỉ chấp nhận file .docx");
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    setError("");
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  // Handler để click vào toàn bộ vùng upload
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Vui lòng nhập tiêu đề và tải lên 1 file .docx");
      return;
    }

    setIsLoading(true);
    setError("");

    // Dùng FormData để gửi file
    const formData = new FormData();
    formData.append("title", title);
    formData.append("courseCode", courseCode || "");
    formData.append("questionCount", questionCount.toString());
    formData.append("file", file); // Tên 'file' phải khớp với backend
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Vui lòng đăng nhập để tạo quiz");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      const res = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        // Không cần 'Content-Type', FormData sẽ tự đặt
        body: formData, 
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Tạo quiz thất bại");
      }

      const newQuiz = await res.json();
      console.log("Tạo quiz thành công:", newQuiz);
      setIsLoading(false);
      navigate("/myquizzes"); // Chuyển hướng khi thành công

    } catch (err) {
      console.error('Lỗi khi tạo quiz:', err);
      // Hiển thị lỗi chi tiết hơn
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError(`Không thể kết nối đến server. Vui lòng kiểm tra xem server đã chạy chưa (${API_ENDPOINTS.TEST})`);
      } else {
        setError(err.message || 'Có lỗi xảy ra khi tạo quiz');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
      <Header />

      {/* Phần nội dung chính */}
      <main className="grow flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-auto p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            ✨ Tạo Quiz mới
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Tải lên file .docx và để AI làm phần còn lại.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="title">
                Tiêu đề Quiz*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Ví dụ: Lịch sử Đảng - Chương 1"
                required
              />
            </div>

            {/* Mã học phần (Tùy chọn) */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="courseCode">
                Mã học phần (Tùy chọn)
              </label>
              <input
                type="text"
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Ví dụ: PHIL101"
              />
            </div>

            {/* Số lượng câu hỏi */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="questionCount">
                Số lượng câu hỏi
              </label>
              <input
                type="number"
                id="questionCount"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 10;
                  setQuestionCount(Math.max(1, Math.min(50, value)));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Mặc định: 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập số lượng câu hỏi muốn tạo (1-50). Mặc định: 10
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="file">
                Tài liệu (.docx)*
              </label>
              <div
                onClick={handleUploadAreaClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                  isDragging
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-red-400"
                }`}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className={`mx-auto h-12 w-12 transition-colors ${
                      isDragging ? "text-red-500" : "text-gray-400"
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-red-600">Tải lên file</span>
                    <span className="pl-1">hoặc kéo thả</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Chỉ hỗ trợ file .docx
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept=".docx"
              />
              {/* Hiển thị tên file đã chọn */}
              {file && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✓ Đã chọn: {file.name}
                </p>
              )}
            </div>

            {/* Nút Submit */}
            <div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý (AI)..." : "Tạo Quiz ngay"}
              </button>
            </div>

            {/* Báo lỗi */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}