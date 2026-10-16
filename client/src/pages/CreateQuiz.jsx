import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_ENDPOINTS } from "../config/api.js";
import { getAuthToken } from "../utils/auth.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, 
  faSpinner, 
  faLightbulb, 
  faFile, 
  faLink, 
  faVideo, 
  faExclamationTriangle,
  faCheck,
  faTrash,
  faCopy,
  faPlus,
  faArrowLeft,
<<<<<<< Updated upstream
  faSave
=======
  faSave,
  faPenToSquare
>>>>>>> Stashed changes
} from '@fortawesome/free-solid-svg-icons';

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [inputValue, setInputValue] = useState("10");
  
  // RAG options - Mặc định tắt để tạo câu hỏi siêu tốc (2s) và không nghẽn CPU
  const [useRAG, setUseRAG] = useState(false);
  const [storeDocument, setStoreDocument] = useState(true);
  
  // Multi-format support
  const [activeTab, setActiveTab] = useState('file'); // 'file', 'url', 'youtube', 'text'
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [text, setText] = useState("");
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // step: 1 = Form, 2 = Processing AI, 3 = Review & Verify Q&A, 4 = Saved Success
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // --- Review / Verify Studio States (Step 3) ---
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [ragMetadata, setRagMetadata] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [createdDeck, setCreatedDeck] = useState(null);
  const questionRefs = useRef({});

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return false;

    const allowedExtensions = ['.pdf', '.docx', '.pptx'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError("Chỉ chấp nhận file PDF, DOCX, hoặc PPTX");
      setFile(null);
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    setError("");
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

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

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError("");
  };

<<<<<<< Updated upstream
=======
  // CHẾ ĐỘ TỰ SOẠN CÂU HỎI THỦ CÔNG: Chuyển thẳng sang Step 3 không cần qua AI
  const handleStartManual = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề Quiz trước khi bắt đầu soạn câu hỏi");
      return;
    }
    setError("");
    const count = Math.max(1, Math.min(50, questionCount || 5));
    const initialQuestions = Array.from({ length: count }, (_, i) => ({
      question: `Câu hỏi ${i + 1}: `,
      options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      correctAnswer: "Phương án A",
      explanation: "",
      bloomLevel: "Hiểu",
      tags: []
    }));
    setQuestions(initialQuestions);
    setSummary([
      "Quiz được tạo ở chế độ tự soạn thủ công.",
      "Bạn có thể chỉnh sửa nội dung câu hỏi, bổ sung các phương án và click để chọn đáp án đúng trước khi Lưu & Xuất bản."
    ]);
    setActiveQuestionIndex(0);
    setStep(3);
  };

>>>>>>> Stashed changes
  // STEP 1 -> STEP 2 -> STEP 3: Gọi API tạo bản xem trước câu hỏi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    
    if (activeTab === 'file' && !file) {
      setError("Vui lòng tải lên file");
      return;
    }
    
    if (activeTab === 'url' && !url) {
      setError("Vui lòng nhập URL");
      return;
    }
    
    if (activeTab === 'youtube' && !youtubeUrl) {
      setError("Vui lòng nhập YouTube URL");
      return;
    }
    
    if (activeTab === 'text' && text.length < 50) {
      setError("Nội dung quá ngắn. Tối thiểu 50 ký tự");
      return;
    }

    setIsLoading(true);
    setStep(2);
    setError("");
    setUploadProgress(10);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Vui lòng đăng nhập để tạo quiz");
        setIsLoading(false);
        setStep(1);
        navigate("/login");
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 88) {
            clearInterval(progressInterval);
            return 88;
          }
          return prev + 8;
        });
      }, 600);

      let res;

      if (activeTab === 'file') {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("courseCode", courseCode || "");
        formData.append("questionCount", questionCount.toString());
        formData.append("useRAG", useRAG.toString());
        formData.append("storeDocument", storeDocument.toString());
        formData.append("preview", "true");
        formData.append("file", file);

        res = await fetch(`${API_ENDPOINTS.UPLOAD}?preview=true`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        res = await fetch(`${API_ENDPOINTS.UPLOAD}?preview=true`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            courseCode: courseCode || "",
            questionCount,
            useRAG,
            storeDocument,
            preview: true,
            url: activeTab === 'url' ? url : activeTab === 'youtube' ? youtubeUrl : undefined,
            text: activeTab === 'text' ? text : undefined
          }),
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Tạo quiz thất bại");
      }

      const data = await res.json();

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Không thể tạo câu hỏi từ tài liệu này. Vui lòng thử lại với nội dung rõ ràng hơn.");
      }

      // Gắn ID tạm cho từng câu
      const parsedQuestions = data.questions.map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        question: q.question || `Câu hỏi ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        answer: q.answer || (q.options && q.options[0]) || "",
      }));

      setQuestions(parsedQuestions);
      setSummary(data.summary || []);
      setRagMetadata(data.ragMetadata || null);
      
      // Chuyển sang Step 3: Kiểm duyệt & Chốt đáp án
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Lỗi khi tạo quiz:", err);
      setStep(1);
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra xem server đã chạy chưa");
      } else {
        setError(err.message || "Có lỗi xảy ra khi tạo quiz");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3 Actions: Chỉnh sửa câu hỏi & chốt đáp án ---

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

      // Cập nhật cả trường answer nếu phương án này đang là đáp án đúng
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
        alert("Mỗi câu hỏi cần tối thiểu 2 phương án lựa chọn.");
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
      alert("Bộ Quiz cần có ít nhất 1 câu hỏi.");
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
      options: [...qToClone.options],
    };
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(qIndex + 1, 0, cloned);
      return next;
    });
  };

  const handleAddNewQuestion = () => {
    const newQ = {
      id: `q_manual_${Date.now()}`,
      question: "",
      options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      answer: "Lựa chọn A",
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
        return false;
      }
      if (q.options.some((opt) => !opt.trim())) {
        scrollToQuestion(i);
        setError(`Câu hỏi số ${i + 1} có phương án lựa chọn bị để trống.`);
        return false;
      }
      if (!q.answer || !q.options.includes(q.answer)) {
        scrollToQuestion(i);
        setError(`Vui lòng chọn 1 đáp án đúng hợp lệ cho câu hỏi số ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  // STEP 3 -> STEP 4: Xác nhận và Lưu Quiz vào cơ sở dữ liệu
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề cho bộ Quiz.");
      return;
    }

    if (!validateQuestions()) return;

    const token = getAuthToken();
    if (!token) {
      setError("Vui lòng đăng nhập để lưu quiz");
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
          answer: q.answer.trim(),
        })),
        isPublic: false
      };

      const res = await fetch(API_ENDPOINTS.DECKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Lưu quiz thất bại");
      }

      const savedDeck = await res.json();
      setCreatedDeck(savedDeck);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Lỗi khi lưu quiz:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const validQuestionsCount = questions.filter(
    (q) => q.question.trim() && q.options.includes(q.answer) && q.options.every((opt) => opt.trim())
  ).length;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col font-sans">
      <Header />

      <main className="grow flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          {/* STEPPER PROGRESS INDICATOR */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-600 to-orange-600 -translate-y-1/2 transition-all duration-500 z-0"
                style={{
                  width: step === 1 ? "0%" : step === 2 ? "33%" : step === 3 ? "66%" : "100%",
                }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => step === 3 && setStep(1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    step >= 1
                      ? "bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950"
                      : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  1
                </button>
                <span className={`text-xs mt-2 font-semibold ${step >= 1 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>
                  Cấu hình nguồn
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    step >= 2
                      ? "bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950"
                      : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  2
                </div>
                <span className={`text-xs mt-2 font-semibold ${step >= 2 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>
                  AI Phân tích
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    step >= 3
                      ? "bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950"
                      : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  3
                </div>
                <span className={`text-xs mt-2 font-semibold ${step >= 3 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>
                  Kiểm tra đáp án
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    step === 4
                      ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-950"
                      : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  ✓
                </div>
                <span className={`text-xs mt-2 font-semibold ${step === 4 ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                  Hoàn tất
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: FORM NHẬP LIỆU */}
            {step === 1 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-red-100 dark:border-red-900 p-8 md:p-12"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 mb-2">
                    Tạo Quiz Mới
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload file, paste URL, hoặc nhập text - AI sẽ tạo câu hỏi để bạn kiểm duyệt đáp án trước khi lưu ✨
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold" htmlFor="title">
                      Tiêu đề Quiz *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Ví dụ: Lịch sử Đảng - Chương 1"
                      required
                    />
                  </motion.div>

                  {/* Course Code */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold" htmlFor="courseCode">
                      Mã học phần (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      id="courseCode"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Ví dụ: PHIL101"
                    />
                  </motion.div>

                  {/* Question Count */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold" htmlFor="questionCount">
                      Số lượng câu hỏi
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        id="questionCount"
                        min="1"
                        max="50"
                        value={questionCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setQuestionCount(val);
                          setInputValue(val.toString());
                        }}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) {
                            setInputValue(val);
                            if (val !== '') {
                              const num = parseInt(val);
                              if (num >= 1 && num <= 50) {
                                setQuestionCount(num);
                              }
                            }
                          }
                        }}
                        onBlur={() => {
                          if (inputValue === '' || parseInt(inputValue) < 1) {
                            setQuestionCount(1);
                            setInputValue('1');
                          } else if (parseInt(inputValue) > 50) {
                            setQuestionCount(50);
                            setInputValue('50');
                          } else {
                            setInputValue(questionCount.toString());
                          }
                        }}
                        className="w-16 text-center text-2xl font-bold text-red-600 dark:text-red-400 bg-transparent border-2 border-red-200 dark:border-red-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Kéo thanh trượt hoặc nhập số (1-50)
                    </p>
                  </motion.div>

                  {/* Multi-format Input with Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                      Nguồn nội dung *
                    </label>
                    
                    {/* Tab Buttons */}
<<<<<<< Updated upstream
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
=======
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
>>>>>>> Stashed changes
                      <button
                        type="button"
                        onClick={() => setActiveTab('file')}
                        className={`p-4 rounded-xl border-2 font-medium transition flex flex-col items-center gap-2 cursor-pointer ${
                          activeTab === 'file'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faFile} className="text-2xl" />
<<<<<<< Updated upstream
                        <span>File (PDF/DOCX/PPTX)</span>
=======
                        <span>File (PDF/DOCX)</span>
>>>>>>> Stashed changes
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('url')}
                        className={`p-4 rounded-xl border-2 font-medium transition flex flex-col items-center gap-2 cursor-pointer ${
                          activeTab === 'url'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faLink} className="text-2xl" />
                        <span>Web URL</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('youtube')}
                        className={`p-4 rounded-xl border-2 font-medium transition flex flex-col items-center gap-2 cursor-pointer ${
                          activeTab === 'youtube'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faVideo} className="text-2xl" />
                        <span>YouTube</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('text')}
                        className={`p-4 rounded-xl border-2 font-medium transition flex flex-col items-center gap-2 cursor-pointer ${
                          activeTab === 'text'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-2xl font-bold">Aa</span>
                        <span>Văn bản</span>
<<<<<<< Updated upstream
=======
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`p-4 rounded-xl border-2 font-medium transition flex flex-col items-center gap-2 cursor-pointer ${
                          activeTab === 'manual'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-2xl" />
                        <span>Tự soạn thủ công</span>
>>>>>>> Stashed changes
                      </button>
                    </div>

                    {/* Tab Contents */}
                    <div>
<<<<<<< Updated upstream
                      {activeTab === 'file' && (
                        <div
                          onClick={handleUploadAreaClick}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                            isDragging
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 scale-[1.01]"
                              : file
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 bg-gray-50/50 dark:bg-gray-900/50"
                          }`}
                        >
                          {file ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 text-2xl">
                                <FontAwesomeIcon icon={faFile} />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition text-sm font-medium cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                                <span>Chọn file khác</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                                <FontAwesomeIcon icon={faFile} className="text-2xl" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                  Kéo thả file vào đây hoặc <span className="text-red-600 dark:text-red-400 underline">chọn từ máy tính</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Hỗ trợ PDF, DOCX, PPTX (tối đa 10MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

=======
                      {activeTab === 'manual' && (
                        <div className="bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-dashed border-red-300 dark:border-red-800 rounded-2xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                              Chế độ tự soạn câu hỏi thủ công
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto mt-1">
                              Bạn có thể tự nhập câu hỏi, thêm các phương án A/B/C/D và tick chọn đáp án đúng theo ý mình trong trình soạn thảo.
                            </p>
                          </div>
                          <div className="inline-block px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                            Khởi tạo ban đầu: <span className="text-red-600 dark:text-red-400 font-bold">{questionCount} câu hỏi trống</span> (bạn có thể thêm/bớt tùy ý ở bước tiếp theo)
                          </div>
                        </div>
                      )}

                      {activeTab === 'file' && (
                        <div
                          onClick={handleUploadAreaClick}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                            isDragging
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 scale-[1.01]"
                              : file
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 bg-gray-50/50 dark:bg-gray-900/50"
                          }`}
                        >
                          {file ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 text-2xl">
                                <FontAwesomeIcon icon={faFile} />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition text-sm font-medium cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                                <span>Chọn file khác</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                                <FontAwesomeIcon icon={faFile} className="text-2xl" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                  Kéo thả file vào đây hoặc <span className="text-red-600 dark:text-red-400 underline">chọn từ máy tính</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Hỗ trợ PDF, DOCX, PPTX (tối đa 10MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

>>>>>>> Stashed changes
                      {activeTab === 'url' && (
                        <div className="space-y-4">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/bai-viet"
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                          />
                        </div>
                      )}

                      {activeTab === 'youtube' && (
                        <div className="space-y-4">
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                          />
                        </div>
                      )}

                      {activeTab === 'text' && (
                        <div className="space-y-4">
                          <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste nội dung văn bản ở đây (tối thiểu 50 ký tự)..."
                            rows={8}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.pptx"
                    />
                  </motion.div>

                  {/* Nút Submit Tiếp tục */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
<<<<<<< Updated upstream
                    <button
                      type="submit"
                      disabled={
                        isLoading || 
                        !title || 
                        (activeTab === 'file' && !file) ||
                        (activeTab === 'url' && !url) ||
                        (activeTab === 'youtube' && !youtubeUrl) ||
                        (activeTab === 'text' && text.length < 50)
                      }
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRocket} />
                      <span>Tạo câu hỏi & Chuyển sang kiểm duyệt đáp án</span>
                    </button>
=======
                    {activeTab === 'manual' ? (
                      <button
                        type="button"
                        onClick={handleStartManual}
                        disabled={!title.trim()}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span>Vào trình soạn thảo câu hỏi ngay (0s)</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={
                          isLoading || 
                          !title || 
                          (activeTab === 'file' && !file) ||
                          (activeTab === 'url' && !url) ||
                          (activeTab === 'youtube' && !youtubeUrl) ||
                          (activeTab === 'text' && text.length < 50)
                        }
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faRocket} />
                        <span>Tạo câu hỏi & Chuyển sang kiểm duyệt đáp án</span>
                      </button>
                    )}
>>>>>>> Stashed changes
                  </motion.div>

                  {/* Báo lỗi */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                      >
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}

            {/* STEP 2: PROCESSING AI PROGRESS */}
            {step === 2 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-8 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-400 rounded-full mx-auto mb-6"
                />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  AI đang trích xuất & biên soạn câu hỏi...
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Hệ thống đang chuẩn bị bảng kiểm duyệt đáp án đúng/sai cho bạn
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden max-w-md mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-3">{uploadProgress}%</p>
              </motion.div>
            )}

            {/* STEP 3: STUDIO KIỂM TRA & CHỐT ĐÁP ÁN ĐÚNG/SAI */}
            {step === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header Info Banner */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {courseCode && courseCode.trim() && courseCode.trim().toUpperCase() !== "GENERAL" && (
                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold">
                          {courseCode.trim()}
                        </span>
                      )}
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
                        {validQuestionsCount}/{questions.length} câu đã có đáp án hợp lệ
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-red-500 focus:bg-gray-50 dark:focus:bg-gray-900 px-1 py-0.5 rounded-lg outline-none transition w-full"
                        title="Bấm để sửa tên quiz"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Click vào phương án bất kỳ để chuyển thành đáp án đúng. Bạn có thể sửa câu từ trực tiếp trên từng ô.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      <span>Sửa nguồn</span>
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

                {/* AI Summary Accordion */}
                {summary && summary.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 shadow-sm">
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    >
                      <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-sm sm:text-base">
                        <span>✨</span>
                        <span>Tóm tắt kiến thức trọng tâm từ AI</span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-800/60 px-2 py-0.5 rounded-full font-semibold">
                          {summary.length} điểm chính
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
                      const isValid = q.question.trim() && q.options.includes(q.answer) && q.options.every((o) => o.trim());
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
                    <span className="font-bold text-gray-900 dark:text-white">Tổng: {questions.length} câu hỏi</span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheck} />
                      <span>{validQuestionsCount}/{questions.length} câu đã kiểm tra</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition cursor-pointer"
                    >
                      ← Quay lại sửa nguồn
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
                          <span>Đang lưu Quiz...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          <span>Lưu & Xuất bản Quiz</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: HOÀN TẤT & THÀNH CÔNG */}
            {step === 4 && createdDeck && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-xl mx-auto"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 text-3xl shadow-inner">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  🎉 Tạo Quiz thành công!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Bộ quiz <strong className="text-red-600 dark:text-red-400">"{createdDeck.title}"</strong> ({createdDeck.questions?.length || questions.length} câu) đã được kiểm duyệt và lưu vào thư viện của bạn.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/quiz/${createdDeck._id}`)}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg transition cursor-pointer"
                  >
                    Bắt đầu làm Quiz ngay
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/myquizzes")}
                      className="py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition cursor-pointer"
                    >
                      Về Quiz của tôi
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTitle("");
                        setCourseCode("");
                        setFile(null);
                        setUrl("");
                        setYoutubeUrl("");
                        setText("");
                        setQuestions([]);
                        setSummary([]);
                        setCreatedDeck(null);
                        setStep(1);
                      }}
                      className="py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition cursor-pointer"
                    >
                      Tạo thêm Quiz mới
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
