// Web Audio API Arcade Sound Synthesizer
// Zero external file latency, works offline, instant game juice

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private bgmPlaying: boolean = false;
  private bgmSpeed: number = 1.0;
  private bgmIntensity: number = 1.0;

  constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("game_sound_muted") === "true";
    }
  }

  private initCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public get muted() {
    return this.isMuted;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("game_sound_muted", String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  // --- Synthwave Arcade Procedural Background Music ---
  public startBgm() {
    if (this.isMuted || this.bgmPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleBgmTick();
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public setBgmIntensity(streak: number, isFever: boolean) {
    if (isFever) {
      this.bgmSpeed = 1.25;
      this.bgmIntensity = 1.5;
    } else {
      const streakBoost = Math.min(0.2, streak * 0.015);
      this.bgmSpeed = 1.0 + streakBoost;
      this.bgmIntensity = 1.0 + (streak >= 5 ? 0.3 : 0);
    }
  }

  private scheduleBgmTick = () => {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
    this.playBgmStep(this.bgmStep);
    this.bgmStep = (this.bgmStep + 1) % 32;

    const baseIntervalMs = 135 / this.bgmSpeed;
    this.bgmTimer = window.setTimeout(this.scheduleBgmTick, baseIntervalMs);
  };

  private playBgmStep(step: number) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Chords: Am (steps 0-7), F (steps 8-15), C (steps 16-23), G (steps 24-31)
    const chordIdx = Math.floor(step / 8);
    const bassFreqs = [110, 87.31, 65.41, 98.0]; // A2, F2, C2, G2
    const arpChords = [
      [220, 261.63, 329.63, 440], // Am: A3, C4, E4, A4
      [174.61, 220, 261.63, 349.23], // F: F3, A3, C4, F4
      [261.63, 329.63, 392, 523.25], // C: C4, E4, G4, C5
      [196, 246.94, 293.66, 392], // G: G3, B3, D4, G4
    ];

    // Bassline pulse on steps 0, 2, 4, 6 of each chord
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(bassFreqs[chordIdx], t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450 * this.bgmIntensity, t);

      const bassVol = 0.045 * Math.min(1.2, this.bgmIntensity);
      gain.gain.setValueAtTime(bassVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    }

    // Melodic Arpeggio pulse
    const chord = arpChords[chordIdx];
    const arpFreq = chord[step % 4];
    const arpOsc = this.ctx.createOscillator();
    const arpGain = this.ctx.createGain();

    arpOsc.type = "sine";
    arpOsc.frequency.setValueAtTime(arpFreq, t);

    const arpVol = (step % 4 === 0 ? 0.04 : 0.025) * Math.min(1.3, this.bgmIntensity);
    arpGain.gain.setValueAtTime(arpVol, t);
    arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    arpOsc.connect(arpGain);
    arpGain.connect(this.ctx.destination);

    arpOsc.start(t);
    arpOsc.stop(t + 0.13);

    // Subtle Kick on every 4th step (step 0, 4, 8, 12, 16...)
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();

      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(110, t);
      kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.08);

      kickGain.gain.setValueAtTime(0.06, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(this.ctx.destination);

      kickOsc.start(t);
      kickOsc.stop(t + 0.1);
    }
  }

  // Jump: energetic melodic chirp
  public jump() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Double Jump: uplifting dual-tone whoosh
  public doubleJump() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(420, t);
    osc1.frequency.exponentialRampToValueAtTime(840, t + 0.15);

    osc2.frequency.setValueAtTime(630, t);
    osc2.frequency.exponentialRampToValueAtTime(1260, t + 0.15);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.19);
    osc2.stop(t + 0.19);
  }

  // Frenzy / All-Time-High fanfare
  public frenzy() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.14, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.26);
    });
  }

  // Short Squeeze Spring launch: high elastic bounce
  public springJump() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.22);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Fever / Moonshot mode activation fanfare
  public feverStart() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, i) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.035);

      gain.gain.setValueAtTime(0.16, t + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.035 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + i * 0.035);
      osc.stop(t + i * 0.035 + 0.21);
    });
  }

  // Fragile candle cracking warning
  public crackWarning() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Perfect center landing chime
  public perfectLanding() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.03);

      gain.gain.setValueAtTime(0.14, t + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.03);
      osc.stop(t + idx * 0.03 + 0.17);
    });
  }

  // Coin / Dollar pickup: crisp crystal ding
  public coin() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(880, t); // A5
    osc.frequency.setValueAtTime(1174.66, t + 0.04); // D6

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  // Gold Coin pickup: high harmonic chime
  public gold() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [987.77, 1318.51, 1975.53].forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.12, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.23);
    });
  }

  // Soft landing on green candle
  public land() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Bear candle slide warning
  public bearWarning() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.16);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Combo streak chime
  public combo(streak: number) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const baseFreq = Math.min(1200, 440 + streak * 60);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Game over / fall down
  public gameOver() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  // UI click
  public click() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Power-up: Stop-Loss Shield
  public shield() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [440, 659.25, 880].forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.26);
    });
  }

  // Power-up: Liquidity Magnet
  public magnet() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Power-up: Bull Rocket
  public rocket() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Pause / Resume
  public pause() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public resume() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

export const sound = new SoundEngine();
