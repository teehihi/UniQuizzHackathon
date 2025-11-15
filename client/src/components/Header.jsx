import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener("storage", updateUser);
    window.addEventListener("userUpdate", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userUpdate", updateUser);
    };
  }, []);

  // ẨN KHI CUỘN XUỐNG – HIỆN KHI CUỘN LÊN
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY && currentY > 50) {
        // cuộn xuống -> ẩn
        setShowHeader(false);
      } else {
        // cuộn lên -> hiện
        setShowHeader(true);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userUpdate"));
    navigate("/");
  };

  return (
    <>
      {/* 1. HEADER CHÍNH (FIXED) */}
      <header
        className={`
          w-full py-5 px-8 flex justify-between items-center
          fixed top-0 left-0 right-0 z-50
          bg-white/95 backdrop-blur-sm shadow-md
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {/* Logo */}
        <Link to="/">
          <img src="/logo.png" alt="UniQuizz Logo" className="w-30 h-auto" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <nav className="flex gap-6 text-gray-700">
            <Link to="/" className="hover:text-red-600 transition">Trang chủ</Link>
            <Link to="/create" className="hover:text-red-600 transition">Tạo Quiz</Link>
            <Link to="/vocabulary" className="hover:text-green-600 font-semibold transition">
              Học Từ Vựng
            </Link>
            <Link to="/myquizzes" className="hover:text-red-600 transition">Quiz của tôi</Link>
          </nav>

          <div className="w-px h-6 bg-gray-300 hidden md:block"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                  {(user.fullName || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium hidden md:block">
                  {user.fullName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-gray-700 hover:text-red-600">Đăng nhập</Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* 2. DỰ PHÒNG (PLACEHOLDER): Đẩy nội dung xuống */}
      {/* Chiều cao của Header là py-5 (padding top và bottom), nên ta dùng h-20 để dự phòng */}
      <div className="h-20 sm:h-24"></div> 
      {/* Chiều cao này có thể cần điều chỉnh thêm dựa trên chính xác kích thước logo và padding của bạn */}
    </>
  );
}