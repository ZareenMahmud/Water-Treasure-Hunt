/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { sound } from './game/audio';
import { GameState, GameStats, PlayerDiver, LevelConfig } from './game/types';
import { LEVELS } from './game/levels';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VirtualControls } from './components/VirtualControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React state reflecting engine state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    treasuresCollected: 0,
    totalTreasuresInLevel: 0,
    totalTreasuresAllTime: 0,
    pearlsCollectedLevel5: 0,
    highScore: 0,
    maxUnlockedLevel: 1,
    timePlayedSeconds: 0,
  });
  const [diverState, setDiverState] = useState<PlayerDiver>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 54,
    height: 32,
    radius: 20,
    facing: 'right',
    tilt: 0,
    flipperAngle: 0,
    flipperPhase: 0,
    lives: 3,
    maxLives: 3,
    oxygen: 100,
    maxOxygen: 100,
    invincibleTimer: 0,
    shieldActive: false,
    shieldDurationRemaining: 0,
    shieldMaxDuration: 3,
    shieldCooldownRemaining: 0,
    shieldMaxCooldown: 10,
    isSwimming: false,
  });
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [isOxygenWarning, setIsOxygenWarning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);

  // Initialize Canvas and Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    // Connect callbacks
    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onOxygenWarning = (warning) => {
      setIsOxygenWarning(warning);
    };

    // Load initial stats
    setStats({ ...engine.stats });

    // Handle viewport resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      engine.resize(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Auto-detect touch device for initial virtual controls
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchControls(true);
    }

    // Start engine loop
    engine.start();

    // Regular HUD sync interval (synced at 20fps for smooth oxygen/shield animations)
    const hudSyncInterval = window.setInterval(() => {
      if (engineRef.current) {
        setDiverState({ ...engineRef.current.diver });
        setCurrentLevel(engineRef.current.currentLevel);
      }
    }, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(hudSyncInterval);
      engine.stop();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Unlock Web Audio on any key press
      sound.userGesture();

      // Pause toggle with 'P' or 'Escape'
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        engine.togglePause();
        return;
      }

      // Space for Bubble Shield
      if (e.code === 'Space') {
        e.preventDefault();
        engine.activateBubbleShield();
        return;
      }

      // Swimming Movement Keys
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        engine.keys.up = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        engine.keys.down = true;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        engine.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        engine.keys.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.keys.up = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.keys.down = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sound.setMuted(newMuted);
  }, [isMuted]);

  // Virtual Controls Direction Change
  const handleVirtualDirectionChange = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
      if (engineRef.current) {
        engineRef.current.keys[dir] = pressed;
      }
    },
    []
  );

  // Bubble Shield trigger
  const handleActivateShield = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.activateBubbleShield();
    }
  }, []);

  // Start new game
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  }, []);

  // Select level
  const handleSelectLevel = useCallback((levelIndex: number) => {
    if (engineRef.current) {
      engineRef.current.loadLevel(levelIndex);
      engineRef.current.setState('playing');
      setIsLevelSelectOpen(false);
      sound.userGesture();
    }
  }, []);

  // Restart current level
  const handleRestartLevel = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.loadLevel(engineRef.current.currentLevelIndex);
      engineRef.current.setState('playing');
    }
  }, []);

  // Return to main menu
  const handleMainMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('menu');
      engineRef.current.diver.x = 200;
      engineRef.current.diver.y = 350;
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 2D HTML Canvas Render Surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <MainMenu
          highScore={stats.highScore}
          maxUnlockedLevel={stats.maxUnlockedLevel}
          isMuted={isMuted}
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* In-Game HUD (Visible during gameplay and pause) */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <HUD
            stats={stats}
            diver={diverState}
            level={currentLevel}
            isOxygenWarning={isOxygenWarning}
            onPause={() => engineRef.current?.togglePause()}
            onOpenHelp={() => setIsHowToPlayOpen(true)}
            onToggleMute={handleToggleMute}
            isMuted={isMuted}
            onActivateShield={handleActivateShield}
            showTouchControls={showTouchControls}
            onToggleTouchControls={() => setShowTouchControls((prev) => !prev)}
          />

          {/* On-screen Virtual Controls for touch & trackpad */}
          {showTouchControls && gameState === 'playing' && (
            <VirtualControls
              onDirectionChange={handleVirtualDirectionChange}
              onActivateShield={handleActivateShield}
              isShieldReady={diverState.shieldCooldownRemaining <= 0}
              isShieldActive={diverState.shieldActive}
            />
          )}
        </>
      )}

      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={gameState === 'paused'}
        isMuted={isMuted}
        levelNumber={currentLevel.number}
        levelName={currentLevel.name}
        onResume={() => engineRef.current?.setState('playing')}
        onRestartLevel={handleRestartLevel}
        onMainMenu={handleMainMenu}
        onToggleMute={handleToggleMute}
      />

      {/* Game Over Screen */}
      <GameOverModal
        isOpen={gameState === 'game_over'}
        stats={stats}
        onRetry={handleRestartLevel}
        onMainMenu={handleMainMenu}
      />

      {/* Victory Screen */}
      <VictoryModal
        isOpen={gameState === 'victory'}
        stats={stats}
        onPlayAgain={handleStartGame}
        onMainMenu={handleMainMenu}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        maxUnlockedLevel={stats.maxUnlockedLevel}
        onSelectLevel={handleSelectLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />
    </div>
  );
}
