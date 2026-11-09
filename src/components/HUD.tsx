import React from 'react';
import { Heart, Shield, Volume2, VolumeX, Pause, HelpCircle, Compass, Sparkles } from 'lucide-react';
import { GameStats, PlayerDiver, LevelConfig } from '../game/types';
import { sound } from '../game/audio';

interface HUDProps {
  stats: GameStats;
  diver: PlayerDiver;
  level: LevelConfig;
  isOxygenWarning: boolean;
  onPause: () => void;
  onOpenHelp: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onActivateShield: () => void;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  diver,
  level,
  isOxygenWarning,
  onPause,
  onOpenHelp,
  onToggleMute,
  isMuted,
  onActivateShield,
  showTouchControls,
  onToggleTouchControls,
}) => {
  // Shield cooldown percentage
  const shieldCooldownFraction = Math.max(0, diver.shieldCooldownRemaining / diver.shieldMaxCooldown);
  const isShieldReady = diver.shieldCooldownRemaining <= 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top HUD Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Lives & Oxygen Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-4 py-2.5 shadow-xl pointer-events-auto">
            {/* Lives Hearts */}
            <div className="flex items-center gap-1.5 border-r border-slate-700/60 pr-3.5">
              {Array.from({ length: diver.maxLives }).map((_, idx) => {
                const hasLife = idx < diver.lives;
                return (
                  <Heart
                    key={idx}
                    className={`w-6 h-6 transition-all duration-300 ${
                      hasLife
                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100'
                        : 'text-slate-600 fill-slate-800 scale-90'
                    }`}
                  />
                );
              })}
            </div>

            {/* Oxygen Bar */}
            <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[180px]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-righteous tracking-wide flex items-center gap-1 text-cyan-300">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  OXYGEN
                </span>
                <span
                  className={`font-chakra font-bold text-xs sm:text-sm ${
                    isOxygenWarning ? 'text-red-400 animate-pulse' : 'text-cyan-200'
                  }`}
                >
                  {Math.round(diver.oxygen)}%
                </span>
              </div>
              <div className="w-full h-3 sm:h-3.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-cyan-800/50">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isOxygenWarning
                      ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-300'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, diver.oxygen))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: Level & Special Boss Progress */}
          <div className="hidden md:flex flex-col items-center bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-5 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-righteous text-sm">LEVEL {level.number}</span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-cyan-200 font-semibold text-sm">{level.name}</span>
            </div>
            {level.number === 5 ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-amber-300 font-medium">Ancient Pearls:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        idx < stats.pearlsCollectedLevel5
                          ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-110'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">
                Treasures: {stats.treasuresCollected} / {stats.totalTreasuresInLevel}
              </span>
            )}
          </div>

          {/* Right: Score & Quick Action Controls */}
          <div className="flex items-center gap-3">
            {/* Score Display */}
            <div className="flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 rounded-2xl px-4 py-2.5 shadow-xl">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-amber-300/80 tracking-wider font-semibold">TREASURE SCORE</span>
                <span className="font-chakra text-lg sm:text-xl font-bold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {stats.score.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 pointer-events-auto">
              <button
                onClick={onToggleMute}
                className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
              </button>

              <button
                onClick={onOpenHelp}
                className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                title="How to Play"
                aria-label="How to Play"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleTouchControls}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  showTouchControls ? 'text-amber-400 bg-amber-400/20' : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80'
                }`}
                title="Toggle On-screen Touch Controls"
                aria-label="Toggle Virtual Controls"
              >
                <Compass className="w-5 h-5" />
              </button>

              <button
                onClick={onPause}
                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                title="Pause (P)"
                aria-label="Pause Game"
              >
                <Pause className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Low Oxygen Warning Banner */}
        {isOxygenWarning && (
          <div className="self-center bg-red-950/90 border border-red-500/80 text-red-200 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.7)] text-xs sm:text-sm font-righteous animate-pulse tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            CRITICAL WARNING: LOW OXYGEN! REFILL AT CLAM STATIONS!
          </div>
        )}
      </div>

      {/* Bottom Area: Bubble Shield Gauge & Ability Trigger */}
      <div className="flex items-end justify-between">
        {/* Bubble Shield Status */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              sound.userGesture();
              onActivateShield();
            }}
            disabled={!isShieldReady}
            className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              diver.shieldActive
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.7)] scale-105'
                : isShieldReady
                ? 'bg-slate-950/80 border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900/90 shadow-xl'
                : 'bg-slate-950/70 border-slate-800 opacity-80 cursor-not-allowed'
            }`}
          >
            {/* Shield Icon with circular recharge ring */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="transparent"
                  stroke="rgba(30, 41, 59, 0.8)"
                  strokeWidth="3.5"
                />
                {!isShieldReady && (
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="transparent"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeDasharray={113}
                    strokeDashoffset={113 * shieldCooldownFraction}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                )}
              </svg>

              <Shield
                className={`w-6 h-6 transition-transform ${
                  diver.shieldActive
                    ? 'text-cyan-300 animate-spin'
                    : isShieldReady
                    ? 'text-cyan-400 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                    : 'text-slate-500'
                }`}
                style={{ animationDuration: '4s' }}
              />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-righteous text-xs tracking-wider text-cyan-300">BUBBLE SHIELD</span>
                <span className="text-[10px] font-chakra px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SPACE
                </span>
              </div>
              <span className="text-xs font-semibold">
                {diver.shieldActive ? (
                  <span className="text-cyan-300 font-chakra font-bold animate-pulse">
                    PROTECTED ({Math.ceil(diver.shieldDurationRemaining)}s)
                  </span>
                ) : isShieldReady ? (
                  <span className="text-emerald-400 font-chakra">READY TO USE</span>
                ) : (
                  <span className="text-slate-400 font-chakra">
                    RECHARGING ({Math.ceil(diver.shieldCooldownRemaining)}s)
                  </span>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Level Controls Quick Tip (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-xs bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800/60">
          <span>Move: <strong className="text-slate-200">Arrow Keys</strong> or <strong className="text-slate-200">WASD</strong></span>
          <span>•</span>
          <span>Shield: <strong className="text-slate-200">Space</strong></span>
          <span>•</span>
          <span>Pause: <strong className="text-slate-200">P</strong></span>
        </div>
      </div>
    </div>
  );
};
