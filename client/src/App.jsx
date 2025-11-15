import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";   // <-- Trang mới
import Login from "./pages/Login";         // <-- Trang mới
import MyQuizzes from "./pages/MyQuizzes"; // <-- Trang mới
import CreateQuiz from "./pages/CreateQuiz";
import QuizPlayer from "./pages/QuizPlayer";
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
      </Routes>
    </BrowserRouter>
  );
}
