import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { initSocket, getSocket, disconnectSocket } from '../utils/socket';
import { soundManager } from '../utils/sounds';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConfirmModal from '../components/ConfirmModal';
import ShareRoomModal from '../components/ShareRoomModal';
import FallingBlossoms from '../components/FallingBlossoms';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVolumeHigh, 
  faVolumeMute, 
  faRightFromBracket, 
  faTrash,
  faForward,
  faStop,
  faTrophy,
  faCrown,
  faCopy,
  faPlay,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

export default function MultiplayerRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [room, setRoom] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  const [participants, setParticipants] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [answerResult, setAnswerResult] = useState(null); // { isCorrect, points, correctAnswer }
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false); // Hiển thị đáp án đúng
  const [nextQuestionProgress, setNextQuestionProgress] = useState(0); // Progress bar 0-100
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const answerTimeRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const displayName = location.state?.displayName;
    const isCreator = location.state?.isCreator; // Check nếu là người tạo phòng

    if (!displayName && !token) {
      toast.error('Vui lòng nhập tên để tham gia');
      navigate('/');
      return;
    }

    // Khởi tạo socket
    socketRef.current = initSocket(token);
    const socket = socketRef.current;

    let hasJoined = false; // Flag để tránh join nhiều lần

    // Nếu là creator, join room để nhận events nhưng không thêm vào participants
    if (isCreator) {
      const joinAsHost = () => {
        if (hasJoined) return;
        hasJoined = true;
        
        // Host join room để nhận socket events
        socket.emit('join-room', { roomCode, displayName: displayName || 'Host' }, (response) => {
          
          if (response?.error) {
            toast.error(response.error);
            navigate('/');
            return;
          }

          if (!response?.room || !response?.quiz) {
            toast.error('Dữ liệu phòng không hợp lệ');
            navigate('/');
            return;
          }

          setRoom(response.room);
          setQuiz(response.quiz);
          setIsHost(true);
          setGameStatus(response.room.status);
          setParticipants(response.room.participants);
          setCurrentQuestionIndex(response.room.currentQuestionIndex);
          
          // Host luôn xem leaderboard
          setShowLeaderboard(true);
          loadLeaderboard();
        });
      };

      if (socket.connected) {
        joinAsHost();
      } else {
        socket.once('connect', joinAsHost);
      }
      
      // Host không return ở đây, vẫn cần listen các events
    } else {
      // Đợi socket connect nếu chưa (cho players)
      const joinRoom = () => {
        if (hasJoined) return;
        
        hasJoined = true;
        
        socket.emit('join-room', { roomCode, displayName }, (response) => {
          
          if (response?.error) {
            toast.error(response.error);
            navigate('/');
            return;
          }

          if (!response?.room || !response?.quiz) {
            toast.error('Dữ liệu phòng không hợp lệ');
            navigate('/');
            return;
          }

          setRoom(response.room);
          setQuiz(response.quiz);
          setIsHost(response.isHost);
          setGameStatus(response.room.status);
          setParticipants(response.room.participants);
          setCurrentQuestionIndex(response.room.currentQuestionIndex);
          
          if (response.room.status === 'playing' && response.quiz.questions) {
            const question = response.quiz.questions[response.room.currentQuestionIndex];
            if (question) {
              setCurrentQuestion(question);
              startTimer(response.room.settings.timePerQuestion);
            }
          }
        });
      };

      if (socket.connected) {
        joinRoom();
      } else {
        socket.once('connect', joinRoom);
      }
    }

    // Socket listeners - Remove all old listeners first
    socket.off('participants-updated');
    socket.off('participant-joined');
    socket.off('participant-left');
    socket.off('game-started');
    socket.off('question-changed');
    socket.off('answer-submitted');
    socket.off('leaderboard-show');
    socket.off('game-ended');
    socket.off('room-deleted');

    // QUAN TRỌNG: Listen participants-updated để cập nhật realtime
    socket.on('participants-updated', (data) => {
      const oldCount = participants.length;
      const newCount = data.participants?.length || 0;
      
      setParticipants(data.participants || []);
      
      // Play sound khi có người join/leave
      if (newCount > oldCount) {
        soundManager.play('join');
      } else if (newCount < oldCount) {
        soundManager.play('leave');
      }
      
      // Nếu là host, reload leaderboard
      if (isCreator) {
        loadLeaderboard();
      }
    });

    socket.on('participant-joined', (data) => {
      toast.info(`${data.displayName} đã tham gia phòng`);
    });

    socket.on('participant-left', (data) => {
      toast.info(`${data.displayName} đã rời phòng`);
    });

    socket.on('game-started', (data) => {
      soundManager.play('start');
      soundManager.startMusic();
      
      // Luôn reload room data để đảm bảo có đầy đủ thông tin
      socket.emit('get-room-data', { roomCode }, (response) => {
        if (response?.success && response?.room && response?.quiz) {
          setRoom(response.room);
          setQuiz(response.quiz);
          setGameStatus('playing');
          setCurrentQuestionIndex(0);
          
          if (response.quiz.questions && response.quiz.questions.length > 0) {
            setCurrentQuestion(response.quiz.questions[0]);
            const timePerQ = response.room.settings?.timePerQuestion || 30;
            startTimer(timePerQ);
            toast.success('Trò chơi bắt đầu!');
          }
        } else {
          toast.error('Không thể tải dữ liệu game');
        }
      });
    });

    socket.on('question-changed', (data) => {
      if (data.isFinished) {
        setGameStatus('finished');
        loadLeaderboard();
        return;
      }
      
      // Reload room data để có settings mới nhất
      socket.emit('get-room-data', { roomCode }, (response) => {
        if (response?.success && response?.room && response?.quiz) {
          setRoom(response.room);
          setQuiz(response.quiz);
          setCurrentQuestionIndex(data.questionIndex);
          
          // Kiểm tra quiz và questions tồn tại
          if (response.quiz.questions && response.quiz.questions[data.questionIndex]) {
            setCurrentQuestion(response.quiz.questions[data.questionIndex]);
            setSelectedAnswer(null);
            setHasAnswered(false);
            setAnsweredCount(0);
            setAnswerResult(null); // Reset answer result
            setShowCorrectAnswer(false); // Reset show correct answer
            setNextQuestionProgress(0); // Reset progress
            
            const timePerQ = response.room.settings?.timePerQuestion || 30;
            startTimer(timePerQ);
          } else {
            console.error('Question not found at index:', data.questionIndex);
          }
        }
      });
    });

    socket.on('answer-submitted', (data) => {
      setAnsweredCount(data.answeredCount);
      
      // Nếu tất cả đã trả lời, hiển thị đáp án đúng
      if (data.answeredCount === data.totalParticipants && !showCorrectAnswer) {
        setTimeout(() => {
          setShowCorrectAnswer(true);
          startNextQuestionProgress();
        }, 500);
      }
      
      // Host tự động reload leaderboard khi có người trả lời
      if (isCreator) {
        loadLeaderboard();
      }
    });

    socket.on('leaderboard-show', (data) => {
      setLeaderboard(data.leaderboard);
      setShowLeaderboard(true);
    });

    socket.on('game-ended', (data) => {
      soundManager.play('finish');
      soundManager.stopMusic();
      
      setGameStatus('finished');
      setLeaderboard(data.leaderboard);
      setShowLeaderboard(true);
      toast.success('Trò chơi kết thúc!');
    });

    socket.on('room-deleted', () => {
      toast.error('Phòng đã bị xóa bởi host');
      
      // Stop background music
      soundManager.stopBackgroundMusic();
      
      // Disconnect socket hoàn toàn
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      navigate('/myquizzes');
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Stop background music when leaving
      soundManager.stopBackgroundMusic();
      
      // Emit leave-room khi component unmount
      if (socketRef.current && roomCode) {
        socketRef.current.emit('leave-room', { roomCode });
      }
      
      // Remove all socket listeners
      if (socketRef.current) {
        socketRef.current.off('participants-updated');
        socketRef.current.off('participant-joined');
        socketRef.current.off('participant-left');
        socketRef.current.off('game-started');
        socketRef.current.off('question-changed');
        socketRef.current.off('answer-submitted');
        socketRef.current.off('leaderboard-show');
        socketRef.current.off('game-ended');
        socketRef.current.off('room-deleted');
      }
    };
  }, [roomCode, navigate, location]);

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeLeft(seconds);
    answerTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        // Play tick sound khi còn 5 giây
        if (prev <= 5 && prev > 1) {
          soundManager.play('tick');
        }
        
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    // Host không làm gì cả
    if (isHost) return;

    // Mark as answered để không submit nữa
    if (!hasAnswered) {
      setHasAnswered(true);
    }

    // Hiển thị đáp án đúng khi hết thời gian
    setShowCorrectAnswer(true);
    
    // Start progress bar và auto next
    startNextQuestionProgress();
  };

  // Function để start progress bar và auto next question
  const startNextQuestionProgress = () => {
    const duration = 3000; // 3 giây
    const interval = 50; // Update mỗi 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setNextQuestionProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setNextQuestionProgress(0);
        
        // Auto next question
        const isAutoMode = !room || room.mode === 'auto';
        if (isAutoMode && !isHost) {
          try {
            const socket = getSocket();
            socket.emit('auto-next-question', { roomCode });
          } catch (error) {
            console.error('Error in auto-next-question:', error);
          }
        }
      }
    }, interval);
  };

  const handleAnswerSelect = (answer) => {
    if (hasAnswered || gameStatus !== 'playing') return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    const timeSpent = Date.now() - answerTimeRef.current;
    
    const socket = getSocket();
    socket.emit('submit-answer', {
      roomCode,
      questionIndex: currentQuestionIndex,
      answer,
      timeSpent
    }, (response) => {
      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Lưu result để hiển thị trong UI thay vì toast
      setAnswerResult({
        isCorrect: response.isCorrect,
        points: response.points,
        correctAnswer: response.correctAnswer
      });

      if (response.isCorrect) {
        soundManager.play('correct');
      } else {
        soundManager.play('wrong');
      }

      // Auto mode: hiện leaderboard sau mỗi X câu
      if (room.mode === 'auto' && 
          (currentQuestionIndex + 1) % room.settings.showLeaderboardEvery === 0) {
        setTimeout(() => {
          loadLeaderboard();
          setShowLeaderboard(true);
        }, 2000);
      }
    });
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('start-game', { roomCode }, (response) => {
      if (response.error) {
        toast.error(response.error);
      }
    });
  };

  const handleNextQuestion = () => {
    const socket = getSocket();
    socket.emit('next-question', { roomCode }, (response) => {
      if (response.error) {
        toast.error(response.error);
      }
    });
  };

  const handleShowLeaderboard = () => {
    const socket = getSocket();
    socket.emit('show-leaderboard', { roomCode }, (response) => {
      if (response.error) {
        toast.error(response.error);
      }
    });
  };

  const handleEndGame = () => {
    const socket = getSocket();
    socket.emit('end-game', { roomCode }, (response) => {
      if (response.error) {
        toast.error(response.error);
      }
    });
  };

  const handleLeaveRoom = () => {
    // Stop background music
    soundManager.stopBackgroundMusic();
    
    // Emit leave-room để server xóa participant
    if (socketRef.current && roomCode) {
      socketRef.current.emit('leave-room', { roomCode });
      
      // Remove listeners
      socketRef.current.off('participants-updated');
      socketRef.current.off('participant-joined');
      socketRef.current.off('participant-left');
      socketRef.current.off('game-started');
      socketRef.current.off('question-changed');
      socketRef.current.off('answer-submitted');
      socketRef.current.off('leaderboard-show');
      socketRef.current.off('game-ended');
      socketRef.current.off('room-deleted');
    }
    navigate('/myquizzes');
  };

  const handleDeleteRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      await fetch(`${API_URL}/api/rooms/${roomCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Stop background music
      soundManager.stopBackgroundMusic();

      // Disconnect socket hoàn toàn khi xóa phòng
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      toast.success('Đã xóa phòng');
      navigate('/myquizzes');
    } catch (error) {
      toast.error('Lỗi khi xóa phòng');
      console.error(error);
    }
  };

  const loadLeaderboard = () => {
    const socket = getSocket();
    socket.emit('get-leaderboard', { roomCode }, (response) => {
      if (response.success) {
        setLeaderboard(response.leaderboard);
      }
    });
  };

  if (!room || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Đang tải phòng...</p>
          <button
            onClick={() => {
              soundManager.stopBackgroundMusic();
              navigate('/myquizzes');
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Quiz không có câu hỏi nào!</p>
          <button
            onClick={() => {
              soundManager.stopBackgroundMusic();
              navigate('/myquizzes');
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Falling Blossoms Effect */}
      <FallingBlossoms />
      {/* Ẩn header khi đang chơi */}
      {gameStatus !== 'playing' && <Header />}
      
      {/* Quiz Info Bar - Hiện khi đang chơi thay cho header */}
      {gameStatus === 'playing' && (
        <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                  {quiz.title}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Mã: <span className="font-mono font-bold text-red-600">{roomCode}</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <FontAwesomeIcon icon={faUsers} className="mr-1" />
                  {participants.filter(p => p.isOnline).length}
                </span>
                <button
                  onClick={() => {
                    const newMuted = soundManager.toggleMute();
                    setIsMuted(newMuted);
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-300 ease-in-out"
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                >
                  <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
                </button>
              </div>
            </div>
            
            {/* Progress Bar - Chỉ hiện cho players, không hiện cho host */}
            {!isHost && currentQuestion && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Câu {currentQuestionIndex + 1}/{quiz.questions.length}
                </span>
                <div className="relative flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full transition-all duration-600"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                  {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`container mx-auto px-4 ${gameStatus === 'playing' ? 'py-4' : 'py-8'}`}>
        {/* Room Info - Chỉ hiện khi không chơi */}
        {gameStatus !== 'playing' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {quiz.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Mã phòng: <span className="font-mono font-bold text-red-600">{roomCode}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Người chơi: {participants.filter(p => p.isOnline).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Chế độ: {room.mode === 'auto' ? 'Tự động' : 'Thủ công'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newMuted = soundManager.toggleMute();
                    setIsMuted(newMuted);
                    toast.info(newMuted ? '🔇 Đã tắt âm thanh' : '🔊 Đã bật âm thanh');
                  }}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-all duration-300 ease-in-out"
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                >
                  <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
                </button>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-all duration-300 ease-in-out flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Rời phòng
                </button>
                {isHost && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-300 ease-in-out flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa phòng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Waiting Room */}
        {gameStatus === 'waiting' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 text-center border-2 border-red-100 dark:border-red-900">
              {/* Animated Lantern Icon */}
              <motion.div
                className="flex justify-center mb-6"
                animate={{
                  y: [0, -10, 0],
                  rotate: [-5, 5, -5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
                      filter: 'blur(20px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                  {/* Lantern */}
                  <svg width="80" height="80" viewBox="0 0 100 100" className="relative z-10">
                    <defs>
                      <linearGradient id="lanternGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                      <radialGradient id="lightGradient">
                        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
                      </radialGradient>
                    </defs>
                    
                    {/* Hanging string */}
                    <line x1="50" y1="5" x2="50" y2="20" stroke="#dc2626" strokeWidth="2" />
                    
                    {/* Top cap */}
                    <ellipse cx="50" cy="20" rx="15" ry="5" fill="#dc2626" />
                    
                    {/* Lantern body */}
                    <path
                      d="M 35 20 Q 30 50 35 80 L 65 80 Q 70 50 65 20 Z"
                      fill="url(#lanternGradient)"
                      opacity="0.9"
                    />
                    
                    {/* Light glow inside */}
                    <ellipse cx="50" cy="50" rx="20" ry="25" fill="url(#lightGradient)" />
                    
                    {/* Hoa mai Việt Nam - 5 cánh */}
                    <g transform="translate(50, 50)">
                      {/* Center circle */}
                      <circle cx="0" cy="0" r="3" fill="#fbbf24" />
                      
                      {/* 5 petals */}
                      {[0, 72, 144, 216, 288].map((angle, i) => {
                        const x = Math.cos((angle - 90) * Math.PI / 180) * 8;
                        const y = Math.sin((angle - 90) * Math.PI / 180) * 8;
                        return (
                          <ellipse
                            key={i}
                            cx={x}
                            cy={y}
                            rx="5"
                            ry="8"
                            fill="#fef3c7"
                            transform={`rotate(${angle} ${x} ${y})`}
                          />
                        );
                      })}
                    </g>
                    
                    {/* Bottom cap */}
                    <ellipse cx="50" cy="80" rx="15" ry="5" fill="#dc2626" />
                    
                    {/* Tassel */}
                    <line x1="50" y1="85" x2="50" y2="95" stroke="#fbbf24" strokeWidth="3" />
                    <circle cx="50" cy="95" r="3" fill="#fbbf24" />
                  </svg>
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Đang chờ bắt đầu...
              </h2>
              
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Chia sẻ mã phòng để mời bạn bè:
                </p>
                <div className="flex flex-col items-center gap-3">
                  <span className="font-mono font-bold text-4xl text-red-600 dark:text-red-400 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    Chia sẻ phòng
                  </button>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} />
                  Người chơi ({participants.filter(p => p.isOnline).length})
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {participants.filter(p => p.isOnline).map((p, i) => (
                    <div 
                      key={p.userId || p.displayName + i} 
                      className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 px-5 py-3 rounded-full border-2 border-red-200 dark:border-red-800 shadow-sm"
                    >
                      <span className="font-medium text-gray-800 dark:text-white">
                        {p.displayName}
                      </span>
                      {p.isGuest && (
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">(Khách)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={participants.filter(p => p.isOnline).length < 1}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-lg rounded-xl hover:from-red-700 hover:to-orange-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Bắt đầu trò chơi
                </button>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  Đang chờ host bắt đầu...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Playing - Host luôn xem leaderboard, Players xem quiz */}
        {gameStatus === 'playing' && !isHost && currentQuestion && !showLeaderboard && (
          <div className="max-w-4xl mx-auto">
            {/* Quiz Content - Giống QuizPlayer */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl border-2 border-red-100 dark:border-red-900">
              {/* Timer & Stats */}
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thời gian</p>
                  <div className={`text-3xl font-bold ${
                    timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-800 dark:text-white'
                  }`}>
                    {timeLeft}s
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Đã trả lời</p>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {answeredCount}/{participants.filter(p => p.isOnline).length}
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <div className="flex items-start gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {currentQuestionIndex + 1}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.answer;
                    const isSelected = option === selectedAnswer;
                    
                    let buttonClass = "relative w-full p-5 border-2 rounded-xl text-left font-medium transition-all duration-300 flex items-center gap-4";
                    
                    // Chỉ hiện đáp án khi showCorrectAnswer = true (hết giờ hoặc tất cả đã trả lời)
                    if (!showCorrectAnswer) {
                      // Chưa hiện đáp án - chỉ highlight câu đã chọn
                      if (isSelected) {
                        buttonClass += " bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 shadow-lg scale-105";
                      } else {
                        buttonClass += " bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:scale-102";
                      }
                    } else {
                      // Hiển thị đáp án đúng/sai khi hết giờ
                      if (isCorrect) {
                        buttonClass += " bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 text-green-800 dark:text-green-200 shadow-lg";
                      } else if (isSelected) {
                        buttonClass += " bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600 text-red-800 dark:text-red-200 shadow-lg";
                      } else {
                        buttonClass += " bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 opacity-70";
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={hasAnswered}
                        className={buttonClass}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          showCorrectAnswer
                            ? isCorrect
                              ? 'bg-green-600'
                              : isSelected
                              ? 'bg-red-600'
                              : 'bg-gray-400'
                            : isSelected
                            ? 'bg-blue-600'
                            : 'bg-gray-400'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {showCorrectAnswer && isCorrect && (
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {showCorrectAnswer && isSelected && !isCorrect && (
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Waiting Message - Hiển thị khi đã trả lời nhưng chưa hết giờ */}
                {hasAnswered && !showCorrectAnswer && (
                  <div className="mt-6 p-6 rounded-xl border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-1">
                          Đã ghi nhận câu trả lời!
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          Đang chờ người chơi khác hoặc hết thời gian để xem kết quả...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Result - Hiển thị sau khi trả lời */}
                {answerResult && showCorrectAnswer && (
                  <div className={`mt-6 p-6 rounded-xl border-2 ${
                    answerResult.isCorrect 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        answerResult.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <FontAwesomeIcon 
                          icon={answerResult.isCorrect ? faCheckCircle : faTimesCircle} 
                          className="text-white text-2xl" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${
                          answerResult.isCorrect 
                            ? 'text-green-800 dark:text-green-200' 
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {answerResult.isCorrect ? 'Chính xác!' : 'Sai rồi!'}
                        </h3>
                        {answerResult.isCorrect ? (
                          <p className="text-green-700 dark:text-green-300 text-lg">
                            Bạn được <span className="font-bold text-2xl">+{answerResult.points}</span> điểm
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-red-700 dark:text-red-300">
                              <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                              Đáp án đúng là:
                            </p>
                            <p className="text-red-800 dark:text-red-200 font-bold text-lg bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              {answerResult.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar - Chuyển câu tiếp theo */}
                    {nextQuestionProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Chuyển câu tiếp theo...
                          </span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {Math.ceil((100 - nextQuestionProgress) / 100 * 3)}s
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
                            style={{ width: `${nextQuestionProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Host Controls (Manual Mode) */}
            {isHost && room.mode === 'manual' && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition"
                >
                  ➡️ Câu tiếp theo
                </button>
                <button
                  onClick={handleShowLeaderboard}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg transition"
                >
                  <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                  Bảng xếp hạng
                </button>
                <button
                  onClick={handleEndGame}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition"
                >
                  🏁 Kết thúc
                </button>
              </div>
            )}
          </div>
        )}

        {/* Host Dashboard - Hiện khi đang chơi */}
        {gameStatus === 'playing' && isHost && (
          <div className="max-w-4xl mx-auto">
            {/* Host Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
                Bảng điều khiển Host
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center hover:scale-105 transition-all duration-500 ease-in-out shadow-sm hover:shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Câu hiện tại</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-500 ease-in-out">
                    {currentQuestionIndex + 1}/{quiz.questions.length}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center hover:scale-105 transition-all duration-500 ease-in-out shadow-sm hover:shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Người chơi</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-500 ease-in-out">
                    {participants.filter(p => p.isOnline).length}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center hover:scale-105 transition-all duration-500 ease-in-out shadow-sm hover:shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đã trả lời</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-500 ease-in-out">
                    {answeredCount}/{participants.filter(p => p.isOnline).length}
                  </p>
                </div>
                <div className={`bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center hover:scale-105 transition-all duration-500 ease-in-out shadow-sm hover:shadow-md ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian</p>
                  <p className={`text-3xl font-bold transition-all duration-500 ease-in-out ${timeLeft <= 5 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {timeLeft}s
                  </p>
                </div>
              </div>

              {room.mode === 'manual' && (
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 font-semibold shadow-md hover:shadow-xl transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faForward} />
                    Câu tiếp theo
                  </button>
                  <button
                    onClick={handleEndGame}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 font-semibold shadow-md hover:shadow-xl transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faStop} />
                    Kết thúc
                  </button>
                </div>
              )}
            </div>

            {/* Realtime Leaderboard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                Bảng xếp hạng Realtime
              </h2>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-500 shadow-lg scale-105'
                          : index === 1
                          ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-400'
                          : index === 2
                          ? 'bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-400'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-400'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <p className="font-bold text-lg text-gray-800 dark:text-white">
                            {player.displayName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {player.correctAnswers} / {player.totalAnswers} đúng
                            {!player.isOnline && <span className="ml-2 text-red-500">(Offline)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{player.score}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">điểm</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Chưa có dữ liệu xếp hạng
                </p>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard cho Players */}
        {showLeaderboard && !isHost && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
              Bảng xếp hạng
            </h2>
            
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500'
                      : index === 1
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : index === 2
                      ? 'bg-orange-100 dark:bg-orange-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {player.displayName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {player.correctAnswers} / {player.totalAnswers} đúng
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{player.score}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">điểm</p>
                  </div>
                </div>
              ))}
            </div>

            {gameStatus !== 'finished' && (
              <button
                onClick={() => setShowLeaderboard(false)}
                className="mt-6 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Tiếp tục
              </button>
            )}

            {gameStatus === 'finished' && (
              <button
                onClick={() => {
                  soundManager.stopBackgroundMusic();
                  navigate('/myquizzes');
                }}
                className="mt-6 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Về trang chủ
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Share Room Modal */}
      <ShareRoomModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomCode={roomCode}
        quizTitle={quiz?.title || 'Quiz'}
      />

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveRoom}
        title="Rời phòng"
        message="Bạn có chắc muốn rời phòng? Điểm số của bạn sẽ được lưu lại."
        confirmText="Rời phòng"
        cancelText="Ở lại"
        type="warning"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRoom}
        title="Xóa phòng"
        message="Bạn có chắc muốn xóa phòng này? Tất cả người chơi sẽ bị đá ra và dữ liệu sẽ bị xóa vĩnh viễn."
        confirmText="Xóa phòng"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}
