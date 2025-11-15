import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 
import api from '../api.js'; 
import { motion, AnimatePresence } from 'framer-motion';
// ⭐️ IMPORT HÀM LẤY TOKEN TỪ utils/auth.js ⭐️
import { getAuthToken } from '../utils/auth.js'; 

// --- API FUNCTIONS ---

// API: Tạo Flashcard
const generateFlashcardsFromFile = async (formData) => {
    // ⭐️ Gắn Token vào headers cho API POST ⭐️
    const token = getAuthToken();
    if (!token) throw new Error("Unauthorized: Missing token.");

    const response = await api.post('/flashcards/generate', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            // Axios tự động đặt Content-Type cho FormData
        }
    });
    return response.data; 
};

// API: Lấy danh sách Flashcard Sets
const fetchFlashcardSets = async () => {
    // ⭐️ Gắn Token vào headers cho API GET ⭐️
    const token = getAuthToken();
    if (!token) {
        console.warn("Không tìm thấy token. Không thể tải Flashcard Sets.");
        return []; 
    }

    const response = await api.get('/flashcards', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        }
    });
    return response.data;
};
// --------------------------------------------------------------------------------

// NotificationModal (Component Modal giữ nguyên)
const NotificationModal = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const title = type === 'success' ? 'Thành công!' : 'Lỗi!';
    const backdropVariants = { visible: { opacity: 1, backdropFilter: 'blur(2px)' }, hidden: { opacity: 0, backdropFilter: 'blur(0px)' } };
    const modalVariants = { hidden: { y: "-100vh", opacity: 0 }, visible: { y: "0", opacity: 1, transition: { delay: 0.1, duration: 0.3 } }, };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose} 
                >
                    <motion.div
                        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className={`py-2 px-4 rounded-t-lg ${bgColor} text-white font-bold text-center -mx-6 -mt-6 mb-4`}>
                            {title}
                        </div>
                        <p className="text-gray-700 mb-6 text-center">{message}</p>
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                        >
                            OK
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
// --------------------------------------------------------------------------------


function CreateFlashcardPage() {
    const navigate = useNavigate();
    
    // State cho Form
    const [flashcardTitle, setFlashcardTitle] = useState('');
    const [flashcardFile, setFlashcardFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // State cho Modal
    const [modalMessage, setModalMessage] = useState(null);
    const [modalType, setModalType] = useState('success'); 

    // State cho danh sách Flashcard Sets
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [isLoadingSets, setIsLoadingSets] = useState(true);
    
    // HÀM TẢI DỮ LIỆU ĐƯỢC CHIA SẺ (BUỘC TẢI LẠI TỪ SERVER) 
    const loadSets = async () => {
        setIsLoadingSets(true); 
        try {
            const data = await fetchFlashcardSets();
            setFlashcardSets(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách flashcards:", error);
            // Có thể thêm logic kiểm tra lỗi 401 để chuyển hướng đến login
        } finally {
            setIsLoadingSets(false);
        }
    };
    
    // EFFECT: Tải danh sách khi trang được mở
    useEffect(() => {
        loadSets();
    }, []); 

    
    const handleFlashcardUpload = async (e) => {
        e.preventDefault();
        
        // Kiểm tra Token trước khi gọi API POST
        if (!getAuthToken()) {
            setModalMessage('Vui lòng đăng nhập lại để tạo Flashcards.');
            setModalType('error');
            navigate('/login');
            return;
        }

        if (!flashcardTitle.trim()) {
            setModalMessage('Vui lòng nhập tiêu đề cho bộ Flashcards.');
            setModalType('error');
            return;
        }
        if (!flashcardFile) {
            setModalMessage('Vui lòng chọn file .docx.');
            setModalType('error');
            return;
        }
        
        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('title', flashcardTitle);
            formData.append('file', flashcardFile);
            
            // 1. GỌI API TẠO (đã được sửa để gắn token)
            const setDoc = await generateFlashcardsFromFile(formData); 

            setFlashcardTitle('');
            setFlashcardFile(null);
            document.getElementById('file-input').value = null; // Reset input file

            // 2. BUỘC TẢI LẠI TOÀN BỘ DANH SÁCH TỪ DB
            await loadSets(); 

            setModalMessage(`Tạo bộ Flashcards "${setDoc.title}" thành công!`);
            setModalType('success');
            
        } catch (error) {
            console.error("Lỗi khi tạo Flashcards từ file:", error);
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            setModalMessage(`Lỗi: Không thể tạo Flashcards. ${errorMessage}`);
            setModalType('error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCloseModal = () => {
        setModalMessage(null);
    };

    return (
        <div className="min-h-screen bg-[#fff7f0] relative flex flex-col">
            <Header />
            <div className="h-20 sm:h-24"></div> 
            
            <main className="grow max-w-4xl mx-auto px-4 pt-8 relative z-10 w-full"> 
                <button 
                    onClick={() => navigate('/flashcard-hub')} 
                    className="mb-6 text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 
                               px-4 py-2 rounded-full font-semibold transition duration-200 shadow-sm"
                >
                    ← Trở về Hub Flashcard
                </button>
                
                {/* FORM TẠO (Giữ nguyên) */}
                <h1 className="text-3xl font-bold mb-6 text-red-700">Tạo Flashcards từ Tài liệu</h1>
                <section className="p-6 bg-red-50 rounded-xl shadow-md border-t-4 border-red-600 mb-12">
                     <p className="text-gray-700 mb-4">
                        Tải file .docx tài liệu học tập của bạn. AI sẽ đọc và tự động tạo các cặp **Front/Back** Flashcards.
                    </p>
                    <form onSubmit={handleFlashcardUpload}>
                        <label htmlFor="flashcard-title" className="font-semibold text-gray-700 mb-1 block">Tiêu đề bộ Flashcard</label>
                        <input
                            id="flashcard-title"
                            type="text"
                            value={flashcardTitle}
                            onChange={(e) => setFlashcardTitle(e.target.value)}
                            placeholder="Ví dụ: Chương 3: Khí Hậu"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                            required
                            disabled={isGenerating}
                        />
                        
                        <label htmlFor="file-input" className="font-semibold text-gray-700 mb-1 block">Chọn file tài liệu (.docx)</label>
                        <input
                            id="file-input"
                            type="file"
                            onChange={(e) => setFlashcardFile(e.target.files[0])}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-6 bg-white file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            required
                            disabled={isGenerating}
                        />
                        
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg text-white font-bold transition duration-200 ${
                                isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                            }`}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Đang gọi AI tạo Flashcards...' : 'Tạo Flashcards từ File Ngay'}
                        </button>
                    </form>
                </section>
                
                {/* ⭐️ SECTION: DANH SÁCH FLASHCARD ĐÃ TẠO ⭐️ */}
                <section className="mb-20">
                    {/* ... */}
                    {isLoadingSets ? (
                        <p className="text-gray-600">Đang tải danh sách...</p>
                    ) : flashcardSets.length === 0 ? (
                        <p className="text-gray-600">Bạn chưa tạo bộ flashcard nào từ file.</p>
                    ) : (
                        <div className="space-y-2">
                            {flashcardSets.map((set, index) => (
                                <div 
                                    key={set._id} 
                                    className={`p-4 rounded-lg shadow-sm cursor-pointer transition duration-200 
                                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        border-l-4 border-red-400 hover:shadow-md
                                    `}
                                    // ⭐️ SỬA ĐỔI: Chuyển đến TopicDetailsPage với ID của SET ⭐️
                                    onClick={() => navigate(`/topic-details/${set._id}`)}
                                >
                                    <h3 className="text-xl font-bold text-gray-700">{set.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {set.courseCode ? `${set.courseCode} | ` : ''}
                                        {set.flashcards?.length || 0} thẻ
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
            <Footer />
            
            <NotificationModal 
                message={modalMessage} 
                type={modalType} 
                onClose={handleCloseModal} 
            />
        </div>
    );
}

export default CreateFlashcardPage;