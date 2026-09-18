import React, { useState } from 'react';
import { logoImage } from '../utils/assetUtils';
import RulesModal from './RulesModal';
import { Shield, UserCheck, Lock, Play } from 'lucide-react';

export default function LandingPage({ onSelectUserMode, onSelectAdminMode }) {
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#040711] text-gray-100 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden font-sans antialiased">
      {/* Stadium Atmospheric Lighting Backgrounds */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/15 via-yellow-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            LIVE AUCTION EVENT 2026
          </span>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="px-4 py-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <span>📋</span> RULES & REGULATIONS
        </button>
      </header>

      {/* Main Center Stage Section */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 z-10 my-auto py-8">
        {/* MPL S4 Official Logo */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative p-4 bg-[#080d1a] border-2 border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex items-center justify-center max-w-xs sm:max-w-sm">
            {logoImage ? (
              <img
                src={logoImage}
                alt="MPL S4 Official Logo"
                className="w-48 sm:w-64 object-contain rounded-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-amber-400 font-extrabold text-2xl">
                MPL S4
              </div>
            )}
          </div>
        </div>

        {/* Tournament Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-xs sm:text-sm font-extrabold tracking-[0.3em] text-amber-400/90 uppercase">
            MADATHUR PREMIER LEAGUE
          </h2>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-display leading-tight">
            SEASON 4 <span className="text-gradient-gold">AUCTION 2026</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto font-medium">
            16 Franchises • 25,000 Points Wallet • Live Player Bidding Dashboard
          </p>
        </div>

        {/* Action Mode Buttons Section */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {/* Admin Mode Button */}
          <button
            onClick={onSelectAdminMode}
            className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-200 active:scale-95 cursor-pointer border border-yellow-300/50"
          >
            <Lock className="w-4 h-4 text-slate-950" />
            <span>🔐 ADMIN MODE</span>
          </button>

          {/* User Mode Button */}
          <button
            onClick={onSelectUserMode}
            className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 border border-gray-700/80 hover:border-amber-500/50 shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>👤 USER MODE</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-500">
          User Mode allows instant view-only public access without login.
        </p>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl text-center py-4 text-xs text-gray-500 border-t border-gray-800/60 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Madathur Premier League Season 4 © 2026</span>
        <span>Official Live Player Auction Display System</span>
      </footer>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
