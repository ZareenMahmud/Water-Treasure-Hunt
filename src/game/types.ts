/**
 * Deep Sea Treasure - Game Type Definitions
 */

export type GameState = 'menu' | 'level_intro' | 'playing' | 'paused' | 'game_over' | 'victory';

export type TreasureType = 'silver_coin' | 'gold_coin' | 'diamond' | 'chest' | 'golden_pearl';

export interface Treasure {
  id: string;
  type: TreasureType;
  x: number;
  y: number;
  radius: number;
  points: number;
  collected: boolean;
  bobOffset: number;
  rotation: number;
  sparkleTimer: number;
  specialPearlIndex?: number; // 0..4 for level 5 boss pearls
}

export type EnemyType = 'shark' | 'jellyfish' | 'pufferfish' | 'mine';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  baseRadius: number;
  currentRadius: number;
  // Shark patrol / aggro
  patrolStartX?: number;
  patrolEndX?: number;
  direction: 1 | -1;
  speed: number;
  isAggro?: boolean;
  facing: 'left' | 'right';
  animationTick: number;
  // Pufferfish inflated state
  isInflated?: boolean;
  puffProgress?: number; // 0..1
  // Jellyfish bobbing
  tentaclePhase?: number;
  // Mine
  chainAnchorY?: number;
  blinkTick?: number;
}

export interface Boss {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  maxHealth: number;
  health: number;
  state: 'patrolling' | 'charging' | 'stunned' | 'defeated';
  stateTimer: number;
  stunTimer: number;
  targetX: number;
  targetY: number;
  animationTick: number;
  pearlsRequired: number;
  pearlsCollected: number;
}

export interface OxygenStation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pulsePhase: number;
  bubbles: Array<{ x: number; y: number; r: number; speed: number }>;
}

export interface RockObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'stalactite' | 'stalagmite' | 'coral_wall';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'bubble' | 'sparkle' | 'gold' | 'blood' | 'electric' | 'shockwave';
}

export interface AmbientFish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  tailPhase: number;
  depth: number;
}

export interface PlayerDiver {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  facing: 'left' | 'right';
  tilt: number;
  flipperAngle: number;
  flipperPhase: number;
  // Stats
  lives: number;
  maxLives: number;
  oxygen: number;
  maxOxygen: number;
  invincibleTimer: number; // Flash after hit
  // Bubble Shield
  shieldActive: boolean;
  shieldDurationRemaining: number;
  shieldMaxDuration: number;
  shieldCooldownRemaining: number;
  shieldMaxCooldown: number;
  // Controls state
  isSwimming: boolean;
}

export interface LevelConfig {
  number: number;
  name: string;
  subtitle: string;
  description: string;
  worldWidth: number;
  worldHeight: number;
  waterColorTop: string;
  waterColorBottom: string;
  fogAlpha: number;
  hasFlashlight: boolean;
  ambientLight: number; // 0 (dark) to 1 (bright daylight)
  treasures: Omit<Treasure, 'bobOffset' | 'rotation' | 'sparkleTimer' | 'collected'>[];
  enemies: Omit<Enemy, 'animationTick' | 'currentRadius'>[];
  stations: Omit<OxygenStation, 'pulsePhase' | 'bubbles'>[];
  obstacles: RockObstacle[];
  boss?: Boss;
  hasBossChest?: boolean;
  bossChestX?: number;
  bossChestY?: number;
}

export interface GameStats {
  score: number;
  level: number;
  treasuresCollected: number;
  totalTreasuresInLevel: number;
  totalTreasuresAllTime: number;
  pearlsCollectedLevel5: number;
  highScore: number;
  maxUnlockedLevel: number;
  timePlayedSeconds: number;
}
