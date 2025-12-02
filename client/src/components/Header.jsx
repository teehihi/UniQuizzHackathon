import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQuizDropdown, setShowQuizDropdown] = useState(false);
  const [showFlashcardDropdown, setShowFlashcardDropdown] = useState(false);

  const navigate = useNavigate();
  const quizDropdownRef = useRef(null);
  const flashcardDropdownRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 50) {
        setShowHeader(false);
      } else {
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
      <header
        className={`
          w-full py-4 px-6 flex justify-between items-center
          fixed top-0 left-0 right-0 z-50
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src="/logo.png" alt="UniQuizz Logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex gap-2 text-gray-700 dark:text-gray-300 font-medium">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            >
              Trang chủ
            </Link>

            {user && (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                Dashboard
              </Link>
            )}

            {/* Quiz Dropdown - Hover */}
            <div 
              className="relative" 
              ref={quizDropdownRef}
              onMouseEnter={() => setShowQuizDropdown(true)}
              onMouseLeave={() => setShowQuizDropdown(false)}
            >
              <button
                className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center gap-1.5"
              >
                Quiz
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-xs transition-transform duration-200 ${showQuizDropdown ? 'rotate-180' : ''}`} 
                />
              </button>
              {showQuizDropdown && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Quiz Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quiz</p>
                    <Link
                      to="/create"
                      className="block px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 group"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">Tạo Quiz</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tạo bộ câu hỏi mới</div>
                    </Link>
                    <Link
                      to="/myquizzes"
                      className="block px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150 group"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Quiz của tôi</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quản lý quiz đã tạo</div>
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  {/* Multiplayer Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Multiplayer</p>
                    <Link
                      to="/create-room"
                      className="block px-3 py-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150 group"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">Tạo phòng</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Thi đấu với bạn bè</div>
                    </Link>
                    <Link
                      to="/join-room"
                      className="block px-3 py-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150 group"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">Tham gia phòng</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vào phòng có sẵn</div>
                    </Link>
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flashcard Dropdown - Hover */}
            <div 
              className="relative" 
              ref={flashcardDropdownRef}
              onMouseEnter={() => setShowFlashcardDropdown(true)}
              onMouseLeave={() => setShowFlashcardDropdown(false)}
            >
              <button
                className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 flex items-center gap-1.5"
              >
                Flashcard
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-xs transition-transform duration-200 ${showFlashcardDropdown ? 'rotate-180' : ''}`} 
                />
              </button>
              {showFlashcardDropdown && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2">
                      <Link
                        to="/flashcard-hub"
                        className="block px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-150 group"
                      >
                        <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">Flashcard Hub</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Khám phá flashcard</div>
                      </Link>
                      <Link
                        to="/create-flashcard"
                        className="block px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-150 group"
                      >
                        <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">Tạo Flashcard</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tạo bộ thẻ học mới</div>
                      </Link>
                      <Link
                        to="/my-flashcards"
                        className="block px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-150 group"
                      >
                        <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">Flashcard của tôi</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quản lý flashcard</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/mentor" 
              className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
            >
              Mentor AI
            </Link>

            <Link 
              to="/search" 
              className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
              Tìm kiếm
            </Link>
          </nav>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                {user.avatar && user.avatar.trim() !== '' ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center font-bold ${user.avatar && user.avatar.trim() !== '' ? 'hidden' : 'flex'}`}
                >
                  {(user.fullName || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium max-w-[120px] truncate">
                  {user.fullName || user.email}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 shadow-sm transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
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
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="mt-8 flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  Trang chủ
                </Link>
                {user && (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Dashboard
                  </Link>
                )}
                
                <div className="mt-2 mb-1 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz</div>
                <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition">
                  Tạo Quiz
                </Link>
                <Link to="/myquizzes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Quiz của tôi
                </Link>

                <div className="mt-3 mb-1 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flashcard</div>
                <Link to="/flashcard-hub" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition">
                  Flashcard Hub
                </Link>
                <Link to="/create-flashcard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition">
                  Tạo Flashcard
                </Link>
                <Link to="/my-flashcards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition">
                  Flashcard của tôi
                </Link>

                <div className="mt-3 mb-1 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Multiplayer</div>
                <Link to="/create-room" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Tạo phòng
                </Link>
                <Link to="/join-room" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Tham gia phòng
                </Link>

                <Link to="/mentor" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition mt-3">
                  <FontAwesomeIcon icon={faRobot} className="text-purple-600" />
                  Mentor AI
                </Link>
                <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
                  <FontAwesomeIcon icon={faSearch} />
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
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      {user.avatar && user.avatar.trim() !== '' ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center font-bold ${user.avatar && user.avatar.trim() !== '' ? 'hidden' : 'flex'}`}>
                        {(user.fullName || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                        {user.fullName || user.email}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      Đăng nhập
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 text-center transition">
                      Đăng ký
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      <div className="h-20"></div>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}
