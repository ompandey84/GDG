// =============================================
// Home Page (Landing)
// =============================================

import { JoinRoom } from '@/components/JoinRoom';
import { CricketBall } from '@/components/CricketBall';

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12">
      <CricketBall />
      
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(245,197,24,0.3)]">
          AI Cricket <span className="text-[var(--color-gold)]">Quiz</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Challenge your friends in a real-time battle of IPL knowledge. 
          Questions generated dynamically by Google Gemini AI.
        </p>
      </div>

      <div className="w-full max-w-md">
        <JoinRoom />
      </div>
    </div>
  );
}
