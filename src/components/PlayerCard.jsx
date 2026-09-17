import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/playerUtils';

export default function PlayerCard({ selectedPlayer, currentCategoryConfig }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [selectedPlayer?.id]);

  if (!selectedPlayer) {
    return (
      <div className="w-full max-w-xl mx-auto min-h-[420px] lg:min-h-[500px] glass-panel rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center text-gray-600 shadow-inner">
          <User className="w-10 h-10 text-gray-600" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-gray-400 text-lg uppercase tracking-wider">
            NO PLAYER SELECTED
          </h3>
          <p className="text-xs text-gray-500 font-medium max-w-xs">
            ENTER A PLAYER NUMBER ABOVE AND CLICK &quot;SHOW CARD&quot; TO REVEAL PLAYER CARD
          </p>
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[selectedPlayer.category] || currentCategoryConfig;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-3 animate-scale-up">
      {/* Player Header Banner */}
      <div className="flex items-center space-x-3 px-5 py-2 rounded-2xl glass-panel border border-amber-500/30 shadow-lg">
        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">
          {categoryConfig.singularName}
        </span>
        <span className="text-gray-600 font-extrabold">•</span>
        <div className="flex items-center space-x-1 text-amber-400 font-display font-black text-xl lg:text-2xl tracking-widest">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>PLAYER #{selectedPlayer.number}</span>
        </div>
      </div>

      {/* Main Original Player Card Container */}
      <div className="w-full relative glass-panel rounded-3xl p-3 sm:p-4 border-2 border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center min-h-[420px] lg:min-h-[520px]">
        {/* Loading Spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-gray-950/60 rounded-3xl backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              LOADING PLAYER CARD...
            </span>
          </div>
        )}

        {/* Fallback Error Display */}
        {imageError ? (
          <div className="w-full h-96 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-rose-950/20 rounded-2xl border border-rose-500/30">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <h4 className="font-display font-bold text-rose-400 text-base uppercase tracking-wider">
              PLAYER CARD COULD NOT BE LOADED
            </h4>
            <p className="text-xs text-gray-400 font-mono">
              PLAYER #{selectedPlayer.number} ({selectedPlayer.fileName})
            </p>
          </div>
        ) : (
          /* Exact Original Card Displayed Without Modification */
          <img
            src={selectedPlayer.path}
            alt={`Player #${selectedPlayer.number}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error(`Failed to load player card image path: ${selectedPlayer.path}`);
              setImageError(true);
            }}
            className={`w-full max-h-[70vh] object-contain rounded-2xl transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        )}
      </div>
    </div>
  );
}
