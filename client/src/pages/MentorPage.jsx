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
  isPlaying
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
    if (!text) return '';
    // Chuyển **text** thành <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Chuyển *text* thành <em>text</em> (italic)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Chuyển xuống dòng thành <br>
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-xl bg-white shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
          <span className="text-white text-lg">🎓</span>
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">Chat với Mentor</h2>
          <p className="text-xs text-gray-500">Hỏi đáp trực tiếp với AI</p>
        </div>
      </div>

      <div className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white" style={{ minHeight: '300px', maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-500 text-sm">Chưa có tin nhắn nào...</p>
            <p className="text-gray-400 text-xs mt-1">Tạm dừng bài giảng để bắt đầu chat</p>
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
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.type === "user" 
                    ? "bg-blue-500" 
                    : "bg-gradient-to-br from-red-500 to-red-600"
                }`}>
                  <span className="text-white text-xs">
                    {msg.type === "user" ? "👤" : "🎓"}
                  </span>
                </div>
                <div className={`flex flex-col max-w-[75%] ${
                  msg.type === "user" ? "items-end" : "items-start"
                }`}>
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}>
                    {msg.type === "mentor" ? (
                      <p 
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.type === "mentor" && (
                    <span className="text-xs text-gray-400 mt-1 px-2">Mentor AI</span>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">🎓</span>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
              placeholder={isPaused ? "Nhập câu hỏi của bạn (đang tạm dừng)..." : "Nhập câu hỏi của bạn..."}
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
          <span className="font-medium">⏸️ Tạm dừng</span> để chat với mentor
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
  
  const lectureContextRef = useRef("");
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const currentSentenceIndexRef = useRef(0);
  const live2dRef = useRef(null);

  // Khởi tạo speech synthesis và load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices (có thể cần thời gian để load)
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          console.log("Đã load voices:", voices.length);
          // Log tất cả voices tiếng Việt để debug
          const viVoices = voices.filter(v => 
            v.lang.includes('vi') || 
            v.name.toLowerCase().includes('vietnamese') ||
            v.name.toLowerCase().includes('viet')
          );
          if (viVoices.length > 0) {
            console.log("Voices tiếng Việt có sẵn:", viVoices.map(v => ({ name: v.name, lang: v.lang })));
          } else {
            console.log("Không tìm thấy voice tiếng Việt. Danh sách voices:", 
              voices.slice(0, 10).map(v => ({ name: v.name, lang: v.lang }))
            );
          }
        }
      };
      
      // Thử load ngay
      loadVoices();
      
      // Một số trình duyệt cần event để load voices
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn("Trình duyệt không hỗ trợ Text-to-Speech");
    }
  }, []);

  // Hàm chia nội dung thành câu
  const splitIntoSentences = (text) => {
    return text
      .split(/[.!?。！？]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  // Hàm tìm voice tiếng Việt nữ
  const getVietnameseVoice = () => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    
    // Lọc tất cả voices tiếng Việt
    const viVoices = voices.filter(voice => 
      voice.lang.includes('vi') || 
      voice.name.toLowerCase().includes('vietnamese') ||
      voice.name.toLowerCase().includes('viet')
    );
    
    if (viVoices.length === 0) return null;
    
    // Ưu tiên tìm voice nữ tiếng Việt
    // Voice nữ thường có tên chứa: female, nữ, woman, hoặc có pitch cao
    const femaleViVoice = viVoices.find(voice => {
      const nameLower = voice.name.toLowerCase();
      return nameLower.includes('female') || 
             nameLower.includes('nữ') ||
             nameLower.includes('woman') ||
             nameLower.includes('f') && !nameLower.includes('male');
    });
    
    if (femaleViVoice) {
      console.log("Đã tìm thấy voice nữ tiếng Việt:", femaleViVoice.name);
      return femaleViVoice;
    }
    
    // Nếu không tìm thấy voice nữ, lấy voice tiếng Việt đầu tiên
    if (viVoices.length > 0) {
      console.log("Sử dụng voice tiếng Việt:", viVoices[0].name);
      return viVoices[0];
    }
    
    return null;
  };

  // ⭐️ HÀM ĐỌC TEXT (TEXT-TO-SPEECH) - ĐỌC TIẾNG VIỆT ⭐️
  const speakText = (text, onEnd) => {
    if (!synthRef.current || !text) {
      if (!('speechSynthesis' in window)) {
        alert("Trình duyệt không hỗ trợ tính năng đọc văn bản.");
      }
      return;
    }

    // Hủy bất kỳ bài đọc nào đang diễn ra
    synthRef.current.cancel();

    // Bắt đầu animation nhép miệng
    if (live2dRef.current) {
      live2dRef.current.startSpeaking();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // ⭐️ THAY ĐỔI: Thiết lập ngôn ngữ đọc là tiếng Việt (vi-VN) ⭐️
    utterance.lang = 'vi-VN';

    // Tìm và sử dụng voice tiếng Việt nữ nếu có
    const viVoice = getVietnameseVoice();
    if (viVoice) {
      utterance.voice = viVoice;
      // Nếu là voice nữ, giữ pitch bình thường, nếu không tăng pitch để giống giọng nữ
      const isFemaleVoice = viVoice.name.toLowerCase().includes('female') || 
                            viVoice.name.toLowerCase().includes('nữ') ||
                            viVoice.name.toLowerCase().includes('woman');
      utterance.pitch = isFemaleVoice ? 1.0 : 1.1;
    } else {
      // Tăng pitch để giống giọng nữ hơn khi không có voice tiếng Việt
      utterance.pitch = 1.15;
    }

    // Tốc độ đọc (0.9 = hơi chậm một chút để dễ nghe)
    utterance.rate = 0.9;
    utterance.volume = 1;

    // Callback khi đọc xong
    utterance.onend = () => {
      // Dừng animation nhép miệng
      if (live2dRef.current) {
        live2dRef.current.stopSpeaking();
      }
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (error) => {
      console.error("Lỗi text-to-speech:", error);
      // Dừng animation nếu có lỗi
      if (live2dRef.current) {
        live2dRef.current.stopSpeaking();
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Hàm đọc bài giảng section hiện tại
  const speakCurrentSection = () => {
    if (!lecture || !synthRef.current) return;
    if (synthRef.current.speaking && !synthRef.current.paused) return;

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
      alert("Lỗi khi tải bài giảng: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };


  // Hàm phát bài giảng với text-to-speech
  const startLecture = () => {
    if (!lecture || !synthRef.current) return;
    
    // Nếu đang tạm dừng, tiếp tục
    if (synthRef.current.paused) {
      resumeLecture();
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    speakCurrentSection();
  };

  // Hàm dừng bài giảng
  const pauseLecture = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      // Dừng animation nhép miệng khi tạm dừng
      if (live2dRef.current) {
        live2dRef.current.stopSpeaking();
      }
      setIsPaused(true);
    }
  };

  // Hàm tiếp tục bài giảng
  const resumeLecture = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else if (synthRef.current && !synthRef.current.speaking) {
      // Nếu không đang phát, bắt đầu lại từ section hiện tại
      speakCurrentSection();
      setIsPaused(false);
    }
  };

  // Hàm dừng hoàn toàn
  const stopLecture = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // Dừng animation nhép miệng
    if (live2dRef.current) {
      live2dRef.current.stopSpeaking();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    currentSentenceIndexRef.current = 0;
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

      // Đọc câu trả lời bằng text-to-speech
      // Dừng bài giảng nếu đang phát
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      // Đọc câu trả lời của mentor
      speakText(mentorResponse);
    } catch (error) {
      console.error("Lỗi chat:", error);
      const errorMessage = "Xin lỗi, tôi gặp lỗi khi trả lời. Vui lòng thử lại.";
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
              🎓 Mentor AI - Giảng viên thông minh
            </h1>
            <p className="text-lg text-gray-600">
              Tải tài liệu lên, mentor sẽ giảng bài cho bạn nghe và trả lời câu hỏi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Live2D Area – chiếm 2 cột */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Live2D Model Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="w-full h-[400px] lg:h-[500px] relative flex items-end justify-center bg-gradient-to-b from-red-50 to-red-100"
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <span className="text-white text-lg">📄</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Upload tài liệu</h3>
                    <p className="text-xs text-gray-500">Chỉ hỗ trợ file .docx</p>
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
                        <span className="text-sm font-medium">Đang xử lý file...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lecture Display Card */}
              {lecture && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-white text-lg">📚</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Bài giảng</h3>
                      <p className="text-xs text-gray-500">Nội dung đã được xử lý</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white max-h-[300px] overflow-y-auto">
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
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>▶️</span>
                        <span>Bắt đầu giảng</span>
                      </button>
                    )}
                    {isPlaying && !isPaused && (
                      <button
                        onClick={pauseLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>⏸️</span>
                        <span>Tạm dừng</span>
                      </button>
                    )}
                    {isPaused && (
                      <button
                        onClick={resumeLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>▶️</span>
                        <span>Tiếp tục</span>
                      </button>
                    )}
                    {(isPlaying || isPaused) && (
                      <button
                        onClick={stopLecture}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition shadow-md hover:shadow-lg"
                      >
                        <span>⏹️</span>
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
