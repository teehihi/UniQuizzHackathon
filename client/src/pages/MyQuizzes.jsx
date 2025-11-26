import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QuizCard from "../components/QuizCard";
import { API_ENDPOINTS } from "../config/api.js";
import { getAuthToken } from "../utils/auth.js";

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const token = getAuthToken();
      if (!token) {
        setError("Vui lòng đăng nhập để xem quiz của bạn");
        setIsLoading(false);
        return;
      }
      
      const res = await fetch(API_ENDPOINTS.DECKS, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("userUpdate"));
          navigate("/login");
          return;
        }
        throw new Error("Không thể tải danh sách quiz");
      }
      
      const data = await res.json();
      
      // Map dữ liệu từ MongoDB sang format cho QuizCard
      const formattedQuizzes = data.map((deck) => ({
        id: deck._id,
        title: deck.title,
        questionCount: deck.questions?.length || 0,
        courseCode: deck.courseCode,
        isPublic: deck.isPublic || false,
      }));
      
      setQuizzes(formattedQuizzes);
    } catch (err) {
      console.error("Lỗi khi tải quiz:", err);
      setError(err.message || "Có lỗi xảy ra khi tải danh sách quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập để xóa quiz");
        navigate("/login");
        return;
      }

      const res = await fetch(API_ENDPOINTS.DELETE_DECK(quizId), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Không thể xóa quiz");
      }

      // Xóa quiz khỏi danh sách local ngay lập tức để UX tốt hơn
      setQuizzes((prevQuizzes) => prevQuizzes.filter((q) => q.id !== quizId));
      
      // Có thể thêm thông báo thành công ở đây nếu muốn
      console.log("Đã xóa quiz thành công");
    } catch (err) {
      console.error("Lỗi khi xóa quiz:", err);
      alert(err.message || "Có lỗi xảy ra khi xóa quiz");
      // Refresh lại danh sách để đảm bảo đồng bộ
      fetchQuizzes();
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
      <Header />

      {/* Phần nội dung chính */}
      <main className="grow max-w-6xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Quiz của tôi
        </h1>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center text-gray-600 py-12">
            <p>Đang tải danh sách quiz...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center text-red-600 py-12">
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchQuizzes}
              className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && quizzes.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            <p className="mb-4">Bạn chưa có bộ quiz nào.</p>
            <Link
              to="/create"
              className="inline-block px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Tạo quiz mới ngay
            </Link>
          </div>
        )}

        {/* Quiz list */}
        {!isLoading && !error && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onDelete={handleDeleteQuiz}
                onPublicToggle={(quizId, isPublic) => {
                  // Update local state
                  setQuizzes(prev => prev.map(q => 
                    q.id === quizId ? { ...q, isPublic } : q
                  ));
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}