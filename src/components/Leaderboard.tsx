// =============================================
// Leaderboard Component
// =============================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Flame } from 'lucide-react';
import type { Player } from '@/types';

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  isMini?: boolean; // True for sidebar during game, false for end screen
}

export function Leaderboard({ players, currentPlayerId, isMini = false }: LeaderboardProps) {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Find highest score for relative bar width
  const topScore = sortedPlayers.length > 0 ? Math.max(sortedPlayers[0].score, 1) : 1;

  return (
    <GlassCard className={`w-full ${isMini ? 'text-sm' : ''}`}>
      {!isMini && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl text-[var(--color-gold)]">
            <Trophy className="w-8 h-8" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={isMini ? 'p-4' : 'pt-2'}>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const isCurrent = player.id === currentPlayerId;
            const rank = index + 1;
            
            // Calculate progress bar width (minimum 5%)
            const widthPct = Math.max((player.score / topScore) * 100, 5);

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative p-3 rounded-lg flex items-center justify-between ${
                  isCurrent ? 'bg-white/10 border border-white/20' : 'bg-black/20'
                }`}
              >
                {/* Score bar background */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-[var(--color-pitch-light)] rounded-lg opacity-40 -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 font-bold text-[var(--color-gold)]">
                    {rank}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-semibold ${isCurrent ? 'text-[var(--color-neon)]' : 'text-white'}`}>
                      {player.username} {isCurrent && '(You)'}
                    </span>
                    {player.streak > 2 && (
                      <span className="flex items-center text-xs text-orange-400">
                        <Flame className="w-3 h-3 mr-1" />
                        {player.streak} Streak
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xl">
                    {player.score}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">pts</span>
                </div>
              </motion.div>
            );
          })}

          {players.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Waiting for players...
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
