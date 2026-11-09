import React from 'react';
import { RotateCcw, Home, Sparkles, Clock, MapPin, Skull } from 'lucide-react';
import { GameStats } from '../game/types';
import { sound } from '../game/audio';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  onRetry,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(stats.timePlayedSeconds / 60);
  const seconds = Math.floor(stats.timePlayedSeconds % 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center text-white font-sans relative overflow-hidden">
        {/* Ambient Red Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-red-600/20 blur-[80px] pointer-events-none rounded-full" />

        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Skull className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="font-righteous text-3xl sm:text-4xl text-red-400 tracking-wider">
          EXPEDITION FAILED
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-6">
          The deep ocean has claimed another diver!
        </p>

        {/* Stats Summary Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Final Score
            </span>
            <span className="font-chakra text-xl font-bold text-amber-300 mt-1">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Highest Level
            </span>
            <span className="font-chakra text-xl font-bold text-cyan-300 mt-1">
              Level {stats.level}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Treasures Collected
            </span>
            <span className="font-chakra text-lg font-bold text-yellow-300 mt-1">
              {stats.totalTreasuresAllTime} items
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Time Dived
            </span>
            <span className="font-chakra text-lg font-bold text-slate-200 mt-1">
              {minutes}m {seconds}s
            </span>
          </div>
        </div>

        {/* High Score Notification */}
        {stats.score >= stats.highScore && stats.score > 0 && (
          <div className="w-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-righteous py-2 px-3 rounded-xl mb-6">
            🎉 NEW PERSONAL BEST SCORE!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              sound.playClick();
              onRetry();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-righteous text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            TRY AGAIN
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-righteous text-sm transition-all cursor-pointer border border-slate-700"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
