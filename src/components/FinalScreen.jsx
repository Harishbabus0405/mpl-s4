import React, { useEffect } from 'react';
import { Trophy, RefreshCw, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FinalScreen({ onResetAuction, totalPlayersShown }) {
  useEffect(() => {
    // Trigger confetti celebration effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-8">
      {/* Trophy Badge */}
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse-subtle" />
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[3px] shadow-[0_0_50px_rgba(245,158,11,0.6)] relative z-10">
          <div className="w-full h-full bg-[#0B101D] rounded-[22px] flex items-center justify-center text-amber-400">
            <Trophy className="w-14 h-14" />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>TOURNAMENT MILESTONE ACHIEVED</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider">
          MPL <span className="text-gradient-gold">S4</span>
        </h1>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amber-400 uppercase tracking-wider">
          PLAYER AUCTION COMPLETED
        </h2>
        <p className="text-base text-gray-300 font-medium pt-2">
          ALL PLAYERS ACROSS ALL CATEGORIES HAVE BEEN SUCCESSFULLY REVEALED
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-md w-full flex items-center justify-around shadow-xl">
        <div className="flex flex-col items-center">
          <Award className="w-6 h-6 text-amber-400 mb-1" />
          <span className="text-2xl font-black font-display text-white">{totalPlayersShown}</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL REVEALED</span>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div className="flex flex-col items-center">
          <Trophy className="w-6 h-6 text-emerald-400 mb-1" />
          <span className="text-2xl font-black font-display text-emerald-400">4 / 4</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CATEGORIES COMPLETE</span>
        </div>
      </div>

      {/* Restart Auction Button */}
      <button
        onClick={onResetAuction}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-lg uppercase tracking-wider flex items-center space-x-2.5 shadow-glow-gold transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <RefreshCw className="w-5 h-5 text-black" />
        <span>RESTART AUCTION</span>
      </button>
    </div>
  );
}
