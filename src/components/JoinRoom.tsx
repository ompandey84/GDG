// =============================================
// JoinRoom Component (Create / Join form)
// =============================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGameContext } from '@/providers/GameProvider';
import { supabase } from '@/lib/supabase/client';
import { generateRoomCode, generateAvatarSeed } from '@/lib/gameEngine';

export function JoinRoom() {
  const router = useRouter();
  const { setCurrentPlayer, setRoomCode } = useGameContext();
  
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [username, setUsername] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
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
          host_id: username, // For hackathon, just using username as host identifier
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
      setError(err.message || 'Failed to create room. Please try again.');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!inputCode.trim() || inputCode.length !== 6) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = inputCode.toUpperCase();

      // 1. Find Room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code)
        .single();

      if (roomError || !roomData) {
        throw new Error('Room not found. Check the code and try again.');
      }

      if (roomData.status !== 'waiting') {
        throw new Error('Game has already started in this room.');
      }

      // 2. Create Player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          username: username.trim(),
          avatar_seed: generateAvatarSeed(),
          is_host: false,
          is_ready: false,
        })
        .select()
        .single();

      if (playerError) {
        if (playerError.code === '23505') { // Unique violation
          throw new Error('Username already taken in this room. Choose another.');
        }
        throw playerError;
      }

      // 3. Update Context & Redirect
      setCurrentPlayer(playerData);
      setRoomCode(code);
      router.push(`/lobby/${code}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to join room. Please try again.');
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
          Test your IPL knowledge against friends in real-time
        </CardDescription>
      </CardHeader>
      
      <div className="flex border-b border-white/10">
        <button
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'join' 
              ? 'text-[var(--color-neon)] border-b-2 border-[var(--color-neon)] bg-white/5' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('join')}
        >
          Join Game
        </button>
        <button
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'create' 
              ? 'text-[var(--color-gold)] border-b-2 border-[var(--color-gold)] bg-white/5' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create Room
        </button>
      </div>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
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

            {activeTab === 'join' ? (
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Your Nickname</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. MS Dhoni"
                    maxLength={15}
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Room Code</label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-md text-white font-mono text-center tracking-widest text-lg uppercase focus:outline-none focus:ring-2 focus:ring-[var(--color-neon)] focus:border-transparent transition-all"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg bg-[var(--color-neon)] text-black hover:bg-[#32e011] shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Enter Arena'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Host Nickname</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Captain Cool"
                    maxLength={15}
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent transition-all"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="gold"
                  className="w-full py-6 text-lg shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create New Game'}
                </Button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </GlassCard>
  );
}

// Need AnimatePresence here too since it's used above
import { AnimatePresence } from 'framer-motion';
