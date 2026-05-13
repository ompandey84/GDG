// =============================================
// Hook: useTimer
// Smooth countdown timer using requestAnimationFrame
// =============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  duration: number; // total seconds
  isRunning: boolean;
  onTimeout: () => void;
}

export function useTimer({ duration, isRunning, onTimeout }: UseTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(1); // 1 = full, 0 = empty
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const hasTimedOut = useRef(false);

  const reset = useCallback(() => {
    setTimeRemaining(duration);
    setProgress(1);
    hasTimedOut.current = false;
    startTimeRef.current = 0;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    hasTimedOut.current = false;
    startTimeRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const prog = remaining / duration;

      setTimeRemaining(remaining);
      setProgress(prog);

      if (remaining <= 0 && !hasTimedOut.current) {
        hasTimedOut.current = true;
        onTimeout();
        return;
      }

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, duration, onTimeout]);

  return { timeRemaining, progress, reset };
}
