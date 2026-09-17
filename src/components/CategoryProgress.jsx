import React from 'react';
import { CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { CATEGORY_ORDER, CATEGORY_CONFIG } from '../utils/playerUtils';

export default function CategoryProgress({
  currentCategoryIndex,
  currentCategoryShownCount,
  currentCategoryTotal,
  playersByCategory = {},
  usedPlayers = new Set()
}) {
  return (
    <div className="w-full glass-panel border-b border-gray-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Stepper */}
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORY_ORDER.map((key, index) => {
            const config = CATEGORY_CONFIG[key];
            const isCurrent = index === currentCategoryIndex;
            const isCompleted = index < currentCategoryIndex;
            const isLocked = index > currentCategoryIndex;

            // Calculate category total & shown
            const catTotal = (playersByCategory[key] || []).length;
            const catShown = (playersByCategory[key] || []).filter((p) =>
              usedPlayers && usedPlayers.has ? usedPlayers.has(p.id) : false
            ).length;

            return (
              <div
                key={key}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 shrink-0 ${
                  isCurrent
                    ? `${config.badgeBg} ${config.borderGlow} scale-105`
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-gray-900/40 border-gray-800 text-gray-500 opacity-60'
                }`}
              >
                <span>{config.emoji}</span>
                <span className="uppercase tracking-wider font-extrabold">{config.displayName}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-gray-600" />
                ) : (
                  <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-black/40 rounded font-bold text-amber-300">
                    {catShown}/{catTotal}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Category Progress Counter */}
        <div className="flex items-center space-x-3 bg-gray-900/90 px-4 py-2 rounded-xl border border-gray-800 shadow-inner w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              PLAYERS SHOWN:
            </span>
          </div>

          <div className="flex items-baseline space-x-1 font-display">
            <span className="text-xl font-black text-amber-400">
              {currentCategoryShownCount}
            </span>
            <span className="text-sm font-semibold text-gray-500">/</span>
            <span className="text-sm font-bold text-gray-300">
              {currentCategoryTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
