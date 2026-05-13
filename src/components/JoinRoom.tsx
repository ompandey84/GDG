// =============================================
// Start Screen Component
// =============================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGameContext } from '@/providers/GameProvider';
import { CRICKET_QUESTIONS } from '@/data/questions';

export function JoinRoom() {
  const router = useRouter();
  const { difficulty, setDifficulty, setQuestions, addNotification, resetGame } = useGameContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      resetGame();
      addNotification('Loading questions...', 'info');
      
      // Filter questions by difficulty
      const filtered = CRICKET_QUESTIONS.filter(q => q.difficulty === difficulty);
      
      // Pick 10 random questions from the filtered list
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      
      if (selected.length > 0) {
        setQuestions(selected);
        router.push('/game');
      } else {
        throw new Error('No questions found for this difficulty');
      }
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
          Test your Cricket knowledge in this offline challenge
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

            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Select Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 rounded-md text-sm font-bold uppercase transition-all ${
                        difficulty === level
                          ? 'bg-[var(--color-gold)] text-black shadow-[0_0_15px_rgba(245,197,24,0.4)]'
                          : 'bg-black/40 text-gray-400 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                variant="gold"
                className="w-full py-6 text-xl font-bold shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                disabled={isLoading}
              >
                {isLoading ? 'Loading Quiz...' : 'Start Quiz'}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </GlassCard>
  );
}

