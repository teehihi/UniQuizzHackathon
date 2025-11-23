import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react"; // Thêm useCallback
import FallingBlossoms from "../components/FallingBlossoms.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { isAuthenticated } from "../utils/auth.js";
import { motion } from "framer-motion";
import FeedbackCard from "../components/FeedbackCard.jsx";
import FAQSection from "../components/FAQSection";
// Animation fade-in
const baseFadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay: i * 0.15,
    },
  }),
};

// Dữ liệu feedback
const feedbackData = [
  {
    quote:
      "Quả thật là cứu tinh mùa thi! Chỉ mất 3 phút upload file slide 70 trang, AI đã trả về bộ quiz hoàn chỉnh, giúp mình ôn tập gấp 5 lần tốc độ thông thường. Công cụ phải có cho sinh viên!",
    name: "Nguyễn Ngọc Tuấn",
    role: "Sinh viên năm 3, ĐH HUTECH",
    avatarInitial: "P",
    bgColor: "bg-green-100",
  },
  {
    quote:
      "Giao diện Tết quá ấm áp và dễ chịu! UniQuizz không chỉ tạo quiz nhanh mà còn cung cấp trải nghiệm học tập khác biệt. Mình đã giảm bớt áp lực ôn thi nhờ sự tập trung cao độ mà giao diện này mang lại.",
    name: "Lê Kim Nghĩa",
    role: "Sinh viên năm 4, FTU",
    avatarInitial: "N",
    bgColor: "bg-yellow-100",
  },
  {
    quote:
      "Tính năng Mentor AI quá đỉnh! Nó không chỉ đặt câu hỏi mà còn giải thích những phần kiến thức mình bị yếu một cách siêu chi tiết. Cảm giác như có gia sư 1 kèm 1 miễn phí vậy.",
    name: "Lê Quốc Khánh",
    role: "Sinh viên năm 2, UEH",
    avatarInitial: "T",
    bgColor: "bg-blue-100",
  },
  {
    quote:
      "Tuyệt vời cho Flash Card! Mình dùng UniQuizz để học từ vựng chuyên ngành và các thuật ngữ pháp lý. Khả năng AI tự động tách và tạo thẻ từ tài liệu là điểm mạnh không thể chối cãi.",
    name: "Trần Hoàng Văn",
    role: "Sinh viên năm cuối, HUB",
    avatarInitial: "L",
    bgColor: "bg-red-100",
  },
  {
    quote:
      "Cơ chế tạo quiz rất thông minh, bám sát nội dung và không mắc lỗi dịch thuật. Đây là công cụ AI tạo quiz tốt nhất tôi từng dùng để hỗ trợ các học sinh của mình ôn tập hiệu quả tại nhà.",
    name: "Công Trường",
    role: "Sinh viên IT, HCMUTE",
    avatarInitial: "H",
    bgColor: "bg-purple-100",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐ STATE CAROUSEL ⭐
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // ⭐ Logic NEXT ⭐
  const nextSlide = useCallback(() => {
    setStartIndex((prev) => (prev + 1) % feedbackData.length);
  }, []);

  // ⭐ Logic PREV ⭐
  const prevSlide = () => {
    setStartIndex(
      (prev) => (prev - 1 + feedbackData.length) % feedbackData.length
    );
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // ⭐ Lấy 3 items theo index xoay vòng
  const visibleCards = [
    feedbackData[startIndex],
    feedbackData[(startIndex + 1) % feedbackData.length],
    feedbackData[(startIndex + 2) % feedbackData.length],
  ];

  const handleStartNow = () => {
    if (isLoggedIn) navigate("/create");
    else navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#fff7f0] dark:bg-gray-900 relative overflow-x-hidden">
      <FallingBlossoms />

      <Header />

      {/* Hero Section (index 0) */}
      <motion.section
        className="px-8 mt-10 flex flex-col items-center text-center relative z-10"
        variants={baseFadeInVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        {/* ... (Nội dung Hero Section giữ nguyên) ... */}
        <img
          src="/tet_left.png"
          className="absolute left-5 top-5 w-28 opacity-90"
        />
        <img
          src="/tet_right.png"
          className="absolute right-5 top-5 w-28 opacity-90"
        />
        <h2 className="text-4xl font-extrabold text-red-700 dark:text-red-500 drop-shadow">
          Học Tết - Nhớ Nhà - Nhưng Vẫn Hiệu Quả
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
          Tạo quiz tự động từ file .docx bằng AI. Học nhanh, nhớ lâu, tiết kiệm
          thời gian - để bạn có thêm những phút giây đoàn tụ cùng gia đình dịp
          Tết.
        </p>
        <div className="mt-8 flex gap-6 flex-wrap justify-center">
          <Link
            to="/create"
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md"
          >
            Tạo Quiz mới
          </Link>
          <Link
            to="/flashcard-hub"
            className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
          >
            Flash Card
          </Link>
          <Link
            to="/myquizzes"
            className="px-8 py-3 rounded-xl bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-400 dark:border-red-600 font-semibold hover:bg-red-50 dark:hover:bg-gray-700 transition"
          >
            Quiz của tôi
          </Link>
        </div>
      </motion.section>

      {/* Features (index 1) */}
      <motion.section
        className="mt-20 px-8 pb-20 relative z-10"
        variants={baseFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={1}
      >
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Tại sao UniQuizz sẽ giúp bạn học tốt hơn?
        </h3>
        {/* ... (Nội dung Features) ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-red-50 dark:border-gray-700 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
              AI tạo câu hỏi tự động
            </h4>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
              Tải file .docx → nhận quiz đầy đủ chỉ sau vài giây.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-red-50 dark:border-gray-700 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Giao diện học đẹp - dễ tập trung
            </h4>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
              Tinh tế, tối giản, lấy cảm hứng từ không khí Tết ấm áp.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-red-50 dark:border-gray-700 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Theo dõi tiến độ học
            </h4>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
              Lưu quiz, xem kết quả mỗi lần luyện tập.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Mentor AI (index 2) */}
      <motion.section
        className="relative z-10 py-24 px-8 bg-linear-to-b from-red-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden"
        variants={baseFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={2}
      >
        {/* Particle floating - sáng hơn trong dark mode */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full top-10 left-1/4 animate-bounce opacity-70 dark:opacity-90" />
          <div className="absolute w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full top-1/2 left-10 animate-ping opacity-70 dark:opacity-90" />
          <div className="absolute w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full bottom-16 right-1/3 animate-bounce opacity-70 dark:opacity-90" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* LEFT TEXT */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              Gặp gỡ <span className="text-red-600 dark:text-red-400">Miku Mentor</span>
            </h2>

            <p className="mt-5 text-lg text-gray-700 dark:text-gray-300 max-w-md">
              Tính năng mới! Củng cố kiến thức của bạn với một mentor 2D. Tải
              tài liệu lên và để Miku giảng bài cho bạn theo phong cách dễ hiểu.
            </p>

            <Link
              to="/mentor"
              className="mt-8 inline-block px-10 py-4 rounded-xl bg-red-600 dark:bg-red-500 text-white font-semibold 
          hover:bg-red-700 dark:hover:bg-red-600 transition-all shadow-lg dark:shadow-red-500/30 text-lg hover:shadow-red-300/50 dark:hover:shadow-red-400/50 hover:scale-[1.03]"
            >
              Trải nghiệm ngay
            </Link>
          </div>

          {/* RIGHT IMAGE PLACEHOLDER (Miku) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Simple glow effect - chỉ 1 layer, không blur nhiều */}
              <div className="absolute -inset-8 bg-red-400/20 dark:bg-red-500/30 rounded-full blur-2xl" />

              {/* Miku image - KHÔNG có background container, KHÔNG có backdrop-blur */}
              <img
                src="https://media.tenor.com/UATloqaC3aAAAAAi/hatsune-miku.gif"
                alt="Miku Dance"
                className="relative w-72 md:w-96 animate-float
                drop-shadow-2xl dark:drop-shadow-[0_20px_40px_rgba(239,68,68,0.4)]
                brightness-100 dark:brightness-110
                contrast-100 dark:contrast-105
                saturate-100 dark:saturate-110"
              />

              {/* Decorative sparkles - ít hơn, đơn giản hơn */}
              <div className="absolute top-5 right-5 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60" />
              <div className="absolute bottom-10 left-5 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Cách Hoạt Động (index 3) */}
      <motion.section
        className="mt-10 px-8 pb-20 relative z-10 bg-white dark:bg-gray-900"
        variants={baseFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={3}
      >
        <div className="max-w-5xl mx-auto py-16">
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
            Hoạt động như thế nào?
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Chỉ 3 bước đơn giản để có ngay bộ câu hỏi ôn tập.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Step 1, 2, 3 giữ nguyên */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Tải lên tài liệu
              </h4>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Chỉ cần tải lên file .docx chứa nội dung bài học của bạn.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI xử lý</h4>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                UniQuizz AI sẽ đọc, hiểu và tạo ra các câu hỏi trắc nghiệm liên
                quan.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Bắt đầu học
              </h4>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Làm quiz, xem lại đáp án và theo dõi tiến độ của bạn ngay lập
                tức.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section (index 4) */}
      <FAQSection baseFadeInVariants={baseFadeInVariants} />

      {/* KHỐI CTA MỚI (index 5) */}
      <motion.section
        className="relative z-10 py-20 mt-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/bgCTA.jpg')" }}
        variants={baseFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={5}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="max-w-2xl mx-auto text-center px-8 relative z-20">
          <h2 className="text-3xl font-extrabold text-white dark:text-gray-100">
            Sẵn sàng học tập hiệu quả dịp Tết?
          </h2>
          <p className="mt-4 text-lg text-gray-200 dark:text-gray-300">
            {isLoggedIn
              ? "Bắt đầu tạo quiz đầu tiên của bạn ngay."
              : "Tạo tài khoản miễn phí và bắt đầu tạo quiz đầu tiên của bạn chỉ trong vài giây."}
          </p>
          <button
            onClick={handleStartNow}
            className="mt-8 inline-block px-10 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-orange-500 transition shadow-lg text-lg"
          >
            {isLoggedIn ? "Tạo Quiz Mới Ngay" : "Bắt đầu ngay"}
          </button>
        </div>
      </motion.section>

      {/* ⭐ FEEDBACK CAROUSEL ⭐ */}
      <motion.section
        className="py-20 relative z-10 bg-gray-50 dark:bg-gray-800 overflow-hidden mt-12"
        variants={baseFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={6}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Khách Hàng Nói Gì Về UniQuizz?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-10">
            Phản hồi từ cộng đồng sinh viên.
          </p>

          <div className="relative max-w-5xl mx-auto px-4">
            {/* Prev */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -mt-6 z-20 p-3 rounded-full bg-white dark:bg-gray-700 shadow-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-600 md:-ml-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* ⭐ DÃY 3 THẺ XOAY VÒNG ⭐ */}
            <motion.div
              key={startIndex} // bắt animation mỗi lần đổi
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visibleCards.map((card, index) => (
                <FeedbackCard key={index} {...card} />
              ))}
            </motion.div>

            {/* Next */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -mt-6 z-20 p-3 rounded-full bg-white dark:bg-gray-700 shadow-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-600 md:-mr-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {feedbackData.map((_, i) => (
              <button
                key={i}
                onClick={() => setStartIndex(i)}
                className={`h-2 w-2 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer
                ${i === startIndex ? "bg-red-600 dark:bg-red-500 w-6" : "bg-gray-400 dark:bg-gray-600"}`}
                aria-label={`Chuyển đến feedback ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </motion.section>
      <Footer />
    </div>
  );
}
