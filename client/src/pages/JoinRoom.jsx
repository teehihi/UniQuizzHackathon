import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function JoinRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill room code from URL query parameter
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Nếu chưa đăng nhập, bắt buộc nhập tên
    if (!token && !displayName.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }

    // Nếu đã đăng nhập, lấy tên từ user
    const finalDisplayName = token 
      ? JSON.parse(user).fullName || JSON.parse(user).email
      : displayName.trim();

    setLoading(true);

    try {
      // Navigate với state
      navigate(`/room/${roomCode.toUpperCase()}`, {
        state: { displayName: finalDisplayName }
      });
    } catch (error) {
      toast.error('Lỗi khi tham gia phòng');
      console.error(error);
      setLoading(false);
    }
  };

  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
            Tham gia phòng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Nhập mã phòng để bắt đầu thi đấu
          </p>

          <div className="space-y-4">
            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã phòng
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="VD: ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-wider uppercase"
              />
            </div>

            {/* Display Name (chỉ hiện nếu chưa đăng nhập) */}
            {!token && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên của bạn
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên hiển thị"
                  maxLength={30}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  * Tên này chỉ dùng cho phòng này và không được lưu lại
                </p>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tham gia...' : 'Tham gia'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  hoặc
                </span>
              </div>
            </div>

            {/* Create Room */}
            {token ? (
              <button
                onClick={() => navigate('/create-room')}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Tạo phòng mới
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Đăng nhập để tạo phòng
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            💡 Lưu ý
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Mã phòng gồm 6 ký tự (chữ và số)</li>
            <li>• Nếu chưa đăng nhập, bạn cần nhập tên để tham gia</li>
            <li>• Tên hiển thị chỉ dùng cho phòng này</li>
            <li>• Đăng nhập để tạo phòng và lưu lịch sử thi đấu</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
