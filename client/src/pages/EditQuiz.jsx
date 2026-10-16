import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_ENDPOINTS } from "../config/api.js";
import { getAuthToken } from "../utils/auth.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheck,
  faTrash,
  faCopy,
  faPlus,
  faArrowLeft,
  faSave,
  faExclamationTriangle,
  faPlay,
  faListCheck,
  faPen
} from "@fortawesome/free-solid-svg-icons";

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Deck states
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [summary, setSummary] = useState([]);
  const [questions, setQuestions] = useState([]);

  // UI states
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questionRefs = useRef({});

  // 1. Fetch existing quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      const token = getAuthToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để chỉnh sửa quiz");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(API_ENDPOINTS.DECK_BY_ID(id), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Không tìm thấy bộ Quiz hoặc bạn không có quyền truy cập");
          }
          throw new Error("Lỗi khi tải dữ liệu Quiz");
        }

        const data = await res.json();

        setTitle(data.title || "");
        setCourseCode(data.courseCode || "GENERAL");
        setIsPublic(Boolean(data.isPublic));
        setSummary(Array.isArray(data.summary) ? data.summary : []);

        const parsedQuestions = (data.questions || []).map((q, idx) => ({
          id: q._id || `q_${Date.now()}_${idx}`,
          question: q.question || "",
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Phương án A", "Phương án B"],
          answer: q.answer || (q.options && q.options[0]) || ""
        }));

        setQuestions(parsedQuestions);
      } catch (err) {
        console.error("Lỗi khi tải quiz:", err);
        setError(err.message || "Không thể tải dữ liệu quiz");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  // Question editing handlers
  const handleQuestionTextChange = (qIndex, newText) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], question: newText };
      return next;
    });
  };

  const handleSelectCorrectAnswer = (qIndex, optionText) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], answer: optionText };
      return next;
    });
  };

  const handleOptionTextChange = (qIndex, optIndex, newOptText) => {
    setQuestions((prev) => {
      const next = [...prev];
      const targetQ = { ...next[qIndex] };
      const oldOptText = targetQ.options[optIndex];
      const newOptions = [...targetQ.options];
      newOptions[optIndex] = newOptText;
      targetQ.options = newOptions;

      if (targetQ.answer === oldOptText) {
        targetQ.answer = newOptText;
      }

      next[qIndex] = targetQ;
      return next;
    });
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      const targetQ = { ...next[qIndex] };
      if (targetQ.options.length >= 6) return prev;
      const optionLetter = String.fromCharCode(65 + targetQ.options.length);
      targetQ.options = [...targetQ.options, `Phương án ${optionLetter}`];
      next[qIndex] = targetQ;
      return next;
    });
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      const targetQ = { ...next[qIndex] };
      if (targetQ.options.length <= 2) {
        toast.warning("Mỗi câu hỏi cần tối thiểu 2 phương án lựa chọn.");
        return prev;
      }
      const removedText = targetQ.options[optIndex];
      const newOptions = targetQ.options.filter((_, idx) => idx !== optIndex);
      targetQ.options = newOptions;

      if (targetQ.answer === removedText) {
        targetQ.answer = newOptions[0] || "";
      }

      next[qIndex] = targetQ;
      return next;
    });
  };

  const handleDeleteQuestion = (qIndex) => {
    if (questions.length <= 1) {
      toast.warning("Bộ Quiz cần có ít nhất 1 câu hỏi.");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa câu hỏi số ${qIndex + 1}?`)) {
      setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
    }
  };

  const handleDuplicateQuestion = (qIndex) => {
    const qToClone = questions[qIndex];
    const cloned = {
      ...qToClone,
      id: `q_clone_${Date.now()}`,
      question: `${qToClone.question} (Bản sao)`,
      options: [...qToClone.options]
    };
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(qIndex + 1, 0, cloned);
      return next;
    });
    toast.info(`Đã nhân bản câu số ${qIndex + 1}`);
  };

  const handleAddNewQuestion = () => {
    const newQ = {
      id: `q_manual_${Date.now()}`,
      question: "",
      options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      answer: "Phương án A"
    };
    setQuestions((prev) => [...prev, newQ]);
    setTimeout(() => {
      scrollToQuestion(questions.length);
    }, 100);
  };

  const scrollToQuestion = (index) => {
    setActiveQuestionIndex(index);
    const element = questionRefs.current[index];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        scrollToQuestion(i);
        setError(`Câu hỏi số ${i + 1} đang để trống nội dung.`);
        toast.error(`Câu hỏi số ${i + 1} đang để trống nội dung.`);
        return false;
      }
      if (q.options.some((opt) => !opt.trim())) {
        scrollToQuestion(i);
        setError(`Câu hỏi số ${i + 1} có phương án lựa chọn bị để trống.`);
        toast.error(`Câu hỏi số ${i + 1} có phương án lựa chọn bị để trống.`);
        return false;
      }
      if (!q.answer || !q.options.includes(q.answer)) {
        scrollToQuestion(i);
        setError(`Vui lòng chọn 1 đáp án đúng hợp lệ cho câu hỏi số ${i + 1}.`);
        toast.error(`Vui lòng chọn 1 đáp án đúng hợp lệ cho câu hỏi số ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  // Save changes
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề cho bộ Quiz.");
      toast.error("Vui lòng nhập tiêu đề cho bộ Quiz.");
      return;
    }

    if (!validateQuestions()) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để lưu quiz");
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        courseCode: courseCode.trim() || "GENERAL",
        summary: summary,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((opt) => opt.trim()),
          answer: q.answer.trim()
        })),
        isPublic: isPublic
      };

      const res = await fetch(API_ENDPOINTS.DECK_BY_ID(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật Quiz");
      }

      toast.success("Cập nhật bộ Quiz thành công!");
      setSaveSuccess(true);
    } catch (err) {
      console.error("Lỗi khi cập nhật quiz:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu quiz");
      toast.error(err.message || "Có lỗi xảy ra khi lưu quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const validQuestionsCount = questions.filter(
    (q) => q.question.trim() && q.options.includes(q.answer) && q.options.every((o) => o.trim())
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Loading state */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu Quiz...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && questions.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-900 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không thể tải Quiz</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => navigate("/myquizzes")}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition cursor-pointer"
            >
              Về danh sách Quiz
            </button>
          </div>
        )}

        {/* Edit Studio */}
        {!isLoading && (!error || questions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Info Banner */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPen} className="text-xs" />
                    Chỉnh sửa Quiz
                  </span>

                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                    {questions.length} câu hỏi
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      validQuestionsCount === questions.length
                        ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        validQuestionsCount === questions.length ? "bg-green-600" : "bg-amber-600"
                      }`}
                    />
                    {validQuestionsCount}/{questions.length} câu hợp lệ
                  </span>

                  {/* Public / Private toggle button */}
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      isPublic
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                    }`}
                    title="Bấm để đổi chế độ công khai / riêng tư"
                  >
                    {isPublic ? "🌐 Công khai" : "🔒 Riêng tư"}
                  </button>
                </div>

                {/* Tiêu đề & Mã môn */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề quiz..."
                      className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-red-500 focus:bg-gray-50 dark:focus:bg-gray-900 px-1 py-0.5 rounded-lg outline-none transition w-full"
                      title="Bấm để sửa tiêu đề Quiz"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
                      Mã môn / Chủ đề:
                    </label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="GENERAL, CS101..."
                      className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 focus:border-red-500 outline-none uppercase"
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Click vào phương án để đặt làm đáp án đúng. Bạn có thể sửa câu từ trực tiếp trên từng ô.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/myquizzes")}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Quay lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Thêm câu hỏi</span>
                </button>
              </div>
            </div>

            {/* AI Summary Accordion (nếu có) */}
            {summary && summary.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 shadow-sm">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                >
                  <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-sm sm:text-base">
                    <span>✨</span>
                    <span>Tóm tắt kiến thức trọng tâm</span>
                    <span className="text-xs bg-amber-200 dark:bg-amber-800/60 px-2 py-0.5 rounded-full font-semibold">
                      {summary.length} ý chính
                    </span>
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    {isSummaryOpen ? "Thu gọn ▲" : "Xem chi tiết ▼"}
                  </span>
                </div>

                <AnimatePresence>
                  {isSummaryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1.5"
                    >
                      {summary.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Question Navigation Strip */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0 mr-2">
                Các câu:
              </span>
              <div className="flex items-center gap-2">
                {questions.map((q, idx) => {
                  const isValid =
                    q.question.trim() &&
                    q.options.includes(q.answer) &&
                    q.options.every((o) => o.trim());
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => scrollToQuestion(idx)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition shrink-0 cursor-pointer ${
                        activeQuestionIndex === idx
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400"
                          : isValid
                          ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800 hover:bg-green-100"
                          : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-100"
                      }`}
                      title={`Câu ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="w-9 h-9 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-red-500 hover:text-red-500 flex items-center justify-center text-sm font-bold shrink-0 transition cursor-pointer"
                title="Thêm câu hỏi mới"
              >
                +
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2 shadow-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Question Cards List */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => {
                const isAnswerValid = q.options.includes(q.answer);

                return (
                  <div
                    key={q.id || qIndex}
                    ref={(el) => (questionRefs.current[qIndex] = el)}
                    className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    {/* Header của từng câu */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold text-sm shadow-sm">
                          Câu {qIndex + 1 < 10 ? `0${qIndex + 1}` : qIndex + 1}
                        </span>

                        {isAnswerValid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold">
                            <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400" />
                            Đã xác định đáp án đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            Chưa chọn đáp án đúng
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(qIndex)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1.5 cursor-pointer"
                          title="Nhân bản câu này"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                          <span>Nhân bản</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIndex)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center gap-1.5 cursor-pointer"
                          title="Xóa câu này"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    {/* Soạn nội dung câu hỏi */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Nội dung câu hỏi:
                      </label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
                      />
                    </div>

                    {/* Các phương án & Chọn đáp án đúng */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                          Các phương án lựa chọn:
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Click vào phương án để đặt làm đáp án đúng
                        </span>
                      </div>

                      <div className="space-y-3">
                        {q.options.map((opt, optIndex) => {
                          const isCorrect = q.answer === opt;
                          const letter = String.fromCharCode(65 + optIndex);

                          return (
                            <div
                              key={optIndex}
                              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                                isCorrect
                                  ? "bg-green-50/80 dark:bg-green-950/40 border-green-500 ring-2 ring-green-500/20 shadow-sm"
                                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              {/* Nút chọn làm đáp án đúng */}
                              <button
                                type="button"
                                onClick={() => handleSelectCorrectAnswer(qIndex, opt)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition cursor-pointer ${
                                  isCorrect
                                    ? "bg-green-600 text-white shadow-md shadow-green-600/30 scale-105"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                }`}
                                title={isCorrect ? "Đang là đáp án đúng" : "Bấm để chọn làm đáp án đúng"}
                              >
                                {isCorrect ? "✓" : letter}
                              </button>

                              {/* Ô nhập nội dung phương án */}
                              <div className="grow">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                                  placeholder={`Nội dung phương án ${letter}...`}
                                  className={`w-full px-3 py-1.5 rounded-lg bg-transparent font-medium text-sm sm:text-base outline-none transition ${
                                    isCorrect
                                      ? "text-green-950 dark:text-green-200 font-semibold"
                                      : "text-gray-800 dark:text-gray-200"
                                  }`}
                                />
                              </div>

                              {/* Badge / Button đáp án */}
                              <div className="shrink-0 flex items-center gap-2">
                                {isCorrect ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold shadow-sm">
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Đáp án đúng</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCorrectAnswer(qIndex, opt)}
                                    className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/40 border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                                  >
                                    Chọn làm đáp án đúng
                                  </button>
                                )}

                                {/* Xóa phương án (nếu > 2 phương án) */}
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIndex, optIndex)}
                                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition cursor-pointer"
                                    title="Xóa phương án này"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.options.length < 6 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIndex)}
                            className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 transition flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Thêm phương án ({String.fromCharCode(65 + q.options.length)})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút thêm câu hỏi mới */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-500 text-gray-700 dark:text-gray-200 hover:text-red-600 font-bold text-sm transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Thêm một câu hỏi mới</span>
              </button>
            </div>

            {/* STICKY BOTTOM BAR */}
            <div className="sticky bottom-6 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-gray-900 dark:text-white">
                  Tổng: {questions.length} câu hỏi
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>
                    {validQuestionsCount}/{questions.length} câu đã xác định đáp án
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/myquizzes")}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition cursor-pointer"
                >
                  Hủy & Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleSaveQuiz}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Đang lưu thay đổi...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal thông báo lưu thành công */}
        <AnimatePresence>
          {saveSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Đã cập nhật Quiz!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tất cả thay đổi cho bộ quiz <strong>"{title}"</strong> đã được lưu thành công vào cơ sở dữ liệu.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => navigate(`/quiz/${id}`)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    <span>Làm thử ngay</span>
                  </button>
                  <button
                    onClick={() => navigate("/myquizzes")}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faListCheck} />
                    <span>Quiz của tôi</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
