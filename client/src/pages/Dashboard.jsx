import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";
import { motion } from "framer-motion";
import StudyStreakCalendar from "../components/StudyStreakCalendar";
import AchievementBadge from "../components/AchievementBadge";
import ProgressChart from "../components/ProgressChart";
import Leaderboard from "../components/Leaderboard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalFlashcards: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    recentActivity: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      try {
        const response = await api.get("/user/dashboard");
        setStats(response.data);
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError.message);
        
        // Fallback to mock data if API fails
        setStats({
          totalQuizzes: 2,
          completedQuizzes: 2,
          averageScore: 75,
          totalFlashcards: 0,
          studyStreak: 5,
          totalStudyTime: 1,
          recentActivity: [
            { type: 'quiz', title: 'Quiz mẫu 1', date: new Date(), questionCount: 10 },
            { type: 'quiz', title: 'Quiz mẫu 2', date: new Date(), questionCount: 15 },
          ],
          achievements: [
            { id: 1, name: 'Quiz Master', unlocked: true },
            { id: 2, name: 'Streak Warrior', unlocked: true },
            { id: 3, name: 'Perfect Score', unlocked: false }
          ]
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`text-4xl ${color.replace('border-', 'text-')}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">so với tuần trước</span>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f0] dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f0] dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Xin chào, {user?.fullName || user?.email}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Đây là tổng quan về hoạt động học tập của bạn
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📝"
            title="Tổng Quiz"
            value={stats.totalQuizzes}
            subtitle={`${stats.completedQuizzes} đã hoàn thành`}
            color="border-blue-500"
            trend={12}
          />
          <StatCard
            icon="⭐"
            title="Điểm Trung Bình"
            value={`${stats.averageScore}%`}
            subtitle="Tất cả quiz"
            color="border-yellow-500"
            trend={5}
          />
          <StatCard
            icon="🔥"
            title="Chuỗi Học Tập"
            value={`${stats.studyStreak} ngày`}
            subtitle="Tiếp tục phát huy!"
            color="border-red-500"
            trend={stats.studyStreak > 0 ? 100 : 0}
          />
          <StatCard
            icon="📚"
            title="Flashcards"
            value={stats.totalFlashcards}
            subtitle="Tổng số thẻ"
            color="border-green-500"
            trend={8}
          />
        </div>

        {/* Progress Chart & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ProgressChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Leaderboard />
          </motion.div>
        </div>

        {/* Study Streak Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <StudyStreakCalendar />
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Thành Tích & Huy Hiệu 🏅
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AchievementBadge
                icon="🏆"
                title="Quiz Master"
                description="Hoàn thành 10 quiz"
                unlocked={true}
                color="yellow"
              />
              <AchievementBadge
                icon="🔥"
                title="Streak Warrior"
                description="Học 7 ngày liên tục"
                unlocked={true}
                progress={5}
                total={7}
                color="red"
              />
              <AchievementBadge
                icon="⭐"
                title="Perfect Score"
                description="Đạt 100% trong quiz"
                unlocked={false}
                progress={8}
                total={10}
                color="blue"
              />
              <AchievementBadge
                icon="📚"
                title="Bookworm"
                description="Học 100 flashcard"
                unlocked={false}
                progress={45}
                total={100}
                color="green"
              />
              <AchievementBadge
                icon="⚡"
                title="Speed Demon"
                description="Hoàn thành quiz < 5 phút"
                unlocked={true}
                color="purple"
              />
              <AchievementBadge
                icon="🎯"
                title="Sharpshooter"
                description="10 câu đúng liên tiếp"
                unlocked={false}
                progress={7}
                total={10}
                color="red"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Hành Động Nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/create"
              className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📝</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Tạo Quiz Mới</span>
            </Link>
            <Link
              to="/flashcard-hub"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📚</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Học Flashcard</span>
            </Link>
            <Link
              to="/mentor"
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">🤖</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Chat với Mentor</span>
            </Link>
            <Link
              to="/myquizzes"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📊</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Xem Quiz Của Tôi</span>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
