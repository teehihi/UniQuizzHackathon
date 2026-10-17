import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCopy, 
  faCheck, 
  faUser,
  faPlay,
  faCrown,
  faBolt,
  faGamepad,
  faPalette,
  faStar,
  faFire,
  faBrain,
  faBullseye,
  faRocket,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import CharacterAvatar from './CharacterAvatar';

const CHIBI_PALETTES = [
  {
    bg: 'from-amber-500/25 via-orange-500/15 to-yellow-500/20 border-amber-400/40',
    avatarBg: 'bg-gradient-to-b from-amber-400/40 via-yellow-500/30 to-amber-700/35',
    avatarBorder: 'border-amber-300/90 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    tag: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    title: 'text-amber-200'
  },
  {
    bg: 'from-fuchsia-500/25 via-pink-500/15 to-rose-500/20 border-pink-400/40',
    avatarBg: 'bg-gradient-to-b from-pink-400/40 via-fuchsia-500/30 to-rose-700/35',
    avatarBorder: 'border-pink-300/90 shadow-[0_0_12px_rgba(236,72,153,0.35)]',
    tag: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
    title: 'text-pink-200'
  },
  {
    bg: 'from-cyan-500/25 via-sky-500/15 to-blue-500/20 border-cyan-400/40',
    avatarBg: 'bg-gradient-to-b from-cyan-400/40 via-sky-500/30 to-blue-700/35',
    avatarBorder: 'border-cyan-300/90 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    tag: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    title: 'text-cyan-200'
  },
  {
    bg: 'from-emerald-500/25 via-teal-500/15 to-green-500/20 border-emerald-400/40',
    avatarBg: 'bg-gradient-to-b from-emerald-400/40 via-teal-500/30 to-green-700/35',
    avatarBorder: 'border-emerald-300/90 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    tag: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    title: 'text-emerald-200'
  },
  {
    bg: 'from-violet-500/25 via-purple-500/15 to-indigo-500/20 border-violet-400/40',
    avatarBg: 'bg-gradient-to-b from-purple-400/40 via-violet-500/30 to-indigo-700/35',
    avatarBorder: 'border-purple-300/90 shadow-[0_0_12px_rgba(139,92,246,0.35)]',
    tag: 'bg-violet-400/20 text-violet-300 border-violet-400/40',
    title: 'text-violet-200'
  }
];

const CHIBI_TITLES = [
  { icon: faFire, text: 'Chiến thần trắc nghiệm', color: 'text-orange-400' },
  { icon: faBrain, text: 'Bậc thầy kiến thức', color: 'text-pink-400' },
  { icon: faBolt, text: 'Thần tốc bấm phím', color: 'text-yellow-400' },
  { icon: faBullseye, text: 'Trùm trả lời đúng', color: 'text-rose-400' },
  { icon: faStar, text: 'Tân thủ may mắn', color: 'text-amber-300' },
  { icon: faCrown, text: 'Đệ nhất học giả', color: 'text-yellow-400' },
  { icon: faGraduationCap, text: 'Thợ săn điểm số', color: 'text-cyan-400' },
  { icon: faRocket, text: 'Kẻ thách thức bảng vàng', color: 'text-purple-400' }
];

export default function ShareRoomModal({ isOpen, onClose, roomCode, quizTitle, participants = [], currentSocketId }) {
  const [copied, setCopied] = useState(false);

  // Generate URLs
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const joinUrl = `${baseUrl}/join-room?code=${roomCode}`;
  const shortUrl = `${baseUrl}/r/${roomCode}`; 

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Container - Wide Layout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] text-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px] border border-gray-800"
            >
              
              {/* Left Column: Join Info (QR & Code) */}
              <div className="w-full md:w-5/12 bg-gradient-to-br from-gray-900 to-black p-8 flex flex-col items-center justify-center relative border-r border-gray-800">
                <div className="text-center space-y-2 mb-8">
                   <h3 className="text-gray-400 text-sm uppercase tracking-wider">Tham gia tại</h3>
                   <div 
                      onClick={() => handleCopy(shortUrl)}
                      className="bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 group border border-white/10"
                   >
                      <span className="text-red-400 font-bold text-lg">uniquizzdom.vercel.app</span>
                      <FontAwesomeIcon icon={faCopy} className="text-gray-500 group-hover:text-white transition-colors text-xs" />
                   </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-white p-4 rounded-2xl shadow-xl transform transition hover:scale-105 duration-300">
                  <QRCodeSVG
                    value={shortUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: '/favicon.png',
                      height: 48,
                      width: 48,
                      excavate: true,
                    }}
                  />
                </div>

                <div className="mt-8 text-center w-full">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Hoặc nhập mã</p>
                  <div 
                    onClick={() => handleCopy(roomCode)}
                    className="text-6xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer hover:scale-105 transition-transform inline-block"
                  >
                    {roomCode}
                  </div>
                </div>
              </div>

              {/* Right Column: Participants List */}
              <div className="flex-1 bg-[#252525] flex flex-col relative">
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-gray-700 flex justify-between items-center bg-[#252525] z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-700/80 p-2.5 rounded-xl border border-white/5">
                            <FontAwesomeIcon icon={faUser} className="text-gray-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg md:text-xl text-white flex items-center gap-2">
                                <span>{participants.length} người tham gia</span>
                            </h3>
                            <p className="text-gray-400 text-xs">Đang chờ các chiến binh khác...</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* List Container - Defaulting to Style 3 Chibi Anime */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
                    {participants.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 py-12">
                            <div className="w-14 h-14 border-4 border-gray-600 border-t-amber-400 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-medium">Đang đợi các chiến binh tham gia...</p>
                        </div>
                    ) : (
                        /* ================= THẺ PHONG CÁCH ANIME / CHIBI (Big Capsule Card) ================= */
                        <div className="grid grid-cols-1 gap-3.5 pt-2">
                            {participants.map((p, index) => {
                                const isSelf = currentSocketId && p.socketId === currentSocketId;
                                const palette = CHIBI_PALETTES[index % CHIBI_PALETTES.length];
                                const titleHash = ((p.displayName || '').length + index) % CHIBI_TITLES.length;
                                const funTitle = CHIBI_TITLES[titleHash];

                                return (
                                    <div 
                                        key={p.socketId || index} 
                                        className={`relative flex items-center justify-between p-2.5 pl-3 pr-4 rounded-full border bg-gradient-to-r ${palette.bg} transition-all duration-300 shadow-lg hover:scale-[1.02] hover:shadow-xl`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Pop-Out Chibi Avatar with Radiant Aura Glow */}
                                            <div className={`relative w-13 h-13 -my-2.5 -ml-1 rounded-full border-2 ${palette.avatarBorder} ${palette.avatarBg} flex items-center justify-center shrink-0`}>
                                                {/* Luồng sáng Aura tỏa xung quanh khung Avatar */}
                                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-yellow-400/40 via-amber-300/30 to-orange-400/35 blur-[5px] animate-pulse pointer-events-none" />
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 via-transparent to-white/10 pointer-events-none z-10" />

                                                {/* Mini rank bubble */}
                                                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-black/90 border border-yellow-400/50 text-[10px] font-black text-yellow-300 flex items-center justify-center z-20 shadow">
                                                    {index + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative">
                                                    {p.characterConfig && Object.keys(p.characterConfig).length > 0 ? (
                                                        <div className="transform scale-110 translate-y-1">
                                                            <CharacterAvatar config={p.characterConfig} size={48} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-black text-lg text-white">
                                                            {p.displayName?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cute Host Crown */}
                                                {p.isHost && (
                                                    <span className="absolute -top-3.5 right-0.5 text-yellow-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-bounce z-20">
                                                        <FontAwesomeIcon icon={faCrown} className="text-sm" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info: Name & Fun Title */}
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`font-black text-sm tracking-wide truncate max-w-[130px] drop-shadow-sm ${
                                                        p.isHost ? 'text-yellow-200' : isSelf ? 'text-cyan-100' : 'text-white'
                                                    }`}>
                                                        {p.displayName}
                                                    </span>

                                                    {p.isHost && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-yellow-950 shadow-sm flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faCrown} className="text-[9px]" />
                                                            <span>Trưởng phòng</span>
                                                        </span>
                                                    )}

                                                    {isSelf && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-400 text-cyan-950 shadow-sm flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faUser} className="text-[9px]" />
                                                            <span>Bạn</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Fun Title with FontAwesome Icon */}
                                                <div className="text-[11px] font-medium text-white/80 flex items-center gap-1.5 mt-0.5 truncate">
                                                    <FontAwesomeIcon icon={funTitle.icon} className={`${funTitle.color} text-[10px]`} />
                                                    <span>{funTitle.text}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md flex items-center gap-1.5 ${palette.tag}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                                <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                                                <span>Ready</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Action (Optional Start Button visual placeholder if needed, or close) */}
                <div className="p-6 border-t border-gray-700 bg-[#252525]">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transform transition active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlay} className="text-sm" />
                        BẮT ĐẦU NGAY
                    </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
