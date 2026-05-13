// =============================================
// CricketBall Animation Component
// =============================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function CricketBall() {
  return (
    <motion.div
      className="relative w-32 h-32 mx-auto mb-8"
      animate={{
        y: [0, -20, 0],
        rotate: [0, 360],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <circle cx="50" cy="50" r="48" fill="#d12e2e" />
        <circle cx="50" cy="50" r="48" fill="url(#ball-grad)" />
        <path d="M 20 20 Q 50 50 20 80" fill="none" stroke="white" strokeWidth="3" strokeDasharray="4 2" />
        <path d="M 80 20 Q 50 50 80 80" fill="none" stroke="white" strokeWidth="3" strokeDasharray="4 2" />
        <path d="M 47 15 L 47 85" fill="none" stroke="white" strokeWidth="1" />
        <path d="M 50 15 L 50 85" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2 4" />
        <path d="M 53 15 L 53 85" fill="none" stroke="white" strokeWidth="1" />
        
        <defs>
          <radialGradient id="ball-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
