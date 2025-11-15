// client/src/pages/FlashcardPage.jsx
// ⭐️ PHIÊN BẢN ĐÚNG (CÓ THỂ MỞ CẢ 2 LOẠI) ⭐️

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 
import api from '../api.js';

// --- API FUNCTIONS (SAO CHÉP TỪ TOPICDETAILSPAGE) ---

// API 1: Lấy Flashcard Set (từ file)
const fetchFlashcardSetById = async (setId) => {
    const response = await api.get(`/flashcards/${setId}`);
    return response.data;
};

// API 2: Lấy Topic (từ vựng)
const fetchTopicById = async (topicId) => {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
};

// ⭐️ HÀM HỢP NHẤT DỮ LIỆU (CHUẨN HÓA) ⭐️
const normalizeData = (data) => {
    if (data && data.words) { // Logic cho Topic
        return {
            id: data._id,
            title: data.title,
            type: 'topic',
            items: data.words.map(item => ({
                front: item.word,
                back: item.definition,
                example: item.example
            }))
        };
    }
    if (data && data.flashcards) { // Logic cho FlashcardSet
        return {
            id: data._id,
            title: data.title,
            type: 'flashcard-set',
            items: data.flashcards.map(item => ({
                front: item.front,
                back: item.back,
                example: item.hint || '' 
            }))
        };
    }
    return null; // Dữ liệu không hợp lệ
};

// ⭐️ HÀM GỌI DỮ LIỆU CHUNG ⭐️
const fetchCombinedData = async (id) => {
    try {
        // 1. Thử tải dưới dạng Topic trước
        const topicData = await fetchTopicById(id);
        return normalizeData(topicData);
    } catch (topicError) {
        const status = topicError.response?.status;
        if (status === 404 || status === 403) {
            // 2. Nếu 404, thử tải dưới dạng Flashcard Set
            try {
                const setData = await fetchFlashcardSetById(id);
                return normalizeData(setData);
            } catch (setError) {
                throw setError; // Ném lỗi của API thứ 2
            }
        }
        throw topicError; // Ném lỗi của API thứ 1 (nếu là 401, 500...)
    }
};

// --------------------------------------------------------------------------------

function FlashcardPage() {
    // ⭐️ SỬA 1: Dùng { id } để khớp với Route /flashcard/:id
    const { topicId: id } = useParams();
    const navigate = useNavigate();

    const [itemData, setItemData] = useState(null); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // ⭐️ SỬA 3: Gọi hàm fetchCombinedData
                const data = await fetchCombinedData(id); 
                
                if (!data || !data.items || data.items.length === 0) {
                     setItemData(null); 
                } else {
                     setItemData(data);
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu flashcard:", error);
                navigate('/flashcard-hub'); // Quay về Hub nếu lỗi
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, navigate]); // ⭐️ SỬA 5: Dùng 'id'

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header />
                <div className="grow text-center p-8 text-xl">Đang tải dữ liệu...</div>
                <Footer />
            </div>
        );
    }
    
    if (!itemData || !itemData.items || itemData.items.length === 0) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header />
                <div className="grow text-center p-8 text-xl text-red-600">
                    Không tìm thấy nội dung hoặc bộ này chưa có thẻ nào.
                </div>
                <Footer />
            </div>
        );
    }

    const { title, type, items } = itemData;
    const currentItem = items[currentIndex];

    const flipCard = () => setIsFlipped(!isFlipped);
    
    const nextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsFlipped(false);
    };

    const prevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setIsFlipped(false);
    };

    return (
        <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden flex flex-col">
            <Header />
            <main className="grow max-w-3xl mx-auto p-4 text-center relative z-10 w-full">
                
                <button 
                    onClick={() => navigate(type === 'topic' ? '/vocabulary' : '/flashcard-hub')} 
                    className="mb-6 text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 
                               px-4 py-2 rounded-full font-semibold transition duration-200 shadow-sm"
                >
                    ← Trở về {type === 'topic' ? 'Chủ đề' : 'Hub Flashcard'}
                </button>
                
                <h1 className="text-4xl font-extrabold mb-4 text-red-700">{title}</h1>
                <p className="mb-8 text-lg text-gray-600">Thẻ {currentIndex + 1} / {items.length}</p>

                {/* Flashcard Component */}
                <div 
                    onClick={flipCard} 
                    className={`w-full h-80 bg-white border-4 border-red-500 rounded-2xl shadow-xl 
                                flex items-center justify-center cursor-pointer transition-transform duration-500 
                                transform perspective-1000 ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ position: 'relative' }}
                >
                    {/* Mặt trước */}
                    <div 
                        className={`absolute backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transition: 'opacity 0.5s', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <p className="text-4xl md:text-5xl font-black text-red-800 p-4">{currentItem.front}</p>
                        <p className="text-gray-500 mt-2">Bấm để lật</p>
                    </div>
                    
                    {/* Mặt sau */}
                    <div 
                        className={`absolute backface-hidden ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transition: 'opacity 0.5s', padding: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div className={`${isFlipped ? 'rotate-y-180' : ''} w-full`}> 
                            <p className="text-3xl md:text-4xl font-bold text-gray-700 mb-2">{currentItem.back}</p>
                            {currentItem.example && (
                                <p className="text-lg italic text-red-600 px-4 mt-4">"{currentItem.example}"</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons (Giữ nguyên) */}
                <div className="flex justify-center space-x-4 mt-8 pb-10">
                    <button 
                        onClick={prevCard} 
                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-400"
                    >
                        ← Lùi
                    </button>
                    <button 
                        onClick={nextCard} 
                        className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700"
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