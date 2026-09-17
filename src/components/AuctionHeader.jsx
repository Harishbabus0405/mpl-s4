import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, RefreshCw, ShieldAlert, Trophy } from 'lucide-react';

export default function AuctionHeader({
  currentCategoryConfig,
  setShowResetModal,
  showResetModal,
  resetAuction
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <>
      <header className="w-full bg-[#0B101D]/90 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        {/* Left: Tournament Logo & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-glow-gold">
            <div className="w-full h-full bg-[#0B101D] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg lg:text-xl tracking-wider text-gradient-gold leading-none">
              MPL S4
            </h1>
            <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-medium">
              CRICKET TOURNAMENT PLAYER AUCTION
            </p>
          </div>
        </div>

        {/* Center: Current Active Category Badge */}
        {currentCategoryConfig && (
          <div className="hidden md:flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-amber-500/20 shadow-lg">
            <span className="text-sm">{currentCategoryConfig.emoji}</span>
            <span className="text-xs font-semibold text-gray-400 tracking-wider">ACTIVE CATEGORY:</span>
            <span className={`text-xs font-black uppercase tracking-wider ${currentCategoryConfig.badgeBg} px-2.5 py-0.5 rounded-md border`}>
              {currentCategoryConfig.displayName}
            </span>
          </div>
        )}

        {/* Right: Actions (Fullscreen & Reset) */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-gray-700/60 text-xs font-semibold transition-all duration-150 active:scale-95"
            title="Toggle Fullscreen Mode (TV / Projector)"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </>
            )}
          </button>

          {/* Reset Auction Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all duration-150 active:scale-95"
            title="Reset Entire Auction"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET AUCTION</span>
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-rose-500/30 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400 mb-4">
              <div className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">RESET AUCTION?</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              ARE YOU SURE YOU WANT TO RESET THE AUCTION?<br />
              <strong className="text-rose-400 font-semibold">ALL PLAYER SELECTIONS WILL BE CLEARED</strong> AND THE AUCTION WILL RESTART FROM THE BOWLER CATEGORY.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold tracking-wider transition-all duration-150 active:scale-95"
              >
                CANCEL
              </button>
              <button
                onClick={resetAuction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-wider transition-all duration-150 shadow-lg shadow-rose-600/30 active:scale-95"
              >
                RESET AUCTION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
