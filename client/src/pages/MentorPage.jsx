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

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-xl bg-white shadow-lg h-full">
      <h2 className="font-semibold text-lg">Chat & Materials</h2>

      <div className="flex-1 border rounded p-2 overflow-y-auto bg-gray-50 min-h-[200px]">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tin nhắn nào...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg ${
                  msg.type === "user"
                    ? "bg-blue-100 ml-auto text-right max-w-[80%]"
                    : "bg-green-100 mr-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm text-gray-800">{msg.text}</p>
                {msg.type === "mentor" && (
                  <span className="text-xs text-gray-500">Mentor AI</span>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="bg-green-100 p-2 rounded-lg mr-auto max-w-[80%]">
                <p className="text-sm text-gray-600">Mentor đang suy nghĩ...</p>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input - hiển thị khi có bài giảng và (đang tạm dừng hoặc chưa phát) */}
      {lecture && (isPaused || !isPlaying) && (
        <div className="flex flex-col gap-2">
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
            className="border rounded px-3 py-2 text-sm"
            disabled={isProcessing}
          />
          <button
            onClick={onSendMessage}
            disabled={isProcessing || !chatInput.trim()}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Đang gửi..." : "Gửi câu hỏi"}
          </button>
        </div>
      )}
      
      {/* Thông báo khi đang phát */}
      {lecture && isPlaying && !isPaused && (
        <div className="text-sm text-gray-500 text-center p-2 bg-yellow-50 rounded">
          ⏸️ Tạm dừng để chat với mentor
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
    <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden">
      <Header />

      {/* MAIN WRAPPER */}
      <section className="px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {/* LEFT: Live2D Area – chiếm 2 cột */}
        <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
          <div
            className="w-full h-[360px] lg:h-[430px] rounded-xl overflow-hidden shadow-xl 
                       relative flex items-end justify-center"
            style={{
              backgroundImage: "url('/bgWaifu.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Model luôn đứng chính giữa đáy */}
            <div className="flex justify-center items-center mb-[-5px] scale-[90%] md:scale-100">
              <Live2DWidget ref={live2dRef} />
            </div>
          </div>

          {/* Controls và Lecture Display */}
          <div className="w-full bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col gap-4">
              {/* File Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Upload tài liệu (.docx)</label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="border rounded px-2 py-1 text-sm"
                />
                {isLoading && (
                  <p className="text-sm text-blue-600">Đang xử lý file...</p>
                )}
              </div>

              {/* Lecture Display */}
              {lecture && (
                <div className="border rounded p-3 bg-gray-50 max-h-[200px] overflow-y-auto">
                  <h3 className="font-semibold text-lg mb-2">{lecture.title}</h3>
                  {lecture.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className={`mb-2 ${
                        idx === currentSectionIndex
                          ? "bg-yellow-100 p-2 rounded"
                          : ""
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{section.title}</h4>
                      {idx === currentSectionIndex && (
                        <p className="text-sm text-gray-700 mt-1">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Control Buttons */}
              {lecture && (
                <div className="flex gap-2 justify-center">
                  {!isPlaying && !isPaused && (
                    <button
                      onClick={startLecture}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      ▶️ Bắt đầu giảng
                    </button>
                  )}
                  {isPlaying && !isPaused && (
                    <button
                      onClick={pauseLecture}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
                    >
                      ⏸️ Tạm dừng
                    </button>
                  )}
                  {isPaused && (
                    <button
                      onClick={resumeLecture}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      ▶️ Tiếp tục
                    </button>
                  )}
                  {(isPlaying || isPaused) && (
                    <button
                      onClick={stopLecture}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      ⏹️ Dừng
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat panel – chiếm 1 cột */}
        <div className="md:col-span-1 w-full">
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
      </section>

      <Footer />
    </div>
  );
}
