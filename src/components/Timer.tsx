// =============================================
// Timer Component
// =============================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  progress: number; // 0 to 1
  timeRemaining: number;
  totalTime: number;
}

export function Timer({ progress, timeRemaining, totalTime }: TimerProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Color logic
  let colorClass = 'text-[var(--color-neon)]'; // Green
  if (progress < 0.5) colorClass = 'text-[var(--color-gold)]'; // Yellow
  if (progress < 0.25) colorClass = 'text-red-500'; // Red

  // Format time (e.g., 9.5s)
  const displayTime = Math.ceil(timeRemaining);
  const showDecimals = timeRemaining < 3 && timeRemaining > 0;
  const formattedTime = showDecimals ? timeRemaining.toFixed(1) : displayTime.toString();

  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/10"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          className={colorClass}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      {/* Time text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <motion.span 
          key={displayTime}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-display font-bold tabular-nums ${showDecimals ? 'text-3xl' : 'text-4xl'} ${colorClass}`}
        >
          {formattedTime}
        </motion.span>
      </div>

      {/* Pulse effect when time is running out */}
      {progress < 0.25 && timeRemaining > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-red-500"
          animate={{
            scale: [1, 1.2],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
