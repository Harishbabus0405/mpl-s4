import React from 'react';
import { Flame, Trophy, ShieldCheck, Tag, ArrowUpRight } from 'lucide-react';

export default function JustSoldHighlight({ justSoldPlayer, onSelectTeam }) {
  if (!justSoldPlayer) return null;

  const boughtPrice = justSoldPlayer.boughtPrice || justSoldPlayer.price || 0;
  const playerName = justSoldPlayer.name || justSoldPlayer.playerName || `Player #${justSoldPlayer.playerNumber}`;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 animate-scale-up">
      <div className="bg-gradient-to-r from-amber-950/70 via-[#0d162a] to-emerald-950/70 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
                OFFICIAL RESULT
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase font-display flex items-center gap-2">
                <span>🔥</span> JUST SOLD
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-gray-900/90 border border-gray-800 px-3.5 py-1.5 rounded-full">
            {justSoldPlayer.timestamp || 'Latest Result'}
          </span>
        </div>

        {/* Featured Player Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Player Number */}
          <div className="bg-[#060913]/90 border border-amber-500/40 rounded-2xl p-4 text-center shadow-inner">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
              Player Number
            </span>
            <span className="text-3xl sm:text-4xl font-black font-display text-amber-400">
              #{justSoldPlayer.playerNumber}
            </span>
          </div>

          {/* Player Name & Role */}
          <div className="sm:col-span-2 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 inline-block">
                🏏 {justSoldPlayer.role}
              </span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-display">
              {playerName}
            </h4>
            <button
              onClick={() => onSelectTeam && onSelectTeam(justSoldPlayer.teamName)}
              className="group text-base sm:text-lg font-black text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer"
              title="Click to view franchise squad"
            >
              <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{justSoldPlayer.teamName}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </button>
          </div>

          {/* Bought Price */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/40 rounded-2xl p-4 text-center shadow-lg">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
              Sold Price
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {boughtPrice.toLocaleString()} <span className="text-sm font-bold text-emerald-300">PTS</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
