import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, PlusCircle, Radio, Sparkles, Trophy } from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/playerUtils';

export default function PlayerCard({
  selectedPlayer,
  currentCategoryConfig,
  onMarkSold,
  onMarkUnsold,
  teamAssignment,
  onOpenAssignTeamModal,
  isAdmin,
  status = 'BIDDING' // 'BIDDING' | 'SOLD' | 'ASSIGNED' | 'UNSOLD' | 'WAITING'
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [selectedPlayer?.id]);

  if (!selectedPlayer) {
    return (
      <div className="w-full max-w-3xl mx-auto min-h-[460px] lg:min-h-[560px] glass-panel rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-5 relative overflow-hidden">
        {/* Subtle stadium light glow behind waiting area */}
        <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-24 h-24 rounded-3xl bg-[#0b1122] border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner relative z-10">
          <Radio className="w-12 h-12 text-amber-500/60 animate-pulse" />
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-xs font-black tracking-widest uppercase">
            ⚪ WAITING FOR NEXT PLAYER
          </div>
          <h3 className="font-display font-black text-white text-xl sm:text-2xl uppercase tracking-wider">
            AUCTION STAGE READY
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-sm mx-auto">
            {isAdmin
              ? 'Enter player number in the control panel above to reveal the next player card for live bidding.'
              : 'The auctioneer will display the next player shortly. Stay tuned for live updates.'}
          </p>
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[selectedPlayer.category] || currentCategoryConfig;
  const currentStatus = teamAssignment ? 'ASSIGNED' : status;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-5 animate-scale-up">
      {/* 1. Live Auction Status Banner */}
      <div className="flex items-center justify-center">
        {currentStatus === 'ASSIGNED' ? (
          <div className="px-5 py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-sold-glow">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>🟢 SOLD TO {teamAssignment.teamName}</span>
          </div>
        ) : currentStatus === 'SOLD' ? (
          <div className="px-5 py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>🟢 SOLD</span>
          </div>
        ) : currentStatus === 'UNSOLD' ? (
          <div className="px-5 py-2 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-300 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-unsold-pulse">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>🔴 UNSOLD</span>
          </div>
        ) : (
          <div className="px-5 py-2 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse">
            <Radio className="w-4 h-4 text-amber-400 animate-spin" />
            <span>🟡 BIDDING IN PROGRESS</span>
          </div>
        )}
      </div>

      {/* 2. Player Identification Header Banner */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-6 py-2.5 rounded-2xl glass-panel border border-amber-500/40 shadow-xl">
        <span className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
          <span>{categoryConfig.emoji}</span>
          <span>{categoryConfig.displayName}</span>
        </span>
        <span className="text-gray-600 font-extrabold">•</span>
        <div className="flex items-center space-x-2 text-white font-display font-black text-xl sm:text-2xl lg:text-3xl tracking-wider">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <span>PLAYER #{selectedPlayer.number}</span>
        </div>
      </div>

      {/* 3. Hero Original Player Card Container (Untouched image, pristine aspect ratio) */}
      <div className="w-full relative hero-card-frame rounded-3xl p-3 sm:p-5 flex items-center justify-center min-h-[460px] lg:min-h-[580px] overflow-hidden">
        {/* Stadium Spotlight Background Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Loading Spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#040711]/80 rounded-3xl backdrop-blur-sm z-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              LOADING PLAYER CARD...
            </span>
          </div>
        )}

        {/* Fallback Error Display */}
        {imageError ? (
          <div className="w-full h-96 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-rose-950/30 rounded-2xl border border-rose-500/40">
            <AlertTriangle className="w-14 h-14 text-rose-500" />
            <h4 className="font-display font-black text-rose-400 text-lg uppercase tracking-wider">
              PLAYER CARD COULD NOT BE LOADED
            </h4>
            <p className="text-xs text-gray-400 font-mono">
              PLAYER #{selectedPlayer.number} ({selectedPlayer.fileName})
            </p>
          </div>
        ) : (
          /* EXACT ORIGINAL CARD DISPLAYED WITHOUT MODIFICATION OR CROPPING */
          <img
            src={selectedPlayer.path}
            alt={`Player #${selectedPlayer.number}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error(`Failed to load player card image path: ${selectedPlayer.path}`);
              setImageError(true);
            }}
            className={`w-full max-h-[72vh] object-contain rounded-2xl transition-all duration-300 relative z-10 shadow-2xl ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        )}
      </div>

      {/* 4. Official Team Ownership / Just Sold Details (If Assigned) */}
      {teamAssignment && (
        <div className="w-full bg-gradient-to-r from-[#0b1528] via-[#06241a] to-[#0b1528] border-2 border-emerald-500/50 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(16,185,129,0.25)] animate-scale-up space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>OFFICIALLY PURCHASED</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white font-black text-xl">
            {teamAssignment.name && <span>{teamAssignment.name}</span>}
            <span className="hidden sm:inline text-gray-500">→</span>
            <span className="text-amber-400 tracking-wider font-display text-2xl">{teamAssignment.teamName}</span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span className="text-emerald-300 font-mono text-2xl">{teamAssignment.boughtPrice?.toLocaleString()} POINTS</span>
          </div>
        </div>
      )}

      {/* 5. Auctioneer Controls (Admin Mode Only) */}
      {isAdmin ? (
        <div className="w-full space-y-3 pt-2">
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={onMarkSold}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center space-x-3 shadow-[0_0_35px_rgba(16,185,129,0.45)] transition-all duration-200 active:scale-95 cursor-pointer border border-emerald-400/50"
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
              <span>SOLD</span>
            </button>

            <button
              onClick={onMarkUnsold}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center space-x-3 shadow-[0_0_35px_rgba(244,63,94,0.45)] transition-all duration-200 active:scale-95 cursor-pointer border border-rose-400/50"
            >
              <XCircle className="w-6 h-6 text-white" />
              <span>UNSOLD</span>
            </button>
          </div>

          <button
            onClick={() => onOpenAssignTeamModal(selectedPlayer)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all duration-200 active:scale-95 cursor-pointer border border-yellow-300"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>{teamAssignment ? 'EDIT TEAM ASSIGNMENT' : 'ASSIGN PLAYER TO TEAM'}</span>
          </button>
        </div>
      ) : (
        <div className="w-full p-3.5 rounded-2xl bg-[#090e1c]/80 border border-gray-800 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>LIVE AUCTION VIEWER MODE — Admin operates player bids</span>
        </div>
      )}
    </div>
  );
}
