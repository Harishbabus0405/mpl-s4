import React, { useState } from 'react';
import { Trophy, Clock, Search, Filter, ShieldCheck, Tag } from 'lucide-react';

export default function LiveAuctionList({
  teamAssignments,
  onSelectTeam
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'TIMELINE'

  // Reverse chronological list of assigned players
  const soldPlayersList = Object.values(teamAssignments).reverse();

  const filteredPlayers = soldPlayersList.filter((p) => {
    // Category Filter
    if (selectedCategory !== 'ALL') {
      const catLower = selectedCategory.toLowerCase();
      const roleLower = (p.role || '').toLowerCase();
      if (!roleLower.includes(catLower)) return false;
    }

    // Search Filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.playerNumber && String(p.playerNumber).toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q)) ||
      (p.teamName && p.teamName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase flex items-center gap-2.5 font-display">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">🔥</span>
            <span>LIVE AUCTION HISTORY ({soldPlayersList.length})</span>
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            Real-time feed of completed player acquisitions
          </p>
        </div>

        {/* View mode toggle & Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#060913] border border-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              CARDS
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                viewMode === 'TIMELINE'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              TIMELINE
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#060913] border border-gray-800 p-1 rounded-xl">
            {['ALL', 'Bowler', 'Batsman', 'All-Rounder', 'Keeper'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'ALL' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="w-full relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sold players by name, number, team, or role..."
          className="w-full bg-[#0a0f20]/90 border border-gray-800 focus:border-amber-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      {/* Empty State */}
      {filteredPlayers.length === 0 ? (
        <div className="p-12 text-center bg-[#070b16]/70 border border-gray-800 rounded-3xl text-gray-400 text-sm space-y-2">
          <p className="font-bold text-gray-300">
            {soldPlayersList.length === 0
              ? 'No players have been sold yet.'
              : 'No sold players match your current search/filter.'}
          </p>
          <p className="text-xs text-gray-500">
            {soldPlayersList.length === 0
              ? 'When players are auctioned and sold to a franchise, they will appear here live!'
              : 'Try clearing the search or switching the role category.'}
          </p>
        </div>
      ) : viewMode === 'TIMELINE' ? (
        /* Timeline Feed Layout */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-500/30 space-y-4 my-4">
          {filteredPlayers.map((player, idx) => (
            <div key={player.playerId || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-amber-400 border-4 border-[#070b16] group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

              <div className="bg-[#0b1020]/90 border border-gray-800/90 group-hover:border-amber-500/50 rounded-2xl p-4 shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-sm">
                    #{player.playerNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base">
                        {player.name}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                        {player.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {player.timestamp || 'Just now'}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold uppercase text-[11px]">🟢 SOLD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                  <button
                    onClick={() => onSelectTeam && onSelectTeam(player.teamName)}
                    className="text-xs sm:text-sm font-black text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{player.teamName}</span>
                  </button>
                  <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">
                    {player.boughtPrice?.toLocaleString()} PTS
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cards Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player, idx) => (
            <div
              key={player.playerId || idx}
              className="bg-gradient-to-b from-[#0e1428] to-[#070b16] border border-gray-800/90 hover:border-amber-500/50 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <div className="flex items-start justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm">
                    #{player.playerNumber}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-snug">
                      {player.name}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      🏏 {player.role}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {player.timestamp}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onSelectTeam && onSelectTeam(player.teamName)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider text-left flex items-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{player.teamName}</span>
                </button>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {player.boughtPrice?.toLocaleString()} Pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
