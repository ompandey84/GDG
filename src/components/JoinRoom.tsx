// =============================================
// JoinRoom Component (Create form)
// =============================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGameContext } from '@/providers/GameProvider';
import { supabase } from '@/lib/supabase/client';
import { generateRoomCode, generateAvatarSeed } from '@/lib/gameEngine';

export function JoinRoom() {
  const router = useRouter();
  const { setCurrentPlayer, setRoomCode } = useGameContext();
  
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newRoomCode = generateRoomCode();
      
      // 1. Create Room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: newRoomCode,
          host_id: username,
          status: 'waiting',
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // 2. Create Host Player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          username: username.trim(),
          avatar_seed: generateAvatarSeed(),
          is_host: true,
          is_ready: true, // Host is ready by default
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // 3. Update Context & Redirect
      setCurrentPlayer(playerData);
      setRoomCode(newRoomCode);
      router.push(`/lobby/${newRoomCode}`);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start game. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-display text-[var(--color-gold)]">
          Play Cricket Quiz
        </CardTitle>
        <CardDescription className="text-center">
          Test your IPL knowledge against AI in real-time
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handlePlay} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Nickname</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. MS Dhoni"
                  maxLength={15}
                  className="w-full px-4 py-4 bg-black/40 border border-white/20 rounded-md text-white text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent transition-all"
                />
              </div>
              <Button 
                type="submit" 
                variant="gold"
                className="w-full py-6 text-xl font-bold shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                disabled={isLoading}
              >
                {isLoading ? 'Preparing Match...' : 'Play Now'}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </GlassCard>
  );
}
