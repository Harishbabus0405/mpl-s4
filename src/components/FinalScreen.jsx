import React, { useEffect } from 'react';
import { Trophy, RefreshCw, Sparkles, CheckCircle2, XCircle, Download, Lock, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MAX_SQUAD_SIZE, downloadTeamCSV } from '../utils/teamData';

export default function FinalScreen({ onResetAuction, stats = {}, globalTeamStats = {}, teamsWithStats = [], isAdmin = false }) {
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

  const handleDownloadAllCSVs = () => {
    teamsWithStats.forEach((team, idx) => {
      if (team.playerCount > 0) {
        setTimeout(() => downloadTeamCSV(team), idx * 150);
      }
    });
  };

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
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-glow-gold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>TOURNAMENT AUCTION FINISHED</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider flex items-center justify-center space-x-3">
          <span>🏆</span>
          <span>MPL <span className="text-gradient-gold">S4</span> AUCTION COMPLETED</span>
        </h1>
        <p className="text-base text-gray-300 font-medium pt-1">
          MAIN AUCTION AND UNSOLD ROUNDS HAVE BEEN OFFICIALLY CONCLUDED
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 max-w-2xl w-full shadow-2xl space-y-6">
        {/* Player Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <span className="text-2xl font-black font-display text-white">{stats.totalPlayers || 0}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1 text-center">
              TOTAL PLAYERS
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-2xl font-black font-display text-emerald-400">{stats.totalSold || 0}</span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mt-1 text-center">
              🟢 SOLD
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
            <XCircle className="w-6 h-6 text-rose-400 mb-1" />
            <span className="text-2xl font-black font-display text-rose-400">{stats.totalUnsold || 0}</span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mt-1 text-center">
              🔴 FINAL UNSOLD
            </span>
          </div>
        </div>

        {/* Global Financial Summary Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/80">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#060913] border border-amber-500/30">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 text-center">
              TOTAL TEAM BUDGET
            </span>
            <span className="text-2xl font-black font-display text-white">
              {globalTeamStats.totalBudget?.toLocaleString() || '400,000'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">POINTS (16 TEAMS)</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#060913] border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 text-center">
              TOTAL SPENT
            </span>
            <span className="text-2xl font-black font-display text-emerald-400 font-mono">
              {globalTeamStats.totalSpent?.toLocaleString() || 0}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">POINTS</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#060913] border border-cyan-500/30">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 text-center">
              TOTAL REMAINING
            </span>
            <span className="text-2xl font-black font-display text-cyan-400 font-mono">
              {globalTeamStats.totalRemaining?.toLocaleString() || '400,000'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">POINTS</span>
          </div>
        </div>

        {/* Full Teams Summary */}
        {teamsWithStats.filter(t => t.isFull).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" /> COMPLETE SQUADS ({MAX_SQUAD_SIZE}/{MAX_SQUAD_SIZE})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamsWithStats.filter(t => t.isFull).map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-xl bg-[#060913] border border-red-500/20">
                  <div>
                    <span className="text-sm font-bold text-white">{team.name}</span>
                    <span className="text-[10px] text-gray-400 block">{team.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-400">🔒 {team.playerCount}/{MAX_SQUAD_SIZE}</span>
                    {isAdmin && (
                      <button
                        onClick={() => downloadTeamCSV(team)}
                        className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                      >
                        <Download className="w-3 h-3" /> CSV
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isAdmin && globalTeamStats.totalSoldAssigned > 0 && (
          <button
            onClick={handleDownloadAllCSVs}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>DOWNLOAD ALL TEAM CSVs</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={onResetAuction}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-lg uppercase tracking-wider flex items-center space-x-2.5 shadow-glow-gold transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 text-black" />
            <span>RESTART AUCTION</span>
          </button>
        )}
      </div>
    </div>
  );
}
