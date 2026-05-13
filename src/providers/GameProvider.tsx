// =============================================
// Game Provider Context
// =============================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Player, Room, GameNotification } from '@/types';

interface GameContextType {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  notifications: GameNotification[];
  addNotification: (message: string, type?: GameNotification['type']) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedPlayer = localStorage.getItem('currentPlayer');
      if (storedPlayer) {
        setCurrentPlayer(JSON.parse(storedPlayer));
      }
      const storedRoom = localStorage.getItem('currentRoomCode');
      if (storedRoom) {
        setRoomCode(storedRoom);
      }
    } catch (e) {
      console.error('Error loading game state from local storage', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
    } else {
      localStorage.removeItem('currentPlayer');
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem('currentRoomCode', roomCode);
    } else {
      localStorage.removeItem('currentRoomCode');
    }
  }, [roomCode]);

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
        currentPlayer,
        setCurrentPlayer,
        roomCode,
        setRoomCode,
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
