import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CircularTimer({ 
  duration = 30, 
  onTimeUp, 
  isActive = true,
  size = 54,
  resetKey = 0
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp, resetKey]);

  const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0;
  
  // SVG circular calculations
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Dynamic colors based on time left
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isUrgent;

  const gradientColors = isUrgent
    ? { from: '#dc2626', to: '#ef4444', text: 'text-red-600 dark:text-red-400' } // Danger Red
    : isWarning
    ? { from: '#ea580c', to: '#f59e0b', text: 'text-amber-600 dark:text-amber-400' } // Warning Orange
    : { from: '#ef4444', to: '#f97316', text: 'text-stone-800 dark:text-stone-100' }; // Standard UniQuizz Gradient

  return (
    <motion.div 
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      animate={isUrgent ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: 0.6, repeat: isUrgent ? Infinity : 0, ease: "easeInOut" }}
    >
      {/* Background Soft Glow for urgency */}
      {isUrgent && (
        <span className="absolute inset-0 rounded-full bg-red-500/15 animate-ping" />
      )}

      {/* SVG Circle Progress */}
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id={`timer-gradient-${resetKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.from} />
            <stop offset="100%" stopColor={gradientColors.to} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-stone-200/80 dark:text-stone-700/60"
        />

        {/* Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#timer-gradient-${resetKey})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </svg>

      {/* Centered Number Display (Crisp, Elegant, No Overflow) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline justify-center">
          <span 
            className={`font-black tracking-tight tabular-nums transition-colors duration-300 ${gradientColors.text}`}
            style={{ 
              fontSize: size <= 54 ? '1.15rem' : '1.35rem',
              lineHeight: 1
            }}
          >
            {timeLeft}
          </span>
          <span 
            className="text-[10px] font-bold text-stone-400 dark:text-stone-500 ml-0.5 leading-none"
            style={{ fontSize: '0.65rem' }}
          >
            s
          </span>
        </div>
      </div>
    </motion.div>
  );
}
