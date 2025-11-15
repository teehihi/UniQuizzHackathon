import { Link } from "react-router-dom";
import FallingBlossoms from "../components/FallingBlossoms.jsx";
import Footer from "../components/Footer.jsx"; // <-- 1. IMPORT FOOTER
import Header from "../components/Header.jsx";
export default function Home() {
  return (
    // 'overflow-x-hidden' để tránh lỗi thanh cuộn ngang do hoa rơi
    <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden">
      <FallingBlossoms />
      
      <Header />
      {/* Hero Section */}
      {/* 2. THÊM 'relative z-10' */}
      <section className="px-8 mt-10 flex flex-col items-center text-center relative z-10">
        {/* Hoa mai góc trái */}
        <img
          src="/tet_left.png"
          className="absolute left-5 top-5 w-28 opacity-90"
        />

        {/* Hoa mai góc phải */}
        <img
          src="/tet_right.png"
          className="absolute right-5 top-5 w-28 opacity-90"
        />

        <h2 className="text-4xl font-extrabold text-red-700 drop-shadow">
          Học Tết - Nhớ Nhà - Nhưng Vẫn Hiệu Quả
        </h2>

        <p className="mt-4 text-lg text-gray-700 max-w-2xl">
          Tạo quiz tự động từ file .docx bằng AI. Học nhanh, nhớ lâu, tiết kiệm
          thời gian - để bạn có thêm những phút giây đoàn tụ cùng gia đình dịp
          Tết.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex gap-6">
          <Link
            to="/create"
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md"
          >
            Tạo Quiz mới
          </Link>

          <Link
            to="/myquizzes"
            className="px-8 py-3 rounded-xl bg-white text-red-600 border border-red-400 font-semibold hover:bg-red-50 transition"
          >
            Quiz của tôi
          </Link>
        </div>
      </section>

      {/* Features */}
      {/* 2. THÊM 'relative z-10' */}
      <section className="mt-20 px-8 pb-20 relative z-10">
        <h3 className="text-2xl font-bold text-center text-gray-800">
          Tại sao UniQuizz sẽ giúp bạn học tốt hơn?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
          {/* Sửa lại class để đẹp hơn một chút */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-50 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600">
              AI tạo câu hỏi tự động
            </h4>
            <p className="text-sm mt-2 text-gray-600">
              Tải file .docx → nhận quiz đầy đủ chỉ sau vài giây.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-50 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600">
              Giao diện học đẹp - dễ tập trung
            </h4>
            <p className="text-sm mt-2 text-gray-600">
              Tinh tế, tối giản, lấy cảm hứng từ không khí Tết ấm áp.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-50 hover:shadow-xl transition">
            <h4 className="text-lg font-semibold text-red-600">
              Theo dõi tiến độ học
            </h4>
            <p className="text-sm mt-2 text-gray-600">
              Lưu quiz, xem kết quả mỗi lần luyện tập.
            </p>
          </div>
        </div>
      </section>

      {/* === 3. SECTION "CÁCH HOẠT ĐỘNG" MỚI === */}
      <section className="mt-10 px-8 pb-20 relative z-10 bg-white">
        <div className="max-w-5xl mx-auto py-16">
          <h3 className="text-2xl font-bold text-center text-gray-800">
            Hoạt động như thế nào?
          </h3>
          <p className="text-center text-gray-600 mt-2">
            Chỉ 3 bước đơn giản để có ngay bộ câu hỏi ôn tập.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-700 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                Tải lên tài liệu
              </h4>
              <p className="text-sm mt-1 text-gray-600">
                Chỉ cần tải lên file .docx chứa nội dung bài học của bạn.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-700 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                AI xử lý
              </h4>
              <p className="text-sm mt-1 text-gray-600">
                UniQuizz AI sẽ đọc, hiểu và tạo ra các câu hỏi trắc nghiệm liên
                quan.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-700 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                Bắt đầu học
              </h4>
              <p className="text-sm mt-1 text-gray-600">
                Làm quiz, xem lại đáp án và theo dõi tiến độ của bạn ngay lập
                tức.
              </p>
            </div>
          </div>
        </div>
      </section>
<section className="mt-10 px-8 pb-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-800">
            Câu hỏi thường gặp
          </h3>

          <div className="mt-10 space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-800">
                UniQuizz có miễn phí không?
              </h4>
              <p className="text-sm mt-2 text-gray-600">
                Hoàn toàn miễn phí. UniQuizz được tạo ra với mục đích hỗ trợ
                cộng đồng sinh viên trong việc học tập.
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-800">
                File .docx của tôi có được bảo mật không?
              </h4>
              <p className="text-sm mt-2 text-gray-600">
                Chúng tôi cam kết không lưu trữ file của bạn sau khi đã xử lý
                xong. Nội dung file chỉ được dùng để tạo câu hỏi và bị xóa
                ngay sau đó.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === KHỐI CTA MỚI === */}
      <section
        className="relative z-10 py-20 mt-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/bgCTA.jpg')" }}
      >
        
        <div className="absolute inset-0 bg-black/60"></div>

        {/* 5. Nội dung CTA
          Phải thêm 'relative' và 'z-20' để nó NỔI LÊN TRÊN overlay
        */}
        <div className="max-w-2xl mx-auto text-center px-8 relative z-20">
          <h2 className="text-3xl font-extrabold text-white">
            Sẵn sàng học tập hiệu quả dịp Tết?
          </h2>
          {/* Đổi sang text-gray-200 để dễ đọc hơn trên nền ảnh */}
          <p className="mt-4 text-lg text-gray-200">
            Tạo tài khoản miễn phí và bắt đầu tạo quiz đầu tiên của bạn chỉ
            trong vài giây.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block px-10 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-orange-500 transition shadow-lg text-lg"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>
      {/* === 4. THÊM FOOTER VÀO === */}
      <Footer />
    </div>
  );
}