import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLogin }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset fields when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setUserId('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = onLogin(userId, password);
    if (!res.success) {
      setError(res.message || 'Invalid User ID or Password');
    } else {
      setUserId('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.25)] text-gray-100 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/40 text-amber-400 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black tracking-wide text-white uppercase">
                ADMIN LOGIN
              </h3>
              <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                MPL S4 Auction Controller
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
            title="Close Login Modal"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              required
              autoComplete="username"
              className="w-full bg-[#060913] border border-gray-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              autoComplete="current-password"
              className="w-full bg-[#060913] border border-gray-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-xs font-bold text-gray-300 transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 cursor-pointer"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
