import React, { useState } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../game/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          install();
        }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 font-semibold text-xs shadow-lg transition-all cursor-pointer"
        title="Install Deep Sea Treasure to play offline"
      >
        <Download className="w-4 h-4 text-cyan-400" />
        <span>Install Offline App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playClick();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 font-semibold text-xs shadow-lg transition-all cursor-pointer"
          title="Install on iOS to play offline"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Install Offline App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-white text-center shadow-2xl">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl mx-auto mb-3">
                📲
              </div>

              <h3 className="font-righteous text-xl text-cyan-300 mb-2">
                Install on iOS Safari
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Play Deep Sea Treasure offline anytime directly from your home screen:
              </p>

              <ol className="text-left text-xs text-slate-300 space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-800">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button in Safari toolbar:
                    <Share className="inline w-3.5 h-3.5 ml-1 text-cyan-400" />
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-800">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong className="text-white">Add to Home Screen</strong>:
                    <PlusSquare className="inline w-3.5 h-3.5 ml-1 text-amber-400" />
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-800">
                    3
                  </span>
                  <span>Tap <strong className="text-white">Add</strong> in top-right corner to launch anytime offline!</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-righteous font-bold text-xs rounded-xl"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
