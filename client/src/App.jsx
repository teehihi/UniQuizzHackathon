import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register"; // <-- Trang mới
import Login from "./pages/Login"; // <-- Trang mới
import MyQuizzes from "./pages/MyQuizzes"; // <-- Trang mới
import CreateQuiz from "./pages/CreateQuiz";
import QuizPlayer from "./pages/QuizPlayer";
import MentorPage from "./pages/MentorPage";
import VocabularyPage from './pages/VocabularyPage'; 
import FlashcardPage from './pages/FlashcardPage';
import TopicDetailsPage from './pages/TopicDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/myquizzes" element={<MyQuizzes />} />

        <Route path="/create" element={<CreateQuiz />} />

        <Route path="/quiz/:quizId" element={<QuizPlayer />} />
        <Route path="/mentor" element={<MentorPage />} />

        {/* ⚠️ Routes mới cho Học Từ Vựng */}
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/topic-details/:topicId" element={<TopicDetailsPage />} />
        <Route path="/flashcard/:topicId" element={<FlashcardPage />} />

        
      </Routes>
    </BrowserRouter>
  );
}
