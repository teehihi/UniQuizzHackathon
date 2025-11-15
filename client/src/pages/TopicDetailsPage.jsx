import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 
import api from '../api.js'; 

// HÀM GỌI API THẬT
const fetchTopicById = async (topicId) => {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
};

// ⭐️ HÀM GIÚP LOẠI BỎ CÁC KÝ TỰ MARKDOWN (**, *)
const cleanMarkdown = (text) => {
    if (typeof text !== 'string') return text;
    // Loại bỏ ** và *
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
};
// --------------------------------------------------------------------------------

// ⭐️ HÀM ĐỌC TỪ (TEXT-TO-SPEECH) ⭐️
const speakWord = (text) => {
    if ('speechSynthesis' in window) {
        // Hủy bất kỳ bài đọc nào đang diễn ra
        window.speechSynthesis.cancel(); 
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Thiết lập ngôn ngữ đọc là tiếng Anh (en-US)
        utterance.lang = 'en-US'; 
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Trình duyệt không hỗ trợ tính năng đọc văn bản.");
    }
};

function TopicDetailsPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();

    const [topic, setTopic] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTopic = async () => {
            try {
                const data = await fetchTopicById(topicId); 
                setTopic(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết chủ đề:", error);
                if (error.response && error.response.status !== 200) {
                     navigate('/vocabulary'); 
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadTopic();
    }, [topicId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header /><div className="h-20 sm:h-24"></div> 
                <div className="grow text-center p-8 text-xl">Đang tải chi tiết chủ đề...</div>
                <Footer />
            </div>
        );
    }
    
    if (!topic) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header /><div className="h-20 sm:h-24"></div> 
                <div className="grow text-center p-8 text-xl text-red-600">
                    Không tìm thấy chủ đề này.
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff7f0] relative flex flex-col">
            <Header />
            <div className="h-16 sm:h-24"></div> 
            
            <main className="grow max-w-4xl mx-auto px-4 pt-2 relative z-10 w-full">
                <button 
                    onClick={() => navigate('/vocabulary')} 
                    className="mb-6 text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 
                               px-4 py-2 rounded-full font-semibold transition duration-200 shadow-sm"
                >
                    ← Trở về Chủ đề
                </button>
                
                <h1 className="text-4xl font-extrabold mb-4 text-red-700">{topic.title}</h1>
                
                <p className="text-gray-600 mb-6">
                    Chủ đề có tổng cộng {topic.words?.length || 0} từ vựng.
                </p>

                {/* NÚT LUYỆN TẬP -> CHUYỂN ĐẾN FLASHCARD */}
                {topic.words?.length > 0 && (
                    <button
                        onClick={() => navigate(`/flashcard/${topicId}`)}
                        className="mb-8 px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 transition shadow-lg"
                    >
                        Luyện Tập (Flashcard) ngay →
                    </button>
                )}

                {/* Danh sách Từ Vựng */}
                <h2 className="text-2xl font-semibold mt-4 mb-4 text-gray-800">Danh Sách Từ Vựng</h2>
                
                <div className="space-y-3 pb-20">
                    {topic.words?.map((wordObj, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400 flex justify-between items-center">
                            
                            {/* Khối Nội dung Từ */}
                            <div>
                                <div className="flex items-center space-x-3">
                                    <p className="text-xl font-bold text-gray-800">{cleanMarkdown(wordObj.word)}</p>
                                    
                                    {/* ⭐️ ICON LOA ĐÃ THÊM CLASS STYLING ⭐️ */}
                                    <button
                                        onClick={() => speakWord(wordObj.word)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        aria-label={`Đọc từ ${wordObj.word}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 640 640">
                                            <path d="M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z"/>
                                        </svg>
                                    </button>
                                </div>
                                
                                <p className="text-md text-gray-600 mt-1">
                                    <span className="font-semibold">Định nghĩa:</span> {cleanMarkdown(wordObj.definition)}
                                </p>
                                <p className="text-sm italic text-gray-500 mt-1">
                                    <span className="font-semibold">Ví dụ:</span> {cleanMarkdown(wordObj.example)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default TopicDetailsPage;