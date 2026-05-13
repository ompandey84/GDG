// =============================================
// GameNotification Component (Toast-like)
// =============================================

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useGameContext } from '@/providers/GameProvider';

export function GameNotification() {
  const { notifications } = useGameContext();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          let bgColor, icon;
          
          switch (notification.type) {
            case 'success':
              bgColor = 'bg-[var(--color-pitch-light)] border-[var(--color-neon)]/50';
              icon = <CheckCircle className="w-5 h-5 text-[var(--color-neon)]" />;
              break;
            case 'warning':
              bgColor = 'bg-orange-900/80 border-orange-500/50';
              icon = <AlertTriangle className="w-5 h-5 text-orange-400" />;
              break;
            case 'error':
              bgColor = 'bg-red-900/80 border-red-500/50';
              icon = <XCircle className="w-5 h-5 text-red-400" />;
              break;
            default: // info
              bgColor = 'bg-[var(--color-surface-light)] border-blue-400/30';
              icon = <Info className="w-5 h-5 text-blue-400" />;
          }

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg ${bgColor} w-full`}
            >
              {icon}
              <p className="text-sm font-medium text-white">{notification.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
