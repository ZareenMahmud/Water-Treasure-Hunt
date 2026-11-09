import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { sound } from '../game/audio';

interface VirtualControlsProps {
  onDirectionChange: (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void;
  onActivateShield: () => void;
  isShieldReady: boolean;
  isShieldActive: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionChange,
  onActivateShield,
  isShieldReady,
  isShieldActive,
}) => {
  const handleTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    sound.userGesture();
    onDirectionChange(dir, true);
  };

  const handleTouchEnd = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionChange(dir, false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex justify-between items-end p-4 sm:p-6 select-none z-30">
      {/* Virtual D-pad on Left */}
      <div className="relative w-36 h-36 pointer-events-auto bg-slate-950/60 backdrop-blur-md rounded-full border border-cyan-500/30 p-2 shadow-2xl flex items-center justify-center">
        {/* Up */}
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onMouseDown={handleTouchStart('up')}
          onMouseUp={handleTouchEnd('up')}
          onMouseLeave={handleTouchEnd('up')}
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-900/90 hover:bg-cyan-900/80 active:bg-cyan-600 rounded-xl border border-cyan-600/40 flex items-center justify-center text-cyan-300 shadow-md transition-transform active:scale-90 cursor-pointer"
          aria-label="Swim Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onMouseDown={handleTouchStart('down')}
          onMouseUp={handleTouchEnd('down')}
          onMouseLeave={handleTouchEnd('down')}
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-900/90 hover:bg-cyan-900/80 active:bg-cyan-600 rounded-xl border border-cyan-600/40 flex items-center justify-center text-cyan-300 shadow-md transition-transform active:scale-90 cursor-pointer"
          aria-label="Swim Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd('left')}
          onMouseLeave={handleTouchEnd('left')}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-900/90 hover:bg-cyan-900/80 active:bg-cyan-600 rounded-xl border border-cyan-600/40 flex items-center justify-center text-cyan-300 shadow-md transition-transform active:scale-90 cursor-pointer"
          aria-label="Swim Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd('right')}
          onMouseLeave={handleTouchEnd('right')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-900/90 hover:bg-cyan-900/80 active:bg-cyan-600 rounded-xl border border-cyan-600/40 flex items-center justify-center text-cyan-300 shadow-md transition-transform active:scale-90 cursor-pointer"
          aria-label="Swim Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Pad Hub */}
        <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-400/80" />
        </div>
      </div>

      {/* Virtual Action Button on Right: Bubble Shield */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5">
        <button
          onClick={(e) => {
            e.preventDefault();
            sound.userGesture();
            onActivateShield();
          }}
          disabled={!isShieldReady}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer ${
            isShieldActive
              ? 'bg-cyan-500 border-white text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.9)] animate-pulse'
              : isShieldReady
              ? 'bg-gradient-to-tr from-cyan-600 to-sky-400 border-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.7)]'
              : 'bg-slate-900/80 border-slate-700 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Bubble Shield"
        >
          <Shield className="w-8 h-8" />
        </button>
        <span className="text-[10px] font-righteous text-cyan-300 tracking-wider">
          SHIELD
        </span>
      </div>
    </div>
  );
};
