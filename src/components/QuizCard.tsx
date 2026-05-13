// =============================================
// QuizCard Component
// =============================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Question } from '@/types';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  correctAnswer?: string | null; // Passed during review phase
  selectedAnswer?: string | null;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
  correctAnswer = null,
  selectedAnswer = null,
}: QuizCardProps) {
  // Local state to show immediate feedback before server confirms
  const [localSelection, setLocalSelection] = useState<string | null>(null);

  // Reset local selection when question changes
  useEffect(() => {
    setLocalSelection(null);
  }, [question.id]);

  const handleSelect = (option: string) => {
    if (disabled || localSelection) return;
    setLocalSelection(option);
    onAnswer(option);
  };

  const getOptionState = (option: string) => {
    // Review phase (showing correct answer)
    if (correctAnswer) {
      if (option === correctAnswer) return 'correct';
      if (option === selectedAnswer && option !== correctAnswer) return 'wrong';
      return 'disabled';
    }

    // Active answering phase
    if (localSelection || selectedAnswer) {
      const isSelected = option === (localSelection || selectedAnswer);
      return isSelected ? 'selected' : 'disabled';
    }

    return 'idle';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <GlassCard className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="dark" className="text-gray-300">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge variant="dark" className="uppercase tracking-wider text-xs">
                {question.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl leading-tight">
              {question.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                const state = getOptionState(option);
                
                let buttonClass = "h-auto py-4 text-left justify-start px-6 text-lg transition-all duration-300 ";
                
                switch (state) {
                  case 'correct':
                    buttonClass += "bg-[var(--color-neon)] text-black border-transparent shadow-[0_0_15px_rgba(57,255,20,0.5)]";
                    break;
                  case 'wrong':
                    buttonClass += "bg-red-500 text-white border-transparent opacity-80";
                    break;
                  case 'selected':
                    buttonClass += "bg-[var(--color-gold)] text-black border-transparent shadow-[0_0_15px_rgba(245,197,24,0.3)] scale-[1.02]";
                    break;
                  case 'disabled':
                    buttonClass += "opacity-50 cursor-not-allowed bg-white/5";
                    break;
                  default: // idle
                    buttonClass += "bg-white/10 hover:bg-white/20 border-white/10 hover:scale-[1.02]";
                }

                return (
                  <motion.div
                    key={index}
                    whileHover={state === 'idle' ? { scale: 1.02 } : {}}
                    whileTap={state === 'idle' ? { scale: 0.98 } : {}}
                  >
                    <Button
                      variant="outline"
                      className={buttonClass + " w-full whitespace-normal break-words"}
                      onClick={() => handleSelect(option)}
                      disabled={disabled || state !== 'idle'}
                    >
                      <span className="mr-4 font-bold opacity-70">{['A', 'B', 'C', 'D'][index]}</span>
                      {option}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
