import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function CircularTimer({ 
  duration = 30, 
  onTimeUp, 
  isActive = true,
  size = 80,
  resetKey = 0 // Add reset key to force reset
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  // Reset timer when resetKey changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsWarning(false);
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
        
        // Warning when < 10 seconds
        if (prev <= 10) {
          setIsWarning(true);
        } else {
          setIsWarning(false);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp, resetKey]);

  const percentage = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (timeLeft <= 5) return '#ef4444'; // red
    if (timeLeft <= 10) return '#f97316'; // orange
    return '#22c55e'; // green
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>

      {/* Time text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={isWarning ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: isWarning ? Infinity : 0
        }}
      >
        <span 
          className={`text-2xl font-bold ${
            timeLeft <= 5 
              ? 'text-red-600 dark:text-red-400' 
              : timeLeft <= 10 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {timeLeft}
        </span>
      </motion.div>

      {/* Warning pulse effect */}
      {isWarning && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-red-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />
      )}
    </div>
  );
}
