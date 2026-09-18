import React, { useState, useEffect } from 'react';
import { Lock, Users, AlertTriangle } from 'lucide-react';
import { MAX_SQUAD_SIZE } from '../utils/teamData';

export default function AddPlayerModal({ isOpen, onClose, initialData, teamsWithStats, onSubmit }) {
  const [name, setName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [role, setRole] = useState('Batsman');
  const [teamId, setTeamId] = useState('');
  const [boughtPrice, setBoughtPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || `Player #${initialData.playerNumber}`);
      setPlayerNumber(initialData.playerNumber || '');
      setRole(initialData.role || initialData.category || 'Batsman');
      // Default to first available (non-full) team
      const firstAvailable = teamsWithStats.find((t) => !t.isFull);
      setTeamId(initialData.teamId || firstAvailable?.id || (teamsWithStats[0]?.id || ''));
      setBoughtPrice(initialData.boughtPrice !== undefined && initialData.boughtPrice !== null ? String(initialData.boughtPrice) : '');
      setError('');
    }
  }, [initialData, teamsWithStats]);

  if (!isOpen || !initialData) return null;

  const selectedTeam = teamsWithStats.find((t) => t.id === teamId || t.name === teamId);

  // Compute available points considering refund if editing same team
  const isSameTeam = initialData.isEdit && initialData.teamId === selectedTeam?.id;
  const availablePoints = selectedTeam
    ? isSameTeam
      ? selectedTeam.remainingPoints + (Number(initialData.boughtPrice) || 0)
      : selectedTeam.remainingPoints
    : 0;

  // Squad capacity check
  const isTeamFull = selectedTeam ? (!isSameTeam && selectedTeam.isFull) : false;

  const priceNum = Number(boughtPrice);
  const isPriceValid = !isNaN(priceNum) && priceNum > 0;
  const isBudgetValid = selectedTeam ? availablePoints >= priceNum : false;
  const canSubmit = isPriceValid && isBudgetValid && !isTeamFull;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isTeamFull) {
      setError(`TEAM FULL! ${selectedTeam?.name} ALREADY HAS ${MAX_SQUAD_SIZE} PLAYERS. CANNOT ASSIGN MORE PLAYERS.`);
      return;
    }

    if (!isPriceValid) {
      setError('BOUGHT PRICE MUST BE GREATER THAN 0');
      return;
    }

    if (!isBudgetValid) {
      setError(`INSUFFICIENT TEAM POINTS! ${selectedTeam?.name} HAS ONLY ${availablePoints.toLocaleString()} POINTS REMAINING.`);
      return;
    }

    const result = onSubmit({
      playerId: initialData.playerId,
      playerNumber,
      name,
      role,
      teamId: selectedTeam.id,
      boughtPrice: priceNum
    });

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(16,185,129,0.25)] text-gray-100 relative">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/40 text-emerald-400">
              🏏
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide text-white uppercase">
                {initialData.isEdit ? 'EDIT PLAYER PURCHASE' : 'ADD PLAYER TO TEAM'}
              </h3>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wider">
                Assign Player #{playerNumber} to MPL S4 Franchise
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Player Number
              </label>
              <input
                type="text"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value)}
                required
                className="w-full bg-[#060913] border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Player Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#060913] border border-gray-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Keeper">Keeper</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              required
              className="w-full bg-[#060913] border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Select Purchasing Team (16 MPL Teams)
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-[#060913] border border-emerald-500/50 focus:border-emerald-400 rounded-xl px-3 py-3 text-sm text-white font-medium focus:outline-none"
            >
              {teamsWithStats.map((team) => {
                const full = !isSameTeam && team.isFull && team.id !== initialData.teamId;
                return (
                  <option key={team.id} value={team.id} disabled={full}>
                    {team.name} ({team.owner}) — {team.playerCount}/{MAX_SQUAD_SIZE} Players — Rem: {team.remainingPoints.toLocaleString()} Pts
                    {full ? ' 🔒 FULL' : ` 🟢 ${team.slotsLeft} SLOTS`}
                  </option>
                );
              })}
            </select>

            {/* Team Capacity & Points Info */}
            {selectedTeam && (
              <div className="mt-2 space-y-2">
                {/* Squad Capacity Bar */}
                <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Squad Capacity
                    </span>
                    <span className={`font-mono font-bold ${
                      isTeamFull ? 'text-red-400' : selectedTeam.playerCount >= MAX_SQUAD_SIZE - 1 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {selectedTeam.playerCount} / {MAX_SQUAD_SIZE}
                      {isTeamFull && <Lock className="w-3 h-3 inline ml-1" />}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isTeamFull ? 'bg-red-500' : selectedTeam.playerCount >= MAX_SQUAD_SIZE - 1 ? 'bg-yellow-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, (selectedTeam.playerCount / MAX_SQUAD_SIZE) * 100)}%` }}
                    />
                  </div>
                  {isTeamFull && (
                    <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> TEAM FULL — CANNOT ASSIGN MORE PLAYERS
                    </p>
                  )}
                  {!isTeamFull && selectedTeam.slotsLeft > 0 && (
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                      {selectedTeam.slotsLeft} {selectedTeam.slotsLeft === 1 ? 'SLOT' : 'SLOTS'} LEFT
                    </p>
                  )}
                </div>

                {/* Points Info */}
                <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs flex justify-between items-center">
                  <span className="text-gray-400">Team Available Points:</span>
                  <span className={`font-mono font-bold ${availablePoints < priceNum ? 'text-red-400' : 'text-emerald-400'}`}>
                    {availablePoints.toLocaleString()} Points
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Bought / Sold Price (Points)
            </label>
            <input
              type="number"
              min="1"
              max={availablePoints}
              value={boughtPrice}
              onChange={(e) => setBoughtPrice(e.target.value)}
              placeholder="e.g. 5000"
              required
              className="w-full bg-[#060913] border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold placeholder-gray-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-sm font-semibold text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {initialData.isEdit ? 'SAVE CHANGES' : 'ADD PLAYER TO TEAM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
