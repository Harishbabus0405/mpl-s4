import React, { useState } from 'react';

export default function AuctionHistoryModal({ isOpen, onClose, auctionHistory }) {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = auctionHistory.filter((item) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.playerNumber && item.playerNumber.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.role && item.role.toLowerCase().includes(q)) ||
      (item.teamName && item.teamName.toLowerCase().includes(q)) ||
      (item.action && item.action.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(6,182,212,0.25)] text-gray-100 relative">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400">
              📜
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                AUCTION AUDIT HISTORY LOG
              </h3>
              <p className="text-xs text-cyan-400/80 font-bold uppercase tracking-wider">
                Live Transaction Log ({auctionHistory.length} Entries)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Filter Input */}
        <div className="mb-6">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by Player Number, Name, Role, Team, or Action..."
            className="w-full bg-[#060913] border border-gray-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-[#060913]/60 border border-gray-800 rounded-2xl text-gray-400 text-sm">
            No history log transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#060913]">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="bg-gray-900/90 text-xs text-gray-400 uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Player #</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{item.timestamp}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.action === 'PURCHASE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.action === 'EDIT'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      #{item.playerNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                    <td className="px-4 py-3 text-gray-300">{item.role}</td>
                    <td className="px-4 py-3 text-cyan-300 font-medium">{item.teamName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-emerald-400">
                      {item.price ? `${item.price.toLocaleString()} Pts` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-sm font-semibold text-gray-300 transition-all"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
