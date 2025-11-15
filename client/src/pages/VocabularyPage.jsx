// client/src/pages/VocabularyPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx"; // <-- THÊM
import Footer from "../components/Footer.jsx"; // <-- THÊM
import { getAuthToken } from '../utils/auth.js';
// ⚠️ MOCK/INLINE LOGIC: Tích hợp Auth và API Services cơ bản
const mockToken = getAuthToken(); 
const API_BASE_URL = 'http://localhost:5001/api';

const fetchTopics = async (token) => {
    const response = await fetch(`${API_BASE_URL}/topics`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Lỗi khi tải danh sách chủ đề.");
    return response.json();
};

const generateNewTopic = async (title, token) => {
    const response = await fetch(`${API_BASE_URL}/topics/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Lỗi khi tạo chủ đề AI.");
    return data;
};
// --------------------------------------------------------------------------------

function VocabularyPage() {
    const token = mockToken; 
    const isAuthenticated = true; 
    const navigate = useNavigate();
    
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const loadTopics = async () => {
            try {
                const data = await fetchTopics(token);
                setTopics(data);
            } catch (error) {
                console.error("Lỗi khi tải chủ đề:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTopics();
    }, [isAuthenticated, token, navigate]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;
        setIsGenerating(true);
        try {
            const newTopic = await generateNewTopic(newTopicTitle, token);
            setTopics([newTopic, ...topics]); 
            setNewTopicTitle('');
            alert(`Tạo chủ đề "${newTopicTitle}" thành công!`);
        } catch (error) {
            console.error("Lỗi khi tạo chủ đề AI:", error);
            alert(`Lỗi: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fff7f0] flex flex-col">
                <Header />
                <div className="flex-grow text-center p-8 text-xl">Đang tải danh sách chủ đề...</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden flex flex-col">
            <Header />
            <main className="flex-grow max-w-4xl mx-auto p-4 relative z-10">
                <h1 className="text-3xl font-bold mb-6 text-green-700">📚 Chọn Chủ Đề Học Từ Vựng</h1>
                
                {/* Form Tạo Chủ Đề Mới */}
                <form onSubmit={handleGenerate} className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">🪄 Tạo Chủ Đề Mới bằng AI</h2>
                    <input
                        type="text"
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Nhập tên chủ đề bạn muốn học..."
                        className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                        required
                    />
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-lg text-white font-bold transition duration-200 ${
                            isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Đang tạo (vui lòng chờ 10-20s)...' : 'Tạo Chủ Đề Từ Vựng Ngay'}
                    </button>
                </form>

                {/* Danh sách Chủ Đề */}
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Danh Sách Chủ Đề Hiện Có ({topics.length})</h2>
                <div className="space-y-4 pb-10">
                    {topics.map((topic) => (
                        <div 
                            key={topic._id} 
                            className={`p-4 rounded-lg shadow-md cursor-pointer transition duration-200 
                                ${topic.isSystem ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-white hover:bg-gray-50'}`}
                            onClick={() => navigate(`/flashcard/${topic._id}`)}
                        >
                            <h3 className="text-xl font-bold text-gray-700">{topic.title}</h3>
                            <p className="text-sm text-gray-500">
                                {topic.isSystem ? 'Chủ đề Hệ thống' : `Tác giả: ${topic.author || 'Bạn'}`}
                                {' | '}
                                {topic.words ? `${topic.words.length} từ` : 'Đang tải...'}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default VocabularyPage;