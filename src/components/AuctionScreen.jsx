import React from 'react';
import CategoryProgress from './CategoryProgress';
import PlayerInput from './PlayerInput';
import PlayerCard from './PlayerCard';
import CategoryComplete from './CategoryComplete';
import FinalScreen from './FinalScreen';
import TeamsDashboard from './TeamsDashboard';
import JustSoldHighlight from './JustSoldHighlight';
import LiveAuctionList from './LiveAuctionList';
import TeamStatusPanel from './TeamStatusPanel';
import MobileUserView from './MobileUserView';
import { CATEGORY_CONFIG } from '../utils/playerUtils';
import { Radio, User, Eye, Clock, XCircle, Sparkles, AlertCircle } from 'lucide-react';

export default function AuctionScreen({ auctionState }) {
  const [isMobile, setIsMobile] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const {
    stage,
    currentCategoryKey,
    currentCategoryConfig,
    selectCategory,
    selectedPlayer,
    enteredNumber,
    setEnteredNumber,
    errorMessage,
    submitPlayerNumber,
    markPlayerSold,
    markPlayerUnsold,
    startUnsoldRound,
    resetAuction,
    stats,
    activeTab,
    setActiveTab,
    teamsWithStats,
    globalTeamStats,
    isAdmin,
    openAssignTeamModal,
    deletePlayerPurchase,
    selectedTeamIdForView,
    setSelectedTeamIdForView,
    teamAssignments,
    justSoldPlayer,
    currentPlayerData,
    unsoldPlayers,
    playerStatuses,
    auctionHistory
  } = auctionState;

  // Handle click on a team name from JustSold, LiveAuctionList, or TeamStatusPanel
  const handleSelectTeamByName = (teamName) => {
    const foundTeam = teamsWithStats.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase() || t.id === teamName
    );
    if (foundTeam) {
      setSelectedTeamIdForView(foundTeam.id);
      setActiveTab('TEAMS');
    }
  };

  // Render Teams Dashboard View
  if (activeTab === 'TEAMS') {
    return (
      <TeamsDashboard
        teamsWithStats={teamsWithStats}
        globalTeamStats={globalTeamStats}
        stats={stats}
        isAdmin={isAdmin}
        onOpenAssignModal={openAssignTeamModal}
        onEditPlayer={(player) => openAssignTeamModal(player)}
        onDeletePlayer={(playerId) => deletePlayerPurchase(playerId)}
        selectedTeamIdForView={selectedTeamIdForView}
        setSelectedTeamIdForView={setSelectedTeamIdForView}
      />
    );
  }

  if (stage === 'FINAL_COMPLETED') {
    return (
      <FinalScreen
        onResetAuction={resetAuction}
        stats={stats}
        globalTeamStats={globalTeamStats}
        teamsWithStats={teamsWithStats}
        isAdmin={isAdmin}
      />
    );
  }

  const isUnsoldRound = stage === 'UNSOLD_ROUND';
  const currentAssignment = selectedPlayer ? teamAssignments[selectedPlayer.id] : null;

  // =========================================================
  // USER MODE: Live Auction Viewer (NO search, NO controls)
  // =========================================================
  if (!isAdmin) {
    // Dedicated Mobile View for phones and small screens
    if (isMobile) {
      return (
        <MobileUserView
          auctionState={auctionState}
          onSelectTeam={handleSelectTeamByName}
        />
      );
    }
    const cpd = currentPlayerData;
    const categoryConfig = cpd ? (CATEGORY_CONFIG[cpd.category] || currentCategoryConfig) : currentCategoryConfig;

    return (
      <div className="flex flex-col min-h-[calc(100vh-65px)] stadium-bg">
        {/* Category Navigation & Broadcast Statistics */}
        <CategoryProgress
          currentCategoryKey={currentCategoryKey}
          selectCategory={selectCategory}
          stats={stats}
          stage={stage}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-8">
          {stage === 'MAIN_COMPLETED' ? (
            <CategoryComplete
              onStartUnsoldRound={() => {}} // User cannot start unsold round
              stats={stats}
              isAdmin={false}
            />
          ) : (
            <>
              {/* Stage Sub-Banner */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                    🔴 LIVE AUCTION STAGE
                  </span>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-wider flex items-center justify-center space-x-3">
                  {isUnsoldRound ? (
                    <>
                      <span className="text-rose-500">🔴</span>
                      <span className="text-gradient-gold">UNSOLD ROUND - {currentCategoryConfig.displayName}</span>
                    </>
                  ) : (
                    <>
                      <span>{currentCategoryConfig.emoji}</span>
                      <span>{currentCategoryConfig.displayName} AUCTION</span>
                    </>
                  )}
                </h2>
              </div>

              {/* Current Hero Player Display for Viewer */}
              {cpd ? (
                <div className="w-full max-w-3xl mx-auto space-y-4 animate-scale-up">
                  {/* Status Banner */}
                  <div className="flex items-center justify-center">
                    <div className={`px-5 py-2 rounded-2xl border-2 text-sm font-black tracking-widest uppercase shadow-lg ${
                      cpd.status === 'BIDDING' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 animate-pulse' :
                      cpd.status === 'SOLD' || cpd.status === 'ASSIGNED' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-sold-glow' :
                      cpd.status === 'UNSOLD' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-unsold-pulse' :
                      'bg-gray-800 border-gray-700 text-gray-400'
                    }`}>
                      {cpd.status === 'BIDDING' && '🟡 BIDDING IN PROGRESS'}
                      {cpd.status === 'SOLD' && '🟢 SOLD'}
                      {cpd.status === 'ASSIGNED' && `🟢 SOLD TO ${cpd.teamName}`}
                      {cpd.status === 'UNSOLD' && '🔴 UNSOLD'}
                    </div>
                  </div>

                  {/* Player Identification Banner */}
                  <div className="flex flex-wrap items-center justify-center gap-3 px-6 py-2.5 rounded-2xl glass-panel border border-amber-500/40 shadow-xl">
                    <span className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
                      <span>{categoryConfig.emoji}</span>
                      <span>{categoryConfig.displayName}</span>
                    </span>
                    <span className="text-gray-600 font-extrabold">•</span>
                    <div className="text-white font-display font-black text-xl sm:text-3xl tracking-wider">
                      PLAYER #{cpd.number}
                    </div>
                  </div>

                  {/* Hero Original Player Card Container */}
                  <div className="w-full relative hero-card-frame rounded-3xl p-3 sm:p-5 flex items-center justify-center min-h-[460px] lg:min-h-[580px] overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <img
                      src={cpd.path}
                      alt={`Player #${cpd.number}`}
                      className="w-full max-h-[72vh] object-contain rounded-2xl relative z-10 shadow-2xl"
                    />
                  </div>

                  {/* Sold Info Celebration Banner */}
                  {cpd.status === 'ASSIGNED' && (
                    <div className="w-full bg-gradient-to-r from-[#0b1528] via-[#06241a] to-[#0b1528] border-2 border-emerald-500/50 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(16,185,129,0.25)] animate-scale-up space-y-2">
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        🔥 OFFICIALLY SOLD
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white font-black text-xl">
                        {cpd.playerName && <span>{cpd.playerName}</span>}
                        <span className="hidden sm:inline text-gray-500">→</span>
                        <span className="text-amber-400 font-display text-2xl">{cpd.teamName}</span>
                        <span className="hidden sm:inline text-gray-500">•</span>
                        <span className="text-emerald-300 font-mono text-2xl">{cpd.boughtPrice?.toLocaleString()} POINTS</span>
                      </div>
                    </div>
                  )}

                  {/* Viewer Notice */}
                  <div className="w-full p-3 rounded-2xl bg-[#090e1c]/80 border border-gray-800 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>LIVE VIEWER MODE — Watching official auction broadcast</span>
                  </div>
                </div>
              ) : (
                /* No player currently active on stage */
                <div className="w-full max-w-3xl mx-auto min-h-[460px] lg:min-h-[560px] glass-panel rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-5 relative overflow-hidden">
                  <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="w-24 h-24 rounded-3xl bg-[#0b1122] border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner relative z-10">
                    <Radio className="w-12 h-12 text-amber-500/60 animate-pulse" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-xs font-black tracking-widest uppercase">
                      ⚪ WAITING FOR NEXT PLAYER
                    </div>
                    <h3 className="font-display font-black text-white text-xl sm:text-2xl uppercase tracking-wider">
                      WAITING FOR AUCTION TO COMMENCE
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-sm mx-auto">
                      THE AUCTIONEER WILL REVEAL A PLAYER CARD SHORTLY. STAY TUNED FOR LIVE BIDDING.
                    </p>
                  </div>
                </div>
              )}

              {/* 🔥 JUST SOLD Featured Highlight */}
              {justSoldPlayer && (
                <JustSoldHighlight
                  justSoldPlayer={justSoldPlayer}
                  onSelectTeam={handleSelectTeamByName}
                />
              )}

              {/* 🛡️ TEAM CAPACITY BOARD */}
              <TeamStatusPanel
                teamsWithStats={teamsWithStats}
                onSelectTeam={handleSelectTeamByName}
              />

              {/* 🔴 PERSISTENT UNSOLD PLAYERS SECTION */}
              {unsoldPlayers.length > 0 && (
                <div className="w-full max-w-5xl mx-auto space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-gray-800 pb-3">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-xl font-black tracking-wide text-white uppercase font-display">
                      UNSOLD PLAYERS WAITING ({unsoldPlayers.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {unsoldPlayers.map((p) => (
                      <div key={p.id} className="bg-[#0b1020]/90 border border-rose-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-md">
                        <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-black text-sm">
                          #{p.number}
                        </span>
                        <div>
                          <span className="text-xs font-black text-gray-200 uppercase block truncate">
                            {CATEGORY_CONFIG[p.category]?.singularName || p.category}
                          </span>
                        </div>
                        <span className="ml-auto text-[10px] font-black text-rose-400 uppercase">🔴 UNSOLD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔥 LIVE AUCTION TIMELINE & RESULTS */}
              <LiveAuctionList
                teamAssignments={teamAssignments}
                onSelectTeam={handleSelectTeamByName}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  // =========================================================
  // ADMIN MODE: Full Auction Controls
  // =========================================================
  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] stadium-bg">
      {/* Category Navigation & Broadcast Statistics */}
      <CategoryProgress
        currentCategoryKey={currentCategoryKey}
        selectCategory={selectCategory}
        stats={stats}
        stage={stage}
      />

      {/* Main Live Auction Work Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-8">
        {stage === 'MAIN_COMPLETED' ? (
          <CategoryComplete
            onStartUnsoldRound={startUnsoldRound}
            stats={stats}
            isAdmin={true}
          />
        ) : (
          <>
            {/* Category Header Banner */}
            <div className="text-center space-y-1.5 animate-fade-in">
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-wider flex items-center justify-center space-x-3">
                {isUnsoldRound ? (
                  <>
                    <span className="text-rose-500">🔴</span>
                    <span className="text-gradient-gold">UNSOLD ROUND - {currentCategoryConfig.displayName}</span>
                  </>
                ) : (
                  <>
                    <span>{currentCategoryConfig.emoji}</span>
                    <span>{currentCategoryConfig.displayName} AUCTION</span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm font-black text-amber-400/80 uppercase tracking-widest">
                {isUnsoldRound
                  ? `ENTER PLAYER NUMBER TO DISPLAY UNSOLD ${currentCategoryConfig.singularName} CARD`
                  : `ENTER PLAYER NUMBER TO DISPLAY ${currentCategoryConfig.singularName} CARD`}
              </p>
            </div>

            {/* Player Input Area (Admin Only) */}
            <PlayerInput
              enteredNumber={enteredNumber}
              setEnteredNumber={setEnteredNumber}
              onSubmit={() => submitPlayerNumber()}
              errorMessage={errorMessage}
              disabled={false}
            />

            {/* Hero Player Card Display with SOLD & UNSOLD & ASSIGN TEAM Buttons */}
            <PlayerCard
              selectedPlayer={selectedPlayer}
              currentCategoryConfig={currentCategoryConfig}
              onMarkSold={markPlayerSold}
              onMarkUnsold={markPlayerUnsold}
              teamAssignment={currentAssignment}
              onOpenAssignTeamModal={openAssignTeamModal}
              isAdmin={isAdmin}
              status={currentPlayerData?.status || 'BIDDING'}
            />

            {/* 🔥 JUST SOLD Featured Section */}
            {justSoldPlayer && (
              <JustSoldHighlight
                justSoldPlayer={justSoldPlayer}
                onSelectTeam={handleSelectTeamByName}
              />
            )}

            {/* 🛡️ TEAM CAPACITY BOARD */}
            <TeamStatusPanel
              teamsWithStats={teamsWithStats}
              onSelectTeam={handleSelectTeamByName}
            />

            {/* 🔴 PERSISTENT UNSOLD PLAYERS SECTION */}
            {unsoldPlayers.length > 0 && (
              <div className="w-full max-w-5xl mx-auto space-y-4">
                <div className="flex items-center gap-2.5 border-b border-gray-800 pb-3">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-xl font-black tracking-wide text-white uppercase font-display">
                    UNSOLD PLAYERS WAITING ({unsoldPlayers.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {unsoldPlayers.map((p) => (
                    <div key={p.id} className="bg-[#0b1020]/90 border border-rose-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-md">
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-black text-sm">
                        #{p.number}
                      </span>
                      <div>
                        <span className="text-xs font-black text-gray-200 uppercase block truncate">
                          {CATEGORY_CONFIG[p.category]?.singularName || p.category}
                        </span>
                      </div>
                      <span className="ml-auto text-[10px] font-black text-rose-400 uppercase">🔴 UNSOLD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 LIVE AUCTION RESULTS / FEED */}
            <LiveAuctionList
              teamAssignments={teamAssignments}
              onSelectTeam={handleSelectTeamByName}
            />
          </>
        )}
      </main>
    </div>
  );
}
