// =============================================
// PlayerList Component (Lobby)
// =============================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Crown } from 'lucide-react';
import type { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {players.map((player, index) => {
        const isCurrent = player.id === currentPlayerId;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm ${
              isCurrent 
                ? 'bg-[var(--color-glass)] border-[var(--color-neon)]/50 shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                : 'bg-black/20 border-white/10'
            }`}
          >
            {/* Avatar Placeholder - Generative Avatars can be added later */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-pitch-light)] to-[var(--color-pitch)] flex items-center justify-center text-xl font-bold uppercase border-2 border-white/20">
              {player.username.charAt(0)}
              {player.is_host && (
                <div className="absolute -top-1 -right-1 bg-[var(--color-gold)] text-black rounded-full p-0.5 shadow-sm">
                  <Crown className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold truncate ${isCurrent ? 'text-[var(--color-neon)]' : 'text-white'}`}>
                {player.username}
              </h4>
              <p className="text-xs text-gray-400">
                {player.is_host ? 'Host' : 'Player'}
              </p>
            </div>

            <div className="flex-shrink-0">
              {player.is_ready ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[var(--color-neon)]"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
              ) : (
                <div className="text-gray-500">
                  <CircleDashed className="w-6 h-6 animate-pulse" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
