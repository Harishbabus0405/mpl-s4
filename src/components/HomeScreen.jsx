import React from 'react';
import { Trophy, Play, Shield, Sparkles } from 'lucide-react';
import { CATEGORY_ORDER, CATEGORY_CONFIG } from '../utils/playerUtils';

export default function HomeScreen({ onStartAuction, playersByCategory }) {
  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10 space-y-8 animate-fade-in">
        {/* Tournament Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-glow-gold">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse-subtle" />
          <span>OFFICIAL PLAYER AUCTION SYSTEM</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white">
            MPL <span className="text-gradient-gold">S4</span>
          </h1>
          <p className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-gray-300 tracking-wider">
            CRICKET TOURNAMENT
          </p>
          <p className="text-sm sm:text-base text-gray-400 uppercase tracking-widest font-semibold pt-1">
            PLAYER AUCTION
          </p>
        </div>

        {/* Auction Order Cards */}
        <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 border border-gray-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>AUCTION CATEGORY ORDER</span>
            </span>
            <span className="text-xs font-semibold text-gray-500">MANUAL SELECTION FLOW</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORY_ORDER.map((key, index) => {
              const config = CATEGORY_CONFIG[key];
              const count = (playersByCategory[key] || []).length;
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-between space-y-2 ${
                    index === 0
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-glow-emerald'
                      : 'bg-gray-900/60 border-gray-800 opacity-85'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-lg">
                    {config.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-wider text-gray-200">
                      {config.displayName}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                      {count} PLAYERS
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      index === 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {index === 0 ? 'START FIRST' : `STEP ${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Auction Button */}
        <button
          onClick={onStartAuction}
          className="group relative inline-flex items-center justify-center space-x-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xl tracking-wider uppercase shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-6 h-6 text-black fill-black group-hover:translate-x-0.5 transition-transform" />
          <span>START AUCTION</span>
        </button>
      </div>
    </div>
  );
}
