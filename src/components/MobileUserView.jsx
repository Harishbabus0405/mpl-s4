import React, { useState } from 'react';
import {
  Radio,
  Trophy,
  Users,
  History,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  ChevronRight,
  Flame,
  ArrowLeft,
  Wifi,
  WifiOff
} from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/playerUtils';
import { MAX_SQUAD_SIZE } from '../utils/teamData';
import RulesModal from './RulesModal';
import CategoryComplete from './CategoryComplete';
import FinalScreen from './FinalScreen';

export default function MobileUserView({
  auctionState,
  onSelectTeam
}) {
  const {
    stage,
    currentCategoryConfig,
    stats,
    teamsWithStats,
    teamAssignments,
    justSoldPlayer,
    currentPlayerData,
    unsoldPlayers,
    connectionStatus = 'CONNECTED',
    returnToLanding
  } = auctionState;

  // Active bottom navigation tab: 'LIVE' | 'TEAMS' | 'HISTORY'
  const [mobileTab, setMobileTab] = useState('LIVE');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);

  const isUnsoldRound = stage === 'UNSOLD_ROUND';
  const cpd = currentPlayerData;
  const categoryConfig = cpd ? (CATEGORY_CONFIG[cpd.category] || currentCategoryConfig) : currentCategoryConfig;

  // Reverse chronological list of assigned players
  const soldPlayersList = Object.values(teamAssignments).reverse();

  // Connection status pill
  const renderConnectionPill = () => {
    if (connectionStatus === 'CONNECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </span>
      );
    }
    if (connectionStatus === 'RECONNECTING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
          <span>SYNCING</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <span>OFFLINE</span>
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#040711] text-gray-100 flex flex-col pb-20 overflow-x-hidden">
      {/* 1. Mobile Top Bar */}
      <header className="sticky top-0 z-30 bg-[#070b16]/95 backdrop-blur-md border-b border-gray-800/80 px-3.5 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          {returnToLanding && (
            <button
              onClick={returnToLanding}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors active:scale-95"
              title="Return to Home Screen"
              aria-label="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-[#080d1a] rounded-[7px] flex items-center justify-center text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-black text-sm text-gradient-gold leading-none">
              MPL S4
            </h1>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold block mt-0.5">
              LIVE AUCTION
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {renderConnectionPill()}
          <span className="text-[9px] px-2 py-0.5 rounded-md bg-gray-900 border border-gray-800 text-gray-300 font-bold uppercase">
            {isUnsoldRound ? 'UNSOLD' : 'MAIN'}
          </span>
        </div>
      </header>

      {/* 2. Main Content View according to active mobileTab */}
      <div className="flex-1 w-full max-w-lg mx-auto px-3.5 py-4 space-y-5">
        {/* ========================================================= */}
        {/* TAB 1: 🏏 LIVE AUCTION STAGE                             */}
        {/* ========================================================= */}
        {mobileTab === 'LIVE' && (
          stage === 'MAIN_COMPLETED' ? (
            <CategoryComplete stats={stats} isAdmin={false} />
          ) : stage === 'FINAL_COMPLETED' ? (
            <FinalScreen
              stats={stats}
              globalTeamStats={auctionState.globalTeamStats}
              teamsWithStats={teamsWithStats}
              isAdmin={false}
            />
          ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Live Sub-banner */}
            <div className="flex items-center justify-between bg-[#080d1a] border border-gray-800 rounded-2xl px-3.5 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                  🔴 LIVE STAGE
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase">
                {currentCategoryConfig?.displayName}
              </span>
            </div>

            {/* Current Player Card Hero */}
            {cpd ? (
              <div className="w-full space-y-3.5 animate-scale-up">
                {/* Live Status Indicator */}
                <div className="w-full flex items-center justify-center">
                  <div className={`w-full py-2.5 px-4 rounded-2xl border-2 text-center text-xs font-black tracking-widest uppercase shadow-md ${
                    cpd.status === 'BIDDING'
                      ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300 animate-pulse'
                      : cpd.status === 'SOLD' || cpd.status === 'ASSIGNED'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 animate-sold-glow'
                      : cpd.status === 'UNSOLD'
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-unsold-pulse'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}>
                    {cpd.status === 'BIDDING' && '🟡 LIVE BIDDING IN PROGRESS'}
                    {cpd.status === 'SOLD' && '🟢 SOLD'}
                    {cpd.status === 'ASSIGNED' && `🟢 SOLD TO ${cpd.teamName}`}
                    {cpd.status === 'UNSOLD' && '🔴 UNSOLD'}
                  </div>
                </div>

                {/* Player Header Pill */}
                <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#0b1020] border border-amber-500/30 shadow-md">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    {categoryConfig?.singularName}
                  </span>
                  <span className="text-white font-display font-black text-base sm:text-lg tracking-wider">
                    PLAYER #{cpd.number}
                  </span>
                </div>

                {/* Exact Player Card Image (scaled to mobile width, untouched) */}
                <div className="w-full hero-card-frame rounded-2xl p-2 sm:p-3 flex items-center justify-center min-h-[340px] max-h-[58vh] overflow-hidden">
                  <img
                    src={cpd.path}
                    alt={`Player #${cpd.number}`}
                    className="w-full max-h-[55vh] object-contain rounded-xl shadow-xl"
                  />
                </div>

                {/* Sold Information Banner (if sold) */}
                {cpd.status === 'ASSIGNED' && (
                  <div className="w-full bg-gradient-to-r from-[#0b1528] via-[#06241a] to-[#0b1528] border border-emerald-500/50 rounded-2xl p-4 text-center shadow-lg space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                      🔥 OFFICIALLY SOLD
                    </span>
                    <div className="text-white font-black text-base">
                      {cpd.playerName && <span className="block">{cpd.playerName}</span>}
                      <span className="text-amber-400 font-display text-lg block">{cpd.teamName}</span>
                      <span className="text-emerald-300 font-mono text-lg block">{cpd.boughtPrice?.toLocaleString()} POINTS</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Waiting for Next Player Stage */
              <div className="w-full min-h-[300px] glass-panel rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#090e1c] border border-gray-800 flex items-center justify-center text-gray-500">
                  <Radio className="w-8 h-8 text-amber-500/60 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                    ⚪ WAITING FOR NEXT PLAYER
                  </span>
                  <h3 className="font-display font-black text-white text-lg uppercase">
                    AUCTION STAGE
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    The auctioneer will reveal a player card shortly.
                  </p>
                </div>
              </div>
            )}

            {/* 🔥 JUST SOLD Mobile Card */}
            {justSoldPlayer && (
              <div className="w-full bg-gradient-to-r from-amber-950/50 via-[#0d162a] to-emerald-950/50 border border-amber-500/40 rounded-2xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-display">
                      JUST SOLD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {justSoldPlayer.timestamp || 'Latest'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono font-black text-xs">
                        #{justSoldPlayer.playerNumber}
                      </span>
                      <h4 className="font-black text-white text-sm">
                        {justSoldPlayer.name || `Player #${justSoldPlayer.playerNumber}`}
                      </h4>
                    </div>
                    <p className="text-xs font-bold text-amber-400 uppercase mt-0.5">
                      {justSoldPlayer.teamName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-emerald-400 block">
                      {(justSoldPlayer.boughtPrice || justSoldPlayer.price)?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Points</span>
                  </div>
                </div>
              </div>
            )}

            {/* Unsold Pool Status */}
            {unsoldPlayers.length > 0 && (
              <div className="w-full bg-[#080d1a] border border-rose-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-400 uppercase flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    UNSOLD PLAYERS WAITING
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-xs">
                    {unsoldPlayers.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {unsoldPlayers.slice(0, 8).map((p) => (
                    <span key={p.id} className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-bold">
                      #{p.number}
                    </span>
                  ))}
                  {unsoldPlayers.length > 8 && (
                    <span className="px-2 py-1 rounded-lg bg-gray-900 text-gray-400 font-mono text-[11px]">
                      +{unsoldPlayers.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Link to Teams & History */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setMobileTab('TEAMS')}
                className="p-3 rounded-2xl bg-[#0a0f20] border border-gray-800 hover:border-amber-500/40 text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-amber-400" />
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-xs font-black text-white uppercase block">Franchise Squads</span>
                <span className="text-[10px] text-gray-400">16 Teams • 25K Budget</span>
              </button>

              <button
                onClick={() => setMobileTab('HISTORY')}
                className="p-3 rounded-2xl bg-[#0a0f20] border border-gray-800 hover:border-amber-500/40 text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between mb-1">
                  <History className="w-4 h-4 text-cyan-400" />
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-xs font-black text-white uppercase block">Auction History</span>
                <span className="text-[10px] text-gray-400">{soldPlayersList.length} Sold Players</span>
              </button>
            </div>
          </div>
        ))}

        {/* ========================================================= */}
        {/* TAB 2: 👥 FRANCHISE TEAMS (Mobile Card List)             */}
        {/* ========================================================= */}
        {mobileTab === 'TEAMS' && (
          <div className="space-y-4 animate-fade-in">
            {/* If a team is selected for detailed squad view */}
            {selectedTeamDetail ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedTeamDetail(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams List
                </button>

                <div className="bg-gradient-to-b from-[#0e1428] to-[#070b16] border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-black text-lg text-white uppercase">
                        {selectedTeamDetail.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-semibold uppercase">
                        Owner: {selectedTeamDetail.owner}
                      </p>
                    </div>
                    {selectedTeamDetail.isFull && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3" /> FULL
                      </span>
                    )}
                  </div>

                  {/* Financial & Squad Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-800">
                    <div className="bg-[#050813] p-2.5 rounded-xl border border-gray-800">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Squad</span>
                      <span className="font-mono font-black text-sm text-white">
                        {selectedTeamDetail.playerCount} / {MAX_SQUAD_SIZE}
                      </span>
                    </div>
                    <div className="bg-[#050813] p-2.5 rounded-xl border border-gray-800">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Spent</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        {selectedTeamDetail.spentPoints.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-[#050813] p-2.5 rounded-xl border border-gray-800">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Remaining</span>
                      <span className="font-mono font-black text-sm text-cyan-400">
                        {selectedTeamDetail.remainingPoints.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Squad Players List */}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider">
                      Current Squad ({selectedTeamDetail.players.length})
                    </h4>
                    {selectedTeamDetail.players.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3 text-center">
                        No players purchased yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedTeamDetail.players.map((p, idx) => (
                          <div key={idx} className="bg-[#060913] border border-gray-800 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono text-xs font-black">
                                #{p.playerNumber}
                              </span>
                              <div>
                                <span className="font-bold text-white text-xs block">{p.name}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold uppercase">{p.role}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-xs text-white">
                              {p.boughtPrice?.toLocaleString()} PTS
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* All 16 Teams Cards */
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                    16 FRANCHISE TEAMS
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">25,000 PTS BUDGET</span>
                </div>

                <div className="space-y-2.5">
                  {teamsWithStats.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeamDetail(team)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.98] ${
                        team.isFull
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-[#0a0f20] border-gray-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h4 className="font-display font-black text-sm text-white uppercase">
                            {team.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">
                            Owner: {team.owner}
                          </span>
                        </div>

                        {team.isFull ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase flex items-center gap-1">
                            <Lock className="w-3 h-3" /> FULL
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            {team.slotsLeft} slots left
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800/80">
                        <span className="text-gray-300 font-mono font-bold">
                          {team.playerCount} / {MAX_SQUAD_SIZE} Players
                        </span>
                        <span className="font-mono font-black text-cyan-400">
                          {team.remainingPoints.toLocaleString()} PTS REMAINING
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 📜 LIVE AUCTION HISTORY                           */}
        {/* ========================================================= */}
        {mobileTab === 'HISTORY' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                <span>🔥</span> LIVE AUCTION FEED ({soldPlayersList.length})
              </h3>
              <span className="text-xs text-gray-400 font-medium">Latest First</span>
            </div>

            {soldPlayersList.length === 0 ? (
              <div className="p-8 text-center bg-[#080d1a] border border-gray-800 rounded-2xl text-gray-400 text-xs">
                No players sold yet. Real-time purchases will appear here live.
              </div>
            ) : (
              <div className="space-y-2.5">
                {soldPlayersList.map((player, idx) => (
                  <div
                    key={player.playerId || idx}
                    className="bg-[#0a0f20] border border-gray-800 rounded-2xl p-3 shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 font-mono font-black text-xs">
                        #{player.playerNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-white text-xs sm:text-sm">{player.name}</h4>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10">
                            {player.role}
                          </span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold uppercase block mt-0.5">
                          {player.teamName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm block">
                        {player.boughtPrice?.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {player.timestamp || 'Just now'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Sticky Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b16]/98 backdrop-blur-xl border-t border-gray-800/90 px-3 py-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => { setMobileTab('LIVE'); setSelectedTeamDetail(null); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${
              mobileTab === 'LIVE'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio className="w-4 h-4 mb-0.5" />
            <span>Live</span>
          </button>

          <button
            onClick={() => { setMobileTab('TEAMS'); setSelectedTeamDetail(null); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${
              mobileTab === 'TEAMS'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Teams</span>
          </button>

          <button
            onClick={() => { setMobileTab('HISTORY'); setSelectedTeamDetail(null); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${
              mobileTab === 'HISTORY'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setShowRulesModal(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-black uppercase text-gray-400 hover:text-amber-400 transition-all"
          >
            <BookOpen className="w-4 h-4 mb-0.5 text-amber-400" />
            <span>Rules</span>
          </button>
        </div>
      </nav>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
