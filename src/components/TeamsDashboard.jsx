import React, { useState } from 'react';
import { Lock, Users, Download, Trophy, ChevronRight, Search, Shield, Wallet } from 'lucide-react';
import { MAX_SQUAD_SIZE, downloadTeamCSV } from '../utils/teamData';

export default function TeamsDashboard({
  teamsWithStats,
  globalTeamStats,
  stats,
  isAdmin,
  onOpenAssignModal,
  onEditPlayer,
  onDeletePlayer,
  selectedTeamIdForView,
  setSelectedTeamIdForView
}) {
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [deleteConfirmPlayerId, setDeleteConfirmPlayerId] = useState(null);

  // Filter teams based on search query
  const filteredTeams = teamsWithStats.filter((team) => {
    const q = teamSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return team.name.toLowerCase().includes(q) || team.owner.toLowerCase().includes(q);
  });

  // Active selected team details
  const activeTeam = teamsWithStats.find((t) => t.id === selectedTeamIdForView);

  // Filtered players across all teams for global player search
  const allAssignedPlayers = teamsWithStats.flatMap((t) =>
    t.players.map((p) => ({ ...p, teamName: t.name, teamOwner: t.owner }))
  );

  const filteredGlobalPlayers = allAssignedPlayers.filter((p) => {
    const q = playerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.playerNumber.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q)
    );
  });

  const handleDownloadCSV = (team) => {
    downloadTeamCSV(team);
  };

  const handleDownloadAllCSVs = () => {
    teamsWithStats.forEach((team) => {
      if (team.playerCount > 0) {
        setTimeout(() => downloadTeamCSV(team), 100);
      }
    });
  };

  // Team capacity visual helpers
  const getCapacityColor = (team) => {
    if (team.isFull) return 'text-red-400';
    if (team.playerCount >= MAX_SQUAD_SIZE - 1) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getCapacityBg = (team) => {
    if (team.isFull) return 'bg-red-500';
    if (team.playerCount >= MAX_SQUAD_SIZE - 1) return 'bg-yellow-500';
    return 'bg-gradient-to-r from-emerald-500 to-teal-500';
  };

  const getCapacityBadge = (team) => {
    if (team.isFull) return { text: '🔒 FULL', bg: 'bg-red-500/15 border-red-500/40 text-red-400' };
    if (team.playerCount >= MAX_SQUAD_SIZE - 1) return { text: `🟡 ${team.slotsLeft} SLOT LEFT`, bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400' };
    return { text: `🟢 ${team.slotsLeft} SLOTS LEFT`, bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Top Global Statistics Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-800 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h2 className="text-2xl font-black tracking-wide text-white uppercase">
                  MPL S4 TEAMS DASHBOARD
                </h2>
                <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                  16 Franchises • 25,000 Points Each • Max {MAX_SQUAD_SIZE} Players Per Team
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#060913] border border-gray-800 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Purse</p>
              <p className="text-lg font-black font-mono text-amber-400">
                {globalTeamStats.totalBudget.toLocaleString()} Pts
              </p>
            </div>
            <div className="bg-[#060913] border border-gray-800 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Spent</p>
              <p className="text-lg font-black font-mono text-emerald-400">
                {globalTeamStats.totalSpent.toLocaleString()} Pts
              </p>
            </div>
            <div className="bg-[#060913] border border-gray-800 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Remaining</p>
              <p className="text-lg font-black font-mono text-cyan-400">
                {globalTeamStats.totalRemaining.toLocaleString()} Pts
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-[#060913]/60 border border-gray-800 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 font-bold block uppercase">Teams</span>
            <span className="text-xl font-black text-white">16</span>
          </div>
          <div className="bg-[#060913]/60 border border-gray-800 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 font-bold block uppercase">Players Sold</span>
            <span className="text-xl font-black text-emerald-400">{stats.totalSold}</span>
          </div>
          <div className="bg-[#060913]/60 border border-gray-800 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 font-bold block uppercase">Unsold Players</span>
            <span className="text-xl font-black text-rose-400">{stats.totalUnsold}</span>
          </div>
          <div className="bg-[#060913]/60 border border-gray-800 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 font-bold block uppercase">Remaining Pool</span>
            <span className="text-xl font-black text-amber-400">{stats.totalRemainingMain}</span>
          </div>
          <div className="bg-[#060913]/60 border border-gray-800 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 font-bold block uppercase">Teams Full</span>
            <span className="text-xl font-black text-red-400">{globalTeamStats.fullTeams} / 16</span>
          </div>
        </div>
      </div>

      {/* Search Bar Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" /> Search Team or Owner
          </label>
          <input
            type="text"
            value={teamSearchQuery}
            onChange={(e) => setTeamSearchQuery(e.target.value)}
            placeholder="e.g. SURYA or MADATHUR CSK..."
            className="w-full bg-[#0f172a] border border-gray-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-400" /> Search Player across Teams
          </label>
          <input
            type="text"
            value={playerSearchQuery}
            onChange={(e) => setPlayerSearchQuery(e.target.value)}
            placeholder="Search Player #, Name, Role, or Team..."
            className="w-full bg-[#0f172a] border border-gray-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Global Player Search Results View (If player search active) */}
      {playerSearchQuery.trim() && (
        <div className="bg-[#0f172a] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <Search className="w-5 h-5" /> PLAYER SEARCH RESULTS ({filteredGlobalPlayers.length})
          </h3>
          {filteredGlobalPlayers.length === 0 ? (
            <p className="text-sm text-gray-400">No players found matching "{playerSearchQuery}"</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-200">
                <thead className="bg-[#060913] text-xs text-gray-400 uppercase border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Player #</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredGlobalPlayers.map((p) => (
                    <tr key={p.playerId} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">#{p.playerNumber}</td>
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3 text-gray-300">{p.role}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{p.teamName}</td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-emerald-300">
                        {p.boughtPrice?.toLocaleString()} Pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin: Download All CSVs */}
      {isAdmin && globalTeamStats.totalSoldAssigned > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleDownloadAllCSVs}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD ALL TEAM CSVs
          </button>
        </div>
      )}

      {/* 16 Team Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-wide text-white uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> 16 MPL FRANCHISES
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            Showing {filteredTeams.length} of 16 Teams
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTeams.map((team) => {
            const pctSquad = Math.min(100, Math.round((team.playerCount / MAX_SQUAD_SIZE) * 100));
            const pctSpent = Math.min(100, Math.round((team.spentPoints / team.initialPoints) * 100));
            const badge = getCapacityBadge(team);

            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamIdForView(team.id)}
                className={`group cursor-pointer bg-gradient-to-b from-[#0f172a] to-[#0b1120] border rounded-2xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between ${
                  team.isFull ? 'border-red-500/40 hover:border-red-500/60' : 'border-gray-800 hover:border-amber-500/60'
                }`}
              >
                {/* Full Badge Overlay */}
                {team.isFull && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black flex items-center gap-1">
                      <Lock className="w-3 h-3" /> FULL
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between pr-14">
                    <div>
                      <h4 className="font-black text-white text-base leading-snug group-hover:text-amber-400 transition-colors">
                        {team.name}
                      </h4>
                      <p className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mt-0.5">
                        Owner: {team.owner}
                      </p>
                    </div>
                  </div>

                  {/* Squad Capacity Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Squad
                      </span>
                      <span className={`font-mono font-bold ${getCapacityColor(team)}`}>
                        {team.playerCount} / {MAX_SQUAD_SIZE}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCapacityBg(team)} transition-all duration-500 rounded-full`}
                        style={{ width: `${pctSquad}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Points Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Spent: {team.spentPoints.toLocaleString()}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Rem: {team.remainingPoints.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500 rounded-full"
                        style={{ width: `${pctSpent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400 group-hover:text-gray-200">
                  <span className="font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" /> View Squad
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Details Panel / Modal */}
      {activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(245,158,11,0.25)] text-gray-100 relative">
            <div className="flex items-start justify-between border-b border-gray-800 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase">{activeTeam.name}</h3>
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      OWNER: {activeTeam.owner}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamIdForView(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Team Status Badge */}
            <div className="flex items-center justify-center mb-6">
              {activeTeam.isFull ? (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/40 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                    <Lock className="w-5 h-5" />
                    <span className="text-lg font-black uppercase">🏆 SQUAD COMPLETE</span>
                  </div>
                  <span className="text-xs text-red-300 font-bold">{activeTeam.playerCount} / {MAX_SQUAD_SIZE} PLAYERS</span>
                </div>
              ) : (
                <div className={`px-6 py-3 rounded-2xl border-2 text-center ${
                  activeTeam.playerCount >= MAX_SQUAD_SIZE - 1
                    ? 'bg-yellow-500/10 border-yellow-500/40'
                    : 'bg-emerald-500/10 border-emerald-500/40'
                }`}>
                  <div className={`flex items-center justify-center gap-2 mb-1 ${
                    activeTeam.playerCount >= MAX_SQUAD_SIZE - 1 ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    <Users className="w-5 h-5" />
                    <span className="text-lg font-black uppercase">
                      {activeTeam.playerCount} / {MAX_SQUAD_SIZE} PLAYERS
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${
                    activeTeam.playerCount >= MAX_SQUAD_SIZE - 1 ? 'text-yellow-300' : 'text-emerald-300'
                  }`}>
                    {activeTeam.slotsLeft} {activeTeam.slotsLeft === 1 ? 'SLOT' : 'SLOTS'} REMAINING
                  </span>
                </div>
              )}
            </div>

            {/* Team Wallet Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#060913] border border-gray-800 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Initial Budget</span>
                <span className="text-lg font-black font-mono text-white">
                  {activeTeam.initialPoints?.toLocaleString() || '25,000'} Pts
                </span>
              </div>
              <div className="bg-[#060913] border border-gray-800 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Spent Points</span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {activeTeam.spentPoints.toLocaleString()} Pts
                </span>
              </div>
              <div className="bg-[#060913] border border-gray-800 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Remaining Points</span>
                <span className="text-lg font-black font-mono text-cyan-400">
                  {activeTeam.remainingPoints.toLocaleString()} Pts
                </span>
              </div>
              <div className="bg-[#060913] border border-gray-800 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Squad Size</span>
                <span className={`text-lg font-black font-mono ${getCapacityColor(activeTeam)}`}>
                  {activeTeam.playerCount} / {MAX_SQUAD_SIZE}
                </span>
              </div>
            </div>

            {/* Squad Capacity Bar */}
            <div className="mb-6 px-1">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400 font-bold uppercase">Squad Capacity</span>
                <span className={`font-mono font-bold ${getCapacityColor(activeTeam)}`}>
                  {activeTeam.playerCount} / {MAX_SQUAD_SIZE}
                </span>
              </div>
              <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getCapacityBg(activeTeam)} transition-all duration-700 rounded-full`}
                  style={{ width: `${Math.min(100, (activeTeam.playerCount / MAX_SQUAD_SIZE) * 100)}%` }}
                />
              </div>
            </div>

            {/* Current Team Squad Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="text-md font-bold text-white uppercase tracking-wider">
                  CURRENT TEAM SQUAD
                </h4>
                <div className="flex items-center gap-3">
                  {/* CSV Download Button */}
                  {activeTeam.playerCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadCSV(activeTeam); }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOWNLOAD {activeTeam.name}.csv
                    </button>
                  )}

                  {isAdmin && !activeTeam.isFull && (
                    <button
                      onClick={() => {
                        onOpenAssignModal({ teamId: activeTeam.id });
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all"
                    >
                      + ASSIGN PLAYER
                    </button>
                  )}
                </div>
              </div>

              {activeTeam.players.length === 0 ? (
                <div className="p-8 text-center bg-[#060913]/60 border border-gray-800 rounded-2xl text-gray-400 text-sm">
                  No players currently purchased for {activeTeam.name}.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#060913]">
                  <table className="w-full text-left text-sm text-gray-200">
                    <thead className="bg-gray-900/90 text-xs text-gray-400 uppercase border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Number</th>
                        <th className="px-4 py-3">Player Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-right">Buy Price</th>
                        {isAdmin && <th className="px-4 py-3 text-center">Admin Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {activeTeam.players.map((player, idx) => (
                        <tr key={player.playerId} className="hover:bg-gray-800/40">
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold text-amber-400">
                            #{player.playerNumber}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">{player.name}</td>
                          <td className="px-4 py-3 text-gray-300">{player.role}</td>
                          <td className="px-4 py-3 font-mono font-bold text-right text-emerald-400">
                            {player.boughtPrice?.toLocaleString()} Pts
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-center space-x-2">
                              <button
                                onClick={() => onEditPlayer(player)}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-semibold transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirmPlayerId(player.playerId)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
              <div className="flex gap-3">
                {activeTeam.playerCount > 0 && (
                  <button
                    onClick={() => handleDownloadCSV(activeTeam)}
                    className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-500/25 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedTeamIdForView(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-sm font-semibold text-gray-300 transition-all"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPlayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(244,63,94,0.3)] text-gray-100">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Player Removal</h3>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to remove this player from the team? The bought price points will be refunded to the team.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmPlayerId(null)}
                className="px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeletePlayer(deleteConfirmPlayerId);
                  setDeleteConfirmPlayerId(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs shadow-md"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
