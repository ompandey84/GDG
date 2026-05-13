// =============================================
// Game Page (Offline Gameplay)
// =============================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizCard } from '@/components/QuizCard';
import { Timer } from '@/components/Timer';
import { useGameContext } from '@/providers/GameProvider';
import { useTimer } from '@/hooks/useTimer';
import { calculateScore } from '@/lib/gameEngine';
import type { Answer, ScoreResult } from '@/types';

export default function GamePage() {
  const router = useRouter();
  const { questions, gameStats, setGameStats } = useGameContext();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isReviewPhase, setIsReviewPhase] = useState(false);

  const activeQuestion = questions[currentIndex];
  const timePerQuestion = 15;

  // Redirect if no questions
  useEffect(() => {
    if (!questions || questions.length === 0) {
      router.push('/');
    }
  }, [questions, router]);

  // Timer hook
  const { timeRemaining, progress, reset: resetTimer } = useTimer({
    duration: timePerQuestion,
    isRunning: !isReviewPhase && !!activeQuestion,
    onTimeout: () => {
      if (!currentAnswer && !isAnswering) {
        handleAnswerSubmit(null); // Auto-submit wrong answer on timeout
      }
    }
  });

  const moveToNextQuestion = useCallback(() => {
    setIsReviewPhase(false);
    setCurrentAnswer(null);
    setScoreResult(null);
    setIsAnswering(false);
    resetTimer();

    if (currentIndex >= questions.length - 1) {
      // Game Over
      router.push('/result');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length, router, resetTimer]);

  const handleAnswerSubmit = useCallback((selectedOption: string | null) => {
    if (!activeQuestion || isAnswering) return;
    setIsAnswering(true);

    const timeTaken = timePerQuestion - timeRemaining;
    const isCorrect = selectedOption === activeQuestion.correct_answer;
    
    const result = calculateScore(timeTaken, activeQuestion.difficulty, timePerQuestion, isCorrect);
    setScoreResult(result);

    setCurrentAnswer({
      question_id: activeQuestion.id,
      player_id: 'local',
      selected_answer: selectedOption,
      time_taken: timeTaken,
      is_correct: isCorrect,
      points_awarded: result.points,
    } as Answer);

    // Update global stats
    setGameStats((prev) => ({
      score: prev.score + result.points,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
      totalTimeTaken: prev.totalTimeTaken + timeTaken,
    }));

    // Show review phase for 3 seconds
    setIsReviewPhase(true);
    setTimeout(() => {
      moveToNextQuestion();
    }, 3000);
  }, [activeQuestion, isAnswering, timeRemaining, setGameStats, moveToNextQuestion]);

  if (!questions || questions.length === 0) {
    return <div className="animate-pulse">Loading match...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Top Bar with Timer */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-black/40 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-md">
          <span className="text-gray-400 text-sm block">Question</span>
          <span className="font-mono text-xl font-bold text-white">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="flex-1 flex justify-center scale-75 sm:scale-100 origin-top">
          <Timer 
            progress={progress} 
            timeRemaining={timeRemaining} 
            totalTime={timePerQuestion} 
          />
        </div>

        <div className="bg-black/40 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-md text-right">
          <span className="text-gray-400 text-sm block">Score</span>
          <span className="font-display text-2xl font-bold text-[var(--color-gold)]">
            {gameStats.score}
          </span>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center relative">
        {activeQuestion && (
          <QuizCard
            question={activeQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
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
  );
}
