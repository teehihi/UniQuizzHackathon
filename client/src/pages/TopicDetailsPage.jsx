import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 
import api from '../api.js'; 
import { getAuthToken } from '../utils/auth.js'; 

// --- API FUNCTIONS MỚI ---

const fetchFlashcardSetById = async (setId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Unauthorized: Missing token.");

    const response = await api.get(`/flashcards/${setId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

const fetchTopicById = async (topicId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Unauthorized: Missing token.");
    
    const response = await api.get(`/topics/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

// ⭐️ HÀM HỢP NHẤT DỮ LIỆU (CHUẨN HÓA) ⭐️
const normalizeData = (data) => {
    // 1. Nếu là Topic (có trường 'words')
    if (data.words) {
        return {
            id: data._id,
            title: data.title,
            courseCode: data.courseCode || '',
            type: 'topic',
            items: data.words.map(item => ({
                front: item.word,
                back: item.definition,
                example: item.example
            }))
        };
    }
    // 2. Nếu là Flashcard Set (có trường 'flashcards')
    if (data.flashcards) {
        return {
            id: data._id,
            title: data.title,
            courseCode: data.courseCode || '',
            type: 'flashcard-set',
            items: data.flashcards.map(item => ({
                front: item.front,
                back: item.back,
                example: item.hint || '' // Sử dụng hint làm ví dụ nếu có
            }))
        };
    }
    return null; // Dữ liệu không hợp lệ
};

// ⭐️ HÀM GỌI DỮ LIỆU CHUNG (ĐÃ SỬA LỖI KIỂM TRA LỖI HTTP) ⭐️
const fetchCombinedData = async (id) => {
    try {
        // 1. Thử tải dưới dạng Topic
        const topicData = await fetchTopicById(id);
        return normalizeData(topicData);
    } catch (topicError) {
        
        // Lấy mã lỗi từ Axios response
        const status = topicError.response?.status;

        // ⭐️ CHỈ THỬ API THỨ HAI NẾU LỖI LÀ 404 (NOT FOUND) HOẶC 403 (FORBIDDEN) ⭐️
        if (status === 404 || status === 403) {
            
            // 2. Thử tải dưới dạng Flashcard Set
            try {
                const setData = await fetchFlashcardSetById(id);
                return normalizeData(setData);
            } catch (setError) {
                // Nếu API Flashcard Set thất bại (401, 500, etc.), ném lỗi ra ngoài.
                throw setError; 
            }
        }
        
        // Nếu lỗi Topic là 401 (Unauthorized), 500, hoặc lỗi mạng, ném lỗi ngay lập tức.
        throw topicError; 
    }
};
// --------------------------------------------------------------------------------

// HÀM GIÚP LOẠI BỎ CÁC KÝ TỰ MARKDOWN (Giữ nguyên)
const cleanMarkdown = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
};

// HÀM ĐỌC TỪ (TEXT-TO-SPEECH) (Giữ nguyên)
const speakWord = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Trình duyệt không hỗ trợ tính năng đọc văn bản.");
    }
};

function TopicDetailsPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();

    const [itemData, setItemData] = useState(null); // Sử dụng tên chung itemData
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // ⭐️ GỌI HÀM KẾT HỢP DỮ LIỆU ⭐️
                const data = await fetchCombinedData(topicId); 
                setItemData(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết:", error);
                
                // ⭐️ SỬA LỖI REDIRECT: Xử lý lỗi 401 và lỗi không tìm thấy ⭐️
                if (error.response?.status === 401) {
                    navigate('/login'); // Lỗi Token -> Yêu cầu đăng nhập lại
                } else {
                    navigate('/vocabulary'); // Lỗi không tìm thấy hoặc lỗi server -> Quay về trang tổng quan
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [topicId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header /><div className="h-20 sm:h-24"></div> 
                <div className="grow text-center p-8 text-xl">Đang tải chi tiết...</div>
                <Footer />
            </div>
        );
    }
    
    if (!itemData) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header /><div className="h-20 sm:h-24"></div> 
                <div className="grow text-center p-8 text-xl text-red-600">
                    Không tìm thấy nội dung này.
                </div>
                <Footer />
            </div>
        );
    }
    
    // Đặt tên biến ngắn gọn hơn cho dữ liệu sau khi normalize
    const { title, type, items } = itemData;

    return (
        <div className="min-h-screen bg-[#fff7f0] relative flex flex-col">
            <Header />
            <div className="h-16 sm:h-24"></div> 
            
            <main className="grow max-w-4xl mx-auto px-4 pt-2 relative z-10 w-full">
                <button 
                    // Tùy chọn chuyển về Hub Flashcard hoặc Vocabulary
                    onClick={() => navigate(type === 'topic' ? '/vocabulary' : '/flashcard-hub')} 
                    className="mb-6 text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 
                               px-4 py-2 rounded-full font-semibold transition duration-200 shadow-sm"
                >
                    ← Trở về {type === 'topic' ? 'Chủ đề' : 'Hub Flashcard'}
                </button>
                
                <h1 className="text-4xl font-extrabold mb-4 text-red-700">
                    {title} 
                    <span className="text-xl text-gray-500 ml-3">
                        ({type === 'topic' ? 'Từ vựng' : 'Bộ Flashcard'})
                    </span>
                </h1>
                
                <p className="text-gray-600 mb-6">
                    Tổng cộng: {items?.length || 0} mục.
                </p>

                {/* NÚT CHUYỂN ĐẾN TRANG LUYỆN TẬP FLASHCARD PAGE */}
                {items?.length > 0 && (
                    <button
                        // ⭐️ CHUYỂN ĐẾN TRANG FLASHCARD PAGE ⭐️
                        onClick={() => navigate(`/flashcard/${itemData.id}`)}
                        className="mb-8 px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 transition shadow-lg"
                    >
                        Luyện Tập (Flashcard) ngay →
                    </button>
                )}

                {/* Danh sách Từ/Flashcard */}
                <h2 className="text-2xl font-semibold mt-4 mb-4 text-gray-800">
                    Danh Sách {type === 'topic' ? 'Từ Vựng' : 'Thẻ'}
                </h2>
                
                <div className="space-y-3 pb-20">
                    {items?.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400 flex justify-between items-center">
                            
                            {/* Khối Nội dung Từ */}
                            <div>
                                <div className="flex items-center space-x-3">
                                    {/* HIỂN THỊ CẢ WORD (Topic) và FRONT (Flashcard) */}
                                    <p className="text-xl font-bold text-gray-800">{cleanMarkdown(item.front)}</p>
                                    
                                    {/* Chỉ cho phép đọc nếu là Topic (hoặc nội dung Front là tiếng Anh) */}
                                    {type === 'topic' && (
                                        <button
                                            onClick={() => speakWord(item.front)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            aria-label={`Đọc từ ${item.front}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 640 640">
                                                <path d="M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-md text-gray-600 mt-1">
                                    <span className="font-semibold">{type === 'topic' ? 'Định nghĩa:' : 'Mặt sau:'}</span> {cleanMarkdown(item.back)}
                                </p>
                                {/* Chỉ hiển thị Ví dụ/Hint nếu có */}
                                {item.example && (
                                    <p className="text-sm italic text-gray-500 mt-1">
                                        <span className="font-semibold">{type === 'topic' ? 'Ví dụ:' : 'Hint/Ví dụ:'}</span> {cleanMarkdown(item.example)}
                                    </p>
                                )}
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