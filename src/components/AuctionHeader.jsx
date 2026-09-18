import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, RefreshCw, ShieldAlert, Trophy, History, Lock, Unlock, Eye, Home, Radio, Users, BookOpen } from 'lucide-react';
import RulesModal from './RulesModal';

export default function AuctionHeader({
  currentCategoryConfig,
  setShowResetModal,
  showResetModal,
  resetAuction,
  stage = 'MAIN_AUCTION',
  activeTab = 'AUCTION',
  setActiveTab,
  isAdmin,
  setShowAdminModal,
  logoutAdmin,
  setShowHistoryModal,
  returnToLanding,
  stats,
  connectionStatus = 'CONNECTED'
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

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

  const isUnsoldRound = stage === 'UNSOLD_ROUND';
  const isFinalCompleted = stage === 'FINAL_COMPLETED';

  // Render connection status pill
  const renderConnectionStatus = () => {
    if (connectionStatus === 'CONNECTED') {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Radio className="w-3.5 h-3.5" />
          <span>LIVE SYNC</span>
        </div>
      );
    }
    if (connectionStatus === 'RECONNECTING') {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-black tracking-widest uppercase animate-pulse">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span>RECONNECTING</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black tracking-widest uppercase">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <span>OFFLINE</span>
      </div>
    );
  };

  return (
    <>
      <header className="w-full bg-[#070b16]/95 backdrop-blur-xl border-b border-gray-800/80 px-4 sm:px-6 lg:px-8 py-2.5 sticky top-0 z-40 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Official MPL S4 Branding */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={returnToLanding} title="Return to Landing Page">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-[0_0_18px_rgba(245,158,11,0.35)] shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-lg sm:text-xl tracking-wider text-gradient-gold leading-none">
                  MPL S4
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
                  SEASON 4
                </span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                MADATHUR PREMIER LEAGUE
              </p>
            </div>
          </div>

          {/* Center: Realtime Connection & Phase Indicator */}
          <div className="hidden md:flex items-center space-x-3">
            {!isFinalCompleted && renderConnectionStatus()}

            {isFinalCompleted ? (
              <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-widest uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>AUCTION COMPLETED</span>
              </div>
            ) : isUnsoldRound ? (
              <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>🔴 UNSOLD ROUND</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>MAIN AUCTION</span>
              </div>
            )}
          </div>

          {/* Right Actions: Navigation, Rules, Logs, Fullscreen & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View Switcher: Auction vs Teams */}
            {setActiveTab && (
              <div className="flex items-center bg-[#090e1c] border border-gray-800 rounded-xl p-1 gap-1 shadow-inner">
                <button
                  onClick={() => setActiveTab('AUCTION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'AUCTION'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md scale-100'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🏏 {isAdmin ? 'AUCTION' : 'LIVE'}
                </button>
                <button
                  onClick={() => setActiveTab('TEAMS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'TEAMS'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md scale-100'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> TEAMS
                  </span>
                </button>
              </div>
            )}

            {/* Rules Button */}
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              title="Tournament Rules & Regulations"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">RULES</span>
            </button>

            {/* History Logs Button */}
            {setShowHistoryModal && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                title="View Complete Auction History Logs"
              >
                <History className="w-4 h-4" />
                <span className="hidden lg:inline">LOGS</span>
              </button>
            )}

            {/* Projector Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              title="Toggle Projector Fullscreen Mode"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">EXIT</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">PROJECTOR</span>
                </>
              )}
            </button>

            {/* Admin vs User Mode Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">ADMIN</span>
                </span>
                <button
                  onClick={logoutAdmin}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 text-xs font-semibold border border-gray-800 transition-all"
                  title="Logout from Admin Mode"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Eye className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden sm:inline">VIEWER</span>
                </span>
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1 transition-all"
                  title="Admin Login"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ADMIN</span>
                </button>
              </div>
            )}

            {/* Admin Reset Button */}
            {isAdmin && (
              <button
                onClick={() => setShowResetModal(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                title="Reset Entire Auction"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden lg:inline">RESET</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/40 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">RESET ENTIRE AUCTION?</h3>
                <p className="text-xs text-rose-400/80 font-bold uppercase tracking-wider">Destructive Action</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to reset the auction?<br />
              <strong className="text-rose-400 font-bold">All player purchases, team budgets (25,000 PTS), and unsold collection will be cleared back to initial state.</strong>
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold tracking-wider transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={resetAuction}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black tracking-wider transition-all shadow-lg shadow-rose-600/30"
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
