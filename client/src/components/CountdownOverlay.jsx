import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountdownOverlay({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
          animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
          exit={{ scale: 2, opacity: 0, rotate: 15 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
          className="flex flex-col items-center"
        >
          {count > 0 ? (
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 rounded-full animate-pulse" />
              
              <span className="relative text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] font-mono">
                {count}
              </span>
            </div>
          ) : (
            <div className="relative">
               <div className="absolute inset-0 bg-red-500 blur-3xl opacity-40 rounded-full animate-pulse" />
               <span className="relative text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] uppercase">
                Bắt đầu!
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
