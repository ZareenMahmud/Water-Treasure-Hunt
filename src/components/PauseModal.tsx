import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';

interface PauseModalProps {
  isOpen: boolean;
  isMuted: boolean;
  levelNumber: number;
  levelName: string;
  onResume: () => void;
  onRestartLevel: () => void;
  onMainMenu: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isMuted,
  levelNumber,
  levelName,
  onResume,
  onRestartLevel,
  onMainMenu,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center text-white font-sans">
        {/* Pause Badge */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl mb-4 text-cyan-300">
          ⏸️
        </div>

        <h2 className="font-righteous text-3xl text-cyan-300 tracking-wide">
          GAME PAUSED
        </h2>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Level {levelNumber}: {levelName}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-righteous text-sm font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME DIVE
          </button>

          {/* Restart Level */}
          <button
            onClick={() => {
              sound.playClick();
              onRestartLevel();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-righteous text-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            RESTART LEVEL
          </button>

          {/* Toggle Mute */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-righteous text-sm transition-all cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>UNMUTE SOUND</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>MUTE SOUND</span>
              </>
            )}
          </button>

          {/* Exit to Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-righteous text-sm transition-all cursor-pointer mt-2"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
