import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {/* Logo */}
        <Link to="/">
          <img src="/logo.png" alt="UniQuizz Logo" className="w-30 h-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-gray-700 dark:text-gray-300">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-400 transition">Trang chủ</Link>
            {user && (
              <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</Link>
            )}
            <Link to="/create" className="hover:text-red-600 dark:hover:text-red-400 transition">Tạo Quiz</Link>
            <Link to="/flashcard-hub" className="hover:text-green-600 dark:hover:text-green-400 font-semibold transition">
              Flash Card
            </Link>
            <Link to="/myquizzes" className="hover:text-red-600 dark:hover:text-red-400 transition">Quiz của tôi</Link>
            <Link 
              to="/search" 
              className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </Link>
          </nav>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center">
                    {(user.fullName || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-700 dark:text-gray-300 font-medium hidden md:block">
                  {user.fullName || user.email}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400">Đăng nhập</Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition py-2"
                >
                  Trang chủ
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition py-2"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition py-2"
                >
                  Tạo Quiz
                </Link>
                <Link
                  to="/flashcard-hub"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-500 transition py-2"
                >
                  Flash Card
                </Link>
                <Link
                  to="/myquizzes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition py-2"
                >
                  Quiz của tôi
                </Link>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-500 transition py-2 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm kiếm
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 w-full"
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center">
                          {(user.fullName || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {user.fullName || user.email}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-2"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-center"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. DỰ PHÒNG (PLACEHOLDER): Đẩy nội dung xuống */}
      {/* Chiều cao của Header là py-5 (padding top và bottom), nên ta dùng h-20 để dự phòng */}
      <div className="h-20 sm:h-24"></div> 
      {/* Chiều cao này có thể cần điều chỉnh thêm dựa trên chính xác kích thước logo và padding của bạn */}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}