import React, { useRef, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';

export default function PlayerInput({
  enteredNumber,
  setEnteredNumber,
  onSubmit,
  errorMessage,
  disabled
}) {
  const inputRef = useRef(null);

  // Auto-focus input field whenever enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit();
    // Keep focus on input after submit
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="player-number-input" className="block text-xs font-black uppercase tracking-widest text-center text-amber-400/90">
          ENTER PLAYER NUMBER
        </label>

        <div className="relative flex items-center shadow-2xl">
          <div className="absolute left-4 pointer-events-none text-gray-500 flex items-center">
            <Search className="w-6 h-6 text-amber-500/70" />
          </div>

          <input
            id="player-number-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={enteredNumber}
            onChange={(e) => setEnteredNumber(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 75"
            className="w-full pl-13 pr-40 py-4 bg-gray-950/90 border-2 border-amber-500/40 focus:border-amber-400 text-white placeholder-gray-600 font-display font-black text-2xl lg:text-3xl tracking-widest text-center rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={disabled}
            className="absolute right-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-black text-xs lg:text-sm tracking-wider uppercase flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>SHOW CARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Error / Warning Alert Banner */}
      {errorMessage && (
        <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 animate-fade-in text-xs font-bold tracking-wide shadow-lg justify-center">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="uppercase">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
