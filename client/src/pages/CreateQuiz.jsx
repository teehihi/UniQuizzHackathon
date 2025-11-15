import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
// (Bạn có thể thêm icon, ví dụ: react-icons)
// import { FiUploadCloud } from "react-icons/fi"; 

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [file, setFile] = useState(null); // Để lưu file .docx
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Chỉ chấp nhận file .docx
      if (!e.target.files[0].name.endsWith(".docx")) {
        setError("Chỉ chấp nhận file .docx");
        setFile(null);
      } else {
        setFile(e.target.files[0]);
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Vui lòng nhập tiêu đề và tải lên 1 file .docx");
      return;
    }

    setIsLoading(true);
    setError("");

    // --- Tạm thời ---
    // Vì backend chưa sẵn sàng, chúng ta sẽ giả lập
    console.log("Đang tải lên:", { title, courseCode, file: file.name });
    setError("Đang giả lập... (Chức năng backend chưa kết nối)");
    
    // Giả lập thời gian chờ 2 giây
    setTimeout(() => {
      setIsLoading(false);
      console.log("Giả lập thành công!");
      // Sau khi tạo xong, chuyển người dùng đến trang "Quiz của tôi"
      navigate("/myquizzes");
    }, 2000);
    // --- Kết thúc tạm thời ---


    // --- CODE THẬT KHI CÓ BACKEND ---
    // (Sẽ dùng FormData để gửi file)
    // const formData = new FormData();
    // formData.append("title", title);
    // formData.append("courseCode", courseCode);
    // formData.append("document", file); // Tên 'document' phải khớp với backend
    
    // try {
    //   const res = await fetch("http://localhost:5000/api/quiz/create", {
    //     method: "POST",
    //     // Không cần 'Content-Type', FormData sẽ tự đặt
    //     body: formData, 
    //     // headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } // Nếu cần xác thực
    //   });

    //   if (!res.ok) {
    //     const errData = await res.json();
    //     throw new Error(errData.msg || "Tạo quiz thất bại");
    //   }

    //   // const newQuiz = await res.json(); // Đây là data (giống JSON bạn gửi)
    //   setIsLoading(false);
    //   navigate("/myquizzes"); // Chuyển hướng khi thành công

    // } catch (err) {
    //   setError(err.message);
    //   setIsLoading(false);
    // }
    // --- KẾT THÚC CODE THẬT ---
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

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="file">
                Tài liệu (.docx)*
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {/* Icon (nếu có) */}
                  {/* <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" /> */}
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none"
                    >
                      <span>Tải lên file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".docx" />
                    </label>
                    <p className="pl-1">hoặc kéo thả</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Chỉ hỗ trợ file .docx
                  </p>
                </div>
              </div>
              {/* Hiển thị tên file đã chọn */}
              {file && (
                <p className="text-sm text-green-600 mt-2">
                  Đã chọn: {file.name}
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