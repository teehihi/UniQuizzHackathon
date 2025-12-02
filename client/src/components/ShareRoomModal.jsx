import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCopy, 
  faCheck, 
  faQrcode, 
  faLink, 
  faHashtag 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function ShareRoomModal({ isOpen, onClose, roomCode, quizTitle }) {
  const [activeTab, setActiveTab] = useState('code'); // code, link, qr
  const [copied, setCopied] = useState(false);

  // Generate URLs - Use production URL if available
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const joinUrl = `${baseUrl}/join-room?code=${roomCode}`;
  const shortUrl = `${baseUrl}/r/${roomCode}`; // Short URL format

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Đã copy ${type}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'code', label: 'Mã phòng', icon: faHashtag },
    { id: 'link', label: 'Link', icon: faLink },
    { id: 'qr', label: 'QR Code', icon: faQrcode }
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Chia sẻ phòng
                    </h3>
                    <p className="text-red-100 text-sm">{quizTitle}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-white dark:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Mã phòng */}
                  {activeTab === 'code' && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Chia sẻ mã này để mời người khác vào phòng
                      </p>
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-8 border-2 border-red-200 dark:border-red-800">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mã phòng</p>
                          <p className="text-5xl font-bold font-mono text-red-600 dark:text-red-400 tracking-wider">
                            {roomCode}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCopy(roomCode, 'mã phòng')}
                          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                          {copied ? 'Đã copy!' : 'Copy mã phòng'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Link */}
                  {activeTab === 'link' && (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Gửi link này để người khác tham gia nhanh chóng
                      </p>
                      
                      {/* Short Link */}
                      <div className="mb-4">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Link rút gọn
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shortUrl}
                            readOnly
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-mono text-sm"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopy(shortUrl, 'link')}
                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Full Link */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Link đầy đủ
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={joinUrl}
                            readOnly
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-mono text-xs"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopy(joinUrl, 'link')}
                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* QR Code */}
                  {activeTab === 'qr' && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Quét mã QR để tham gia phòng
                      </p>
                      <div id="share-modal" className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg relative">
                          <QRCodeSVG
                            value={shortUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: '/favicon.png',
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                        </div>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                          Quét mã QR bằng camera điện thoại
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Download QR code
                            const svg = document.querySelector('#share-modal svg');
                            const svgData = new XMLSerializer().serializeToString(svg);
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            img.onload = () => {
                              canvas.width = img.width;
                              canvas.height = img.height;
                              ctx.drawImage(img, 0, 0);
                              const pngFile = canvas.toDataURL('image/png');
                              const downloadLink = document.createElement('a');
                              downloadLink.download = `room-${roomCode}-qr.png`;
                              downloadLink.href = pngFile;
                              downloadLink.click();
                              toast.success('Đã tải QR code!');
                            };
                            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                          }}
                          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                        >
                          Tải QR Code
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  💡 Mẹo: Người tham gia có thể vào trang chủ và nhập mã phòng hoặc dùng link/QR
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
