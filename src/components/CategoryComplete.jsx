import React from 'react';
import { Trophy, ArrowRight, Sparkles, CheckCircle2, XCircle, Users } from 'lucide-react';

export default function CategoryComplete({
  onStartUnsoldRound,
  stats = {},
  isAdmin = true
}) {
  const totalPlayers = stats.totalPlayers || 0;
  const totalSold = stats.totalSold || 0;
  const totalUnsold = stats.totalUnsold || 0;

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel-gold rounded-3xl p-8 sm:p-12 border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center space-y-8 animate-scale-up my-auto relative overflow-hidden">
      {/* Background glow halos */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Trophy Icon */}
      <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.4)]">
        <div className="w-full h-full bg-[#080d1a] rounded-[22px] flex items-center justify-center">
          <Trophy className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-500/30">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>OFFICIAL MILESTONE REACHED</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
          🏆 MAIN AUCTION COMPLETED
        </h2>
        <p className="text-base sm:text-lg font-bold text-gray-300 max-w-xl mx-auto leading-relaxed">
          All <strong className="text-amber-400 font-black">{totalPlayers} players</strong> in the tournament pool have been officially processed.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto py-2">
        <div className="p-4 rounded-2xl bg-[#0b1020]/90 border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-black font-mono text-white">{totalPlayers}</span>
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">TOTAL PLAYERS</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center shadow-md">
          <span className="text-3xl font-black font-mono text-emerald-400">{totalSold}</span>
          <span className="text-xs font-black text-emerald-300 uppercase tracking-wider mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SOLD
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center shadow-md">
          <span className="text-3xl font-black font-mono text-rose-400">{totalUnsold}</span>
          <span className="text-xs font-black text-rose-300 uppercase tracking-wider mt-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> UNSOLD
          </span>
        </div>
      </div>

      {/* Unsold Collection Waiting Banner */}
      {totalUnsold > 0 ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0e1428] to-rose-950/40 border border-rose-500/40 max-w-xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>🔴 UNSOLD PLAYERS WAITING</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalUnsold} PLAYERS</p>
          <p className="text-xs text-gray-400 font-medium">
            These players are collected in the persistent Unsold Collection ready for the Unsold Round.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm max-w-xl mx-auto">
          All players were sold! No players remain unsold.
        </div>
      )}

      {/* Action Area */}
      {totalUnsold > 0 && (
        isAdmin ? (
          <div className="max-w-md mx-auto pt-2">
            <button
              onClick={onStartUnsoldRound}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xl uppercase tracking-wider flex items-center justify-center space-x-3 shadow-[0_0_35px_rgba(245,158,11,0.4)] transition-all duration-200 active:scale-95 cursor-pointer border border-yellow-300"
            >
              <span>START UNSOLD ROUND</span>
              <ArrowRight className="w-6 h-6 text-slate-950" />
            </button>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              Only collected Unsold players will be available in the Unsold Round.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-gray-300 font-semibold text-sm max-w-md mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Waiting for Admin to launch the Unsold Round ({totalUnsold} players)</span>
          </div>
        )
      )}
    </div>
  );
}
