import React from 'react';
import { Play, Map, HelpCircle, Trophy, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';

interface MainMenuProps {
  highScore: number;
  maxUnlockedLevel: number;
  isMuted: boolean;
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  maxUnlockedLevel,
  isMuted,
  onStartGame,
  onOpenLevelSelect,
  onOpenHowToPlay,
  onToggleMute,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-gradient-to-b from-sky-950 via-slate-950 to-slate-950 text-white font-sans">
      {/* Background Animated Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/20 border border-cyan-300/40 animate-bubble-float"
            style={{
              left: `${(i * 4.5 * 19) % 100}%`,
              width: `${12 + (i % 5) * 8}px`,
              height: `${12 + (i % 5) * 8}px`,
              animationDuration: `${6 + (i % 6) * 2}s`,
              animationDelay: `${(i * 0.4) % 5}s`,
            }}
          />
        ))}
        {/* Soft Radial Ambient Lights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Top Header: Audio & High Score Badge */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        {/* High Score Badge */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 px-4 py-2 rounded-2xl shadow-lg">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-semibold text-amber-300/70 tracking-wider">
              BEST SCORE
            </span>
            <span className="font-chakra text-sm sm:text-base font-bold text-amber-300">
              {highScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            sound.userGesture();
            sound.playClick();
            onToggleMute();
          }}
          className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/60 px-3.5 py-2 rounded-2xl transition-all cursor-pointer text-xs font-semibold text-slate-200"
          title="Toggle Audio"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Sound: OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Sound: ON</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Title & Diver Artwork */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        {/* Shimmering Game Title */}
        <div className="inline-block relative mb-3">
          <span className="text-xs sm:text-sm tracking-[0.3em] font-chakra font-bold text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">
            UNDERWATER ADVENTURE
          </span>
          <h1 className="font-righteous text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider animate-gold-shimmer drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
            DEEP SEA TREASURE
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mt-2 font-medium">
            Explore 5 mysterious ocean depths, gather legendary sunken riches, dodge lethal sea predators, and defeat the Giant Megalodon!
          </p>
        </div>

        {/* Diver & Ocean Mascot Showcase */}
        <div className="relative my-4 sm:my-6 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-cyan-900/60 via-slate-900/80 to-sky-600/30 border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(14,165,233,0.35)] relative overflow-hidden">
            {/* Animated water ripple */}
            <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
            <span className="text-5xl sm:text-6xl filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] select-none animate-bounce" style={{ animationDuration: '3s' }}>
              🤿
            </span>
          </div>
          {/* Orbiting Treasures */}
          <div className="absolute -top-2 -right-4 text-2xl animate-spin" style={{ animationDuration: '10s' }}>
            💎
          </div>
          <div className="absolute -bottom-2 -left-4 text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
            🪙
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm mt-2">
          {/* Play Game Button */}
          <button
            onClick={() => {
              sound.userGesture();
              sound.playClick();
              onStartGame();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-righteous text-lg tracking-wider font-bold shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:shadow-[0_0_45px_rgba(245,158,11,0.9)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            PLAY GAME
          </button>

          {/* Level Select */}
          <button
            onClick={() => {
              sound.userGesture();
              sound.playClick();
              onOpenLevelSelect();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-righteous text-sm tracking-wide shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Map className="w-4 h-4 text-cyan-400" />
            LEVELS ({maxUnlockedLevel}/5)
          </button>
        </div>

        {/* How to Play Link */}
        <button
          onClick={() => {
            sound.userGesture();
            sound.playClick();
            onOpenHowToPlay();
          }}
          className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How to Play & Controls</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 w-full text-center text-[11px] text-slate-500">
        Controls: Arrow Keys / WASD to Swim • Space for Bubble Shield • P to Pause
      </div>
    </div>
  );
};
