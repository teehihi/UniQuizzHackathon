import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Đảm bảo đường dẫn đúng
import Footer from "../components/Footer"; // Đảm bảo đường dẫn đúng

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    // Tạm thời, chúng ta sẽ log ra console
    console.log("Đang thử đăng ký với:", { email, password });
    setError("Chức năng backend chưa được kết nối.");

    // ---- ĐOẠN CODE KHI CÓ BACKEND ----
    // try {
    //   const res = await fetch("http://localhost:5000/api/auth/register", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   const data = await res.json();
    //   if (!res.ok) throw new Error(data.msg || "Đăng ký thất bại");
    //   navigate("/login");
    // } catch (err) {
    //   setError(err.message);
    // }
    // ---- KẾT THÚC ----
  };

  return (
    // Dùng màu nền #fff7f0 giống trang chủ
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
      <Header />
      
      {/* Phần nội dung chính */}
      <div className="grow flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full m-4">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
            Tạo tài khoản
          </h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Đăng ký
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-red-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}