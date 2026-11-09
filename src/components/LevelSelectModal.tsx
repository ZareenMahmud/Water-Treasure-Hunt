import React from 'react';
import { X, Lock, Play, Compass } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { sound } from '../game/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  maxUnlockedLevel: number;
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  maxUnlockedLevel,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans text-white">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-righteous text-2xl sm:text-3xl text-cyan-300">
              SELECT EXPEDITION LEVEL
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Progress through the ocean depths to unlock legendary waters!
            </p>
          </div>
        </div>

        {/* Level List */}
        <div className="space-y-3.5">
          {LEVELS.map((lvl, index) => {
            const isUnlocked = lvl.number <= maxUnlockedLevel;

            return (
              <div
                key={lvl.number}
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-950/90 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Level Number Pill */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-chakra font-bold text-lg shrink-0 ${
                      isUnlocked
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? lvl.number : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-righteous text-lg text-slate-100">
                        Level {lvl.number}: {lvl.name}
                      </h3>
                      {lvl.number === 5 && (
                        <span className="text-[10px] font-chakra font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          BOSS LEVEL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                      {lvl.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2">
                      {lvl.description}
                    </p>
                  </div>
                </div>

                {/* Dive Button */}
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    sound.userGesture();
                    sound.playClick();
                    onSelectLevel(index);
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-righteous text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:scale-102 active:scale-98'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>DIVE</span>
                    </>
                  ) : (
                    <span>LOCKED</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
