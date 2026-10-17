import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSignInAlt, faUsers, faClock, faGamepad, faTrophy, faTimes } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function CreateRoom() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
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
    loadMyRooms();
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

  const loadMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/rooms/my/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleDeleteRoom = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/rooms/${roomToDelete.roomCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa phòng');
      loadMyRooms(); // Reload list
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (error) {
      toast.error('Lỗi khi xóa phòng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleJoinExistingRoom = (roomCode) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const displayName = user?.fullName || user?.email || 'Host';
    navigate(`/room/${roomCode}`, {
      state: { displayName, isCreator: true }
    });
  };

  const handleViewLeaderboard = async (roomCode) => {
    try {
      setLoadingLeaderboard(true);
      setShowLeaderboardModal(true);
      setSelectedLeaderboard(null);
      const res = await axios.get(`${API_URL}/api/rooms/${roomCode}/leaderboard`);
      setSelectedLeaderboard(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chưa có bảng xếp hạng cho phòng này hoặc đã hết hạn 15 ngày');
      setShowLeaderboardModal(false);
    } finally {
      setLoadingLeaderboard(false);
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

      console.log('[Create Room] Sending mode:', mode, 'settings:', settings);

      socket.emit('create-room', {
        quizId: selectedQuiz,
        mode,
        settings
      }, (response) => {
        if (response.error) {
          toast.error(response.error);
          return;
        }

        console.log('[Create Room] Room created:', response.roomCode, 'Mode:', response.room?.mode);
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-2xl mx-auto">
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
                    Tự động - Câu hỏi tự động chuyển khi hết thời gian HOẶC tất cả đã trả lời
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
        {/* Existing Rooms List */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faGamepad} className="text-red-600" />
            Phòng đang hoạt động của bạn <span className="text-gray-500 text-xl">({myRooms.length})</span>
          </h2>

          {myRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faGamepad} className="text-4xl mb-3 opacity-20" />
              <p>Chưa có phòng nào đang hoạt động</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myRooms.map(room => (
                <div key={room._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {room.quizId?.title || 'Quiz không xác định'}
                      </h3>
                      <div className="text-sm font-mono text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded inline-block select-all">
                        {room.roomCode}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${room.status === 'playing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      room.status === 'finished' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                      {room.status === 'waiting' ? 'Đang chờ' : room.status === 'playing' ? 'Đang chơi' : 'Kết thúc'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} />
                      {room.participants?.length || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} />
                      {new Date(room.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJoinExistingRoom(room.roomCode)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-sm"
                    >
                      <FontAwesomeIcon icon={faSignInAlt} /> Vào lại
                    </button>
                    <button
                      onClick={() => handleViewLeaderboard(room.roomCode)}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-sm"
                      title="Xem Bảng xếp hạng (lưu 15 ngày)"
                    >
                      <FontAwesomeIcon icon={faTrophy} /> BXH
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-sm"
                      title="Xóa phòng"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 animate-scaleIn border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <FontAwesomeIcon icon={faTrash} className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Xác nhận xóa phòng?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Bạn có chắc chắn muốn xóa phòng <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-sm">{roomToDelete?.roomCode}</span> không?
                <br />
                <span className="text-sm text-red-500 mt-2 block font-semibold">⚠️ Thao tác này không thể hoàn tác.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-bold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteRoom}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02]"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 Leaderboard Modal (Lưu trữ 15 ngày) */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all scale-100 animate-scaleIn border border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <FontAwesomeIcon icon={faTrophy} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bảng xếp hạng phòng: <span className="font-mono text-blue-600 dark:text-blue-400">{selectedLeaderboard?.roomCode}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLeaderboard?.quizTitle || 'Quiz'} • ⏱️ Lưu trữ 15 ngày
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {loadingLeaderboard ? (
                <div className="text-center py-10 text-gray-400">Đang tải bảng xếp hạng...</div>
              ) : selectedLeaderboard?.rankings?.length > 0 ? (
                selectedLeaderboard.rankings.map((player, idx) => {
                  const rank = player.rank || idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        rank === 1
                          ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700'
                          : rank === 2
                          ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                          : rank === 3
                          ? 'bg-orange-50/60 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-sm'
                              : rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {rank}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {player.displayName}
                          </p>
                          {player.totalAnswers > 0 && (
                            <p className="text-xs text-gray-400">
                              Đúng {player.correctAnswers}/{player.totalAnswers} câu
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                          {player.score?.toLocaleString() || 0}
                        </span>
                        <span className="text-xs text-gray-400 block">điểm</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-400">Chưa có ai thi đấu trong phòng này</div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
