import React from 'react';
import { Trophy, RotateCcw, Home, Sparkles, Star } from 'lucide-react';
import { GameStats } from '../game/types';
import { sound } from '../game/audio';

interface VictoryModalProps {
  isOpen: boolean;
  stats: GameStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  stats,
  onPlayAgain,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(stats.timePlayedSeconds / 60);
  const seconds = Math.floor(stats.timePlayedSeconds % 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center text-center text-white font-sans relative overflow-hidden">
        {/* Divine Golden Ambient Beams */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-400/30 blur-[100px] pointer-events-none rounded-full" />

        {/* Floating Confetti / Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xl animate-bounce"
              style={{
                left: `${(i * 18) % 100}%`,
                top: `${(i * 24) % 80}%`,
                animationDuration: `${2 + (i % 3)}s`,
                animationDelay: `${(i * 0.2) % 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Golden Trophy Emblem */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_30px_rgba(251,191,36,0.8)] mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Congratulatory Header */}
        <div className="flex items-center gap-1.5 text-amber-300 font-chakra font-bold text-xs tracking-widest uppercase mb-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>LEGENDARY EXPEDITION COMPLETE</span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>

        <h2 className="font-righteous text-3xl sm:text-5xl font-bold tracking-wide animate-gold-shimmer mb-3">
          VICTORY!
        </h2>

        <p className="text-amber-200/90 text-sm sm:text-base max-w-md mx-auto mb-6 font-medium leading-relaxed">
          Congratulations! You have discovered the legendary deep sea treasure and conquered the Megalodon!
        </p>

        {/* Performance Scorecard */}
        <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 bg-slate-900/60 rounded-xl">
            <span className="text-[10px] text-amber-300/80 font-semibold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Final Score
            </span>
            <span className="font-chakra text-2xl font-bold text-amber-300 mt-1">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center p-2 bg-slate-900/60 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Total Treasures
            </span>
            <span className="font-chakra text-xl font-bold text-yellow-300 mt-1">
              {stats.totalTreasuresAllTime} items
            </span>
          </div>

          <div className="flex flex-col items-center p-2 bg-slate-900/60 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Dive Duration
            </span>
            <span className="font-chakra text-xl font-bold text-slate-200 mt-1">
              {minutes}m {seconds}s
            </span>
          </div>
        </div>

        {/* Diver Master Rank */}
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/50 py-2.5 px-4 rounded-xl text-xs font-righteous text-amber-200 mb-6 flex items-center justify-center gap-2">
          <span>👑 AWARDED TITLE:</span>
          <span className="text-amber-300 font-bold uppercase tracking-wider">
            LEGENDARY OCEAN CONQUEROR
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-righteous text-base font-bold shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-righteous text-sm transition-all cursor-pointer border border-slate-700"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
