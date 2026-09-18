import React from 'react';
import { CheckCircle2, Sparkles, Check, X, Hourglass, Flame } from 'lucide-react';
import { CATEGORY_ORDER, CATEGORY_CONFIG } from '../utils/playerUtils';

export default function CategoryProgress({
  currentCategoryKey,
  selectCategory,
  stats = {},
  stage = 'MAIN_AUCTION'
}) {
  const isUnsoldRound = stage === 'UNSOLD_ROUND';
  const categoryStats = stats.categoryStats || {};

  const totalPlayers = !isUnsoldRound ? (stats.totalPlayers || 0) : (stats.totalUnsoldRoundItems || 0);
  const totalProcessed = !isUnsoldRound ? (stats.totalProcessedMain || 0) : (stats.totalUnsoldRoundProcessed || 0);
  const totalSold = stats.totalSold || 0;
  const totalUnsold = stats.totalUnsold || 0;
  const totalRemaining = !isUnsoldRound ? (stats.totalRemainingMain || 0) : (stats.totalUnsoldRoundRemaining || 0);

  const percentProcessed = totalPlayers > 0 ? Math.round((totalProcessed / totalPlayers) * 100) : 0;

  return (
    <div className="w-full bg-[#080d1a]/80 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top: Category Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {CATEGORY_ORDER.map((key) => {
            const config = CATEGORY_CONFIG[key];
            const isCurrent = key === currentCategoryKey;
            const catStat = categoryStats[key] || { total: 0, processedMain: 0, sold: 0, unsold: 0 };

            const isCatCompleted = !isUnsoldRound
              ? catStat.total > 0 && catStat.processedMain >= catStat.total
              : catStat.unsoldRoundTotal > 0 && catStat.unsoldRoundProcessed >= catStat.unsoldRoundTotal;

            const processedCount = !isUnsoldRound ? catStat.processedMain : catStat.unsoldRoundProcessed;
            const totalCount = !isUnsoldRound ? catStat.total : (catStat.unsoldRoundTotal || 0);

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(key)}
                className={`relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none active:scale-[0.98] ${
                  isCurrent
                    ? 'bg-gradient-to-br from-amber-500/20 via-[#0f172a] to-amber-950/30 border-amber-400/70 ring-2 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                    : isCatCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50'
                    : 'bg-[#0b1020]/90 border-gray-800/90 text-gray-400 hover:border-gray-700 hover:text-gray-200 hover:bg-[#0e1529]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl sm:text-2xl">{config.emoji}</span>
                  <div>
                    <span className={`block font-display font-black text-xs sm:text-sm tracking-wider uppercase ${
                      isCurrent ? 'text-amber-300' : isCatCompleted ? 'text-emerald-400' : 'text-gray-200'
                    }`}>
                      {config.displayName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                      {isUnsoldRound ? 'UNSOLD POOL' : config.singularName}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isCatCompleted ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-mono text-xs">{processedCount}/{totalCount}</span>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border tracking-wider ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                        : 'bg-black/60 text-amber-300 border-gray-800'
                    }`}>
                      {processedCount} / {totalCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom: Broadcast Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 font-display">
          {/* 1. Processed Card */}
          <div className="bg-[#0b1020]/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {!isUnsoldRound ? 'PROCESSED' : 'UNSOLD ROUND'}
              </span>
              <span className="text-[10px] font-mono text-gray-400">{percentProcessed}%</span>
            </div>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalProcessed}
              </span>
              <span className="text-gray-500 text-sm font-bold">/</span>
              <span className="text-gray-400 text-sm font-bold font-mono">
                {totalPlayers}
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2 overflow-hidden border border-gray-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentProcessed}%` }}
              />
            </div>
          </div>

          {/* 2. Sold Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#0b1020] to-[#0b1020] border border-emerald-500/35 rounded-2xl p-3 sm:p-4 shadow-lg hover:border-emerald-500/60 transition-all">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              SOLD
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {totalSold}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Purchased by Teams</p>
          </div>

          {/* 3. Unsold Card */}
          <div className="bg-gradient-to-br from-rose-950/40 via-[#0b1020] to-[#0b1020] border border-rose-500/35 rounded-2xl p-3 sm:p-4 shadow-lg hover:border-rose-500/60 transition-all">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" />
              UNSOLD
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {totalUnsold}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Waiting for Unsold Round</p>
          </div>

          {/* 4. Remaining Card */}
          <div className="bg-gradient-to-br from-cyan-950/40 via-[#0b1020] to-[#0b1020] border border-cyan-500/35 rounded-2xl p-3 sm:p-4 shadow-lg hover:border-cyan-500/60 transition-all">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-cyan-400" />
              REMAINING
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                {totalRemaining}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">To Be Auctioned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
