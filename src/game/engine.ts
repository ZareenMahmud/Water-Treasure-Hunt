/**
 * Deep Sea Treasure - Game Engine
 * Handles physics, enemy AI, collisions, oxygen, abilities, scoring, and level transitions.
 */

import { sound } from './audio';
import { CanvasRenderer } from './canvasRenderer';
import { LEVELS } from './levels';
import {
  GameState,
  PlayerDiver,
  Enemy,
  Treasure,
  OxygenStation,
  RockObstacle,
  Boss,
  Particle,
  FloatingText,
  AmbientFish,
  LevelConfig,
  GameStats,
} from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private tick: number = 0;

  // Game state
  public state: GameState = 'menu';
  public currentLevelIndex: number = 0;
  public currentLevel: LevelConfig;
  public diver: PlayerDiver;
  public treasures: Treasure[] = [];
  public enemies: Enemy[] = [];
  public stations: OxygenStation[] = [];
  public obstacles: RockObstacle[] = [];
  public boss?: Boss;
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public ambientFish: AmbientFish[] = [];

  // Camera coordinates (smooth lerp tracking diver)
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Level 5 ancient boss chest state
  public isBossChestOpen: boolean = false;

  // Input states
  public keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
  } = { up: false, down: false, left: false, right: false, space: false };

  // Stats
  public stats: GameStats = {
    score: 0,
    level: 1,
    treasuresCollected: 0,
    totalTreasuresInLevel: 0,
    totalTreasuresAllTime: 0,
    pearlsCollectedLevel5: 0,
    highScore: 0,
    maxUnlockedLevel: 1,
    timePlayedSeconds: 0,
  };

  // State Change Callbacks for React UI
  public onStateChange?: (state: GameState) => void;
  public onStatsUpdate?: (stats: GameStats) => void;
  public onOxygenWarning?: (isWarning: boolean) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d')!;
    this.renderer = new CanvasRenderer(ctx);

    // Load saved high score & max level
    try {
      const savedScore = localStorage.getItem('dst_highscore');
      if (savedScore) this.stats.highScore = parseInt(savedScore, 10);
      const savedMaxLevel = localStorage.getItem('dst_max_level');
      if (savedMaxLevel) this.stats.maxUnlockedLevel = Math.max(1, parseInt(savedMaxLevel, 10));
    } catch {}

    this.currentLevel = LEVELS[0];
    this.diver = this.createInitialDiver();
    this.initAmbientFish();
  }

  private createInitialDiver(): PlayerDiver {
    return {
      x: 180,
      y: 350,
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
      shieldMaxDuration: 3.0,
      shieldCooldownRemaining: 0,
      shieldMaxCooldown: 10.0,
      isSwimming: false,
    };
  }

  private initAmbientFish() {
    this.ambientFish = [];
    const colors = ['#f97316', '#38bdf8', '#eab308', '#ec4899', '#22c55e', '#a855f7'];
    for (let i = 0; i < 28; i++) {
      this.ambientFish.push({
        x: Math.random() * 2500,
        y: 100 + Math.random() * 1200,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 1.0),
        vy: (Math.random() - 0.5) * 0.2,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        tailPhase: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7,
      });
    }
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.setDimensions(width, height);
  }

  // Start new game from Level 1
  public startNewGame() {
    this.stats.score = 0;
    this.stats.treasuresCollected = 0;
    this.stats.totalTreasuresAllTime = 0;
    this.stats.timePlayedSeconds = 0;
    this.diver.lives = 3;
    this.loadLevel(0);
    this.setState('playing');
    sound.userGesture();
  }

  // Load specific level index (0..4)
  public loadLevel(levelIndex: number) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelIndex));
    const lvl = LEVELS[this.currentLevelIndex];
    this.currentLevel = lvl;
    this.stats.level = lvl.number;
    this.isBossChestOpen = false;

    // Reset diver position & status
    this.diver.x = 200;
    this.diver.y = 350;
    this.diver.vx = 0;
    this.diver.vy = 0;
    this.diver.oxygen = 100;
    this.diver.invincibleTimer = 1.0;
    this.diver.shieldActive = false;
    this.diver.shieldDurationRemaining = 0;
    this.diver.shieldCooldownRemaining = 0;

    // Initialize Treasures
    this.treasures = lvl.treasures.map((tr) => ({
      ...tr,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
      rotation: 0,
      sparkleTimer: Math.random() * 50,
    }));
    this.stats.totalTreasuresInLevel = this.treasures.length;
    this.stats.pearlsCollectedLevel5 = 0;

    // Initialize Enemies
    this.enemies = lvl.enemies.map((en) => ({
      ...en,
      currentRadius: en.baseRadius,
      animationTick: Math.random() * 100,
      isInflated: false,
      puffProgress: 0,
      blinkTick: Math.random() * 20,
    }));

    // Initialize Stations
    this.stations = lvl.stations.map((st) => ({
      ...st,
      pulsePhase: Math.random() * Math.PI,
      bubbles: Array.from({ length: 8 }, () => ({
        x: Math.random() * st.width,
        y: Math.random() * st.height,
        r: 2 + Math.random() * 4,
        speed: 1 + Math.random() * 2,
      })),
    }));

    // Initialize Obstacles
    this.obstacles = [...lvl.obstacles];

    // Initialize Boss (Level 5)
    if (lvl.boss) {
      this.boss = {
        ...lvl.boss,
        health: lvl.boss.maxHealth,
        state: 'patrolling',
        stateTimer: 0,
        stunTimer: 0,
        pearlsCollected: 0,
      };
    } else {
      this.boss = undefined;
    }

    this.particles = [];
    this.floatingTexts = [];

    // Center camera initially
    this.cameraX = this.diver.x - this.canvas.width / 2;
    this.cameraY = this.diver.y - this.canvas.height / 2;

    // Update unlocked level
    if (lvl.number > this.stats.maxUnlockedLevel) {
      this.stats.maxUnlockedLevel = lvl.number;
      try {
        localStorage.setItem('dst_max_level', String(lvl.number));
      } catch {}
    }

    this.notifyStatsUpdate();
  }

  public setState(newState: GameState) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  public activateBubbleShield() {
    if (this.state !== 'playing') return;
    if (this.diver.shieldCooldownRemaining <= 0 && !this.diver.shieldActive) {
      this.diver.shieldActive = true;
      this.diver.shieldDurationRemaining = this.diver.shieldMaxDuration;
      this.diver.shieldCooldownRemaining = this.diver.shieldMaxCooldown;
      sound.playShieldActivate();
      this.addFloatingText('BUBBLE SHIELD ON!', this.diver.x, this.diver.y - 35, '#38bdf8');
      this.emitParticles(this.diver.x, this.diver.y, 'sparkle', 14, '#38bdf8');
    }
  }

  public togglePause() {
    if (this.state === 'playing') {
      this.setState('paused');
    } else if (this.state === 'paused') {
      this.setState('playing');
    }
  }

  // --- Particle & Floating Text Helpers ---

  public emitParticles(
    x: number,
    y: number,
    type: Particle['type'],
    count: number,
    color: string = '#ffffff'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: type === 'bubble' ? 3 + Math.random() * 5 : 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 35,
        type,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#fbbf24') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1,
      life: 0,
      maxLife: 45,
    });
  }

  // --- Main Update Loop ---

  public update(dt: number) {
    if (this.state !== 'playing') return;

    this.tick++;
    this.stats.timePlayedSeconds += dt;

    const diver = this.diver;
    const level = this.currentLevel;

    // 1. Controls & Swimming Physics
    let ax = 0;
    let ay = 0;
    const swimSpeed = 4.2;

    if (this.keys.left) ax -= 1;
    if (this.keys.right) ax += 1;
    if (this.keys.up) ay -= 1;
    if (this.keys.down) ay += 1;

    // Normalize diagonal acceleration
    if (ax !== 0 && ay !== 0) {
      ax *= 0.7071;
      ay *= 0.7071;
    }

    const isMoving = ax !== 0 || ay !== 0;
    diver.isSwimming = isMoving;

    if (isMoving) {
      diver.vx += ax * 0.45;
      diver.vy += ay * 0.45;
      diver.flipperPhase += 0.22;
      sound.playSwim();

      // Exhaust bubbles from regulator
      if (Math.random() < 0.25) {
        this.emitParticles(
          diver.x + (diver.facing === 'left' ? 14 : -14),
          diver.y - 8,
          'bubble',
          1,
          '#bae6fd'
        );
      }
    }

    // Water Drag / Friction
    diver.vx *= 0.94;
    diver.vy *= 0.94;

    // Limit maximum speed
    const currentSpeed = Math.hypot(diver.vx, diver.vy);
    if (currentSpeed > swimSpeed) {
      diver.vx = (diver.vx / currentSpeed) * swimSpeed;
      diver.vy = (diver.vy / currentSpeed) * swimSpeed;
    }

    // Update position
    diver.x += diver.vx;
    diver.y += diver.vy;

    // Update facing and tilt angle
    if (diver.vx > 0.3) diver.facing = 'right';
    else if (diver.vx < -0.3) diver.facing = 'left';

    const targetTilt = Math.atan2(diver.vy, Math.abs(diver.vx)) * 0.45;
    diver.tilt += (targetTilt - diver.tilt) * 0.15;

    // Boundary Collisions (Keep within ocean)
    const minX = diver.radius + 15;
    const maxX = level.worldWidth - diver.radius - 15;
    const minY = diver.radius + 40; // Water surface
    const maxY = level.worldHeight - diver.radius - 40; // Seabed

    if (diver.x < minX) {
      diver.x = minX;
      diver.vx = 0;
    } else if (diver.x > maxX) {
      diver.x = maxX;
      diver.vx = 0;
    }

    if (diver.y < minY) {
      diver.y = minY;
      diver.vy = 0;
    } else if (diver.y > maxY) {
      diver.y = maxY;
      diver.vy = 0;
    }

    // Obstacle Collisions
    this.obstacles.forEach((obs) => {
      // Circle vs Box collision
      const closestX = Math.max(obs.x, Math.min(diver.x, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(diver.y, obs.y + obs.height));
      const dx = diver.x - closestX;
      const dy = diver.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < diver.radius) {
        // Push diver out
        const overlap = diver.radius - dist;
        if (dist > 0.001) {
          diver.x += (dx / dist) * overlap;
          diver.y += (dy / dist) * overlap;
        } else {
          diver.y -= overlap;
        }
        diver.vx *= 0.5;
        diver.vy *= 0.5;
      }
    });

    // 2. Oxygen Depletion & Refilling
    // Base drain ~2.0% per sec, slightly more when swimming
    const drainRate = (isMoving ? 2.8 : 1.8) * dt;
    diver.oxygen = Math.max(0, diver.oxygen - drainRate);

    // Low oxygen warning (<25%)
    const isOxygenWarning = diver.oxygen > 0 && diver.oxygen <= 25;
    if (this.onOxygenWarning) this.onOxygenWarning(isOxygenWarning);
    if (isOxygenWarning) {
      sound.playLowOxygenWarning();
    }

    // Oxygen reaches zero -> lose life
    if (diver.oxygen <= 0) {
      this.handlePlayerDamage('asphyxiation');
      diver.oxygen = 50; // Restore half tank after suffering hit
    }

    // Check Oxygen Refill Stations
    this.stations.forEach((st) => {
      // Animate bubbles inside station
      st.bubbles.forEach((b) => {
        b.y -= b.speed;
        if (b.y < -20) {
          b.y = st.height;
          b.x = Math.random() * st.width;
        }
      });

      const stCenterX = st.x + st.width / 2;
      const stCenterY = st.y + st.height / 2;
      const distToStation = Math.hypot(diver.x - stCenterX, diver.y - stCenterY);

      if (distToStation < diver.radius + 50) {
        if (diver.oxygen < 99) {
          diver.oxygen = 100;
          sound.playRefill();
          this.emitParticles(stCenterX, stCenterY, 'bubble', 18, '#38bdf8');
          this.addFloatingText('OXYGEN 100%!', diver.x, diver.y - 30, '#38bdf8');
        }
      }
    });

    // 3. Bubble Shield Timers
    if (diver.shieldActive) {
      diver.shieldDurationRemaining -= dt;
      if (diver.shieldDurationRemaining <= 0) {
        diver.shieldActive = false;
        sound.playShieldExpire();
        this.emitParticles(diver.x, diver.y, 'bubble', 10, '#38bdf8');
      }
    }
    if (diver.shieldCooldownRemaining > 0) {
      diver.shieldCooldownRemaining = Math.max(0, diver.shieldCooldownRemaining - dt);
    }

    // Invincible protection timer decay
    if (diver.invincibleTimer > 0) {
      diver.invincibleTimer = Math.max(0, diver.invincibleTimer - dt);
    }

    // 4. Treasure Collection
    this.treasures.forEach((tr) => {
      if (tr.collected) return;
      const dist = Math.hypot(diver.x - tr.x, diver.y - tr.y);

      if (dist < diver.radius + tr.radius) {
        tr.collected = true;
        this.stats.score += tr.points;
        this.stats.treasuresCollected++;
        this.stats.totalTreasuresAllTime++;

        // Sound effect
        switch (tr.type) {
          case 'silver_coin':
            sound.playSilverCoin();
            break;
          case 'gold_coin':
            sound.playCoin();
            break;
          case 'diamond':
            sound.playDiamond();
            break;
          case 'chest':
            sound.playChest();
            break;
          case 'golden_pearl':
            sound.playPearl();
            break;
        }

        // Floating points animation & burst particles
        this.addFloatingText(`+${tr.points}`, tr.x, tr.y - 15, tr.type === 'diamond' ? '#38bdf8' : '#fbbf24');
        this.emitParticles(
          tr.x,
          tr.y,
          tr.type === 'diamond' ? 'sparkle' : 'gold',
          14,
          tr.type === 'diamond' ? '#38bdf8' : '#f59e0b'
        );

        // Level 5 Boss Pearls
        if (tr.specialPearlIndex !== undefined && this.boss) {
          this.boss.pearlsCollected++;
          this.stats.pearlsCollectedLevel5 = this.boss.pearlsCollected;
          this.addFloatingText(
            `PEARL ${this.boss.pearlsCollected}/5 GATHERED!`,
            diver.x,
            diver.y - 45,
            '#fde047'
          );

          if (this.boss.pearlsCollected >= this.boss.pearlsRequired) {
            // STUN THE BOSS & UNLOCK LEGENDARY CHEST!
            this.boss.state = 'stunned';
            this.boss.stunTimer = 18; // 18 seconds of stun!
            this.isBossChestOpen = true;
            sound.playBossStunned();
            this.addFloatingText('MEGALODON STUNNED! CHEST UNLOCKED!', this.boss.x, this.boss.y - 70, '#38bdf8');
            this.emitParticles(this.boss.x, this.boss.y, 'electric', 30, '#fef08a');
          }
        }

        this.checkLevelProgress();
        this.notifyStatsUpdate();
      }
    });

    // 5. Boss Chest Interaction (Level 5)
    if (level.hasBossChest && this.isBossChestOpen) {
      const distToBossChest = Math.hypot(diver.x - level.bossChestX!, diver.y - level.bossChestY!);
      if (distToBossChest < diver.radius + 40) {
        // VICTORY!
        this.stats.score += 500;
        sound.playVictory();
        this.setState('victory');
        return;
      }
    }

    // 6. Enemy AI & Collisions
    this.enemies.forEach((enemy) => {
      enemy.animationTick++;

      switch (enemy.type) {
        case 'shark': {
          // Patrol & Aggro mechanics
          const distToDiver = Math.hypot(diver.x - enemy.x, diver.y - enemy.y);
          const aggroRange = level.number === 2 ? 300 : 250;

          if (distToDiver < aggroRange) {
            enemy.isAggro = true;
            // Charge toward diver
            const angle = Math.atan2(diver.y - enemy.y, diver.x - enemy.x);
            enemy.vx = Math.cos(angle) * (enemy.speed * 1.45);
            enemy.vy = Math.sin(angle) * (enemy.speed * 1.45);
            enemy.facing = enemy.vx > 0 ? 'right' : 'left';
          } else {
            enemy.isAggro = false;
            // Peaceful patrol along waypoint
            enemy.x += enemy.direction * enemy.speed;
            enemy.vy = Math.sin(this.tick * 0.05 + enemy.animationTick) * 0.4;
            enemy.facing = enemy.direction > 0 ? 'right' : 'left';

            if (enemy.patrolStartX && enemy.x < enemy.patrolStartX) {
              enemy.direction = 1;
            } else if (enemy.patrolEndX && enemy.x > enemy.patrolEndX) {
              enemy.direction = -1;
            }
          }

          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
          break;
        }

        case 'jellyfish': {
          // Gentle vertical bobbing & drifting
          enemy.y += enemy.vy;
          enemy.x += Math.sin(this.tick * 0.03 + (enemy.tentaclePhase || 0)) * 0.5;

          if (enemy.y < 120) enemy.vy = Math.abs(enemy.vy);
          else if (enemy.y > level.worldHeight - 160) enemy.vy = -Math.abs(enemy.vy);
          break;
        }

        case 'pufferfish': {
          // Patrol & inflate on diver proximity
          enemy.x += enemy.direction * enemy.speed;
          enemy.facing = enemy.direction > 0 ? 'right' : 'left';

          if (enemy.patrolStartX && enemy.x < enemy.patrolStartX) enemy.direction = 1;
          else if (enemy.patrolEndX && enemy.x > enemy.patrolEndX) enemy.direction = -1;

          const distToDiver = Math.hypot(diver.x - enemy.x, diver.y - enemy.y);
          if (distToDiver < 170) {
            enemy.puffProgress = Math.min(1.0, (enemy.puffProgress || 0) + 0.08);
          } else {
            enemy.puffProgress = Math.max(0, (enemy.puffProgress || 0) - 0.04);
          }
          enemy.currentRadius = enemy.baseRadius * (1 + (enemy.puffProgress || 0) * 0.8);
          break;
        }

        case 'mine': {
          // Swaying mine
          enemy.y += Math.sin(this.tick * 0.05 + enemy.speed) * 0.6;
          break;
        }
      }

      // Check Collision with Diver
      const hitRadius = enemy.currentRadius || enemy.baseRadius;
      const dist = Math.hypot(diver.x - enemy.x, diver.y - enemy.y);

      if (dist < diver.radius + hitRadius) {
        if (diver.shieldActive) {
          // Deflect enemy!
          enemy.vx = (enemy.x - diver.x) * 0.15;
          enemy.vy = (enemy.y - diver.y) * 0.15;
          this.emitParticles((diver.x + enemy.x) / 2, (diver.y + enemy.y) / 2, 'shockwave', 4, '#38bdf8');
        } else if (diver.invincibleTimer <= 0) {
          this.handlePlayerDamage('enemy');
          // Knockback diver away from enemy
          const angle = Math.atan2(diver.y - enemy.y, diver.x - enemy.x);
          diver.vx = Math.cos(angle) * 6;
          diver.vy = Math.sin(angle) * 6;
        }
      }
    });

    // 7. Giant Shark Boss AI (Level 5)
    if (this.boss && this.boss.state !== 'defeated') {
      const b = this.boss;
      b.animationTick++;

      if (b.state === 'stunned') {
        b.stunTimer -= dt;
        b.vx *= 0.9;
        b.vy *= 0.9;
        if (b.stunTimer <= 0) {
          b.state = 'patrolling';
          sound.playBossRoar();
        }
      } else {
        b.stateTimer += dt;
        const distToDiver = Math.hypot(diver.x - b.x, diver.y - b.y);

        if (b.state === 'patrolling') {
          // Circle or patrol chamber
          b.x += b.vx;
          b.y += Math.sin(this.tick * 0.03) * 1.5;
          b.facing = b.vx > 0 ? 'right' : 'left';

          if (b.x < 500) b.vx = Math.abs(b.vx);
          else if (b.x > level.worldWidth - 500) b.vx = -Math.abs(b.vx);

          // Charge periodically if diver gets close
          if (b.stateTimer > 4.5 && distToDiver < 550) {
            b.state = 'charging';
            b.stateTimer = 0;
            sound.playBossRoar();
            const angle = Math.atan2(diver.y - b.y, diver.x - b.x);
            b.vx = Math.cos(angle) * 5.5;
            b.vy = Math.sin(angle) * 5.5;
            b.facing = b.vx > 0 ? 'right' : 'left';
          }
        } else if (b.state === 'charging') {
          b.x += b.vx;
          b.y += b.vy;
          b.facing = b.vx > 0 ? 'right' : 'left';

          if (b.stateTimer > 2.2) {
            b.state = 'patrolling';
            b.stateTimer = 0;
            b.vx = b.facing === 'right' ? 2.5 : -2.5;
            b.vy = 0;
          }
        }

        // Collision with Diver
        if (distToDiver < diver.radius + 65) {
          if (diver.shieldActive) {
            diver.vx = (diver.x - b.x) * 0.12;
            diver.vy = (diver.y - b.y) * 0.12;
            this.emitParticles(diver.x, diver.y, 'shockwave', 6, '#38bdf8');
          } else if (diver.invincibleTimer <= 0) {
            this.handlePlayerDamage('boss');
            const angle = Math.atan2(diver.y - b.y, diver.x - b.x);
            diver.vx = Math.cos(angle) * 8;
            diver.vy = Math.sin(angle) * 8;
          }
        }
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === 'bubble') {
        p.vy -= 0.05; // Buoyancy rising
        p.x += Math.sin(p.life * 0.2) * 0.4;
      }
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 9. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 0.8;
      ft.alpha = 1 - ft.life / ft.maxLife;
      ft.scale = 1 + (ft.life / ft.maxLife) * 0.2;

      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 10. Smooth Camera Follow
    const targetCamX = diver.x - this.canvas.width / 2;
    const targetCamY = diver.y - this.canvas.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;

    // Clamp camera within world bounds
    this.cameraX = Math.max(0, Math.min(level.worldWidth - this.canvas.width, this.cameraX));
    this.cameraY = Math.max(0, Math.min(level.worldHeight - this.canvas.height, this.cameraY));
  }

  // Handle taking damage (lives reduction & protection period)
  private handlePlayerDamage(source: 'enemy' | 'asphyxiation' | 'boss') {
    const diver = this.diver;
    diver.lives--;
    diver.invincibleTimer = 2.5; // 2.5s protection period!

    sound.playDamage();
    this.emitParticles(diver.x, diver.y, 'blood', 12, '#ef4444');
    this.addFloatingText('-1 LIFE!', diver.x, diver.y - 30, '#ef4444');

    if (diver.lives <= 0) {
      sound.playGameOver();
      // Check high score
      if (this.stats.score > this.stats.highScore) {
        this.stats.highScore = this.stats.score;
        try {
          localStorage.setItem('dst_highscore', String(this.stats.score));
        } catch {}
      }
      this.setState('game_over');
    }

    this.notifyStatsUpdate();
  }

  // Check if all treasures collected to advance to next level
  private checkLevelProgress() {
    const remaining = this.treasures.filter((t) => !t.collected).length;
    if (this.currentLevel.number < 5 && remaining === 0) {
      // Advance to next level!
      sound.playVictory();
      this.addFloatingText('LEVEL COMPLETE! DIVING DEEPER...', this.diver.x, this.diver.y - 40, '#22c55e');

      window.setTimeout(() => {
        if (this.currentLevelIndex < LEVELS.length - 1) {
          this.loadLevel(this.currentLevelIndex + 1);
        }
      }, 1800);
    }
  }

  // --- Render Loop ---

  public render() {
    this.renderer.clear();
    const level = this.currentLevel;

    // 1. Water background, caustics, ambient fish, seabed
    this.renderer.drawBackground(this.cameraX, this.cameraY, level, this.tick, this.ambientFish);

    // 2. Obstacles (rocks, coral walls, stalactites)
    this.renderer.drawObstacles(this.obstacles, this.cameraX, this.cameraY);

    // 3. Oxygen Refill Stations
    this.renderer.drawOxygenStations(this.stations, this.cameraX, this.cameraY, this.tick);

    // 4. Treasures
    this.renderer.drawTreasures(this.treasures, this.cameraX, this.cameraY, this.tick);

    // 5. Boss Chest (Level 5)
    if (level.hasBossChest && level.bossChestX && level.bossChestY) {
      this.renderer.drawBossChest(
        level.bossChestX,
        level.bossChestY,
        this.cameraX,
        this.cameraY,
        this.isBossChestOpen,
        this.tick
      );
    }

    // 6. Enemies
    this.renderer.drawEnemies(this.enemies, this.cameraX, this.cameraY, this.tick);

    // 7. Boss (Level 5)
    if (this.boss) {
      this.renderer.drawBoss(this.boss, this.cameraX, this.cameraY, this.tick);
    }

    // 8. Player Diver
    this.renderer.drawDiver(this.diver, this.cameraX, this.cameraY, this.tick);

    // 9. Flashlight Cone Mask (Level 3 Dark Ocean)
    this.renderer.drawFlashlightEffect(this.diver, this.cameraX, this.cameraY, level);

    // 10. Particles
    this.renderer.drawParticles(this.particles, this.cameraX, this.cameraY);

    // 11. Floating Score Texts
    this.renderer.drawFloatingTexts(this.floatingTexts, this.cameraX, this.cameraY);

    // 12. Radar Mini-Map
    this.renderer.drawRadar(
      this.diver,
      this.treasures,
      this.enemies,
      this.stations,
      this.boss,
      level,
      135
    );
  }

  // --- Loop Control ---

  public start() {
    if (this.animationFrameId) return;

    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private notifyStatsUpdate() {
    if (this.onStatsUpdate) this.onStatsUpdate({ ...this.stats });
  }
}
