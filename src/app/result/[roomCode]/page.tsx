// =============================================
// Result Page (Post-Game)
// =============================================

'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, RefreshCcw, Trophy, Medal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Leaderboard } from '@/components/Leaderboard';
import { useGameContext } from '@/providers/GameProvider';
import { supabase } from '@/lib/supabase/client';
import type { Player } from '@/types';

export default function ResultPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode.toUpperCase();
  const { currentPlayer } = useGameContext();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinalResults() {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', (await supabase.from('rooms').select('id').eq('room_code', roomCode).single()).data?.id)
        .order('score', { ascending: false });
        
      if (data) setPlayers(data as Player[]);
      setLoading(false);
    }
    loadFinalResults();
  }, [roomCode]);

  if (loading) {
    return <div className="animate-pulse">Loading final results...</div>;
  }

  const winner = players[0];
  const isWinner = currentPlayer?.id === winner?.id;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-8">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1 }}
          className="inline-block"
        >
          {isWinner ? (
            <Trophy className="w-24 h-24 text-[var(--color-gold)] mx-auto drop-shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
          ) : (
            <Medal className="w-24 h-24 text-gray-400 mx-auto" />
          )}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-display font-bold text-white uppercase tracking-tight"
        >
          {isWinner ? 'Victory!' : 'Match Over'}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-400"
        >
          {isWinner 
            ? 'You are the ultimate Cricket Quiz Champion!' 
            : `${winner?.username || 'Someone'} won the match.`}
        </motion.p>
      </div>

      {/* Podium & Leaderboard */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Leaderboard players={players} currentPlayerId={currentPlayer?.id} />
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-white/10"
      >
        <Button 
          variant="outline" 
          className="px-8 py-6 text-lg border-white/20 hover:bg-white/10"
          onClick={() => router.push('/')}
        >
          <Home className="w-5 h-5 mr-2" /> Return to Home
        </Button>
        
        {currentPlayer?.is_host && (
          <Button 
            variant="gold" 
            className="px-8 py-6 text-lg shadow-[0_0_15px_rgba(245,197,24,0.3)]"
            onClick={() => router.push('/')}
          >
            <RefreshCcw className="w-5 h-5 mr-2" /> Start New Match
          </Button>
        )}
      </motion.div>
      
    </div>
  );
}
