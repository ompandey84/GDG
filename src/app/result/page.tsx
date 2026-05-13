// =============================================
// Result Page (Offline)
// =============================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, RefreshCcw, Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGameContext } from '@/providers/GameProvider';

export default function ResultPage() {
  const router = useRouter();
  const { gameStats, resetGame } = useGameContext();
  
  const handleRestart = () => {
    resetGame();
    router.push('/');
  };

  const avgTime = gameStats.correctCount > 0 
    ? (gameStats.totalTimeTaken / (gameStats.correctCount + gameStats.wrongCount)).toFixed(1)
    : '0.0';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 py-8">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1 }}
          className="inline-block"
        >
          <Trophy className="w-24 h-24 text-[var(--color-gold)] mx-auto drop-shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-display font-bold text-white uppercase tracking-tight"
        >
          Quiz Finished!
        </motion.h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Trophy className="text-[var(--color-gold)]" />} 
          label="Total Score" 
          value={gameStats.score} 
          delay={0.4}
        />
        <StatCard 
          icon={<CheckCircle2 className="text-[var(--color-neon)]" />} 
          label="Correct" 
          value={gameStats.correctCount} 
          delay={0.5}
        />
        <StatCard 
          icon={<XCircle className="text-red-500" />} 
          label="Wrong" 
          value={gameStats.wrongCount} 
          delay={0.6}
        />
        <StatCard 
          icon={<Clock className="text-blue-400" />} 
          label="Avg Time" 
          value={`${avgTime}s`} 
          delay={0.7}
        />
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-white/10"
      >
        <Button 
          variant="outline" 
          className="px-8 py-6 text-lg border-white/20 hover:bg-white/10"
          onClick={() => router.push('/')}
        >
          <Home className="w-5 h-5 mr-2" /> Main Menu
        </Button>
        
        <Button 
          variant="gold" 
          className="px-8 py-6 text-lg shadow-[0_0_15px_rgba(245,197,24,0.3)]"
          onClick={handleRestart}
        >
          <RefreshCcw className="w-5 h-5 mr-2" /> Try Again
        </Button>
      </motion.div>
      
    </div>
  );
}

function StatCard({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string | number, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-2"
    >
      <div className="p-3 bg-white/5 rounded-full">{icon}</div>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-3xl font-display font-bold text-white">{value}</span>
    </motion.div>
  );
}
