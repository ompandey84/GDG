// =============================================
// Game Provider Context
// =============================================

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GameNotification, Question } from '@/types';

export interface GameStats {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalTimeTaken: number;
}

interface GameContextType {
  difficulty: string;
  setDifficulty: (diff: string) => void;
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  gameStats: GameStats;
  setGameStats: (stats: GameStats | ((prev: GameStats) => GameStats)) => void;
  resetGame: () => void;
  notifications: GameNotification[];
  addNotification: (message: string, type?: GameNotification['type']) => void;
}

const defaultStats: GameStats = {
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  totalTimeTaken: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>(defaultStats);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  const resetGame = () => {
    setQuestions([]);
    setGameStats(defaultStats);
  };

  const addNotification = (message: string, type: GameNotification['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <GameContext.Provider
      value={{
        difficulty,
        setDifficulty,
        questions,
        setQuestions,
        gameStats,
        setGameStats,
        resetGame,
        notifications,
        addNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
