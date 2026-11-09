/**
 * Deep Sea Treasure - Web Audio API Sound Synthesizer Engine
 * 100% self-contained, offline, realistic underwater sound design.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.4;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private ambientGain: GainNode | null = null;
  private lowOxygenCooldown: number = 0;
  private swimCooldown: number = 0;

  constructor() {
    // Load preferences from localStorage if available
    try {
      const savedMute = localStorage.getItem('dst_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedSfx = localStorage.getItem('dst_sfx_vol');
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
      const savedMusic = localStorage.getItem('dst_music_vol');
      if (savedMusic !== null) this.musicVolume = parseFloat(savedMusic);
    } catch {
      // localStorage may fail in restricted environments
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public userGesture() {
    this.initContext();
    if (!this.isMusicPlaying && !this.isMuted) {
      this.startAmbientMusic();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('dst_muted', String(muted));
    } catch {}
    if (muted) {
      this.stopAmbientMusic();
    } else {
      this.startAmbientMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('dst_sfx_vol', String(this.sfxVolume));
    } catch {}
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('dst_music_vol', String(this.musicVolume));
    } catch {}
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.35, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // --- Sound Effects ---

  public playCoin() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.exponentialRampToValueAtTime(1567.98, t + 0.12); // G6

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playSilverCoin() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playDiamond() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7 shimmer
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + idx * 0.04 + 0.25);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.4);
    });
  }

  public playChest() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant fanfare arpeggio: C5, G5, C6, E6, G6
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.55);
    });
  }

  public playPearl() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Celestial bell with harmonic vibrato
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, t); // D6
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.3);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(587.33, t);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 0.65);
    subOsc.stop(t + 0.65);
  }

  public playRefill() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Bubbly rising water sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(2200, t + 0.4);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playSwim() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const now = Date.now();
    if (now - this.swimCooldown < 250) return;
    this.swimCooldown = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Gentle water displaced swoosh
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, t);

    gain.gain.setValueAtTime(this.sfxVolume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playDamage() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Heavy underwater impact thud
    const osc = this.ctx.createOscillator();
    const noiseOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);

    noiseOsc.type = 'sawtooth';
    noiseOsc.frequency.setValueAtTime(120, t);
    noiseOsc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    noiseOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    noiseOsc.start(t);
    osc.stop(t + 0.3);
    noiseOsc.stop(t + 0.3);
  }

  public playLifeLost() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Dramatic descending sequence
    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.5, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.25);
    });
  }

  public playLowOxygenWarning() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const now = Date.now();
    if (now - this.lowOxygenCooldown < 1200) return;
    this.lowOxygenCooldown = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Double sonar pulse warning beep
    [0, 0.15].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, t + offset); // G5

      gain.gain.setValueAtTime(this.sfxVolume * 0.45, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + offset);
      osc.stop(t + offset + 0.1);
    });
  }

  public playShieldActivate() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Sci-fi bubble shield expansion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.35);

    gain.gain.setValueAtTime(this.sfxVolume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playShieldExpire() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Bubble pop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playBossRoar() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Deep monstrous underwater roar with rumble
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);

    gain.gain.setValueAtTime(this.sfxVolume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  public playBossStunned() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Electric electric discharge
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(220, t + 0.1);
    osc.frequency.setValueAtTime(880, t + 0.2);
    osc.frequency.setValueAtTime(110, t + 0.3);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playVictory() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Grand triumphant fanfare
    const notes = [
      { f: 523.25, time: 0, dur: 0.15 },
      { f: 659.25, time: 0.15, dur: 0.15 },
      { f: 783.99, time: 0.3, dur: 0.15 },
      { f: 1046.5, time: 0.45, dur: 0.4 },
      { f: 880.0, time: 0.9, dur: 0.15 },
      { f: 1046.5, time: 1.05, dur: 0.8 },
    ];

    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, t + n.time);

      gain.gain.setValueAtTime(this.sfxVolume * 0.45, t + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur);
    });
  }

  public playGameOver() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Sinking minor cadence
    const notes = [329.63, 311.13, 293.66, 246.94];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.28);

      gain.gain.setValueAtTime(this.sfxVolume * 0.45, t + idx * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.28 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.28);
      osc.stop(t + idx * 0.28 + 0.4);
    });
  }

  public playClick() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- Ambient Underwater Music Loop ---

  public startAmbientMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const scale = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0]; // G major pentatonic underwater calm

    const playTone = () => {
      if (!this.isMusicPlaying || !this.ctx || this.isMuted || this.musicVolume <= 0) return;
      const t = this.ctx.currentTime;

      // Soft ambient chord note
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      const note = scale[Math.floor(Math.random() * scale.length)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      const noteVol = this.musicVolume * (0.12 + Math.random() * 0.08);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(noteVol, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.9);
    };

    // Play periodic soothing ambient note
    playTone();
    this.musicInterval = window.setInterval(() => {
      if (Math.random() > 0.25) {
        playTone();
      }
    }, 1800);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundEngine();
