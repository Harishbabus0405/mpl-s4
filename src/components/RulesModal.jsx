import React from 'react';
import { rulesImage } from '../utils/assetUtils';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(245,158,11,0.25)] text-gray-100 relative flex flex-col items-center">
        <div className="w-full flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-xl font-extrabold tracking-wide text-white uppercase">
                MPL S4 RULES & REGULATIONS
              </h3>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Madathur Premier League Official Tournament Rules
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

        {rulesImage ? (
          <div className="w-full flex items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-[#060913]">
            <img
              src={rulesImage}
              alt="MPL S4 Rules and Regulations"
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Rules and Regulations asset not found.
          </div>
        )}

        <div className="w-full mt-4 pt-3 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-md transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
