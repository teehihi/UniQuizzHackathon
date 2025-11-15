import React from "react";
import Header from "../components/Header"; // Đảm bảo đường dẫn đúng
import Footer from "../components/Footer"; // Đảm bảo đường dẫn đúng
import QuizCard from "../components/QuizCard"; // Component thẻ quiz vừa tạo

// === Dữ liệu mẫu ===
// Sau này, bạn sẽ fetch (tải) dữ liệu này từ API/Backend
const mockQuizzes = [
  {
    id: "1",
    title: "Lịch sử Đảng - Chương 1: Bối cảnh",
    questionCount: 15,
  },
  {
    id: "2",
    title: "Triết học Mác-Lênin - Chương 3",
    questionCount: 25,
  },
  {
    id: "3",
    title: "Tiếng Anh chuyên ngành: Từ vựng Unit 5",
    questionCount: 40,
  },
  {
    id: "4",
    title: "Kinh tế vi mô: Cung và Cầu",
    questionCount: 20,
  },
];
// === Kết thúc dữ liệu mẫu ===

export default function MyQuizzes() {
  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
      <Header />

      {/* Phần nội dung chính */}
      <main className="grow max-w-6xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Quiz của tôi
        </h1>

        {/* Kiểm tra nếu không có quiz */}
        {mockQuizzes.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Bạn chưa có bộ quiz nào.</p>
            <Link
              to="/create"
              className="mt-4 inline-block px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Tạo quiz mới ngay
            </Link>
          </div>
        ) : (
          /* Hiển thị danh sách quiz */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}