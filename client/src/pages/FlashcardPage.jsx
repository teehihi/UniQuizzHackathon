// client/src/pages/FlashcardPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 

// 1. IMPORT API THẬT
import api from '../api.js'; // <-- IMPORT API đã có Interceptor (Tự gắn Token)

// 2. ĐỊNH NGHĨA HÀM GỌI API THẬT
const fetchTopicById = async (topicId) => {
    // Dùng api.js (interceptor), không cần truyền token
    const response = await api.get(`/topics/${topicId}`);
    return response.data; // Trả về data thật từ server
};
// --- XÓA HẾT MOCK DATA VÀ LOGIC CŨ ---

function FlashcardPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    // (Xóa const token = mockToken;)

    const [topic, setTopic] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTopic = async () => {
            try {
                // Gọi hàm fetchTopicById thật
                const data = await fetchTopicById(topicId); 
                setTopic(data);
            } catch (error) {
                console.error("Lỗi khi tải từ vựng:", error);
                // Nếu lỗi 404 (Không tìm thấy) hoặc 401 (Unauthorized), ta đẩy về danh sách chủ đề
                if (error.response && (error.response.status === 404 || error.response.status === 401)) {
                     navigate('/vocabulary'); // Quay lại trang danh sách chủ đề
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadTopic();
    }, [topicId, navigate]); // <-- Chỉ còn topicId và navigate

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header />
                <div className="flex-grow text-center p-8 text-xl">Đang tải từ vựng...</div>
                <Footer />
            </div>
        );
    }
    
    if (!topic || !topic.words || topic.words.length === 0) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header />
                <div className="flex-grow text-center p-8 text-xl text-red-600">
                    Không tìm thấy chủ đề hoặc chủ đề này chưa có từ vựng.
                </div>
                <Footer />
            </div>
        );
    }

    const words = topic.words;
    const currentWord = words[currentIndex];

    const flipCard = () => setIsFlipped(!isFlipped);
    
    const nextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsFlipped(false);
    };

    const prevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
        setIsFlipped(false);
    };

    return (
        <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden flex flex-col">
            <Header />
            <main className="flex-grow max-w-3xl mx-auto p-4 text-center relative z-10 w-full">
                <button 
                    onClick={() => navigate('/vocabulary')} 
                    className="mb-6 text-blue-600 hover:underline font-semibold"
                >
                    ← Trở về danh sách Chủ đề
                </button>
                <h1 className="text-4xl font-extrabold mb-4 text-purple-700">{topic.title}</h1>
                <p className="mb-8 text-lg text-gray-600">Từ {currentIndex + 1} / {words.length}</p>

                {/* Flashcard Component */}
                <div 
                    onClick={flipCard} 
                    className={`w-full h-80 bg-white border-4 border-purple-500 rounded-2xl shadow-xl 
                            flex items-center justify-center cursor-pointer transition-transform duration-500 
                            transform perspective-1000 ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ position: 'relative' }}
                >
                    {/* Mặt trước: Từ vựng */}
                    <div 
                        className={`absolute backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transition: 'opacity 0.5s' }}
                    >
                        <p className="text-6xl font-black text-purple-800 p-4">{currentWord.word}</p>
                        <p className="text-gray-500 mt-2">Bấm để lật</p>
                    </div>
                    {/* Mặt sau: Định nghĩa và Ví dụ */}
                    <div 
                        className={`absolute backface-hidden ${isFlipped ? 'rotate-y-180 opacity-100' : 'opacity-0'}`}
                        style={{ transition: 'opacity 0.5s', padding: '1.5rem' }}
                    >
                        <p className="text-4xl font-bold text-gray-700 mb-2">{currentWord.definition}</p>
                        <p className="text-lg italic text-purple-600 px-4">"{currentWord.example}"</p>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center space-x-4 mt-8 pb-10">
                    <button 
                        onClick={prevCard} 
                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-400"
                    >
                        ← Lùi
                    </button>
                    <button 
                        onClick={nextCard} 
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700"
                    >
                        Tiếp →
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default FlashcardPage;