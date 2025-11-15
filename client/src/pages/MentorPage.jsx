import Live2DWidget from "../components/Live2DWidget";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

function ChatPanel() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-xl bg-white shadow-lg h-full">
      <h2 className="font-semibold text-lg">Chat & Materials</h2>

      <div className="flex-1 border rounded p-2 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <p key={idx} className="text-gray-700 text-sm">
              {msg}
            </p>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input type="file" className="border rounded px-2 py-1" />
        <select className="border rounded px-2 py-1">
          <option>Chọn bài giảng có sẵn</option>
          <option>Bài 1</option>
          <option>Bài 2</option>
        </select>

        <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition">
          Upload / Select
        </button>
      </div>
    </div>
  );
}

export default function MentorPage() {
  return (
    <div className="min-h-screen bg-[#fff7f0] relative overflow-x-hidden">
      <Header />

      {/* MAIN WRAPPER */}
      <section className="px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">

        {/* LEFT: Live2D Area – chiếm 2 cột */}
        <div className="md:col-span-2 flex items-center justify-center">
          <div
            className="w-full h-[360px] lg:h-[430px] rounded-xl overflow-hidden shadow-xl 
                       relative flex items-end justify-center"
            style={{
              backgroundImage: "url('/bgWaifu.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Model luôn đứng chính giữa đáy */}
            <div className="flex justify-center items-center mb-[-5px] scale-[90%] md:scale-100">
              <Live2DWidget />
            </div>
          </div>
        </div>

        {/* RIGHT: Chat panel – chiếm 1 cột */}
        <div className="md:col-span-1 w-full">
          <ChatPanel />
        </div>
      </section>

      <Footer />
    </div>
  );
}
