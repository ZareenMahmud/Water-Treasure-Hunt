import React from 'react';
import { X, Shield, Wind, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { sound } from '../game/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-white font-sans overflow-y-auto">
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl">
            📖
          </div>
          <div>
            <h2 className="font-righteous text-2xl sm:text-3xl text-cyan-300">
              HOW TO PLAY
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Master the controls and dive safely into the deep ocean!
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-slate-300">
          {/* Controls */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-righteous text-amber-400 text-base mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              CONTROLS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-600/50 rounded-lg font-chakra font-bold text-cyan-300">
                  ARROWS / WASD
                </span>
                <span>Swim in all directions</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-600/50 rounded-lg font-chakra font-bold text-cyan-300">
                  SPACEBAR
                </span>
                <span>Activate Bubble Shield (3s)</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-600/50 rounded-lg font-chakra font-bold text-cyan-300">
                  P KEY
                </span>
                <span>Pause / Resume game</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-600/50 rounded-lg font-chakra font-bold text-cyan-300">
                  TOUCH / D-PAD
                </span>
                <span>On-screen virtual controls</span>
              </div>
            </div>
          </div>

          {/* Treasures & Points */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-righteous text-amber-400 text-base mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              TREASURES & POINT VALUES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xl">🪙</span>
                <div>
                  <div className="font-bold text-slate-200">Silver Coin</div>
                  <div className="text-cyan-400 font-chakra font-bold">+5 Points</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xl">🪙</span>
                <div>
                  <div className="font-bold text-amber-300">Gold Coin</div>
                  <div className="text-amber-400 font-chakra font-bold">+10 Points</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xl">💎</span>
                <div>
                  <div className="font-bold text-sky-300">Diamond</div>
                  <div className="text-sky-400 font-chakra font-bold">+20 Points</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xl">📦</span>
                <div>
                  <div className="font-bold text-amber-400">Treasure Chest</div>
                  <div className="text-amber-400 font-chakra font-bold">+50 Points</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-xl">🔮</span>
                <div>
                  <div className="font-bold text-yellow-300">Golden Pearl</div>
                  <div className="text-yellow-400 font-chakra font-bold">+100 Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Oxygen System & Bubble Shield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-righteous text-cyan-400 text-sm mb-2 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                OXYGEN SYSTEM
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Oxygen depletes as you swim underwater. If oxygen reaches 0%, you lose a life! Refill oxygen to 100% at any bubbling clam station on the seafloor.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-righteous text-sky-400 text-sm mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                BUBBLE SHIELD
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Press Spacebar to surround yourself with an iridescent barrier. Provides 3 seconds of invulnerability against enemy attacks and explosive mines. Recharges in 10 seconds.
              </p>
            </div>
          </div>

          {/* Enemies & Boss */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-righteous text-rose-400 text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              SEA ENEMIES & BOSS BATTLE
            </h3>
            <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
              <li><strong className="text-slate-100">Sharks:</strong> Patrol areas and relentlessly chase the diver when you swim close!</li>
              <li><strong className="text-slate-100">Jellyfish:</strong> Bob vertically with electric tentacles.</li>
              <li><strong className="text-slate-100">Pufferfish:</strong> Inflates with poisonous spikes when the diver approaches.</li>
              <li><strong className="text-slate-100">Naval Mines:</strong> Swaying contact mines with pulsating red lights that detonate on contact.</li>
              <li><strong className="text-amber-300">Level 5 Megalodon Boss:</strong> Collect all 5 Golden Pearls across the sunken Atlantean ruins to stun the giant shark and unlock the legendary treasure vault!</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-righteous font-bold text-sm transition-all cursor-pointer shadow-lg"
          >
            <span>GOT IT, LET'S DIVE!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
