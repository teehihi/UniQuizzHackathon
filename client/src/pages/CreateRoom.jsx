import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function CreateRoom() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [mode, setMode] = useState('auto');
  const [settings, setSettings] = useState({
    timePerQuestion: 30,
    showLeaderboardEvery: 5,
    allowLateJoin: true
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/decks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQuizzes(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      toast.error('Vui lòng chọn quiz');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const displayName = user?.fullName || user?.email || 'Host';
      
      const { initSocket } = await import('../utils/socket');
      
      const socket = initSocket(token);

      // Đợi socket connect
      if (!socket.connected) {
        await new Promise((resolve) => {
          socket.once('connect', resolve);
        });
      }

      // Leave tất cả rooms cũ trước khi tạo mới
      socket.emit('leave-all-rooms');
      
      socket.emit('create-room', {
        quizId: selectedQuiz,
        mode,
        settings
      }, (response) => {
        if (response.error) {
          toast.error(response.error);
          return;
        }

        toast.success(`Phòng đã được tạo: ${response.roomCode}`);
        // Navigate với state để truyền displayName và flag isCreator
        navigate(`/room/${response.roomCode}`, {
          state: { 
            displayName,
            isCreator: true // Flag để biết đây là người tạo phòng
          }
        });
      });
    } catch (error) {
      toast.error('Lỗi khi tạo phòng: ' + error.message);
      console.error('Create room error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Tạo phòng thi đấu
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Chọn Quiz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Chọn quiz --</option>
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title} ({quiz.questions.length} câu)
                </option>
              ))}
            </select>
          </div>

          {/* Chế độ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chế độ
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="auto"
                  checked={mode === 'auto'}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Tự động - Câu hỏi tự động chuyển sau khi hết thời gian
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Thủ công - Host điều khiển chuyển câu và hiển thị bảng xếp hạng
                </span>
              </label>
            </div>
          </div>

          {/* Thời gian mỗi câu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thời gian mỗi câu (giây)
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={settings.timePerQuestion}
              onChange={(e) => setSettings({ ...settings, timePerQuestion: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Hiện bảng xếp hạng (chỉ cho auto mode) */}
          {mode === 'auto' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hiện bảng xếp hạng sau mỗi (câu)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.showLeaderboardEvery}
                onChange={(e) => setSettings({ ...settings, showLeaderboardEvery: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Cho phép tham gia muộn */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowLateJoin}
                onChange={(e) => setSettings({ ...settings, allowLateJoin: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Cho phép người chơi tham gia sau khi trò chơi bắt đầu
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/myquizzes')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={!selectedQuiz}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo phòng
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            💡 Hướng dẫn
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Chọn quiz bạn muốn thi đấu</li>
            <li>• Chế độ tự động: Câu hỏi tự động chuyển, phù hợp cho thi nhanh</li>
            <li>• Chế độ thủ công: Host kiểm soát hoàn toàn, phù hợp cho lớp học</li>
            <li>• Sau khi tạo phòng, chia sẻ mã phòng để mời bạn bè</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
