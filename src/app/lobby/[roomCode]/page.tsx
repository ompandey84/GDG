// =============================================
// Lobby Page
// =============================================

'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, Share2, Play } from 'lucide-react';
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlayerList } from '@/components/PlayerList';
import { useGameContext } from '@/providers/GameProvider';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { supabase } from '@/lib/supabase/client';
import type { Room } from '@/types';

export default function LobbyPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode.toUpperCase();
  const { currentPlayer, setRoomCode, addNotification } = useGameContext();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { players } = useRealtimePlayers(room?.id || null);

  // Load room details
  useEffect(() => {
    async function loadRoom() {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();
      
      if (data) {
        setRoom(data);
        setRoomCode(roomCode);
      } else {
        addNotification('Room not found', 'error');
        router.push('/');
      }
    }
    loadRoom();
  }, [roomCode, setRoomCode, addNotification, router]);

  // Handle room updates
  useRealtimeRoom({
    roomId: room?.id || null,
    onRoomUpdate: (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'playing') {
        router.push(`/game/${roomCode}`);
      }
    },
  });

  // Redirect if no player context (direct URL access)
  useEffect(() => {
    if (!currentPlayer) {
      // In a real app we might show a join modal here instead of redirecting
      addNotification('Please join the room first', 'warning');
      router.push('/');
    }
  }, [currentPlayer, router, addNotification]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    addNotification('Room code copied to clipboard!', 'success');
  };

  const toggleReady = async () => {
    if (!currentPlayer || !room) return;
    
    await supabase
      .from('players')
      .update({ is_ready: !currentPlayer.is_ready })
      .eq('id', currentPlayer.id);
  };

  const startGame = async () => {
    if (!room || !currentPlayer?.is_host) return;
    
    setIsGenerating(true);
    addNotification('Generating AI questions...', 'info');

    try {
      // 1. Update status to starting (locks the room)
      await supabase
        .from('rooms')
        .update({ status: 'starting' })
        .eq('id', room.id);

      // 2. Generate questions via API
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          count: room.total_questions,
          difficulty: room.difficulty,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate questions');

      // 3. Start game
      await supabase
        .from('rooms')
        .update({ 
          status: 'playing',
          started_at: new Date().toISOString(),
          current_question_index: 0
        })
        .eq('id', room.id);

      // (Routing happens automatically via useRealtimeRoom)
      
    } catch (error) {
      console.error(error);
      addNotification('Failed to start game', 'error');
      setIsGenerating(false);
      // Revert status
      await supabase.from('rooms').update({ status: 'waiting' }).eq('id', room.id);
    }
  };

  if (!room || !currentPlayer) {
    return <div className="text-white animate-pulse">Loading lobby...</div>;
  }

  const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
  const canStart = currentPlayer.is_host && players.length >= 1; // Allow 1 player for testing

  const me = players.find(p => p.id === currentPlayer.id) || currentPlayer;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-display font-bold text-white">Match Lobby</h1>
        <p className="text-gray-400">Waiting for players to join...</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Room Info */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle className="text-xl">Room Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-black/50 border border-white/10 rounded-lg py-4 px-8 w-full text-center">
                <span className="text-4xl font-mono tracking-[0.2em] font-bold text-[var(--color-neon)]">
                  {roomCode}
                </span>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="secondary" className="flex-1" onClick={copyRoomCode}>
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join my AI Cricket Quiz!',
                      text: `Join my room with code: ${roomCode}`,
                      url: window.location.href,
                    });
                  } else {
                    copyRoomCode();
                  }
                }}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardHeader>
              <CardTitle className="text-xl">Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Questions</span>
                <span className="font-bold">{room.total_questions}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Time per Q</span>
                <span className="font-bold">{room.time_per_question}s</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Difficulty</span>
                <Badge variant="gold" className="uppercase">{room.difficulty}</Badge>
              </div>
            </CardContent>
          </GlassCard>
        </div>

        {/* Right Column - Players & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Players ({players.length})</CardTitle>
              {allPlayersReady && players.length > 1 && (
                <Badge variant="neon">All Ready!</Badge>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-6">
              <PlayerList players={players} currentPlayerId={me.id} />
              
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 mt-auto">
                <Button
                  variant={me.is_ready ? "outline" : "default"}
                  className="flex-1 py-6 text-lg"
                  onClick={toggleReady}
                >
                  {me.is_ready ? 'Not Ready' : 'I am Ready!'}
                </Button>

                {me.is_host && (
                  <Button
                    variant="gold"
                    className="flex-1 py-6 text-lg"
                    disabled={!canStart || isGenerating}
                    onClick={startGame}
                  >
                    {isGenerating ? (
                      <span className="animate-pulse">Preparing Match...</span>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" /> Start Game
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
