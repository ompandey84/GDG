// =============================================
// Game Page (Live Gameplay)
// =============================================

'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizCard } from '@/components/QuizCard';
import { Timer } from '@/components/Timer';
import { Leaderboard } from '@/components/Leaderboard';
import { useGameContext } from '@/providers/GameProvider';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useTimer } from '@/hooks/useTimer';
import { supabase } from '@/lib/supabase/client';
import { calculateScore } from '@/lib/gameEngine';
import type { Room, Question, Answer, ScoreResult } from '@/types';

export default function GamePage({ params }: { params: Promise<{ roomCode: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode.toUpperCase();
  const { currentPlayer, addNotification } = useGameContext();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  
  // Realtime hooks
  const { players } = useRealtimePlayers(room?.id || null);
  const { broadcastEvent } = useRealtimeRoom({
    roomId: room?.id || null,
    onRoomUpdate: (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'finished') {
        router.push(`/result/${roomCode}`);
      }
    },
    onBroadcast: (event, payload) => {
      if (event === 'player_answered') {
        if (payload.username !== currentPlayer?.username) {
          addNotification(`${payload.username} has answered!`, 'info');
        }
      }
    }
  });

  const activeQuestion = questions[room?.current_question_index || 0];
  const isReviewPhase = room?.status === 'reviewing';

  // Timer hook
  const { timeRemaining, progress, reset: resetTimer } = useTimer({
    duration: room?.time_per_question || 15,
    isRunning: room?.status === 'playing',
    onTimeout: () => {
      if (!currentAnswer && !isAnswering) {
        handleAnswerSubmit(null); // Auto-submit wrong answer on timeout
      }
    }
  });

  // Load initial data
  useEffect(() => {
    async function loadGameData() {
      if (!currentPlayer) {
        router.push('/');
        return;
      }

      // Load Room
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();
      
      if (!roomData) return;
      setRoom(roomData);

      // Load Questions
      const { data: questionData } = await supabase
        .from('questions')
        .select('*')
        .eq('room_id', roomData.id)
        .order('question_order', { ascending: true });
        
      if (questionData) setQuestions(questionData);
    }
    loadGameData();
  }, [roomCode, currentPlayer, router]);

  // Reset answer state when question changes
  useEffect(() => {
    if (room?.current_question_index !== undefined) {
      setCurrentAnswer(null);
      setScoreResult(null);
      setIsAnswering(false);
      resetTimer();
    }
  }, [room?.current_question_index, resetTimer]);

  const handleAnswerSubmit = useCallback(async (selectedOption: string | null) => {
    if (!currentPlayer || !room || !activeQuestion || isAnswering) return;
    setIsAnswering(true);

    const timeTaken = room.time_per_question - timeRemaining;
    const isCorrect = selectedOption === activeQuestion.correct_answer;
    
    const result = calculateScore(timeTaken, activeQuestion.difficulty, room.time_per_question, isCorrect);
    setScoreResult(result);

    const answerData = {
      question_id: activeQuestion.id,
      player_id: currentPlayer.id,
      selected_answer: selectedOption,
      time_taken: timeTaken,
      is_correct: isCorrect,
      points_awarded: result.points,
    };

    // 1. Save Answer
    const { data: savedAnswer } = await supabase
      .from('answers')
      .insert(answerData)
      .select()
      .single();
      
    if (savedAnswer) setCurrentAnswer(savedAnswer as Answer);

    // 2. Update Player Score
    const newScore = currentPlayer.score + result.points;
    const newStreak = isCorrect ? currentPlayer.streak + 1 : 0;
    
    await supabase
      .from('players')
      .update({ score: newScore, streak: newStreak })
      .eq('id', currentPlayer.id);

    // 3. Broadcast to others
    broadcastEvent('player_answered', { username: currentPlayer.username });

    // 4. Host Logic: Check if everyone answered, then move to review
    if (currentPlayer.is_host) {
      // Small delay to allow DB sync
      setTimeout(async () => {
        const { count } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', activeQuestion.id);

        if (count === players.length) {
          moveToReview(room.id);
        }
      }, 500);
    }
  }, [currentPlayer, room, activeQuestion, isAnswering, timeRemaining, players.length, broadcastEvent]);

  // Host only: Auto-move to review when timer hits 0 (if everyone didn't answer)
  useEffect(() => {
    if (timeRemaining <= 0 && currentPlayer?.is_host && room?.status === 'playing') {
      moveToReview(room.id);
    }
  }, [timeRemaining, currentPlayer?.is_host, room?.status, room?.id]);

  // Host only: Handle transitions
  const moveToReview = async (roomId: string) => {
    await supabase.from('rooms').update({ status: 'reviewing' }).eq('id', roomId);
    
    // Wait 5 seconds in review, then next question
    setTimeout(async () => {
      const { data } = await supabase.from('rooms').select('current_question_index, total_questions').eq('id', roomId).single();
      if (!data) return;

      if (data.current_question_index >= data.total_questions - 1) {
        // Game Over
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId);
      } else {
        // Next Question
        await supabase.from('rooms').update({ 
          status: 'playing',
          current_question_index: data.current_question_index + 1 
        }).eq('id', roomId);
      }
    }, 5000);
  };

  if (!room || questions.length === 0) {
    return <div className="animate-pulse">Loading match...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar with Timer */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-black/40 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-gray-400 text-sm block">Room</span>
            <span className="font-mono text-xl font-bold text-[var(--color-gold)]">{roomCode}</span>
          </div>

          <div className="flex-1 flex justify-center scale-75 sm:scale-100 origin-top">
            <Timer 
              progress={progress} 
              timeRemaining={timeRemaining} 
              totalTime={room.time_per_question} 
            />
          </div>

          <div className="bg-black/40 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-md text-right">
            <span className="text-gray-400 text-sm block">Your Score</span>
            <span className="font-display text-2xl font-bold text-white">
              {players.find(p => p.id === currentPlayer?.id)?.score || 0}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col justify-center relative">
          {activeQuestion && (
            <QuizCard
              question={activeQuestion}
              questionNumber={(room.current_question_index || 0) + 1}
              totalQuestions={room.total_questions}
              onAnswer={handleAnswerSubmit}
              disabled={!!currentAnswer || isReviewPhase}
              correctAnswer={isReviewPhase ? activeQuestion.correct_answer : null}
              selectedAnswer={currentAnswer?.selected_answer}
            />
          )}

          {/* Feedback Overlay (Review Phase) */}
          <AnimatePresence>
            {isReviewPhase && scoreResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                  <span className="text-6xl">{scoreResult.emoji}</span>
                  <h2 className={`text-4xl font-display font-bold ${scoreResult.points > 0 ? 'text-[var(--color-neon)]' : 'text-red-500'}`}>
                    {scoreResult.label}
                  </h2>
                  <p className="text-gray-300 text-lg">{scoreResult.description}</p>
                  <div className="mt-4 font-mono bg-white/10 px-4 py-2 rounded-lg text-xl">
                    +{scoreResult.points} pts
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar - Leaderboard */}
      <div className="w-full md:w-80 flex-shrink-0 order-first md:order-last mb-6 md:mb-0">
        <Leaderboard players={players} currentPlayerId={currentPlayer?.id} isMini />
      </div>
    </div>
  );
}
