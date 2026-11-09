/**
 * Deep Sea Treasure - Canvas 2D Graphics & Rendering Engine
 * Pure Canvas 2D procedural rendering - 100% offline, zero external asset dependencies.
 */

import {
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
} from './types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 600;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  // Clear canvas
  public clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Draw background water gradient, caustic light rays, and seabed
  public drawBackground(
    cameraX: number,
    cameraY: number,
    level: LevelConfig,
    tick: number,
    ambientFish: AmbientFish[]
  ) {
    const ctx = this.ctx;
    const cw = this.width;
    const ch = this.height;

    // 1. Water Gradient
    const grad = ctx.createLinearGradient(0, -cameraY * 0.3, 0, level.worldHeight - cameraY * 0.3);
    grad.addColorStop(0, level.waterColorTop);
    grad.addColorStop(1, level.waterColorBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Sunlight Caustic Rays (more prominent in shallower levels)
    if (level.ambientLight > 0.3) {
      ctx.save();
      ctx.globalAlpha = 0.12 * level.ambientLight;
      ctx.fillStyle = '#ffffff';

      const rayCount = 7;
      for (let i = 0; i < rayCount; i++) {
        const sway = Math.sin(tick * 0.02 + i * 1.3) * 60;
        const topX = ((i * 350 + sway * 1.5 - cameraX * 0.2) % (level.worldWidth + 600)) - 300;
        const widthTop = 90 + Math.sin(tick * 0.03 + i) * 30;
        const widthBottom = widthTop * 3.5;

        ctx.beginPath();
        ctx.moveTo(topX, -cameraY * 0.2);
        ctx.lineTo(topX + widthTop, -cameraY * 0.2);
        ctx.lineTo(topX + widthBottom + sway, ch);
        ctx.lineTo(topX - widthBottom * 0.5 + sway, ch);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Ambient Background Fish (swimming gracefully in the background)
    ambientFish.forEach((fish) => {
      const screenX = fish.x - cameraX * fish.depth;
      const screenY = fish.y - cameraY * fish.depth;

      // Wrap around world
      if (screenX >= -50 && screenX <= cw + 50 && screenY >= -50 && screenY <= ch + 50) {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.globalAlpha = 0.35 + fish.depth * 0.3;
        ctx.fillStyle = fish.color;

        const isLeft = fish.vx < 0;
        if (isLeft) ctx.scale(-1, 1);

        // Fish body
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size, fish.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wiggling tail
        const tailWiggle = Math.sin(tick * 0.15 + fish.tailPhase) * 6;
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.8, 0);
        ctx.lineTo(-fish.size * 1.5, -fish.size * 0.6 + tailWiggle);
        ctx.lineTo(-fish.size * 1.5, fish.size * 0.6 + tailWiggle);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fish.size * 0.4, -fish.size * 0.15, fish.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    // 4. Parallax Seabed Floor & Ancient Ruins / Reefs
    this.drawSeabedDecorations(cameraX, cameraY, level, tick);
  }

  // Draw seabed terrain, corals, and seaweeds
  private drawSeabedDecorations(cameraX: number, cameraY: number, level: LevelConfig, tick: number) {
    const ctx = this.ctx;
    const seaBedY = level.worldHeight - 80 - cameraY;

    // Sandy or rocky ocean floor base
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, seaBedY, 0, seaBedY + 120);
    floorGrad.addColorStop(0, '#064e3b22');
    floorGrad.addColorStop(1, '#021f18bb');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, Math.max(0, seaBedY), this.width, this.height - Math.max(0, seaBedY));

    // Sea floor undulating line
    ctx.beginPath();
    ctx.strokeStyle = '#04785755';
    ctx.lineWidth = 4;
    for (let x = 0; x <= this.width; x += 30) {
      const worldX = x + cameraX;
      const wave = Math.sin(worldX * 0.015) * 14 + Math.sin(worldX * 0.005) * 8;
      const y = level.worldHeight - 60 + wave - cameraY;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Swaying seaweed fronds
    ctx.fillStyle = '#10b98155';
    for (let worldX = 100; worldX < level.worldWidth; worldX += 140) {
      const screenX = worldX - cameraX;
      if (screenX > -40 && screenX < this.width + 40) {
        const baseFloorY = level.worldHeight - 60 - cameraY;
        const frondHeight = 80 + Math.sin(worldX) * 30;
        const sway = Math.sin(tick * 0.04 + worldX * 0.05) * 18;

        ctx.beginPath();
        ctx.moveTo(screenX, baseFloorY);
        ctx.quadraticCurveTo(screenX + sway * 0.5, baseFloorY - frondHeight * 0.5, screenX + sway, baseFloorY - frondHeight);
        ctx.quadraticCurveTo(screenX + sway * 0.5 + 8, baseFloorY - frondHeight * 0.5, screenX + 12, baseFloorY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Draw rock and coral obstacles with textured detail
  public drawObstacles(obstacles: RockObstacle[], cameraX: number, cameraY: number) {
    const ctx = this.ctx;
    obstacles.forEach((obs) => {
      const sx = obs.x - cameraX;
      const sy = obs.y - cameraY;

      // Cull offscreen
      if (sx + obs.width < 0 || sx > this.width || sy + obs.height < 0 || sy > this.height) return;

      ctx.save();
      if (obs.type === 'coral_wall') {
        // Vibrant coral ridge
        const grad = ctx.createLinearGradient(sx, sy, sx + obs.width, sy + obs.height);
        grad.addColorStop(0, '#f43f5e'); // Rose
        grad.addColorStop(0.5, '#fb923c'); // Orange
        grad.addColorStop(1, '#be185d'); // Crimson
        ctx.fillStyle = grad;

        // Rounded bumpy coral silhouette
        ctx.beginPath();
        ctx.roundRect(sx, sy, obs.width, obs.height, [24, 24, 8, 8]);
        ctx.fill();

        // Decorative coral pores & texture
        ctx.fillStyle = '#ffe4e644';
        for (let py = sy + 20; py < sy + obs.height - 20; py += 30) {
          ctx.beginPath();
          ctx.arc(sx + obs.width * 0.35, py, 6, 0, Math.PI * 2);
          ctx.arc(sx + obs.width * 0.7, py + 12, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (obs.type === 'stalactite') {
        // Jagged ceiling spire
        const grad = ctx.createLinearGradient(sx, sy, sx + obs.width, sy + obs.height);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#334155');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + obs.width, sy);
        ctx.lineTo(sx + obs.width * 0.55, sy + obs.height);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === 'stalagmite') {
        // Jagged floor spire
        const grad = ctx.createLinearGradient(sx, sy + obs.height, sx + obs.width, sy);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#334155');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(sx, sy + obs.height);
        ctx.lineTo(sx + obs.width, sy + obs.height);
        ctx.lineTo(sx + obs.width * 0.5, sy);
        ctx.closePath();
        ctx.fill();
      } else {
        // Ancient underwater rock / temple pillar
        const grad = ctx.createLinearGradient(sx, sy, sx + obs.width, sy + obs.height);
        grad.addColorStop(0, '#334155');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(sx, sy, obs.width, obs.height, 12);
        ctx.fill();

        // Highlights and cracks
        ctx.strokeStyle = '#64748b55';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#94a3b833';
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + 20);
        ctx.lineTo(sx + obs.width - 15, sy + 40);
        ctx.lineTo(sx + 20, sy + 80);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Draw Oxygen Refill Stations (bubbling clam or techno canister)
  public drawOxygenStations(stations: OxygenStation[], cameraX: number, cameraY: number, tick: number) {
    const ctx = this.ctx;
    stations.forEach((st) => {
      const sx = st.x - cameraX;
      const sy = st.y - cameraY;

      if (sx + st.width < -50 || sx > this.width + 50 || sy + st.height < -50 || sy > this.height + 50) return;

      ctx.save();
      ctx.translate(sx + st.width / 2, sy + st.height / 2);

      // Pulsing oxygen aura
      const pulse = Math.sin(tick * 0.08 + st.pulsePhase) * 6;
      const auraGrad = ctx.createRadialGradient(0, -10, 15, 0, -10, 50 + pulse);
      auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      auraGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -10, 50 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Giant Pearl Clam base
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.ellipse(0, 16, 32, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top shell open
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 14, 0, Math.PI, 0);
      ctx.fill();

      // Glowing Oxygen Core (O2 Capsule)
      const coreGrad = ctx.createRadialGradient(0, 2, 2, 0, 2, 16);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#38bdf8');
      coreGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 2, 14, 0, Math.PI * 2);
      ctx.fill();

      // "O2" text logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Righteous, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('O₂', 0, 3);

      // Bubbles streaming upwards
      st.bubbles.forEach((b) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(b.x - st.width / 2, b.y - st.height / 2, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }

  // Draw Treasures (Coins, Diamonds, Chests, Golden Pearls)
  public drawTreasures(treasures: Treasure[], cameraX: number, cameraY: number, tick: number) {
    const ctx = this.ctx;

    treasures.forEach((tr) => {
      if (tr.collected) return;
      const sx = tr.x - cameraX;
      const bob = Math.sin(tick * 0.05 + tr.bobOffset) * 6;
      const sy = tr.y - cameraY + bob;

      if (sx < -40 || sx > this.width + 40 || sy < -40 || sy > this.height + 40) return;

      ctx.save();
      ctx.translate(sx, sy);

      // Shimmering treasure aura
      const aura = ctx.createRadialGradient(0, 0, tr.radius * 0.5, 0, 0, tr.radius * 1.8);
      if (tr.type === 'silver_coin') {
        aura.addColorStop(0, 'rgba(226, 232, 240, 0.5)');
        aura.addColorStop(1, 'rgba(226, 232, 240, 0)');
      } else if (tr.type === 'gold_coin') {
        aura.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
        aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
      } else if (tr.type === 'diamond') {
        aura.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (tr.type === 'chest') {
        aura.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        // Golden pearl
        aura.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
        aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      }
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, tr.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Render specific treasure graphic
      switch (tr.type) {
        case 'silver_coin': {
          const rotScale = Math.abs(Math.cos(tick * 0.05 + tr.bobOffset));
          ctx.scale(Math.max(0.15, rotScale), 1);

          const coinGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, tr.radius);
          coinGrad.addColorStop(0, '#f8fafc');
          coinGrad.addColorStop(0.6, '#cbd5e1');
          coinGrad.addColorStop(1, '#94a3b8');
          ctx.fillStyle = coinGrad;
          ctx.beginPath();
          ctx.arc(0, 0, tr.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Star stamp
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 0);
          break;
        }

        case 'gold_coin': {
          const rotScale = Math.abs(Math.cos(tick * 0.06 + tr.bobOffset));
          ctx.scale(Math.max(0.15, rotScale), 1);

          const goldGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, tr.radius);
          goldGrad.addColorStop(0, '#fef08a');
          goldGrad.addColorStop(0.5, '#f59e0b');
          goldGrad.addColorStop(1, '#b45309');
          ctx.fillStyle = goldGrad;
          ctx.beginPath();
          ctx.arc(0, 0, tr.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Anchor emblem
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚓', 0, -1);
          break;
        }

        case 'diamond': {
          // Sparkling faceted cyan gem
          ctx.rotate(Math.sin(tick * 0.03 + tr.bobOffset) * 0.15);
          const r = tr.radius;

          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.85, -r * 0.25);
          ctx.lineTo(0, r);
          ctx.lineTo(-r * 0.85, -r * 0.25);
          ctx.closePath();

          const gemGrad = ctx.createLinearGradient(0, -r, 0, r);
          gemGrad.addColorStop(0, '#e0f2fe');
          gemGrad.addColorStop(0.35, '#38bdf8');
          gemGrad.addColorStop(1, '#0284c7');
          ctx.fillStyle = gemGrad;
          ctx.fill();

          // Facet lines
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(-r * 0.85, -r * 0.25);
          ctx.lineTo(r * 0.85, -r * 0.25);
          ctx.moveTo(0, -r);
          ctx.lineTo(0, r);
          ctx.stroke();

          // Glint sparkle
          if (Math.sin(tick * 0.1 + tr.bobOffset) > 0.6) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-r * 0.25, -r * 0.45, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'chest': {
          // Wooden & Brass sunken treasure chest
          const w = tr.radius * 1.8;
          const h = tr.radius * 1.3;

          // Chest Base Wood
          const woodGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
          woodGrad.addColorStop(0, '#451a03');
          woodGrad.addColorStop(0.5, '#78350f');
          woodGrad.addColorStop(1, '#451a03');
          ctx.fillStyle = woodGrad;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2 + 6, w, h * 0.8, 4);
          ctx.fill();

          // Glowing gold light escaping from lid
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, 4);

          // Chest Lid Curvature
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.ellipse(0, -h / 2 + 4, w / 2, 8, 0, Math.PI, 0);
          ctx.fill();

          // Brass Trim Bands
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-w / 2 + 6, -h / 2, 5, h);
          ctx.fillRect(w / 2 - 11, -h / 2, 5, h);

          // Keyhole plate
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-1.5, 0, 3, 5);
          break;
        }

        case 'golden_pearl': {
          // Radiant golden pearl (or special boss pearl)
          const r = tr.radius;
          const pGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
          pGrad.addColorStop(0, '#ffffff');
          pGrad.addColorStop(0.3, '#fef08a');
          pGrad.addColorStop(0.7, '#f59e0b');
          pGrad.addColorStop(1, '#b45309');
          ctx.fillStyle = pGrad;

          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Outer shimmering corona
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Orbiting sparkle mote
          const orbitAngle = tick * 0.08 + (tr.specialPearlIndex || 0);
          const ox = Math.cos(orbitAngle) * (r + 8);
          const oy = Math.sin(orbitAngle) * (r + 8);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ox, oy, 3, 0, Math.PI * 2);
          ctx.fill();

          if (tr.specialPearlIndex !== undefined) {
            ctx.fillStyle = '#78350f';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${tr.specialPearlIndex + 1}`, 0, 0);
          }
          break;
        }
      }

      ctx.restore();
    });
  }

  // Draw Enemies (Shark, Jellyfish, Pufferfish, Sea Mine)
  public drawEnemies(enemies: Enemy[], cameraX: number, cameraY: number, tick: number) {
    const ctx = this.ctx;

    enemies.forEach((enemy) => {
      const sx = enemy.x - cameraX;
      const sy = enemy.y - cameraY;

      if (sx < -100 || sx > this.width + 100 || sy < -100 || sy > this.height + 100) return;

      ctx.save();
      ctx.translate(sx, sy);

      switch (enemy.type) {
        case 'shark': {
          // Shark swimming with tail wagging
          const isLeft = enemy.facing === 'left';
          if (isLeft) ctx.scale(-1, 1);

          const tailPhase = Math.sin(tick * 0.18 + enemy.animationTick) * 0.25;

          // Shark Body (Sleek predatory grey-blue)
          const bodyGrad = ctx.createLinearGradient(0, -enemy.height / 2, 0, enemy.height / 2);
          bodyGrad.addColorStop(0, '#1e293b'); // Dark dorsal
          bodyGrad.addColorStop(0.5, '#475569'); // Mid grey
          bodyGrad.addColorStop(1, '#f1f5f9'); // White belly
          ctx.fillStyle = bodyGrad;

          ctx.beginPath();
          ctx.moveTo(enemy.width * 0.5, 0); // Snout
          ctx.bezierCurveTo(
            enemy.width * 0.2,
            -enemy.height * 0.55,
            -enemy.width * 0.2,
            -enemy.height * 0.45,
            -enemy.width * 0.45,
            0
          );
          ctx.bezierCurveTo(
            -enemy.width * 0.2,
            enemy.height * 0.45,
            enemy.width * 0.2,
            enemy.height * 0.35,
            enemy.width * 0.5,
            0
          );
          ctx.closePath();
          ctx.fill();

          // Dorsal Fin
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(0, -enemy.height * 0.4);
          ctx.lineTo(-enemy.width * 0.12, -enemy.height * 0.95);
          ctx.lineTo(-enemy.width * 0.22, -enemy.height * 0.35);
          ctx.closePath();
          ctx.fill();

          // Pectoral Fin
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(enemy.width * 0.1, enemy.height * 0.15);
          ctx.lineTo(-enemy.width * 0.05, enemy.height * 0.7);
          ctx.lineTo(-enemy.width * 0.15, enemy.height * 0.2);
          ctx.closePath();
          ctx.fill();

          // Wagging Caudal Tail Fin
          ctx.save();
          ctx.translate(-enemy.width * 0.45, 0);
          ctx.rotate(tailPhase);

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-enemy.width * 0.25, -enemy.height * 0.65);
          ctx.lineTo(-enemy.width * 0.15, 0);
          ctx.lineTo(-enemy.width * 0.25, enemy.height * 0.55);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Gills
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(enemy.width * 0.05 - i * 6, -enemy.height * 0.15);
            ctx.lineTo(enemy.width * 0.05 - i * 6, enemy.height * 0.15);
            ctx.stroke();
          }

          // Menacing Eye
          ctx.fillStyle = enemy.isAggro ? '#ef4444' : '#0f172a';
          ctx.beginPath();
          ctx.arc(enemy.width * 0.32, -enemy.height * 0.1, 4, 0, Math.PI * 2);
          ctx.fill();
          if (enemy.isAggro) {
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(enemy.width * 0.33, -enemy.height * 0.1, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Teeth / Jaws when aggro
          if (enemy.isAggro) {
            ctx.fillStyle = '#ffffff';
            for (let t = 0; t < 3; t++) {
              ctx.beginPath();
              ctx.moveTo(enemy.width * 0.35 + t * 4, enemy.height * 0.08);
              ctx.lineTo(enemy.width * 0.37 + t * 4, enemy.height * 0.18);
              ctx.lineTo(enemy.width * 0.39 + t * 4, enemy.height * 0.08);
              ctx.fill();
            }
          }
          break;
        }

        case 'jellyfish': {
          // Bioluminescent pulsing jellyfish
          const pulse = Math.sin(tick * 0.08 + (enemy.tentaclePhase || 0));
          const bellScaleY = 1 + pulse * 0.15;
          const bellScaleX = 1 - pulse * 0.1;

          // Glowing Aura
          const jAura = ctx.createRadialGradient(0, -6, 5, 0, -6, 28);
          jAura.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
          jAura.addColorStop(1, 'rgba(192, 132, 252, 0)');
          ctx.fillStyle = jAura;
          ctx.beginPath();
          ctx.arc(0, -6, 28, 0, Math.PI * 2);
          ctx.fill();

          // Translucent Bell
          ctx.save();
          ctx.scale(bellScaleX, bellScaleY);

          const bellGrad = ctx.createLinearGradient(0, -enemy.height * 0.45, 0, 0);
          bellGrad.addColorStop(0, '#c084fc');
          bellGrad.addColorStop(0.7, '#a855f7');
          bellGrad.addColorStop(1, '#e879f9');
          ctx.fillStyle = bellGrad;

          ctx.beginPath();
          ctx.arc(0, 0, enemy.width * 0.45, Math.PI, 0);
          ctx.quadraticCurveTo(enemy.width * 0.3, 4, 0, 2);
          ctx.quadraticCurveTo(-enemy.width * 0.3, 4, -enemy.width * 0.45, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          // Undulating Tentacles
          ctx.strokeStyle = '#d8b4fe';
          ctx.lineWidth = 2;
          for (let i = -2; i <= 2; i++) {
            const tx = i * 6;
            ctx.beginPath();
            ctx.moveTo(tx, 0);
            const wave1 = Math.sin(tick * 0.1 + i + (enemy.tentaclePhase || 0)) * 8;
            const wave2 = Math.cos(tick * 0.12 + i) * 10;
            ctx.quadraticCurveTo(tx + wave1, enemy.height * 0.4, tx + wave2, enemy.height * 0.85);
            ctx.stroke();
          }
          break;
        }

        case 'pufferfish': {
          // Pufferfish that inflates when player approaches
          const isLeft = enemy.facing === 'left';
          if (isLeft) ctx.scale(-1, 1);

          const puff = enemy.puffProgress || 0; // 0..1
          const radius = enemy.baseRadius * (1 + puff * 0.8);

          // Puffer Body
          const pGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
          pGrad.addColorStop(0, puff > 0.4 ? '#fef08a' : '#fed7aa');
          pGrad.addColorStop(0.6, puff > 0.4 ? '#f97316' : '#f59e0b');
          pGrad.addColorStop(1, puff > 0.4 ? '#dc2626' : '#d97706');
          ctx.fillStyle = pGrad;

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();

          // Sharp spikes (prominent when inflated!)
          const spikeCount = 12 + Math.floor(puff * 6);
          const spikeLength = 4 + puff * 10;
          ctx.fillStyle = '#7c2d12';
          for (let s = 0; s < spikeCount; s++) {
            const angle = (s / spikeCount) * Math.PI * 2;
            const bx = Math.cos(angle) * (radius - 2);
            const by = Math.sin(angle) * (radius - 2);
            const tx = Math.cos(angle) * (radius + spikeLength);
            const ty = Math.sin(angle) * (radius + spikeLength);

            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(radius * 0.35, -radius * 0.2, 5 + puff * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(radius * 0.4, -radius * 0.2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Tail
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(-radius * 0.8, 0);
          ctx.lineTo(-radius * 1.4, -radius * 0.4);
          ctx.lineTo(-radius * 1.4, radius * 0.4);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'mine': {
          // Anchored Naval Sea Mine
          const r = enemy.baseRadius;

          // Iron Spiked Ball
          const mGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
          mGrad.addColorStop(0, '#64748b');
          mGrad.addColorStop(0.7, '#1e293b');
          mGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = mGrad;

          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Contact Horns / Detonators
          ctx.fillStyle = '#334155';
          for (let h = 0; h < 8; h++) {
            const angle = (h / 8) * Math.PI * 2;
            const hx = Math.cos(angle) * (r + 7);
            const hy = Math.sin(angle) * (r + 7);
            ctx.beginPath();
            ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Blinking Warning LED
          const blink = Math.sin(tick * 0.15 + (enemy.blinkTick || 0)) > 0;
          ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();

          if (blink) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
          }

          // Heavy anchor chain links
          if (enemy.chainAnchorY) {
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, r);
            ctx.lineTo(0, enemy.chainAnchorY - cameraY);
            ctx.stroke();
          }
          break;
        }
      }

      ctx.restore();
    });
  }

  // Draw Giant Shark Boss (Megalodon)
  public drawBoss(boss: Boss, cameraX: number, cameraY: number, tick: number) {
    const ctx = this.ctx;
    const sx = boss.x - cameraX;
    const sy = boss.y - cameraY;

    if (sx < -300 || sx > this.width + 300 || sy < -300 || sy > this.height + 300) return;

    ctx.save();
    ctx.translate(sx, sy);

    const isLeft = boss.facing === 'left';
    if (isLeft) ctx.scale(-1, 1);

    const isStunned = boss.state === 'stunned';
    const isCharging = boss.state === 'charging';

    // Tail Wagging
    const tailSpeed = isCharging ? 0.35 : 0.15;
    const tailPhase = Math.sin(tick * tailSpeed + boss.animationTick) * 0.3;

    // Wake Shockwave Bubbles when charging
    if (isCharging) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      for (let i = 0; i < 5; i++) {
        const bx = -boss.width * 0.6 - i * 25;
        const by = Math.sin(tick * 0.3 + i) * 20;
        ctx.beginPath();
        ctx.arc(bx, by, 10 + i * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Huge Megalodon Body
    const megalodonGrad = ctx.createLinearGradient(0, -boss.height / 2, 0, boss.height / 2);
    if (isStunned) {
      megalodonGrad.addColorStop(0, '#38bdf8');
      megalodonGrad.addColorStop(0.5, '#0284c7');
      megalodonGrad.addColorStop(1, '#e0f2fe');
    } else {
      megalodonGrad.addColorStop(0, '#0f172a'); // Massive dark back
      megalodonGrad.addColorStop(0.55, '#334155'); // Deep slate
      megalodonGrad.addColorStop(1, '#f8fafc'); // White underbelly
    }
    ctx.fillStyle = megalodonGrad;

    ctx.beginPath();
    ctx.moveTo(boss.width * 0.5, 0); // Massive snout
    ctx.bezierCurveTo(
      boss.width * 0.25,
      -boss.height * 0.6,
      -boss.width * 0.25,
      -boss.height * 0.5,
      -boss.width * 0.45,
      0
    );
    ctx.bezierCurveTo(
      -boss.width * 0.25,
      boss.height * 0.55,
      boss.width * 0.25,
      boss.height * 0.45,
      boss.width * 0.5,
      0
    );
    ctx.closePath();
    ctx.fill();

    // Colossal Dorsal Fin with battle scars
    ctx.fillStyle = isStunned ? '#0369a1' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, -boss.height * 0.42);
    ctx.lineTo(-boss.width * 0.12, -boss.height * 1.15);
    ctx.lineTo(-boss.width * 0.24, -boss.height * 0.4);
    ctx.closePath();
    ctx.fill();

    // Pectoral Fins
    ctx.beginPath();
    ctx.moveTo(boss.width * 0.15, boss.height * 0.15);
    ctx.lineTo(-boss.width * 0.05, boss.height * 0.95);
    ctx.lineTo(-boss.width * 0.18, boss.height * 0.25);
    ctx.closePath();
    ctx.fill();

    // Giant Caudal Tail Fin
    ctx.save();
    ctx.translate(-boss.width * 0.45, 0);
    ctx.rotate(tailPhase);

    ctx.fillStyle = isStunned ? '#0369a1' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-boss.width * 0.32, -boss.height * 0.85);
    ctx.lineTo(-boss.width * 0.18, 0);
    ctx.lineTo(-boss.width * 0.32, boss.height * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5 Gill Slits
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    for (let g = 0; g < 5; g++) {
      ctx.beginPath();
      ctx.moveTo(boss.width * 0.12 - g * 9, -boss.height * 0.2);
      ctx.lineTo(boss.width * 0.12 - g * 9, boss.height * 0.2);
      ctx.stroke();
    }

    // Glowing Menacing Eye
    ctx.fillStyle = isStunned ? '#38bdf8' : isCharging ? '#ef4444' : '#eab308';
    ctx.beginPath();
    ctx.arc(boss.width * 0.35, -boss.height * 0.12, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(boss.width * 0.36, -boss.height * 0.12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Jaws with Razor-sharp Serrated Teeth
    ctx.fillStyle = '#ffffff';
    for (let t = 0; t < 6; t++) {
      ctx.beginPath();
      ctx.moveTo(boss.width * 0.25 + t * 9, boss.height * 0.08);
      ctx.lineTo(boss.width * 0.29 + t * 9, boss.height * 0.25);
      ctx.lineTo(boss.width * 0.33 + t * 9, boss.height * 0.08);
      ctx.fill();
    }

    // Electric Stun Effect
    if (isStunned) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      for (let z = 0; z < 6; z++) {
        const zx = (Math.random() - 0.5) * boss.width;
        const zy = (Math.random() - 0.5) * boss.height;
        ctx.beginPath();
        ctx.moveTo(zx, zy);
        ctx.lineTo(zx + (Math.random() - 0.5) * 30, zy + (Math.random() - 0.5) * 30);
        ctx.stroke();
      }

      // Dizzy Stars
      for (let s = 0; s < 4; s++) {
        const starAngle = tick * 0.1 + (s * Math.PI) / 2;
        const sxSt = Math.cos(starAngle) * 50;
        const sySt = -boss.height * 0.6 + Math.sin(starAngle) * 15;
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('★', sxSt, sySt);
      }
    }

    ctx.restore();

    // Draw In-world Boss Health / Stun Gauge Bar
    const barW = 240;
    const barH = 14;
    const barX = sx - barW / 2;
    const barY = sy - boss.height * 0.85;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 8, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stun or Health fill
    const fillPercent = isStunned ? boss.stunTimer / 18 : (boss.pearlsRequired - boss.pearlsCollected) / boss.pearlsRequired;
    ctx.fillStyle = isStunned ? '#38bdf8' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(0, barW * fillPercent), barH, 4);
    ctx.fill();

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Righteous, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isStunned
        ? `STUNNED! CLAIM THE CHEST! (${Math.ceil(boss.stunTimer)}s)`
        : `MEGALODON BARRIER: ${boss.pearlsCollected}/${boss.pearlsRequired} PEARLS`,
      barX + barW / 2,
      barY + barH / 2
    );
    ctx.restore();
  }

  // Draw Ancient Boss Chest (Level 5)
  public drawBossChest(x: number, y: number, cameraX: number, cameraY: number, isOpen: boolean, tick: number) {
    const ctx = this.ctx;
    const sx = x - cameraX;
    const sy = y - cameraY;

    if (sx < -100 || sx > this.width + 100 || sy < -100 || sy > this.height + 100) return;

    ctx.save();
    ctx.translate(sx, sy);

    // Grand divine radiance
    const glowR = 100 + Math.sin(tick * 0.06) * 15;
    const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, glowR);
    aura.addColorStop(0, isOpen ? 'rgba(250, 204, 21, 0.85)' : 'rgba(217, 119, 6, 0.45)');
    aura.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Golden divine rays if open
    if (isOpen) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      for (let r = 0; r < 8; r++) {
        const rayA = (r / 8) * Math.PI * 2 + tick * 0.02;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rayA - 0.15) * 160, Math.sin(rayA - 0.15) * 160);
        ctx.lineTo(Math.cos(rayA + 0.15) * 160, Math.sin(rayA + 0.15) * 160);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Legendary Chest Body (Double size)
    const w = 70;
    const h = 50;

    const chestGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    chestGrad.addColorStop(0, '#78350f');
    chestGrad.addColorStop(0.5, '#b45309');
    chestGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.fill();

    // Gold Trim & Rubies
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-w / 2 + 6, -h / 2, 8, h);
    ctx.fillRect(w / 2 - 14, -h / 2, 8, h);
    ctx.fillRect(-w / 2, -h / 2 + 10, w, 8);

    // Glowing Center Jewel
    ctx.fillStyle = isOpen ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Prompt if open
    if (isOpen) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Righteous, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLAIM TREASURE!', 0, -h / 2 - 16);
    }

    ctx.restore();
  }

  // Draw Player Diver (Scuba diver with diving helmet, tank, flippers, bubble exhaust, and bubble shield)
  public drawDiver(diver: PlayerDiver, cameraX: number, cameraY: number, tick: number) {
    const ctx = this.ctx;
    const sx = diver.x - cameraX;
    const sy = diver.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    // Damage Invulnerability Flash (blinks when invincible)
    if (diver.invincibleTimer > 0 && Math.floor(diver.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Tilt diver in movement direction
    ctx.rotate(diver.tilt);

    // Direction flip
    const isLeft = diver.facing === 'left';
    if (isLeft) ctx.scale(-1, 1);

    // 1. Oxygen Tank on back
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-diver.width * 0.4, -diver.height * 0.45, 14, diver.height * 0.65, 5);
    ctx.fill();

    // Tank Valve & Regulator Cap
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-diver.width * 0.4 + 2, -diver.height * 0.52, 10, 5);

    // Tank straps
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-diver.width * 0.4, -diver.height * 0.25, 14, 3);
    ctx.fillRect(-diver.width * 0.4, 0, 14, 3);

    // 2. Diver Body & Diving Suit (Vibrant Marine Wetsuit)
    const suitGrad = ctx.createLinearGradient(-diver.width * 0.3, 0, diver.width * 0.3, 0);
    suitGrad.addColorStop(0, '#0284c7'); // Ocean blue
    suitGrad.addColorStop(0.5, '#0ea5e9'); // Light blue
    suitGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = suitGrad;

    // Torso
    ctx.beginPath();
    ctx.roundRect(-diver.width * 0.25, -diver.height * 0.3, diver.width * 0.5, diver.height * 0.6, 8);
    ctx.fill();

    // Wetsuit stripe
    ctx.fillStyle = '#f59e0b'; // High-visibility amber stripe
    ctx.fillRect(-diver.width * 0.25, -diver.height * 0.1, diver.width * 0.5, 4);

    // 3. Legs & Fluttering Flippers
    const flipperSwing1 = Math.sin(diver.flipperPhase) * 0.35;
    const flipperSwing2 = Math.sin(diver.flipperPhase + Math.PI) * 0.35;

    // Leg 1
    ctx.save();
    ctx.translate(-diver.width * 0.25, diver.height * 0.15);
    ctx.rotate(flipperSwing1);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-12, -4, 14, 8);
    // Flipper blade
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-26, -10);
    ctx.lineTo(-24, 8);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Leg 2
    ctx.save();
    ctx.translate(-diver.width * 0.25, -diver.height * 0.1);
    ctx.rotate(flipperSwing2);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-12, -4, 14, 8);
    // Flipper blade
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-26, -10);
    ctx.lineTo(-24, 8);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Arms & Hands
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.roundRect(0, -diver.height * 0.15, diver.width * 0.35, 7, 3);
    ctx.fill();

    // 5. Diving Helmet & Visor
    // Helmet base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(diver.width * 0.2, -diver.height * 0.05, 15, 0, Math.PI * 2);
    ctx.fill();

    // Visor Glass
    const visorGrad = ctx.createLinearGradient(
      diver.width * 0.15,
      -diver.height * 0.15,
      diver.width * 0.35,
      diver.height * 0.05
    );
    visorGrad.addColorStop(0, '#e0f2fe');
    visorGrad.addColorStop(0.5, '#38bdf8');
    visorGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.ellipse(diver.width * 0.25, -diver.height * 0.05, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor glass reflection gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(diver.width * 0.28, -diver.height * 0.1, 4, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Breathing regulator hose
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-diver.width * 0.35, -diver.height * 0.4);
    ctx.quadraticCurveTo(0, -diver.height * 0.4, diver.width * 0.2, -diver.height * 0.05);
    ctx.stroke();

    ctx.restore();

    // 6. Bubble Shield (If Active)
    if (diver.shieldActive) {
      ctx.save();
      ctx.translate(sx, sy);

      const shieldRadius = diver.radius * 1.8;
      const shieldPulse = Math.sin(tick * 0.12) * 3;
      const currentShieldR = shieldRadius + shieldPulse;

      // Outer Iridescent Aura
      const sGrad = ctx.createRadialGradient(0, 0, currentShieldR * 0.4, 0, 0, currentShieldR);
      sGrad.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      sGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.25)');
      sGrad.addColorStop(0.9, 'rgba(244, 114, 182, 0.45)');
      sGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
      ctx.fillStyle = sGrad;

      ctx.beginPath();
      ctx.arc(0, 0, currentShieldR, 0, Math.PI * 2);
      ctx.fill();

      // Outer Ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Swirling highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, currentShieldR - 4, tick * 0.05, tick * 0.05 + 1.2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Draw Dark Ocean Flashlight Effect (Dynamic mask revealing cone of light)
  public drawFlashlightEffect(diver: PlayerDiver, cameraX: number, cameraY: number, level: LevelConfig) {
    if (!level.hasFlashlight) return;

    const ctx = this.ctx;
    const sx = diver.x - cameraX;
    const sy = diver.y - cameraY;

    ctx.save();

    // Create full screen darkness mask with cutout
    // We use a temporary canvas or destination-out masking
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = this.width;
    maskCanvas.height = this.height;
    const mCtx = maskCanvas.getContext('2d');
    if (!mCtx) {
      ctx.restore();
      return;
    }

    // Fill with deep ocean darkness
    mCtx.fillStyle = `rgba(2, 6, 23, ${level.fogAlpha})`;
    mCtx.fillRect(0, 0, this.width, this.height);

    // Cut out flashlight cone + ambient diver halo
    mCtx.globalCompositeOperation = 'destination-out';

    // 1. Ambient soft sphere around diver
    const haloGrad = mCtx.createRadialGradient(sx, sy, 20, sx, sy, 110);
    haloGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mCtx.fillStyle = haloGrad;
    mCtx.beginPath();
    mCtx.arc(sx, sy, 110, 0, Math.PI * 2);
    mCtx.fill();

    // 2. Focused Flashlight Cone pointing in diver facing direction / tilt
    const beamAngle = diver.tilt + (diver.facing === 'left' ? Math.PI : 0);
    const beamDistance = 380;
    const beamSpread = 0.55; // Radians spread

    mCtx.save();
    mCtx.translate(sx, sy);
    mCtx.rotate(beamAngle);

    const beamGrad = mCtx.createRadialGradient(0, 0, 30, beamDistance * 0.6, 0, beamDistance);
    beamGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    beamGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mCtx.fillStyle = beamGrad;

    mCtx.beginPath();
    mCtx.moveTo(15, 0);
    mCtx.arc(0, 0, beamDistance, -beamSpread, beamSpread);
    mCtx.closePath();
    mCtx.fill();
    mCtx.restore();

    // Draw darkness mask onto main canvas
    ctx.drawImage(maskCanvas, 0, 0);

    // Golden / Cyan light shaft dust specks
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(186, 230, 253, 0.2)';
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(beamAngle);
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.arc(0, 0, beamDistance * 0.9, -beamSpread * 0.8, beamSpread * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Draw Particles (Bubbles, pick-up sparkles, blood, electric arcs)
  public drawParticles(particles: Particle[], cameraX: number, cameraY: number) {
    const ctx = this.ctx;

    particles.forEach((p) => {
      const sx = p.x - cameraX;
      const sy = p.y - cameraY;

      if (sx < -20 || sx > this.width + 20 || sy < -20 || sy > this.height + 20) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'bubble') {
        // Translucent bubble with glossy specular highlight
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx - p.radius * 0.35, sy - p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle' || p.type === 'gold') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Draw Floating Score & Event Text (+10, +50, OXYGEN REFILLED!)
  public drawFloatingTexts(texts: FloatingText[], cameraX: number, cameraY: number) {
    const ctx = this.ctx;

    texts.forEach((ft) => {
      const sx = ft.x - cameraX;
      const sy = ft.y - cameraY;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
      ctx.translate(sx, sy);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = 'bold 18px Righteous, sans-serif';
      ctx.textAlign = 'center';

      // Drop shadow for crisp readability
      ctx.fillStyle = '#0f172a';
      ctx.fillText(ft.text, 1.5, 1.5);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }

  // Draw Radar / Mini-map overlay
  public drawRadar(
    diver: PlayerDiver,
    treasures: Treasure[],
    enemies: Enemy[],
    stations: OxygenStation[],
    boss: Boss | undefined,
    level: LevelConfig,
    radarSize: number = 130
  ) {
    const ctx = this.ctx;
    const padding = 16;
    const rx = this.width - radarSize - padding;
    const ry = this.height - radarSize - padding;

    ctx.save();
    // Radar Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(rx, ry, radarSize, radarSize, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // World scale factors
    const scaleX = (radarSize - 12) / level.worldWidth;
    const scaleY = (radarSize - 12) / level.worldHeight;

    // Mini map inner offset
    const ox = rx + 6;
    const oy = ry + 6;

    // Draw Stations (Cyan)
    ctx.fillStyle = '#38bdf8';
    stations.forEach((st) => {
      ctx.beginPath();
      ctx.arc(ox + st.x * scaleX, oy + st.y * scaleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Treasures (Yellow/Gold)
    ctx.fillStyle = '#fbbf24';
    treasures.forEach((tr) => {
      if (!tr.collected) {
        ctx.beginPath();
        ctx.arc(ox + tr.x * scaleX, oy + tr.y * scaleY, tr.type === 'golden_pearl' ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Enemies (Red)
    ctx.fillStyle = '#ef4444';
    enemies.forEach((en) => {
      ctx.beginPath();
      ctx.arc(ox + en.x * scaleX, oy + en.y * scaleY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Boss (Giant Red Blip)
    if (boss && boss.state !== 'defeated') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(ox + boss.x * scaleX, oy + boss.y * scaleY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Diver (Bright Emerald Green Blip)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(ox + diver.x * scaleX, oy + diver.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Radar Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Righteous, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RADAR', rx + 8, ry + 12);

    ctx.restore();
  }
}
