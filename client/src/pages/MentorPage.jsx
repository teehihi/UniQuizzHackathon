import Live2DWidget from "../components/Live2DWidget";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useRef, useEffect } from "react";
import api from "../api";

function ChatPanel({
  messages,
  onSendMessage,
  chatInput,
  setChatInput,
  isPaused,
  isProcessing,
  lecture,
  isPlaying,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hàm format markdown text thành HTML
  const formatText = (text) => {
    if (!text) return "";
    // Chuyển **text** thành <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Chuyển *text* thành <em>text</em> (italic)
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Chuyển xuống dòng thành <br>
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-xl bg-white shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
            className="h-6 w-6 text-white" 
            fill="currentColor" 
          >
            <path d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">Chat với Mentor</h2>
          <p className="text-xs text-gray-500">Hỏi đáp trực tiếp với AI</p>
        </div>
      </div>

      <div
        className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto bg-linear-to-b from-gray-50 to-white"
        style={{ minHeight: "300px", maxHeight: "400px" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-500 text-sm">Chưa có tin nhắn nào...</p>
            <p className="text-gray-400 text-xs mt-1">
              Tạm dừng bài giảng để bắt đầu chat
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === "user"
                      ? "bg-blue-500"
                      : "bg-linear-to-br from-red-500 to-red-600"
                  }`}
                >
                  <span className="text-white text-xs">
                    {msg.type === "user" ? "👤" : "🎓"}
                  </span>
                </div>
                <div
                  className={`flex flex-col max-w-[75%] ${
                    msg.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.type === "user"
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.type === "mentor" ? (
                      <p
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatText(msg.text),
                        }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}
                  </div>
                  {msg.type === "mentor" && (
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      Mentor AI
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    className="h-6 w-6 text-white" 
                    fill="currentColor" 
                  >
                    <path d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input - hiển thị khi có bài giảng và (đang tạm dừng hoặc chưa phát) */}
      {lecture && (isPaused || !isPlaying) && (
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isProcessing && chatInput.trim()) {
                  onSendMessage();
                }
              }}
              placeholder={
                isPaused
                  ? "Nhập câu hỏi của bạn (đang tạm dừng)..."
                  : "Nhập câu hỏi của bạn..."
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
              disabled={isProcessing}
            />
            <button
              onClick={onSendMessage}
              disabled={isProcessing || !chatInput.trim()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isProcessing ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}

      {/* Thông báo khi đang phát */}
      {lecture && isPlaying && !isPaused && (
        <div className="text-sm text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <span className="font-medium text-red-600">Tạm dừng</span> để chat với
          mentor
        </div>
      )}
    </div>
  );
}

export default function MentorPage() {
  const [lecture, setLecture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // TTS states - Chỉ sử dụng Google Translate TTS
  const [ttsConfig, setTtsConfig] = useState({
    gender: "female", // 'male' hoặc 'female'
    rate: 1.0,
    volume: 1.0,
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const lectureContextRef = useRef("");
  const live2dRef = useRef(null);
  const audioRef = useRef(null);

  // Load voice config khi component mount
  useEffect(() => {
    const loadVoiceConfig = async () => {
      try {
        const response = await api.get("/mentor/voice-config");
        const config = response.data;
        setTtsConfig({
          gender: config.gender || "female",
          rate: config.rate || 1.0,
          volume: config.volume || 1.0,
        });
      } catch (error) {
        console.error("Lỗi khi load voice config:", error);
      }
    };

    loadVoiceConfig();
  }, []);

  // Hàm lưu voice config
  const saveVoiceConfig = async () => {
    try {
      await api.put("/mentor/voice-config", {
        gender: ttsConfig.gender,
        language: "vi",
        rate: ttsConfig.rate,
        volume: ttsConfig.volume,
      });

      alert("Đã lưu cấu hình giọng đọc!");
      setShowVoiceSettings(false);
    } catch (error) {
      console.error("Lỗi khi lưu voice config:", error);
      alert(
        "Lỗi khi lưu cấu hình: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // ĐỌC TEST GOOGLE TRANSLATE TTS
  const speakText = async (text, onEnd) => {
    if (!text) return;

    // Dừng bất kỳ audio nào đang phát
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Bắt đầu animation nhép miệng
    if (live2dRef.current) {
      live2dRef.current.startSpeaking();
    }

    try {
      // Sử dụng Google Translate TTS
      const response = await api.post(
        "/mentor/tts/synthesize",
        {
          text,
          options: {
            language: "vi",
            gender: ttsConfig.gender,
            rate: ttsConfig.rate,
            volume: ttsConfig.volume,
          },
        },
        {
          responseType: "arraybuffer",
          headers: {
            Accept: "audio/webm, audio/*",
          },
        }
      );

      // Kiểm tra response
      if (!response.data || response.data.byteLength === 0) {
        throw new Error("Audio response rỗng");
      }

      // Kiểm tra Content-Type
      const contentType = response.headers["content-type"] || "audio/webm";
      console.log("Audio Content-Type:", contentType);
      console.log("Audio size:", response.data.byteLength, "bytes");

      // Convert arraybuffer thành blob
      const blob = new Blob([response.data], { type: contentType });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.volume = ttsConfig.volume;
      audio.playbackRate = ttsConfig.rate;

      // Thêm error handler trước khi play
      audio.onerror = (error) => {
        console.error("Lỗi phát audio:", error);
        console.error("Audio error details:", {
          error: audio.error,
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState,
        });
        URL.revokeObjectURL(audioUrl);
        if (live2dRef.current) {
          live2dRef.current.stopSpeaking();
        }
        audioRef.current = null;
        alert("Lỗi phát audio. Vui lòng thử lại hoặc kiểm tra cấu hình TTS.");
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (live2dRef.current) {
          live2dRef.current.stopSpeaking();
        }
        if (onEnd) onEnd();
        audioRef.current = null;
      };

      // Kiểm tra audio có thể load không
      audio.oncanplaythrough = () => {
        console.log("Audio đã sẵn sàng phát");
      };

      audio.onloadstart = () => {
        console.log("Bắt đầu load audio");
      };

      audioRef.current = audio;

      // Thử play với error handling
      try {
        await audio.play();
      } catch (playError) {
        console.error("Lỗi khi play audio:", playError);
        URL.revokeObjectURL(audioUrl);
        if (live2dRef.current) {
          live2dRef.current.stopSpeaking();
        }
        audioRef.current = null;
        throw new Error("Không thể phát audio: " + playError.message);
      }
    } catch (error) {
      console.error("Lỗi khi phát giọng đọc:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi không xác định";
      alert("Lỗi khi phát giọng đọc: " + errorMessage);
      if (live2dRef.current) {
        live2dRef.current.stopSpeaking();
      }
    }
  };

  // Hàm đọc bài giảng section hiện tại
  const speakCurrentSection = () => {
    if (!lecture) return;

    // Kiểm tra nếu đang phát audio
    if (audioRef.current && !audioRef.current.paused) {
      return;
    }

    const section = lecture.sections[currentSectionIndex];
    if (!section) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    const fullText = `${section.title}. ${section.content}`;
    speakText(fullText, () => {
      // Sau khi đọc xong section, chuyển sang section tiếp theo
      if (currentSectionIndex < lecture.sections.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
        setTimeout(() => speakCurrentSection(), 500);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };

  // Hàm xử lý upload file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      alert("Vui lòng chọn file .docx");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/mentor/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLecture(response.data);
      lectureContextRef.current = JSON.stringify(response.data);
      setCurrentSectionIndex(0);
      setMessages([]);
      alert("Tải bài giảng thành công! Nhấn nút phát để bắt đầu.");
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert(
        "Lỗi khi tải bài giảng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm phát bài giảng với Gemini TTS
  const startLecture = () => {
    if (!lecture) return;

    // Nếu đang tạm dừng, tiếp tục
    if (isPaused) {
      resumeLecture();
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    speakCurrentSection();
  };

  // Hàm dừng bài giảng
  const pauseLecture = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
    // Dừng animation nhép miệng khi tạm dừng
    if (live2dRef.current) {
      live2dRef.current.stopSpeaking();
    }
  };

  // Hàm tiếp tục bài giảng
  const resumeLecture = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
    } else if (!audioRef.current) {
      // Nếu không đang phát, bắt đầu lại từ section hiện tại
      speakCurrentSection();
      setIsPaused(false);
    }
  };

  // Hàm dừng hoàn toàn
  const stopLecture = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Dừng animation nhép miệng
    if (live2dRef.current) {
      live2dRef.current.stopSpeaking();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
  };

  // Hàm gửi câu hỏi
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessingChat) return;

    const question = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { type: "user", text: question }]);
    setIsProcessingChat(true);

    try {
      const response = await api.post("/mentor/chat", {
        question,
        lectureContext: lectureContextRef.current,
      });

      const mentorResponse = response.data.response;

      // Thêm câu trả lời vào messages
      setMessages((prev) => [
        ...prev,
        { type: "mentor", text: mentorResponse },
      ]);

      // Đọc câu trả lời bằng Gemini TTS
      // Dừng bài giảng nếu đang phát
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Đọc câu trả lời của mentor
      speakText(mentorResponse);
    } catch (error) {
      console.error("Lỗi chat:", error);
      const errorMessage =
        "Xin lỗi, tôi gặp lỗi khi trả lời. Vui lòng thử lại.";
      setMessages((prev) => [
        ...prev,
        {
          type: "mentor",
          text: errorMessage,
        },
      ]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden flex flex-col">
      <Header />

      {/* MAIN WRAPPER */}
      <main className="grow px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-red-700 mb-2">
              Miku Mentor - Trợ thủ thông minh của mọi sinh viên
            </h1>
            <p className="text-lg text-gray-600">
              Tải tài liệu lên, Miku sẽ giảng bài cho bạn nghe và trả lời câu
              hỏi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Live2D Area – chiếm 2 cột */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Live2D Model Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="w-full h-[400px] lg:h-[500px] relative flex items-end justify-center bg-linear-to-b from-red-50 to-red-100"
                  style={{
                    backgroundImage: "url('/bgWaifu.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Model luôn đứng chính giữa đáy */}
                  <div className="flex justify-center items-center mb-[-5px] scale-[90%] lg:scale-100">
                    <Live2DWidget ref={live2dRef} />
                  </div>
                </div>
              </div>

              {/* File Upload Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="h-6 w-6 text-white" 
                      fill="currentColor" 
                    >
                      <path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Upload tài liệu
                    </h3>
                    <p className="text-xs text-gray-500">
                      Chỉ hỗ trợ file .docx
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition cursor-pointer hover:border-red-300"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">
                          Đang xử lý file...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Settings Card - Hiển thị sau khi upload thành công */}
              {lecture && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          fill="currentColor"
                          className="h-6 w-6 text-white" 
                        >
                          <path d="M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552C416 538.7 405.3 528 392 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          Cấu hình giọng đọc
                        </h3>
                        <p className="text-xs text-gray-500">
                          Chọn giọng nam/nữ và điều chỉnh thông số
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                      className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    >
                      {showVoiceSettings ? "Ẩn" : "Hiện"}
                    </button>
                  </div>

                  {showVoiceSettings && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {/* Chọn giọng nam/nữ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giọng đọc
                        </label>
                        <select
                          value={ttsConfig.gender}
                          onChange={(e) =>
                            setTtsConfig({
                              ...ttsConfig,
                              gender: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="female">Nữ</option>
                          <option value="male">Nam</option>
                        </select>
                      </div>

                      {/* Cấu hình Tốc độ và Âm lượng */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tốc độ: {ttsConfig.rate.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={ttsConfig.rate}
                            onChange={(e) =>
                              setTtsConfig({
                                ...ttsConfig,
                                rate: parseFloat(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Âm lượng: {ttsConfig.volume.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            value={ttsConfig.volume}
                            onChange={(e) =>
                              setTtsConfig({
                                ...ttsConfig,
                                volume: parseFloat(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Nút lưu */}
                      <button
                        onClick={saveVoiceConfig}
                        className="w-full px-4 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition"
                      >
                        Lưu cấu hình
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lecture Display Card */}
              {lecture && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="h-6 w-6 text-white" 
                        fill="currentColor"
                      >
                        <path d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Bài giảng
                      </h3>
                      <p className="text-xs text-gray-500">
                        Nội dung đã được xử lý
                      </p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-linear-to-b from-gray-50 to-white max-h-[300px] overflow-y-auto">
                    <h4 className="font-bold text-xl text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      {lecture.title}
                    </h4>
                    <div className="space-y-4">
                      {lecture.sections.map((section, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg transition-all ${
                            idx === currentSectionIndex
                              ? "bg-yellow-50 border-2 border-yellow-400 shadow-md"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <h5 className="font-semibold text-base text-gray-800 mb-2">
                            {idx + 1}. {section.title}
                          </h5>
                          {idx === currentSectionIndex && (
                            <p className="text-sm text-gray-700 leading-relaxed mt-2">
                              {section.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              {lecture && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {!isPlaying && !isPaused && (
                      <button
                        onClick={startLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>Bắt đầu giảng</span>
                      </button>
                    )}
                    {isPlaying && !isPaused && (
                      <button
                        onClick={pauseLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>Tạm dừng</span>
                      </button>
                    )}
                    {isPaused && (
                      <button
                        onClick={resumeLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>Tiếp tục</span>
                      </button>
                    )}
                    {(isPlaying || isPaused) && (
                      <button
                        onClick={stopLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>Dừng</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Chat panel – chiếm 1 cột */}
            <div className="lg:col-span-1 w-full">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isPaused={isPaused}
                isProcessing={isProcessingChat}
                lecture={lecture}
                isPlaying={isPlaying}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
