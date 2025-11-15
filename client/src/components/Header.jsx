import { Link } from "react-router-dom";

export default function Header() {
  return (
    // 'relative z-10' rất quan trọng để nó nằm trên hoa rơi
    <header className="w-full py-5 px-8 flex justify-between items-center relative z-10">
      {/* Logo */}
      <Link to="/">
        <img
          src="/logo.png"
          alt="UniQuizz Logo"
          className="w-30 h-auto object-contain"
        />
      </Link>

      {/* Khối Nav và Nút bấm */}
      <div className="flex items-center gap-8">
        {/* Nav */}
        <nav className="flex gap-6 text-gray-700">
          <Link to="/" className="hover:text-red-600 transition">
            Trang chủ
          </Link>
          <Link to="/create" className="hover:text-red-600 transition">
            Tạo Quiz
          </Link>
          <Link to="/myquizzes" className="hover:text-red-600 transition">
            Quiz của tôi
          </Link>
        </nav>

        {/* Vạch ngăn cách */}
        <div className="w-px h-6 bg-gray-300 hidden md:block"></div>

        {/* Nút Đăng nhập / Đăng ký */}
        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            className="text-gray-700 font-medium hover:text-red-600 transition"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}