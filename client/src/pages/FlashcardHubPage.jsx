import React from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Header.jsx"; 
import Footer from "../components/Footer.jsx"; 
import FallingBlossoms from '../components/FallingBlossoms.jsx';

export default function FlashcardHubPage() {
    return (
        <div className="min-h-screen bg-[#fff7f0] relative flex flex-col">
            <FallingBlossoms />
            <Header />
            <div className="h-20 sm:h-24"></div> {/* Placeholder */}
            
            <main className="grow max-w-4xl mx-auto px-4 pt-8 relative z-10 w-full text-center"> 
                <h1 className="text-4xl font-extrabold mb-10 text-red-700">Chọn Lối Đi Của Bạn</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    
                    {/* NÚT 1: HỆ THỐNG KIẾN THỨC (Dẫn đến Trang Upload File) */}
                    <Link to="/create-flashcard" className="block">
                        <div className="p-8 bg-red-50 hover:bg-red-100 rounded-xl shadow-lg border-b-4 border-red-600 transition duration-300 transform hover:scale-[1.02]">
                            <h2 className="text-2xl font-bold text-red-700 mb-2">
                                📚 Hệ Thống Kiến Thức
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Tải file tài liệu (.docx) lên để AI tự động tạo bộ Flashcards Front/Back chi tiết.
                            </p>
                            <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md">
                                Tải File & Tạo Flashcard →
                            </button>
                        </div>
                    </Link>

                    {/* NÚT 2: HỌC TỪ VỰNG (Dẫn đến Trang Topic Generator/List) */}
                    <Link to="/vocabulary" className="block">
                        <div className="p-8 bg-green-50 hover:bg-green-100 rounded-xl shadow-lg border-b-4 border-green-600 transition duration-300 transform hover:scale-[1.02]">
                            <h2 className="text-2xl font-bold text-green-700 mb-2">
                                📖 Học Từ Vựng
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Duyệt các Topic Sets có sẵn hoặc tạo danh sách Từ vựng/Định nghĩa nhanh bằng AI.
                            </p>
                            <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md">
                                Duyệt Topic Sets →
                            </button>
                        </div>
                    </Link>

                </div>
            </main>
            <Footer />
        </div>
    );
}