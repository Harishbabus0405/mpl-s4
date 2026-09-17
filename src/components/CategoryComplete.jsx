import React from 'react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORY_ORDER, CATEGORY_CONFIG } from '../utils/playerUtils';

export default function CategoryComplete({
  currentCategoryConfig,
  currentCategoryIndex,
  onStartNextCategory,
  totalCategoryPlayers
}) {
  const isLastCategory = currentCategoryIndex >= CATEGORY_ORDER.length - 1;
  const nextCategoryKey = !isLastCategory ? CATEGORY_ORDER[currentCategoryIndex + 1] : null;
  const nextCategoryConfig = nextCategoryKey ? CATEGORY_CONFIG[nextCategoryKey] : null;

  return (
    <div className="w-full max-w-xl mx-auto glass-panel-gold rounded-3xl p-8 border-2 border-amber-500/40 shadow-2xl text-center space-y-6 animate-scale-up">
      {/* Icon Badge */}
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-gold">
        <CheckCircle2 className="w-10 h-10 text-amber-400" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CATEGORY COMPLETED</span>
        </div>
        <h2 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-wider">
          {currentCategoryConfig.displayName} AUCTION COMPLETED
        </h2>
        <p className="text-sm font-semibold text-gray-300">
          ALL {totalCategoryPlayers} {currentCategoryConfig.displayName} HAVE BEEN REVEALED
        </p>
      </div>

      {/* Transition Action Button */}
      {!isLastCategory && nextCategoryConfig && (
        <button
          onClick={onStartNextCategory}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-lg uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <span>START {nextCategoryConfig.displayName} AUCTION</span>
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      )}
    </div>
  );
}
