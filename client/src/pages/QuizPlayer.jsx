import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// === DỮ LIỆU MẪU (Sử dụng JSON bạn đã cung cấp) ===
const mockQuizData = {
  _id: "6917fee5535b46e1e1e58e69",
  title: "Test Quang hợp",
  courseCode: "PHIL101",
  questions: [
    {
      question: "Quang hợp chủ yếu diễn ra ở bộ phận nào của cây?",
      options: ["Rễ cây", "Thân cây", "Lá cây", "Hoa"],
      answer: "Lá cây",
    },
    {
      question: "Sinh vật nào chủ yếu thực hiện quá trình quang hợp?",
      options: ["Động vật", "Thực vật", "Nấm", "Vi khuẩn lam"],
      answer: "Thực vật",
    },
    {
      question: "Chất hữu cơ được tổng hợp từ các chất nào trong quá trình quang hợp?",
      options: ["Chất hữu cơ", "Chất vô cơ", "Nước và oxy", "Carbon dioxide và protein"],
      answer: "Chất vô cơ",
    },
    {
      question: "Sản phẩm chính của quang hợp cung cấp năng lượng cho cây là gì?",
      options: ["Oxy", "Carbon dioxide", "Nước", "Glucose"],
      answer: "Glucose",
    },
    {
      question: "Diệp lục có vai trò gì trong quá trình quang hợp?",
      options: ["Hấp thụ nước", "Hấp thụ năng lượng ánh sáng", "Tạo ra carbon dioxide", "Giải phóng oxy"],
      answer: "Hấp thụ năng lượng ánh sáng",
    },
  ],
};
// === KẾT THÚC DỮ LIỆU MẪU ===

// === 1. TẠO ĐỐI TƯỢNG ÂM THANH ===
// (Đảm bảo file đã nằm trong thư mục /public)
const correctSound = new Audio('/correct.mp3');
const wrongSound = new Audio('/wrong.mp3');
// ===================================

export default function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setQuiz(mockQuizData);
      setIsLoading(false);
    }, 500);
  }, [quizId]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  // === 2. CẬP NHẬT HÀM CHECK ANSWER ===
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return; 
    setIsAnswered(true);

    if (selectedAnswer === currentQuestion.answer) {
      setScore(score + 1);
      correctSound.play(); // <-- PHÁT ÂM THANH ĐÚNG
    } else {
      wrongSound.play(); // <-- PHÁT ÂM THANH SAI
    }
  };
  // ===================================

  const handleNextQuestion = () => {
    setQuestionKey(prevKey => prevKey + 1); 

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const getOptionClass = (option) => {
    let baseClasses = "relative w-full p-4 border-2 rounded-lg text-left font-medium transition-all duration-300 flex items-center";
    let iconClass = "";

    if (!isAnswered) {
      if (selectedAnswer === option) {
        baseClasses += " bg-red-100 border-red-400 text-red-800 shadow-md scale-105"; 
        iconClass = "bg-red-600";
      } else {
        baseClasses += " bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200"; 
        iconClass = "bg-gray-300";
      }
    } else {
      if (option === currentQuestion.answer) {
        baseClasses += " bg-green-100 border-green-500 text-green-800 shadow-lg"; 
        iconClass = "bg-green-600";
      } else if (option === selectedAnswer && option !== currentQuestion.answer) {
        baseClasses += " bg-red-100 border-red-500 text-red-800 shadow-lg"; 
        iconClass = "bg-red-600";
      } else {
        baseClasses += " bg-gray-50 border-gray-200 text-gray-600 opacity-70"; 
        iconClass = "bg-gray-300";
      }
    }

    return { baseClasses, iconClass };
  };

  // ... (Phần code JSX (return) giữ nguyên, không thay đổi)
  // ...
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700 animate-pulse">Đang tải quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center">
        <div className="text-xl font-semibold text-red-700">Không tìm thấy quiz.</div>
      </div>
    );
  }

  // Giao diện KẾT QUẢ
  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const resultMessage = percentage >= 70 ? "Chúc mừng, bạn đã làm rất tốt!" : "Hãy cố gắng hơn nữa nhé!";

    return (
      <div className="min-h-screen bg-[#fff7f0] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-100"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">🎉 Hoàn thành Quiz!</h2>
          <p className="text-xl text-gray-700 mb-6">
            Bạn đã đạt được: 
            <strong className="text-red-600 text-2xl ml-2">{score} / {quiz.questions.length}</strong>
          </p>
          <p className="text-lg text-gray-600 mb-6">{resultMessage}</p>

          <div className="relative pt-1 mb-6">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-600">
                  {percentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
              <div
                style={{ width: `${percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-500"
              ></div>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/myquizzes")}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 duration-300 shadow-md"
          >
            Quay về "Quiz của tôi"
          </button>
        </motion.div>
      </div>
    );
  }

  // Giao diện LÀM QUIZ
  return (
    <div className="min-h-screen bg-[#fff7f0]">
      {/* Header đơn giản */}
      <header className="p-4 bg-white shadow-sm border-b border-red-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-700">{quiz.title}</h1>
          <Link to="/myquizzes" className="text-gray-600 hover:text-red-600 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Thoát
          </Link>
        </div>
      </header>

      {/* Nội dung Quiz */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
        <motion.div
          key={questionKey} // Dùng key để reset animation khi câu hỏi thay đổi
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-red-100"
        >
          {/* Thanh tiến độ */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Câu hỏi <span className="font-bold text-red-600">{currentQuestionIndex + 1}</span> / {quiz.questions.length}
            </p>
            <div className="w-full bg-red-100 rounded-full h-3">
              <motion.div
                className="bg-red-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>

          {/* Câu hỏi */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 leading-relaxed"
          >
            {currentQuestion.question}
          </motion.h2>

          {/* Các lựa chọn */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const { baseClasses, iconClass } = getOptionClass(option);
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={baseClasses}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 ${iconClass}`}>
                    {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                  </span>
                  <span className="flex-grow">{option}</span>
                  {isAnswered && option === currentQuestion.answer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="ml-auto text-green-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                  {isAnswered && option === selectedAnswer && option !== currentQuestion.answer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="ml-auto text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Nút Kiểm tra / Tiếp theo */}
          <div className="mt-10 text-right">
            {!isAnswered ? (
              <motion.button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                Kiểm tra
              </motion.button>
            ) : (
              <motion.button
                onClick={handleNextQuestion}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "Tiếp theo" : "Xem kết quả"}
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}