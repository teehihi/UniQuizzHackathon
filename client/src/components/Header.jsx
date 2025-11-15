import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hàm để cập nhật user từ localStorage
    const updateUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Lỗi khi parse user data:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Kiểm tra user khi component mount
    updateUser();

    // Lắng nghe sự kiện storage để cập nhật khi login/logout
    // (hoạt động cả trong cùng tab và tab khác)
    window.addEventListener("storage", updateUser);
    // Lắng nghe custom event từ cùng tab
    window.addEventListener("userUpdate", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userUpdate", updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Dispatch event để cập nhật (nếu có Header khác)
    window.dispatchEvent(new Event("userUpdate"));
    navigate("/");
  };

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

        {/* Hiển thị user info hoặc nút Đăng nhập/Đăng ký */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold text-sm">
                {(user.fullName || user.email).charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium hidden md:block">
                {user.fullName || user.email}
              </span>
            </div>
            {/* Nút đăng xuất */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </header>
  );
}