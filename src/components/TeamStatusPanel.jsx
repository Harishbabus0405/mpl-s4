import React from 'react';
import { Users, Trophy, Lock, ShieldCheck, Download } from 'lucide-react';
import { MAX_SQUAD_SIZE } from '../utils/teamData';

export default function TeamStatusPanel({ teamsWithStats, onSelectTeam }) {
  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase font-display flex items-center gap-2">
              FRANCHISE SQUAD STATUS ({teamsWithStats.length} TEAMS)
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Maximum {MAX_SQUAD_SIZE} players per squad • 25,000 Starting Points Budget
            </p>
          </div>
        </div>
      </div>

      {/* 16 Teams Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {teamsWithStats.map((team) => {
          const isFull = team.isFull;
          const slotsLeft = team.slotsLeft;
          const percentage = Math.round((team.playerCount / MAX_SQUAD_SIZE) * 100);

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam && onSelectTeam(team.name)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                isFull
                  ? 'bg-gradient-to-b from-rose-950/30 via-[#0e1428] to-[#070b16] border-rose-500/40 shadow-rose-900/20 shadow-md'
                  : 'bg-gradient-to-b from-[#0e1428] to-[#070b16] border-gray-800/90 hover:border-amber-500/50 shadow-md'
              }`}
            >
              {/* Top Row: Team Name & Lock / Slot Badge */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <h4 className="font-display font-black text-xs sm:text-sm text-white uppercase truncate group-hover:text-amber-400 transition-colors">
                  {team.name}
                </h4>

                {isFull ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                    <Lock className="w-3 h-3" /> FULL
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-mono font-bold text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                    {slotsLeft} left
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-950 rounded-full h-1.5 mb-2.5 overflow-hidden border border-gray-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull
                      ? 'bg-rose-500'
                      : percentage >= 75
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Bottom Row: Players count & Remaining points */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <span className="font-mono font-black text-white">
                    {team.playerCount}
                  </span>
                  <span className="text-gray-500 text-[10px]">/ {MAX_SQUAD_SIZE}</span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {team.remainingPoints.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-0.5 font-bold">PTS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
