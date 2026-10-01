import { useEffect, useRef, useState } from "react";
import { CHARACTERS } from "@/lib/game-data";
import { getSkinSpritePath } from "@/lib/skin-assets";
import {
  TIMEFRAMES,
  TOP_VOLUME_SYMBOLS,
  fetchMarketCandles,
  type Candle,
  type MarketSymbol,
  type TimeframeConfig,
} from "@/lib/market-data";
import { useGameStore } from "@/lib/store";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronsUp,
  Heart,
  RotateCcw,
  Search,
  Share2,
  TrendingUp,
  X,
  Zap,
  Pause,
  Play,
  Shield,
  Magnet,
  Flame,
  Volume2,
  VolumeX,
  Home,
  Trophy,
  Medal,
  Flag,
  Award,
  Clock,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { DailySpeedrunRecord } from "@/lib/store";

type PlatformType = "normal" | "volatile" | "spring" | "fragile" | "finish";

type Platform = {
  x: number;
  y: number;
  baseY: number;
  w: number;
  h: number;
  bull: boolean;
  type: PlatformType;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  changePct: number;
  patternName: string;
  patternTip: string;
  label: string;
  wickTop: number;
  wickBottom: number;
  sinkOffset: number;
  crackTimer: number;
  cracked: boolean;
  sinePhase: number;
  isFinish?: boolean;
};

type CollectibleKind = "dolar" | "altin" | "kalkan" | "miknatis" | "roket";

type Collectible = {
  x: number;
  y: number;
  r: number;
  kind: CollectibleKind;
  value: number;
  collected: boolean;
  bob: number;
};

type PlayerAnimation = "bekle" | "sol" | "sag" | "zipla" | "dus";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
};

const DEFAULT_TIMEFRAME = TIMEFRAMES[0];
const TRADE_SYMBOLS = TOP_VOLUME_SYMBOLS;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const initialTickerIdx = Math.floor(Math.random() * TRADE_SYMBOLS.length);
  const [timeframe, setTimeframe] = useState<TimeframeConfig>(DEFAULT_TIMEFRAME);
  const [tickerIdx, setTickerIdx] = useState(initialTickerIdx);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"canlı" | "gerçek-tarihi">("gerçek-tarihi");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(() => sound.muted);
  const [search, setSearch] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [hud, setHud] = useState({
    lives: 3,
    dollars: 0,
    distance: 0,
    gameOver: false,
    isVictory: false,
    speedrunRank: null as number | null,
    finishMeters: 450,
    elapsedMs: 0,
    streak: 0,
    multiplier: 1,
    isNewRecord: false,
    hasShield: false,
    magnetSeconds: 0,
    rocketSeconds: 0,
    feverCharge: 0,
    feverSeconds: 0,
    perfectLandings: 0,
    activeCandle: null as {
      price: number;
      open: number;
      high: number;
      low: number;
      volume: number;
      changePct: number;
      patternName: string;
      patternTip: string;
      label: string;
    } | null,
  });

  const selectedCharId = useGameStore((s) => s.selectedCharacter);
  const selectedSkinId = useGameStore((s) => s.selectedSkins[selectedCharId] || "base");
  const character = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const addDollarsGlobal = useGameStore((s) => s.addDollars);
  const addCoinGlobal = useGameStore((s) => s.addCoin);
  const recordRun = useGameStore((s) => s.recordRun);
  const recordSpeedrunGlobal = useGameStore((s) => s.recordSpeedrun);
  const getTodayLeaderboardGlobal = useGameStore((s) => s.getTodayLeaderboard);
  const highScore = useGameStore((s) => s.highScore);
  const characterRef = useRef(character);
  const skinIdRef = useRef(selectedSkinId);
  const dataSourceRef = useRef(dataSource);
  const loadingRef = useRef(loading);

  const stateRef = useRef({
    lives: 3,
    dollars: 0,
    distance: 0,
    gameOver: false,
    isVictory: false,
    completed: false,
    finishX: 0,
    finishMeters: 450,
    cameraX: 0,
    bullStreak: 0,
    multiplier: 1,
    isNewRecord: false,
    hasShield: false,
    magnetTimer: 0,
    rocketTimer: 0,
    feverCharge: 0,
    feverTimer: 0,
    perfectCount: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    screenShake: 0,
    ambientDust: [] as { x: number; y: number; speed: number; size: number; alpha: number }[],
    minPrice: 0,
    maxPrice: 0,
    groundY: 460,
    topY: 150,
    activeCandle: null as {
      price: number;
      open: number;
      high: number;
      low: number;
      volume: number;
      changePct: number;
      patternName: string;
      patternTip: string;
      label: string;
    } | null,
    player: {
      x: 80,
      y: 0,
      vx: 0,
      vy: 0,
      w: 24,
      h: 32,
      onGround: false,
      facing: 1,
      animation: "bekle" as PlayerAnimation,
      runClock: 0,
      canDoubleJump: true,
      jumpSpin: 0,
      squashX: 1,
      squashY: 1,
    },
    input: { left: false, right: false, jump: false, jumpPressed: false },
    platforms: [] as Platform[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as { x: number; y: number; text: string; life: number; color: string }[],
    candles: [] as Candle[],
    bgBars: [] as { x: number; h: number; w: number }[],
    lastTime: 0,
    started: false,
    startAt: 0,
    elapsedMs: 0,
    jumpPower: -560,
  });

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    skinIdRef.current = selectedSkinId;
  }, [selectedSkinId]);

  useEffect(() => {
    dataSourceRef.current = dataSource;
  }, [dataSource]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let cancelled = false;
    const id = requestIdRef.current + 1;
    requestIdRef.current = id;
    setLoading(true);

    fetchMarketCandles(TRADE_SYMBOLS[tickerIdx], timeframe, 124).then(({ candles, source }) => {
      if (cancelled || requestIdRef.current !== id) return;
      buildLevel(candles, timeframe);
      setDataSource(source);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [timeframe, tickerIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        if (down && !stateRef.current.gameOver) {
          togglePause();
        }
        return;
      }
      if (isPausedRef.current) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setInput("left", down);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setInput("right", down);
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        setInput("jump", down);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      const wrap = containerRef.current;
      if (!canvas || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      const state = stateRef.current;
      const dt = Math.min(0.033, (time - (state.lastTime || time)) / 1000);
      state.lastTime = time;
      if (!isPausedRef.current) {
        step(dt, time);
      }
      render(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const togglePause = () => {
    const next = !isPausedRef.current;
    if (next) {
      sound.pause();
      sound.stopBgm();
      haptic.light();
    } else {
      sound.resume();
      if (stateRef.current.started && !stateRef.current.gameOver) {
        sound.startBgm();
      }
      haptic.light();
    }
    setIsPaused(next);
  };

  const toggleMuteInGame = () => {
    haptic.light();
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted && stateRef.current.started && !stateRef.current.gameOver && !isPausedRef.current) {
      sound.startBgm();
    }
  };

  const buildLevel = (candles: Candle[], tf: TimeframeConfig) => {
    const state = stateRef.current;
    state.candles = candles;
    const prices = candles.flatMap((c) => [c.h, c.l]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = Math.max(0.0001, maxPrice - minPrice);
    const layout = getTimeframeLayout(tf.id);
    const groundY = layout.groundY;
    const topY = layout.topY;
    state.minPrice = minPrice;
    state.maxPrice = maxPrice;
    state.groundY = groundY;
    state.topY = topY;

    // Adapt player collision hitbox to candle width
    const playerW = tf.id === "1y" ? 18 : tf.id === "1ay" ? 22 : 24;
    state.player.w = playerW;

    const priceToY = (price: number) => groundY - ((price - minPrice) / range) * (groundY - topY);
    const platforms: Platform[] = [];
    const collectibles: Collectible[] = [];
    let cursorX = 56;
    let currentY = 360;

    const maxLevelCandles = Math.min(80, candles.length);
    const activeCandles = candles.slice(0, maxLevelCandles);
    const finishIndex = activeCandles.length - 1;

    activeCandles.forEach((candle, i) => {
      const bull = candle.c >= candle.o;
      const rawTargetY = priceToY(Math.max(candle.o, candle.c));

      // Smooth vertical curve so jumps are never impossible cliffs
      if (i > 0) {
        const deltaY = rawTargetY - currentY;
        const clampedDelta = Math.max(-42, Math.min(42, deltaY));
        currentY = currentY + clampedDelta;
      } else {
        currentY = Math.max(200, Math.min(400, rawTargetY));
      }

      const bodyTop = Math.max(140, Math.min(420, currentY));
      const rawH = Math.abs(priceToY(candle.o) - priceToY(candle.c));
      const h = Math.max(34, Math.min(100, rawH * 0.6 + 28));
      const wickTop = bodyTop - Math.min(42, Math.abs(priceToY(candle.h) - rawTargetY) * 0.4 + 16);
      const wickBottom =
        bodyTop + h + Math.min(42, Math.abs(priceToY(candle.l) - rawTargetY) * 0.4 + 16);

      // True variable candle width scaled strictly per timeframe:
      // 1G: ~96px (broad, forgiving, low fall risk)
      // 1H: ~68px (balanced)
      // 1A: ~46px (narrow)
      // 1Y: ~26px (razor-thin, precise jumps, high risk of falling off edges!)
      let w = Math.max(22, Math.min(120, tf.candleWidth * (0.96 + deterministicWave(i, 0.08))));
      const gap = Math.max(22, Math.min(48, tf.gap * (0.94 + deterministicWave(i + 11, 0.12))));

      let type: PlatformType = "normal";
      const isFinish = i === finishIndex;

      if (isFinish) {
        type = "finish";
        w = 260; // Spacious Golden Victory Podium
      } else if (i > 3) {
        if (bull) {
          if (i % 7 === 0) {
            type = "spring"; // Short Squeeze Trampoline!
          } else if (i % 5 === 0) {
            type = "volatile"; // Moving up and down!
          }
        } else {
          if (i % 6 === 0) {
            type = "fragile"; // Cracks and collapses!
          }
        }
      }

      platforms.push({
        x: cursorX,
        y: bodyTop,
        baseY: bodyTop,
        w,
        h: isFinish ? Math.max(h, 60) : h,
        bull: isFinish ? true : bull,
        type,
        price: candle.c,
        open: candle.o,
        high: candle.h,
        low: candle.l,
        volume: candle.v || 25000,
        changePct: candle.changePct ?? Number((((candle.c - candle.o) / Math.max(0.001, candle.o)) * 100).toFixed(2)),
        patternName: candle.patternName ?? (bull ? "Boğa Mumu" : "Ayı Mumu"),
        patternTip: candle.patternTip ?? (bull ? "Alıcılar seansı kazandı." : "Satıcılar baskın geldi."),
        label: isFinish ? "BİTİŞ ÇİZGİSİ" : candle.label,
        wickTop,
        wickBottom,
        sinkOffset: 0,
        crackTimer: 0,
        cracked: false,
        sinePhase: i * 0.9,
        isFinish,
      });

      if (isFinish) {
        state.finishX = cursorX + 90;
        state.finishMeters = Math.floor(state.finishX / 20);

        // 5 Star Coins over the victory platform
        for (let coinIdx = 0; coinIdx < 5; coinIdx++) {
          collectibles.push({
            x: cursorX + 50 + coinIdx * 38,
            y: bodyTop - 65 - Math.sin((coinIdx / 4) * Math.PI) * 25,
            r: 12,
            kind: "altin",
            value: 100,
            collected: false,
            bob: coinIdx * 0.4,
          });
        }
      } else if (type === "spring") {
        // If Short Squeeze Spring candle, spawn an arc of 4 gold coins in the sky
        for (let coinIdx = 0; coinIdx < 4; coinIdx++) {
          const coinArcX = cursorX + w / 2 + (coinIdx - 1.5) * 28;
          const coinArcY = bodyTop - 110 - Math.sin((coinIdx / 3) * Math.PI) * 45;
          collectibles.push({
            x: coinArcX,
            y: coinArcY,
            r: 11,
            kind: "altin",
            value: 50,
            collected: false,
            bob: coinIdx * 0.5,
          });
        }
      } else if (i > 1 && i % 2 === 0) {
        // Power-up spawn every 14 candles
        const isPowerup = i > 4 && i % 14 === 0;
        const isGold = !isPowerup && i % 5 === 0;

        let kind: CollectibleKind = "dolar";
        let value = 10;
        let radius = 9;

        if (isPowerup) {
          const powerChoices: CollectibleKind[] = ["kalkan", "miknatis", "roket"];
          kind = powerChoices[(i / 14) % powerChoices.length];
          radius = 13;
          value = 0;
        } else if (isGold) {
          kind = "altin";
          radius = 11;
          value = 50;
        }

        collectibles.push({
          x: cursorX + w / 2,
          y: bodyTop - (isPowerup ? 52 : isGold ? 46 : 38),
          r: radius,
          kind,
          value,
          collected: false,
          bob: i * 0.73,
        });
      }

      cursorX += w + gap;
    });

    const first = platforms[0];
    state.platforms = platforms;
    state.collectibles = collectibles;
    state.player.x = first.x + Math.max(2, Math.min(first.w / 2 - state.player.w / 2, 20));
    state.player.y = first.y - state.player.h;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.animation = "bekle";
    state.player.canDoubleJump = true;
    state.player.jumpSpin = 0;
    state.player.squashX = 1;
    state.player.squashY = 1;
    state.coyoteTimer = 0.14;
    state.jumpBufferTimer = 0;
    state.screenShake = 0;
    state.cameraX = 0;
    state.distance = 0;
    state.dollars = 0;
    state.lives = 3;
    state.bullStreak = 0;
    state.multiplier = 1;
    state.isNewRecord = false;
    state.hasShield = false;
    state.magnetTimer = 0;
    state.rocketTimer = 0;
    state.feverCharge = 0;
    state.feverTimer = 0;
    state.perfectCount = 0;
    state.gameOver = false;
    state.isVictory = false;
    state.completed = false;
    state.particles = [];
    state.floatingTexts = [];
    state.started = false;
    state.startAt = 0;
    state.elapsedMs = 0;
    state.jumpPower = -560 * tf.jumpBoost;
    state.activeCandle = {
      price: first.price,
      open: first.open,
      high: first.high,
      low: first.low,
      volume: first.volume,
      changePct: first.changePct,
      patternName: first.patternName,
      patternTip: first.patternTip,
      label: first.label,
    };
    setIsPaused(false);

    // Ambient floating market embers/dust
    state.ambientDust = Array.from({ length: 28 }, (_, i) => ({
      x: i * 85 + Math.random() * 40,
      y: 40 + Math.random() * 380,
      speed: 10 + Math.random() * 15,
      size: 1.5 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.25,
    }));

    // Ambient background volume profile
    state.bgBars = Array.from({ length: 42 }, (_, i) => ({
      x: i * 70,
      h: 24 + ((i * 37) % 90),
      w: 32,
    }));

    setHud({
      lives: 3,
      dollars: 0,
      distance: 0,
      gameOver: false,
      isVictory: false,
      speedrunRank: null,
      finishMeters: state.finishMeters,
      elapsedMs: 0,
      streak: 0,
      multiplier: 1,
      isNewRecord: false,
      hasShield: false,
      magnetSeconds: 0,
      rocketSeconds: 0,
      feverCharge: 0,
      feverSeconds: 0,
      perfectLandings: 0,
      activeCandle: state.activeCandle,
    });
  };

  const step = (dt: number, now: number) => {
    const state = stateRef.current;
    if (state.gameOver || loadingRef.current || state.platforms.length === 0) return;
    const player = state.player;
    const activeMove = state.input.left || state.input.right || state.input.jumpPressed;

    if (!state.started && activeMove) {
      state.started = true;
      state.startAt = now;
      sound.startBgm();
    }
    if (state.started) state.elapsedMs = now - state.startAt;

    // Check Finish Line Victory!
    if (
      !state.gameOver &&
      !state.isVictory &&
      state.finishX > 0 &&
      player.x + player.w >= state.finishX
    ) {
      completeRun();
      return;
    }

    // Volatile & Fragile Platforms Update
    for (const p of state.platforms) {
      if (p.type === "volatile") {
        p.y = p.baseY + Math.sin(now / 380 + p.sinePhase) * 26;
      } else if (p.type === "fragile" && p.crackTimer > 0 && !p.cracked) {
        p.crackTimer -= dt;
        p.sinkOffset = Math.sin(now / 25) * 3.5;
        if (Math.random() > 0.45) {
          state.particles.push({
            x: p.x + Math.random() * p.w,
            y: p.y + Math.random() * p.h,
            vx: (Math.random() - 0.5) * 40,
            vy: 20 + Math.random() * 40,
            size: 2,
            life: 0.18,
            maxLife: 0.18,
            color: "#f43f5e",
          });
        }
        if (p.crackTimer <= 0) {
          p.cracked = true;
          p.sinkOffset = 9999;
          spawnBurst(state.particles, p.x + p.w / 2, p.y + p.h / 2, 14, "#e11d48", 1.5);
        }
      }
    }

    // Fever / Moonshot Mode Update
    const isFeverActive = state.feverTimer > 0;
    if (isFeverActive) {
      state.feverTimer = Math.max(0, state.feverTimer - dt);
      state.multiplier = 5;

      // Super Magnet in Fever Mode
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      for (const item of state.collectibles) {
        if (item.collected) continue;
        const dx = px - item.x;
        const dy = py - item.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 380 * 380) {
          const dist = Math.sqrt(distSq);
          item.x += (dx / dist) * 440 * dt;
          item.y += (dy / dist) * 440 * dt;
        }
      }

      // Rainbow / Gold fever trail
      state.particles.push({
        x: player.x + player.w / 2 - player.facing * 12,
        y: player.y + player.h / 2 + (Math.random() - 0.5) * 16,
        vx: -player.facing * (60 + Math.random() * 60),
        vy: (Math.random() - 0.5) * 40,
        size: 3.5,
        life: 0.28,
        maxLife: 0.28,
        color: ["#f59e0b", "#10b981", "#38bdf8", "#ec4899", "#a855f7"][
          Math.floor(Math.random() * 5)
        ],
      });
    }

    // Dynamic BGM tempo & intensity
    sound.setBgmIntensity(state.bullStreak, isFeverActive);

    // Power-up timers
    if (state.magnetTimer > 0) {
      state.magnetTimer = Math.max(0, state.magnetTimer - dt);
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      for (const item of state.collectibles) {
        if (item.collected) continue;
        const dx = px - item.x;
        const dy = py - item.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 220 * 220) {
          const dist = Math.sqrt(distSq);
          item.x += (dx / dist) * 360 * dt;
          item.y += (dy / dist) * 360 * dt;
        }
      }
    }

    const isRocketActive = state.rocketTimer > 0;
    if (isRocketActive) {
      state.rocketTimer = Math.max(0, state.rocketTimer - dt);
      player.vx = 400;
      player.vy = 0;
      player.onGround = true;

      // Rocket flame trail
      state.particles.push({
        x: player.x - player.facing * 6,
        y: player.y + player.h / 2 + (Math.random() - 0.5) * 8,
        vx: -player.facing * (100 + Math.random() * 50),
        vy: (Math.random() - 0.5) * 30,
        size: 3.5,
        life: 0.16,
        maxLife: 0.16,
        color: Math.random() > 0.5 ? "#f59e0b" : "#f43f5e",
      });
    }

    const gravity = isRocketActive ? 0 : 1380;
    const moveSpeed = 260 + Math.min(90, state.distance * 0.02);
    const wasOnGround = player.onGround;

    // Coyote time tracking
    if (player.onGround) {
      state.coyoteTimer = 0.14;
      player.canDoubleJump = true;
    } else {
      state.coyoteTimer = Math.max(0, state.coyoteTimer - dt);
    }

    // Jump buffering
    if (state.input.jumpPressed) {
      state.jumpBufferTimer = 0.14;
    }
    state.jumpBufferTimer = Math.max(0, state.jumpBufferTimer - dt);

    // Smooth squash & stretch decay
    player.squashX += (1 - player.squashX) * Math.min(1, 14 * dt);
    player.squashY += (1 - player.squashY) * Math.min(1, 14 * dt);

    // Double jump rotation decay
    if (player.jumpSpin !== 0) {
      const spinSpeed = 16 * dt;
      if (Math.abs(player.jumpSpin) <= spinSpeed) {
        player.jumpSpin = 0;
      } else {
        player.jumpSpin -= Math.sign(player.jumpSpin) * spinSpeed;
      }
    }

    // Screen shake decay
    if (state.screenShake > 0) {
      state.screenShake = Math.max(0, state.screenShake - 2.5 * dt);
    }

    if (!isRocketActive) {
      // Smooth responsive horizontal physics
      const targetVx = state.input.left ? -moveSpeed : state.input.right ? moveSpeed : 0;
      if (targetVx !== 0) {
        player.facing = targetVx > 0 ? 1 : -1;
        const accel = player.onGround ? 2200 : 1500;
        player.vx += (targetVx - player.vx) * Math.min(1, accel * dt * 0.015);
      } else {
        const friction = player.onGround ? 0.78 : 0.94;
        player.vx *= friction;
        if (Math.abs(player.vx) < 5) player.vx = 0;
      }

      // Ground or Coyote Jump
      if (state.jumpBufferTimer > 0 && state.coyoteTimer > 0) {
        player.vy = state.jumpPower;
        player.onGround = false;
        player.squashX = 0.76;
        player.squashY = 1.28;
        state.coyoteTimer = 0;
        state.jumpBufferTimer = 0;
        sound.jump();
        haptic.light();
        spawnBurst(state.particles, player.x + player.w / 2, player.y + player.h, 7, "#10b981", 1);
      }
      // Air Double Jump!
      else if (state.jumpBufferTimer > 0 && player.canDoubleJump && !player.onGround) {
        player.canDoubleJump = false;
        player.vy = state.jumpPower * 0.92;
        player.squashX = 0.72;
        player.squashY = 1.34;
        player.jumpSpin = player.facing * Math.PI * 2;
        state.jumpBufferTimer = 0;
        sound.doubleJump();
        haptic.medium();
        spawnDoubleJumpBurst(state.particles, player.x + player.w / 2, player.y + player.h / 2);
      }

      // Variable jump height: release early to cut upward velocity for tight precision
      if (!state.input.jump && player.vy < -200) {
        player.vy *= 0.88;
      }
    }
    state.input.jumpPressed = false;

    const prevX = player.x;
    const prevY = player.y;
    player.vy = Math.min(960, player.vy + gravity * dt);
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    // Platform side wall collision: prevent passing horizontally through candle bodies
    for (const platform of state.platforms) {
      if (platform.cracked) continue;
      if (Math.abs(platform.x - player.x) > 120) continue;
      const py = platform.y + platform.sinkOffset;
      const candleBottom = py + platform.h;
      if (player.y + player.h > py + 14 && player.y < candleBottom) {
        if (prevX + player.w <= platform.x && player.x + player.w > platform.x) {
          player.x = platform.x - player.w;
          player.vx = 0;
        } else if (prevX >= platform.x + platform.w && player.x < platform.x + platform.w) {
          player.x = platform.x + platform.w;
          player.vx = 0;
        }
      }
    }

    const previousBottom = prevY + player.h;
    const currentBottom = player.y + player.h;
    const footCenter = player.x + player.w / 2;
    let supportPlatform: Platform | null = null;
    let supportY = Number.POSITIVE_INFINITY;

    for (const platform of state.platforms) {
      if (platform.cracked) continue;
      if (Math.abs(platform.x - player.x) > 160) continue;
      const py = platform.y + platform.sinkOffset;

      // STRICT PLATFORM BOUNDS CHECK:
      // Karakterin ayak merkezi kesinlikle mumun genişliği içinde olmalıdır.
      // Dışarı taştığı anda ayak altı boşalır ve karakter doğrudan aşağı düşer!
      const onPlatform = footCenter >= platform.x && footCenter <= platform.x + platform.w;
      if (!onPlatform) continue;

      const crossedTop = player.vy >= 0 && previousBottom <= py + 14 && currentBottom >= py;
      const alreadyStanding = wasOnGround && Math.abs(currentBottom - py) <= 8 && player.vy >= -30;

      if ((crossedTop || alreadyStanding) && py < supportY) {
        supportPlatform = platform;
        supportY = py;
      }
    }

    if (supportPlatform) {
      // Fragile candle step trigger
      if (
        supportPlatform.type === "fragile" &&
        supportPlatform.crackTimer === 0 &&
        !supportPlatform.cracked
      ) {
        supportPlatform.crackTimer = 0.45;
        sound.crackWarning();
        haptic.warning();
        state.screenShake = 0.2;
      }

      // Spring / Short Squeeze candle launch trigger!
      if (supportPlatform.type === "spring" && !wasOnGround) {
        player.vy = state.jumpPower * 1.48;
        player.onGround = false;
        player.canDoubleJump = true;
        player.squashX = 0.65;
        player.squashY = 1.45;
        sound.springJump();
        haptic.heavy();
        state.screenShake = 0.25;
        state.floatingTexts.push({
          x: player.x,
          y: player.y - 30,
          text: "⚡ SHORT SQUEEZE! +🚀",
          life: 1.6,
          color: "#fbbf24",
        });
        spawnBurst(state.particles, player.x + player.w / 2, supportPlatform.y, 16, "#f59e0b", 2.0);
      } else {
        player.y = supportY - player.h;
        player.vy = 0;
        player.onGround = true;
        player.canDoubleJump = true;
        player.jumpSpin = 0;

        // Dynamic Active Candle for Learning
        state.activeCandle = {
          price: supportPlatform.price,
          open: supportPlatform.open,
          high: supportPlatform.high,
          low: supportPlatform.low,
          volume: supportPlatform.volume,
          changePct: supportPlatform.changePct,
          patternName: supportPlatform.patternName,
          patternTip: supportPlatform.patternTip,
          label: supportPlatform.label,
        };

        // EDGE SLIP MECHANICS:
        // Mumun kenar ucuna basıldığında (sol veya sağ dış çeper), karakter dışarı doğru kaymaya başlar.
        // İnce mumlarda (1Y) platform çok dar (26px) olduğu için kenara basan anında kayıp aşağı düşer!
        if (!supportPlatform.isFinish) {
          const leftLip = footCenter - supportPlatform.x;
          const rightLip = supportPlatform.x + supportPlatform.w - footCenter;
          const slipThreshold = Math.min(5, supportPlatform.w * 0.18);

          if (leftLip < slipThreshold) {
            player.vx = Math.min(player.vx, -90);
            if (Math.random() < 0.3) {
              spawnBurst(state.particles, supportPlatform.x, supportPlatform.y, 1, "#64748b", 0.4);
            }
          } else if (rightLip < slipThreshold) {
            player.vx = Math.max(player.vx, 90);
            if (Math.random() < 0.3) {
              spawnBurst(state.particles, supportPlatform.x + supportPlatform.w, supportPlatform.y, 1, "#64748b", 0.4);
            }
          }
        }
      }

      if (!wasOnGround) {
        player.squashX = 1.25;
        player.squashY = 0.75;
        sound.land();
        spawnBurst(
          state.particles,
          player.x + player.w / 2,
          player.y + player.h + 1,
          6,
          supportPlatform.bull ? "#10b981" : "#f43f5e",
          0.75,
        );

        // Check Perfect Center Landing
        const platformCenter = supportPlatform.x + supportPlatform.w / 2;
        const distFromCenter = Math.abs(footCenter - platformCenter);
        if (distFromCenter < 9 && supportPlatform.type !== "spring") {
          state.perfectCount += 1;
          const perfectReward = 25 * state.multiplier;
          state.dollars += perfectReward;
          state.feverCharge = Math.min(100, state.feverCharge + 14);
          sound.perfectLanding();
          haptic.success();
          state.floatingTexts.push({
            x: player.x - 20,
            y: player.y - 42,
            text: `🎯 MÜKEMMEL İNİŞ! +$${perfectReward}`,
            life: 1.4,
            color: "#34d399",
          });
          spawnBurst(state.particles, footCenter, supportPlatform.y, 10, "#6ee7b7", 1.2);
        }

        if (supportPlatform.bull) {
          state.bullStreak += 1;
          state.feverCharge = Math.min(100, state.feverCharge + 6);

          // Check Fever activation!
          if (state.feverCharge >= 100 && state.feverTimer <= 0) {
            state.feverTimer = 7.0;
            state.feverCharge = 0;
            sound.feverStart();
            haptic.heavy();
            state.screenShake = 0.4;
            state.floatingTexts.push({
              x: player.x - 40,
              y: player.y - 50,
              text: "🌟 BOĞA ÇILGINLIĞI (MOONSHOT)! x5",
              life: 2.2,
              color: "#fbbf24",
            });
            spawnBurst(state.particles, player.x + player.w / 2, player.y, 22, "#f59e0b", 2.2);
          }

          if (state.bullStreak >= 10 && !isFeverActive) {
            state.multiplier = 3;
            if (state.bullStreak === 10) {
              sound.frenzy();
              haptic.heavy();
              state.screenShake = 0.35;
              state.floatingTexts.push({
                x: player.x,
                y: player.y - 25,
                text: "🚀 ALL-TIME HIGH x3!",
                life: 1.6,
                color: "#10b981",
              });
              spawnBurst(state.particles, player.x + player.w / 2, player.y, 14, "#34d399", 1.8);
            }
          } else if (state.bullStreak >= 5 && !isFeverActive) {
            state.multiplier = 2;
            if (state.bullStreak === 5) {
              sound.combo(5);
              haptic.medium();
              state.screenShake = 0.2;
              state.floatingTexts.push({
                x: player.x,
                y: player.y - 25,
                text: "🔥 BOĞA KOŞUSU x2!",
                life: 1.2,
                color: "#34d399",
              });
            }
          }
        } else {
          // Stepped on bear candle
          if (isFeverActive) {
            // Invincible during fever!
            state.floatingTexts.push({
              x: player.x,
              y: player.y - 25,
              text: "⚡ BOĞA YIKTI GEÇTİ!",
              life: 1.2,
              color: "#fbbf24",
            });
          } else if (state.hasShield) {
            state.hasShield = false;
            sound.shield();
            haptic.success();
            state.screenShake = 0.25;
            state.floatingTexts.push({
              x: player.x,
              y: player.y - 25,
              text: "🛡️ STOP-LOSS KORUDU!",
              life: 1.5,
              color: "#38bdf8",
            });
            player.vy = state.jumpPower * 0.7;
          } else {
            state.bullStreak = 0;
            state.multiplier = 1;
            state.screenShake = 0.35;
            sound.bearWarning();
            haptic.warning();
          }
        }
      }

      if (!supportPlatform.bull && !state.hasShield && !isFeverActive) {
        supportPlatform.sinkOffset = Math.min(20, supportPlatform.sinkOffset + 14 * dt);
        player.vx *= 0.96;
      }
    }

    player.runClock += dt * Math.max(1, Math.abs(player.vx) / 60);
    if (!player.onGround && player.vy < 0) player.animation = "zipla";
    else if (!player.onGround && player.vy >= 0) player.animation = "dus";
    else if (Math.abs(player.vx) > 18) player.animation = player.facing > 0 ? "sag" : "sol";
    else player.animation = "bekle";

    // Footstep dust when sprinting
    if (player.onGround && Math.abs(player.vx) > 70 && Math.sin(player.runClock * 7) > 0.86) {
      state.particles.push({
        x: player.x + player.w / 2 - player.facing * 10,
        y: player.y + player.h + 1,
        vx: -player.facing * (18 + Math.abs(player.vx) * 0.08),
        vy: -18,
        size: 2.5,
        life: 0.22,
        maxLife: 0.22,
        color: "rgba(16, 185, 129, 0.4)",
      });
    }

    // Collectibles & Power-up collection
    for (const item of state.collectibles) {
      if (item.collected) continue;
      item.bob += dt * 4.5;
      const dx = player.x + player.w / 2 - item.x;
      const dy = player.y + player.h / 2 - item.y;
      const grabRadius = item.r + 18 + (state.magnetTimer > 0 || isFeverActive ? 25 : 0);

      if (dx * dx + dy * dy < grabRadius * grabRadius) {
        item.collected = true;

        if (item.kind === "kalkan") {
          state.hasShield = true;
          sound.shield();
          haptic.heavy();
          state.floatingTexts.push({
            x: item.x,
            y: item.y - 12,
            text: "🛡️ STOP-LOSS KALKANI!",
            life: 1.5,
            color: "#38bdf8",
          });
        } else if (item.kind === "miknatis") {
          state.magnetTimer = 6.0;
          sound.magnet();
          haptic.heavy();
          state.floatingTexts.push({
            x: item.x,
            y: item.y - 12,
            text: "🧲 LİKİDİTE MIKNATISI!",
            life: 1.5,
            color: "#fbbf24",
          });
        } else if (item.kind === "roket") {
          state.rocketTimer = 3.5;
          sound.rocket();
          haptic.heavy();
          state.screenShake = 0.35;
          state.floatingTexts.push({
            x: item.x,
            y: item.y - 12,
            text: "🚀 BOĞA ROKETİ!",
            life: 1.5,
            color: "#f97316",
          });
        } else {
          // Dollar or Gold Coin
          const reward = item.value * state.multiplier;
          state.dollars += reward;
          state.feverCharge = Math.min(100, state.feverCharge + (item.kind === "altin" ? 5 : 2));

          if (item.kind === "altin") {
            sound.gold();
            haptic.heavy();
          } else {
            sound.coin();
            haptic.medium();
          }

          state.floatingTexts.push({
            x: item.x,
            y: item.y - 10,
            text: `+$${reward}${state.multiplier > 1 ? ` (x${state.multiplier})` : ""}`,
            life: 1,
            color: item.kind === "altin" ? "#f59e0b" : "#10b981",
          });
        }
      }
    }

    state.distance = Math.max(state.distance, player.x);
    const currentMeters = Math.floor(state.distance / 20);
    if (currentMeters > highScore && !state.isNewRecord) {
      state.isNewRecord = true;
      sound.combo(12);
      state.floatingTexts.push({
        x: player.x - 30,
        y: player.y - 45,
        text: "🏆 YENİ REKOR!",
        life: 2,
        color: "#f59e0b",
      });
    }

    // Fall into abyss
    const canvasH = canvasRef.current?.clientHeight || 500;
    const abyssY = Math.max(530, canvasH + 20);
    if (player.y > abyssY) {
      // Find the closest platform right behind or near the fall point
      const previousPlatforms = state.platforms.filter((p) => p.x <= player.x + 40 && !p.cracked);
      const target =
        previousPlatforms.length > 0
          ? previousPlatforms[previousPlatforms.length - 1]
          : state.platforms[0];

      if (isFeverActive) {
        // Fever bounce rescue!
        player.x = target.x + Math.max(6, Math.min(target.w - player.w - 6, 12));
        player.y = target.y - player.h - 10;
        player.vx = 0;
        player.vy = -420;
        state.floatingTexts.push({
          x: player.x,
          y: player.y - 25,
          text: "⚡ BOĞA ÇILGINLIĞI KURTARDI!",
          life: 1.5,
          color: "#fbbf24",
        });
      } else if (state.hasShield) {
        // Shield saves from abyss fall!
        state.hasShield = false;
        sound.shield();
        haptic.success();
        state.screenShake = 0.35;
        player.x = target.x + Math.max(6, Math.min(target.w - player.w - 6, 12));
        player.y = target.y - player.h - 10;
        player.vx = 0;
        player.vy = -340;
        player.canDoubleJump = true;
        player.jumpSpin = 0;
        state.floatingTexts.push({
          x: player.x,
          y: player.y - 25,
          text: "🛡️ STOP-LOSS DÜŞMEYİ ENGELLEDİ!",
          life: 1.5,
          color: "#38bdf8",
        });
      } else {
        state.lives -= 1;
        state.bullStreak = 0;
        state.multiplier = 1;
        state.screenShake = 0.55;
        haptic.warning();

        if (state.lives <= 0) {
          sound.gameOver();
          endRun();
        } else {
          sound.bearWarning();
          player.x = target.x + Math.max(6, Math.min(target.w - player.w - 6, 12));
          player.y = target.y - player.h - 10;
          player.vx = 0;
          player.vy = 0;
          player.canDoubleJump = true;
          player.jumpSpin = 0;
        }
      }
    }

    // Update ambient dust positions
    if (state.ambientDust) {
      state.ambientDust.forEach((d) => {
        d.x -= d.speed * dt;
        if (d.x < state.cameraX - 40) {
          d.x = state.cameraX + 800 + Math.random() * 200;
          d.y = 40 + Math.random() * 380;
        }
      });
    }

    const targetCamera = Math.max(0, player.x - 160);
    state.cameraX += (targetCamera - state.cameraX) * Math.min(1, dt * 6);
    state.floatingTexts = state.floatingTexts
      .filter((f) => (f.life -= dt) > 0)
      .map((f) => ({ ...f, y: f.y - 22 * dt }));
    state.particles = state.particles
      .filter((p) => (p.life -= dt) > 0)
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + 120 * dt,
      }));
    if (state.particles.length > 90) state.particles = state.particles.slice(-90);

    if (Math.floor(now / 100) !== Math.floor((now - dt * 1000) / 100)) {
      setHud((prev) => ({
        ...prev,
        lives: state.lives,
        dollars: state.dollars,
        distance: currentMeters,
        gameOver: state.gameOver,
        isVictory: state.isVictory,
        finishMeters: state.finishMeters,
        elapsedMs: state.elapsedMs,
        streak: state.bullStreak,
        multiplier: state.multiplier,
        isNewRecord: state.isNewRecord,
        hasShield: state.hasShield,
        magnetSeconds: Math.ceil(state.magnetTimer),
        rocketSeconds: Math.ceil(state.rocketTimer),
        feverCharge: Math.floor(state.feverCharge),
        feverSeconds: Math.ceil(state.feverTimer),
        perfectLandings: state.perfectCount,
      }));
    }
  };

  const completeRun = () => {
    const state = stateRef.current;
    if (state.gameOver || state.completed) return;
    state.completed = true;
    state.gameOver = true;
    state.isVictory = true;
    sound.stopBgm();
    sound.frenzy();
    haptic.success();

    const bonusDollars = 1500;
    const bonusCoins = 25;
    state.dollars += bonusDollars;
    addDollarsGlobal(state.dollars);
    addCoinGlobal(bonusCoins);
    recordRun(Math.floor(state.distance / 20), selectedCharId, state.dollars);

    const speedrunResult = recordSpeedrunGlobal(
      state.elapsedMs,
      TRADE_SYMBOLS[tickerIdx].symbol,
      selectedCharId,
    );

    // Confetti celebration burst
    for (let i = 0; i < 54; i++) {
      const angle = (Math.PI * 2 * i) / 54;
      const speed = 75 + Math.random() * 110;
      state.particles.push({
        x: state.player.x + state.player.w / 2,
        y: state.player.y - 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 3 + Math.random() * 3,
        life: 1.5,
        maxLife: 1.5,
        color: ["#f59e0b", "#10b981", "#38bdf8", "#fbbf24", "#e11d48", "#a855f7"][i % 6],
      });
    }

    setHud({
      lives: state.lives,
      dollars: state.dollars,
      distance: Math.floor(state.distance / 20),
      gameOver: true,
      isVictory: true,
      speedrunRank: speedrunResult.rank,
      finishMeters: state.finishMeters,
      elapsedMs: state.elapsedMs,
      streak: state.bullStreak,
      multiplier: state.multiplier,
      isNewRecord: state.isNewRecord,
      hasShield: false,
      magnetSeconds: 0,
      rocketSeconds: 0,
      feverCharge: 0,
      feverSeconds: 0,
      perfectLandings: state.perfectCount,
    });
  };

  const endRun = () => {
    const state = stateRef.current;
    state.gameOver = true;
    state.isVictory = false;
    sound.stopBgm();
    addDollarsGlobal(state.dollars);
    recordRun(Math.floor(state.distance / 20), selectedCharId, state.dollars);
    setHud({
      lives: 0,
      dollars: state.dollars,
      distance: Math.floor(state.distance / 20),
      gameOver: true,
      isVictory: false,
      speedrunRank: null,
      finishMeters: state.finishMeters,
      elapsedMs: state.elapsedMs,
      streak: 0,
      multiplier: 1,
      isNewRecord: state.isNewRecord,
      hasShield: false,
      magnetSeconds: 0,
      rocketSeconds: 0,
      feverCharge: 0,
      feverSeconds: 0,
      perfectLandings: state.perfectCount,
    });
  };

  const render = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const state = stateRef.current;

    // Premium dark background (Solid fast fill, zero per-frame allocation)
    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, width, height);

    // Viewport bounds for strict culling (10x rendering boost)
    const minVisibleX = state.cameraX - 100;
    const maxVisibleX = state.cameraX + width + 100;

    // Subtle financial chart grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    ctx.lineWidth = 1;
    const gridOffsetX = -(state.cameraX * 0.3) % 40;
    ctx.beginPath();
    for (let x = gridOffsetX; x < width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Ambient background volume profile
    ctx.fillStyle = "rgba(16, 185, 129, 0.022)";
    state.bgBars.forEach((bar) => {
      const bx = ((bar.x - state.cameraX * 0.15) % (width + 140)) - 70;
      const drawX = bx < -70 ? bx + width + 140 : bx;
      ctx.fillRect(drawX, height - bar.h, bar.w, bar.h);
    });

    const shakeMagnitude = state.screenShake * state.screenShake * 12;
    const shakeX = shakeMagnitude > 0 ? (Math.random() - 0.5) * shakeMagnitude : 0;
    const shakeY = shakeMagnitude > 0 ? (Math.random() - 0.5) * shakeMagnitude : 0;

    // --- Elegant Watermark Ticker in Center Background ---
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.028)";
    ctx.font = "900 100px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TRADE_SYMBOLS[tickerIdx].symbol, width / 2, height / 2 - 15);
    ctx.restore();

    ctx.save();
    ctx.translate(-state.cameraX + shakeX, shakeY);

    // --- Real Volume Histogram Profile (Layer 1) ---
    state.platforms.forEach((platform) => {
      if (platform.cracked || platform.isFinish) return;
      if (platform.x + platform.w < minVisibleX || platform.x > maxVisibleX) return;
      const volNorm = Math.min(65, Math.max(12, (platform.volume / 85000) * 58));
      const volY = height - volNorm - 10;
      ctx.fillStyle = platform.bull ? "rgba(16, 185, 129, 0.16)" : "rgba(244, 63, 94, 0.16)";
      roundRect(ctx, platform.x, volY, platform.w, volNorm, 2);
      ctx.fill();
    });

    // --- Flowing Exponential Moving Average (EMA) Lines (Layer 2) ---
    const screenStart = Math.max(0, state.cameraX - 80);
    const screenEnd = state.cameraX + width + 80;

    // EMA-20: Clean Financial Aqua
    ctx.save();
    ctx.beginPath();
    for (let wx = screenStart; wx < screenEnd; wx += 35) {
      const wy = 320 + Math.sin(wx * 0.005 + now * 0.001) * 55 + Math.cos(wx * 0.002) * 35;
      if (wx === screenStart) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // EMA-50: Clean Slate Violet
    ctx.beginPath();
    for (let wx = screenStart; wx < screenEnd; wx += 35) {
      const wy = 360 + Math.sin(wx * 0.003 - now * 0.0008) * 45 + Math.cos(wx * 0.004) * 40;
      if (wx === screenStart) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Ambient floating market embers/dust
    if (state.ambientDust) {
      state.ambientDust.forEach((d) => {
        if (d.x < minVisibleX || d.x > maxVisibleX) return;
        ctx.fillStyle = `rgba(52, 211, 153, ${d.alpha})`;
        ctx.fillRect(d.x, d.y, d.size, d.size);
      });
    }

    // Warp Speed Lines during Fever or Rocket
    if (state.feverTimer > 0 || state.rocketTimer > 0 || Math.abs(state.player.vx) > 310) {
      ctx.save();
      ctx.strokeStyle =
        state.feverTimer > 0 ? "rgba(251, 191, 36, 0.28)" : "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const lineX = state.cameraX + (((now * 2.2 + i * 90) % (width + 240)) - 120);
        const lineY = (i * 41 + 60) % height;
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX - 45, lineY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Candlesticks (With Strict Viewport Culling & Zero shadowBlur)
    state.platforms.forEach((platform) => {
      if (platform.cracked) return;
      if (platform.x + platform.w < minVisibleX || platform.x > maxVisibleX) return;

      const y = platform.y + platform.sinkOffset;
      const isBull = platform.bull;
      const isSpring = platform.type === "spring";
      const isVolatile = platform.type === "volatile";
      const isFragile = platform.type === "fragile";
      const isFinish = platform.isFinish;

      if (isFinish) {
        // --- Grand Wall Street Opening/Closing Bell Finish Arch ---
        const archX = platform.x + 24;
        const archW = platform.w - 48;
        const archTop = y - 95;

        // Brass Pillars (Left & Right)
        ctx.fillStyle = "#b45309";
        roundRect(ctx, archX, archTop, 10, y - archTop, 2);
        ctx.fill();
        roundRect(ctx, archX + archW - 10, archTop, 10, y - archTop, 2);
        ctx.fill();

        // Top Arch Crossbeam
        ctx.fillStyle = "#d97706";
        roundRect(ctx, archX - 8, archTop - 18, archW + 16, 22, 4);
        ctx.fill();
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Arch Header Text
        ctx.fillStyle = "#1e1b4b";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText("🔔 BOĞA ZİRVESİ · BİTİŞ 🔔", archX + archW / 2, archTop - 4);

        // Swinging Wall Street Trading Bell
        const bellSwing = Math.sin(now / 180) * 0.14;
        ctx.save();
        ctx.translate(archX + archW / 2, archTop + 8);
        ctx.rotate(bellSwing);
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(0, 10, 9, Math.PI, 0, false);
        ctx.lineTo(12, 20);
        ctx.lineTo(-12, 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Clapper
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(0, 22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Checkered Finish Tape
        const tapeY = y - 24;
        const squareSize = 6;
        const countSquares = Math.floor(archW / squareSize);
        for (let s = 0; s < countSquares; s++) {
          for (let row = 0; row < 2; row++) {
            ctx.fillStyle = (s + row) % 2 === 0 ? "#ffffff" : "#0f172a";
            ctx.fillRect(archX + s * squareSize, tapeY + row * squareSize, squareSize, squareSize);
          }
        }
        ctx.textAlign = "left";

        // Podium base
        ctx.fillStyle = "#d97706";
        roundRect(ctx, platform.x, y, platform.w, platform.h, 6);
        ctx.fill();
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(platform.x + 4, y, platform.w - 8, 3);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText("🏁 MARKET FINISH 🏁", platform.x + platform.w / 2, y + platform.h / 2 + 4);
        ctx.textAlign = "left";
        return;
      }

      // Realistic clean wick
      ctx.strokeStyle = isSpring
        ? "rgba(245, 158, 11, 0.95)"
        : isBull
          ? "rgba(16, 185, 129, 0.85)"
          : "rgba(244, 63, 94, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(platform.x + platform.w / 2, platform.wickTop + platform.sinkOffset);
      ctx.lineTo(platform.x + platform.w / 2, platform.wickBottom + platform.sinkOffset);
      ctx.stroke();

      // Wick tip spark
      if (isBull || isSpring) {
        ctx.fillStyle = isSpring ? "#fef08a" : "#6ee7b7";
        ctx.beginPath();
        ctx.arc(
          platform.x + platform.w / 2,
          platform.wickTop + platform.sinkOffset,
          2.0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Soft natural candle shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      roundRect(ctx, platform.x + 2, y + 3, platform.w, platform.h, 3);
      ctx.fill();

      // Candlestick body with crisp TradingView colors
      ctx.fillStyle = isSpring ? "#d97706" : isBull ? "#059669" : "#be123c";
      roundRect(ctx, platform.x, y, platform.w, platform.h, 3);
      ctx.fill();

      // Top specular highlight edge
      ctx.fillStyle = isSpring ? "#fef08a" : isBull ? "#34d399" : "#fb7185";
      ctx.fillRect(platform.x + 1.5, y, platform.w - 3, 2);

      // Specialized Candle Type Overlays (only if wide enough to comfortably fit text)
      if (platform.w >= 56) {
        if (isSpring) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText("▲ SQUEEZE", platform.x + platform.w / 2, y + platform.h / 2 + 3.5);
          ctx.textAlign = "left";
        } else if (isVolatile) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 8px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText("⚡ VOLATİL", platform.x + platform.w / 2, y + platform.h / 2 + 3);
          ctx.textAlign = "left";
        } else if (isFragile) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
          ctx.font = "bold 8px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText(
            platform.crackTimer > 0 ? "⚠️ ÇÖKÜYOR" : "💥 KIRILGAN",
            platform.x + platform.w / 2,
            y + platform.h / 2 + 3,
          );
          ctx.textAlign = "left";
        }
      }

      // Crisp top specular edge highlight
      ctx.strokeStyle = isSpring
        ? "rgba(255, 255, 255, 0.55)"
        : isBull
          ? "rgba(255, 255, 255, 0.35)"
          : "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(platform.x + 2, y + 1);
      ctx.lineTo(platform.x + platform.w - 2, y + 1);
      ctx.stroke();
    });

    // Price and date tags under candles (Viewport Culled)
    ctx.font = "600 9px JetBrains Mono, monospace";
    state.platforms.forEach((platform, i) => {
      if (platform.cracked || i % (platform.w < 40 ? 8 : 5) !== 0) return;
      if (platform.x + platform.w < minVisibleX || platform.x > maxVisibleX) return;
      ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
      ctx.fillText(platform.label, platform.x, platform.y + platform.h + 20);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillText(`$${platform.price.toFixed(2)}`, platform.x, platform.y + platform.h + 32);
    });

    // Collectibles & Power-ups (Viewport Culled)
    state.collectibles.forEach((item) => {
      if (item.collected) return;
      if (item.x + 30 < minVisibleX || item.x - 30 > maxVisibleX) return;
      const y = item.y + Math.sin(item.bob) * 4;
      if (item.kind === "dolar") {
        drawDollarBill(ctx, item.x, y, now);
      } else if (item.kind === "altin") {
        drawGoldCoin(ctx, item.x, y, item.r);
      } else {
        drawPowerupItem(ctx, item.x, y, item.kind, now);
      }
    });

    // Particles
    state.particles.forEach((particle) => drawParticle(ctx, particle));

    // Player with power-up effects
    const player = state.player;

    // Fever mode celestial aura (Rendered with dual circles instead of slow shadowBlur)
    if (state.feverTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.22)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        32 + Math.sin(now / 90) * 4,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Shield aura
    if (state.hasShield) {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        28 + Math.sin(now / 180) * 2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
    }

    // Magnet aura ripples
    if (state.magnetTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        45 + Math.sin(now / 120) * 8,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
    }

    drawPlayer(ctx, player.x, player.y, player.w, player.h, {
      hue: characterRef.current.hue,
      sprite: getSkinSpritePath(characterRef.current.id, skinIdRef.current),
      facing: player.facing,
      animation: player.animation,
      runClock: player.runClock,
      squashX: player.squashX,
      squashY: player.squashY,
      jumpSpin: player.jumpSpin,
      now,
    });

    // Floating text animations
    state.floatingTexts.forEach((text) => {
      ctx.globalAlpha = Math.max(0, text.life);
      ctx.fillStyle = text.color;
      ctx.font = "bold 13px JetBrains Mono, monospace";
      ctx.fillText(text.text, text.x, text.y);
      ctx.globalAlpha = 1;
    });

    ctx.restore();

    // --- TradingView Right-Axis Live Price Ruler (Screen Space Overlay) ---
    ctx.save();
    const axisWidth = 56;
    const axisX = width - axisWidth;
    ctx.fillStyle = "rgba(9, 13, 22, 0.88)";
    ctx.fillRect(axisX, 0, axisWidth, height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, height);
    ctx.stroke();

    // 5 Horizontal Price Guideline markers across chart
    const numPriceSteps = 4;
    for (let pStep = 0; pStep <= numPriceSteps; pStep++) {
      const stepRatio = pStep / numPriceSteps;
      const levelY = state.topY + stepRatio * (state.groundY - state.topY);
      const levelPrice = state.maxPrice - stepRatio * (state.maxPrice - state.minPrice);

      // Guideline tick mark
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.moveTo(axisX, levelY);
      ctx.lineTo(axisX + 4, levelY);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
      ctx.font = "600 8.5px JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`$${levelPrice.toFixed(1)}`, axisX + 7, levelY + 3);
    }

    // Dynamic Live Price Pointer matching Player's Current Elevation
    const playerPrice = Math.max(
      state.minPrice,
      Math.min(
        state.maxPrice,
        state.minPrice +
          ((state.groundY - (player.y + player.h)) / Math.max(1, state.groundY - state.topY)) *
            (state.maxPrice - state.minPrice),
      ),
    );
    const pointerY = Math.max(16, Math.min(height - 20, player.y + player.h / 2));
    ctx.fillStyle = player.onGround ? "#10b981" : "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(axisX, pointerY);
    ctx.lineTo(axisX + 6, pointerY - 7);
    ctx.lineTo(axisX + axisWidth - 2, pointerY - 7);
    ctx.lineTo(axisX + axisWidth - 2, pointerY + 7);
    ctx.lineTo(axisX + 6, pointerY + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#030712";
    ctx.font = "bold 8.5px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`$${playerPrice.toFixed(1)}`, axisX + 8, pointerY + 3);
    ctx.restore();

    // Data source indicator
    drawHintBox(
      ctx,
      12,
      12,
      `${dataSourceRef.current === "canlı" ? "CANLI PİYASA" : "TARİHİ SİMÜLASYON"} · ${TRADE_SYMBOLS[tickerIdx].symbol}`,
      "#10b981",
    );
  };

  const restart = () => {
    sound.click();
    sound.stopBgm();
    haptic.medium();
    setIsPaused(false);
    setLoading(true);
    fetchMarketCandles(TRADE_SYMBOLS[tickerIdx], timeframe, 124).then(({ candles, source }) => {
      buildLevel(candles, timeframe);
      setDataSource(source);
      setLoading(false);
    });
  };

  const shareScore = () => {
    sound.click();
    haptic.success();
    const text = `🚀 Block Jumper (Mum Koşusu)'nda ${hud.distance}m koştum ve $${hud.dollars} topladım! Beni geçebilir misin?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const nextTicker = () => {
    sound.click();
    haptic.light();
    setTickerIdx((idx) => (idx + 1) % TRADE_SYMBOLS.length);
  };

  const setInput = (key: "left" | "right" | "jump", down: boolean) => {
    const input = stateRef.current.input;
    if (key === "left") input.left = down;
    if (key === "right") input.right = down;
    if (key === "jump") {
      if (down && !input.jump) input.jumpPressed = true;
      input.jump = down;
    }
  };

  const currentSymbol = TRADE_SYMBOLS[tickerIdx];
  const filteredSymbols = TRADE_SYMBOLS.filter((symbol) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return symbol.symbol.toLowerCase().includes(q) || symbol.name.toLowerCase().includes(q);
  });

  const selectSymbol = (symbol: MarketSymbol) => {
    sound.click();
    haptic.light();
    const idx = TRADE_SYMBOLS.findIndex((entry) => entry.symbol === symbol.symbol);
    if (idx >= 0) {
      setTickerIdx(idx);
    }
    setSelectorOpen(false);
    setSearch("");
  };

  return (
    <div className="relative flex h-full w-full flex-col px-3 pt-2 pb-3">
      {/* Sleek Native Top HUD Header */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5">
        {/* Left: Home Exit Button + Hearts + Stock Ticker */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link
            to="/"
            onClick={() => {
              sound.click();
              haptic.light();
            }}
            className="glass-low grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 active:scale-95 transition-all border border-white/8 shadow-sm"
            title="Ana Menüye Dön"
            aria-label="Ana Menü"
          >
            <Home className="h-4 w-4" />
          </Link>

          {/* Hearts */}
          <div className="glass-low flex items-center gap-1 rounded-xl px-2 py-1.5 border border-white/8 shadow-sm">
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={
                  "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all " +
                  (i < hud.lives
                    ? "fill-rose-500 text-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]"
                    : "text-slate-600 scale-90")
                }
              />
            ))}
          </div>

          {/* Stock Ticker Button */}
          <button
            onClick={() => {
              sound.click();
              haptic.light();
              setSelectorOpen(true);
            }}
            className="glass-low flex items-center gap-1 rounded-xl px-2.5 py-1.5 border border-white/8 text-xs font-mono font-bold hover:bg-white/5 active:scale-95 transition-all shadow-sm"
            title="Hisse Değiştir"
          >
            <span className="text-emerald-400 font-extrabold">{currentSymbol.symbol}</span>
          </button>
        </div>

        {/* Center: Direct Timeframe Segmented Selector */}
        <div className="glass-low flex items-center p-0.5 rounded-xl border border-white/8 shadow-sm">
          {TIMEFRAMES.map((tf) => {
            const active = tf.id === timeframe.id;
            return (
              <button
                key={tf.id}
                onClick={() => {
                  sound.click();
                  haptic.light();
                  setTimeframe(tf);
                }}
                className={
                  "px-2 py-1 rounded-lg font-mono text-[10px] font-extrabold transition-all " +
                  (active
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white")
                }
                title={`${tf.label} (${tf.difficulty}): ${tf.description}`}
              >
                {tf.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Right: Sound Toggle + Stopwatch + Trophy + Pause */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleMuteInGame}
            className="glass-low grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8 shadow-sm"
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            aria-label="Ses"
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </button>

          {/* Stopwatch */}
          <div className="glass-low hidden xs:block rounded-xl px-2 py-1.5 text-center font-mono text-xs font-bold text-white border border-white/8 shadow-sm">
            {formatStopwatch(hud.elapsedMs)}
          </div>

          {/* Daily Speedrun Leaderboard */}
          <button
            onClick={() => {
              sound.click();
              haptic.light();
              setLeaderboardModalOpen(true);
            }}
            className="glass-low grid h-8 w-8 place-items-center rounded-xl text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 active:scale-95 transition-all shadow-sm"
            title="Günün En Hızlıları"
          >
            <Trophy className="h-3.5 w-3.5" />
          </button>

          {/* Pause / Play */}
          {!hud.gameOver && (
            <button
              onClick={togglePause}
              className="glass-low grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8 shadow-sm"
              aria-label="Duraklat"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5 fill-current text-emerald-400" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Financial Education & Candlestick Pattern Ribbon */}
      <div className="glass-low mb-2 flex items-center justify-between rounded-xl px-3 py-1.5 border border-white/8 font-mono text-[11px] shadow-sm">
        {hud.activeCandle ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white">${hud.activeCandle.price.toFixed(2)}</span>
              <span
                className={
                  "font-bold text-[10px] px-1.5 py-0.5 rounded " +
                  (hud.activeCandle.changePct >= 0
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400")
                }
              >
                {hud.activeCandle.changePct >= 0 ? "+" : ""}{hud.activeCandle.changePct}%
              </span>
              <span className="text-[10px] text-slate-400 hidden xs:inline">
                A:${hud.activeCandle.open.toFixed(1)} Y:${hud.activeCandle.high.toFixed(1)} D:${hud.activeCandle.low.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" title={hud.activeCandle.patternTip}>
              <span className="text-[9px] text-muted-foreground hidden sm:inline">Formasyon:</span>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 truncate max-w-[130px] sm:max-w-none">
                {hud.activeCandle.patternName}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400 text-[10px]">
            <span>📊 {currentSymbol.symbol} · {currentSymbol.name}</span>
            <span className="text-emerald-400 font-semibold">{timeframe.label} ({timeframe.difficulty})</span>
          </div>
        )}
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-2xl border border-white/8 bg-[#0b0f19] shadow-2xl"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-md">
            <div className="glass rounded-2xl px-6 py-5 text-center">
              <div className="font-display text-lg font-bold text-white">Piyasa Yükleniyor</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                Finansal mumlar işleniyor...
              </div>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {isPaused && !hud.gameOver && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-black/75 backdrop-blur-md p-4">
            <div className="glass w-full max-w-[320px] rounded-2xl p-6 text-center border border-white/10 shadow-2xl">
              <div className="font-display text-xl font-bold text-white">OYUN DURAKLATILDI</div>
              <div className="mt-1 text-xs text-muted-foreground">Mevcut koşun donduruldu.</div>

              <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                <Result label="MESAFE" value={`${hud.distance}m`} />
                <Result label="KAZANÇ" value={`$${hud.dollars}`} />
              </div>

              {/* Timeframe switch during pause */}
              <div className="mt-3">
                <div className="font-mono text-[10px] uppercase font-semibold text-muted-foreground text-left mb-1.5 flex justify-between">
                  <span>MUM ZAMAN DİLİMİ</span>
                  <span className="text-emerald-400">{timeframe.difficulty}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/8 bg-slate-900/60 p-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        sound.click();
                        haptic.light();
                        setTimeframe(tf);
                      }}
                      className={
                        "rounded-lg py-1.5 text-center font-mono text-xs font-bold transition-all " +
                        (timeframe.id === tf.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-white")
                      }
                      title={tf.description}
                    >
                      {tf.shortLabel}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground font-mono text-left">
                  {timeframe.description}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  onClick={togglePause}
                  className="primary-cta inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 transition-all"
                >
                  <Play className="h-4 w-4 fill-current" /> DEVAM ET
                </button>

                <button
                  onClick={restart}
                  className="glass-low inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all border border-white/8"
                >
                  <RotateCcw className="h-4 w-4" /> YENİDEN BAŞLAT
                </button>

                <button
                  onClick={() => {
                    sound.click();
                    setLeaderboardModalOpen(true);
                  }}
                  className="glass-low inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all border border-amber-500/25"
                >
                  <Trophy className="h-3.5 w-3.5" /> GÜNÜN EN HIZLILARI
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={toggleMuteInGame}
                    className="glass-low flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>{isMuted ? "Sesi Aç" : "Sesi Kapat"}</span>
                  </button>

                  <Link
                    to="/"
                    onClick={() => setIsPaused(false)}
                    className="glass-low inline-flex items-center justify-center px-4 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                    title="Ana Menü"
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Victory Modal with Daily Speedrun Leaderboard */}
        {hud.gameOver && hud.isVictory && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-black/80 backdrop-blur-md p-3 overflow-y-auto">
            <div className="glass w-full max-w-[360px] rounded-2xl p-5 text-center border border-amber-500/30 shadow-2xl my-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                <Trophy className="h-4 w-4" /> BOĞA ZİRVESİNE ULAŞILDI!
              </div>

              <div className="mt-2 font-display text-2xl font-black tracking-tight text-white">
                PİYASA KAPANIŞ ZİLİ ÇALDI
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Tüm mumları başarıyla aştın ve zirveye ulaştın!
              </div>

              {/* Player Speedrun Rank Card */}
              <div className="mt-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-transparent p-3 border border-amber-500/30">
                <div className="text-[10px] font-mono uppercase font-bold text-amber-300">
                  GÜNÜN KOŞU DERECESİ
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <Medal className="h-5 w-5 text-amber-400" />
                  <div className="font-mono text-lg font-black text-white">
                    {hud.speedrunRank === 1
                      ? "1. SIRA (GÜNÜN ŞAMPİYONU!)"
                      : hud.speedrunRank === 2
                        ? "2. SIRA (GÜNÜN PODYUMU)"
                        : hud.speedrunRank === 3
                          ? "3. SIRA (GÜNÜN PODYUMU)"
                          : `${hud.speedrunRank}. SIRA`}
                  </div>
                </div>
                <div className="mt-0.5 font-mono text-xs text-emerald-400 font-bold">
                  Bitiş Süresi: {formatStopwatch(hud.elapsedMs)}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 font-mono text-xs">
                <Result label="SÜRE" value={formatStopwatch(hud.elapsedMs)} />
                <Result label="MESAFE" value={`${hud.distance}m`} />
                <Result label="KAZANÇ" value={`+$${hud.dollars}`} />
                <Result label="BONUS" value="+25 COIN" />
              </div>

              {/* Daily Speedrun Leaderboard (Günün En Hızlıları) */}
              <div className="mt-3.5 text-left">
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span>GÜNÜN EN HIZLILARI</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">TOP 8</span>
                </div>

                <div className="max-h-[160px] overflow-y-auto space-y-1 rounded-xl bg-slate-950/60 p-1.5 border border-white/8 scrollbar-none">
                  {getTodayLeaderboardGlobal().map((entry) => (
                    <div
                      key={entry.rank}
                      className={
                        "flex items-center justify-between rounded-lg px-2 py-1 text-xs font-mono transition-all " +
                        (entry.isPlayer
                          ? "bg-emerald-500/25 border border-emerald-500/50 text-white font-bold"
                          : "text-slate-300 hover:bg-white/5")
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={
                            "grid h-4.5 w-4.5 place-items-center rounded-md text-[10px] font-bold " +
                            (entry.rank === 1
                              ? "bg-amber-500 text-black"
                              : entry.rank === 2
                                ? "bg-slate-300 text-black"
                                : entry.rank === 3
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-800 text-slate-400")
                          }
                        >
                          {entry.rank}
                        </span>
                        <div className="truncate">
                          <span className={entry.isPlayer ? "text-emerald-400 font-bold" : ""}>
                            {entry.runnerName}
                          </span>
                          {entry.isPlayer && (
                            <span className="ml-1 rounded bg-emerald-500/30 px-1 py-0.2 text-[9px] text-emerald-300">
                              SEN
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-white">{formatStopwatch(entry.timeMs)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex flex-col gap-2">
                <button
                  onClick={restart}
                  className="primary-cta inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 transition-all shadow-lg"
                >
                  <RotateCcw className="h-4 w-4" /> DAHA HIZLI KOŞ (YENİ REKOR)
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={shareScore}
                    className="glass-low flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                  >
                    <Share2 className="h-4 w-4" /> {copiedShare ? "KOPYALANDI!" : "DERECENİ PAYLAŞ"}
                  </button>

                  <Link
                    to="/"
                    className="glass-low inline-flex items-center justify-center px-4 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                    title="Ana Menü"
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Game Over Modal (when run terminates without reaching finish) */}
        {hud.gameOver && !hud.isVictory && (
          <div className="absolute inset-0 grid place-items-center bg-black/75 backdrop-blur-md p-4">
            <div className="glass w-full max-w-[320px] rounded-2xl p-6 text-center border border-white/10 shadow-2xl">
              {hud.isNewRecord && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                  🏆 YENİ EN İYİ SKOR!
                </div>
              )}
              <div className="font-display text-2xl font-bold text-rose-500">PİYASA KAPANDI</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Koşu sona erdi, kazanç cüzdanına aktarıldı.
              </div>

              <div className="mt-5 grid grid-cols-4 gap-1.5 font-mono text-xs">
                <Result label="SÜRE" value={formatStopwatch(hud.elapsedMs)} />
                <Result label="MESAFE" value={`${hud.distance}m`} />
                <Result label="KAZANÇ" value={`$${hud.dollars}`} />
                <Result label="MÜKEMMEL" value={`${hud.perfectLandings}x`} />
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  onClick={restart}
                  className="primary-cta inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> TEKRAR DENE
                </button>

                <button
                  onClick={() => {
                    sound.click();
                    setLeaderboardModalOpen(true);
                  }}
                  className="glass-low inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all border border-amber-500/25"
                >
                  <Trophy className="h-4 w-4" /> GÜNÜN EN HIZLILARI
                </button>

                <button
                  onClick={shareScore}
                  className="glass-low inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                >
                  <Share2 className="h-4 w-4" /> {copiedShare ? "KOPYALANDI!" : "SKORU PAYLAŞ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standalone Daily Speedrun Leaderboard Modal */}
        {leaderboardModalOpen && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md p-3">
            <div className="glass w-full max-w-[340px] rounded-2xl p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-display text-base font-bold text-white">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <span>Günün En Hızlıları</span>
                </div>
                <button
                  onClick={() => {
                    sound.click();
                    setLeaderboardModalOpen(false);
                  }}
                  className="glass-low grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2.5 text-xs text-muted-foreground font-mono">
                Piyasa zirvesini bugün en hızlı tamamlayan koşucular:
              </div>

              <div className="mt-3 space-y-1.5 max-h-[260px] overflow-y-auto scrollbar-none">
                {getTodayLeaderboardGlobal().map((entry) => (
                  <div
                    key={entry.rank}
                    className={
                      "flex items-center justify-between rounded-xl p-2.5 font-mono text-xs border " +
                      (entry.isPlayer
                        ? "bg-emerald-500/20 border-emerald-500/40 text-white font-bold"
                        : "bg-slate-900/50 border-white/5 text-slate-300")
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={
                          "grid h-5 w-5 place-items-center rounded-md text-[10px] font-bold " +
                          (entry.rank === 1
                            ? "bg-amber-500 text-black font-black"
                            : entry.rank === 2
                              ? "bg-slate-300 text-black font-black"
                              : entry.rank === 3
                                ? "bg-amber-700 text-white font-black"
                                : "bg-slate-800 text-slate-400")
                        }
                      >
                        {entry.rank}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-foreground truncate">
                          {entry.runnerName} {entry.isPlayer && "(SEN)"}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {entry.charName} · {entry.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      {formatStopwatch(entry.timeMs)}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.click();
                  setLeaderboardModalOpen(false);
                }}
                className="glass-low mt-4 w-full rounded-xl py-2.5 text-xs font-bold text-white hover:bg-white/10 active:scale-95 transition-all border border-white/8"
              >
                KAPAT
              </button>
            </div>
          </div>
        )}

        {/* Floating Dynamic Power-Up / Fever Status Pill */}
        {(hud.feverSeconds > 0 ||
          hud.hasShield ||
          hud.magnetSeconds > 0 ||
          hud.rocketSeconds > 0 ||
          hud.multiplier > 1) && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
            <div className="flex items-center gap-1.5">
              {hud.feverSeconds > 0 ? (
                <div className="glass flex items-center gap-1.5 rounded-full px-4 py-1.5 border border-amber-400/50 bg-amber-500/20 text-amber-300 font-mono text-xs font-extrabold shadow-lg shadow-amber-500/20">
                  <Zap className="h-3.5 w-3.5 fill-current text-amber-400" />
                  <span>BOĞA ÇILGINLIĞI x5 · {hud.feverSeconds}s</span>
                </div>
              ) : hud.rocketSeconds > 0 ? (
                <div className="glass flex items-center gap-1.5 rounded-full px-4 py-1.5 border border-orange-500/40 bg-orange-500/20 text-orange-300 font-mono text-xs font-extrabold shadow-lg shadow-orange-500/20">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>BOĞA ROKETİ · {hud.rocketSeconds}s</span>
                </div>
              ) : hud.magnetSeconds > 0 ? (
                <div className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1 border border-amber-500/40 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shadow-md">
                  <Magnet className="h-3.5 w-3.5 text-amber-400" />
                  <span>LİKİDİTE MIKNATISI · {hud.magnetSeconds}s</span>
                </div>
              ) : hud.hasShield ? (
                <div className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1 border border-sky-500/40 bg-sky-500/20 text-sky-300 font-mono text-xs font-bold shadow-md">
                  <Shield className="h-3.5 w-3.5 text-sky-400" />
                  <span>STOP-LOSS KALKANI</span>
                </div>
              ) : hud.multiplier > 1 ? (
                <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1 border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shadow-md">
                  <Zap className="h-3.5 w-3.5 fill-current text-emerald-400" />
                  <span>SERİ KAZANÇ x{hud.multiplier}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Stock Selector Modal */}
        {selectorOpen && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md">
            <div className="absolute inset-x-3 top-3 bottom-3 glass flex flex-col overflow-hidden rounded-2xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <div className="font-display text-base font-bold text-white">
                    60 Hacimli Hisse
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    Seçilen hisse için {timeframe.label} verisi çekilir
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.click();
                    setSelectorOpen(false);
                  }}
                  className="glass-low grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-white"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-b border-white/10 px-4 py-3">
                <label className="glass-low flex items-center gap-2 rounded-xl px-3 py-2 border border-white/8">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Sembol veya şirket ara..."
                    className="w-full bg-transparent font-mono text-xs text-white outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </div>

              <div className="scrollbar-none flex-1 overflow-y-auto px-2 py-2">
                <div className="space-y-1">
                  {filteredSymbols.map((symbol) => {
                    const active = symbol.symbol === currentSymbol.symbol;
                    return (
                      <button
                        key={symbol.symbol}
                        onClick={() => selectSymbol(symbol)}
                        className={
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all " +
                          (active
                            ? "bg-primary/20 text-emerald-400 font-semibold"
                            : "hover:bg-white/5 text-foreground")
                        }
                      >
                        <div>
                          <div className="font-mono text-xs font-bold">{symbol.symbol}</div>
                          <div className="text-[11px] text-muted-foreground">{symbol.name}</div>
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">CANLI</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <button
                  onClick={nextTicker}
                  className="glass-low w-full rounded-xl py-2.5 font-mono text-xs font-bold text-primary active:scale-95 transition-all"
                >
                  Rastgele Hisse Seç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ergonomic Arcade Touch Controls */}
      <div className="mt-2.5 flex items-center justify-between gap-3 touch-none select-none">
        {/* Directional Thumb Pads */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptic.light();
              setInput("left", true);
            }}
            onPointerLeave={() => setInput("left", false)}
            onPointerUp={() => setInput("left", false)}
            onPointerCancel={() => setInput("left", false)}
            className="group relative flex h-14 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-slate-200 shadow-md backdrop-blur-md active:bg-emerald-500/20 active:border-emerald-500/50 active:scale-95 transition-all"
            aria-label="Sola koş"
          >
            <ArrowLeft className="h-6 w-6 transition-transform group-active:-translate-x-1" />
            <span className="absolute bottom-1 font-mono text-[8px] text-muted-foreground/60 hidden sm:block">
              A / ←
            </span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptic.light();
              setInput("right", true);
            }}
            onPointerLeave={() => setInput("right", false)}
            onPointerUp={() => setInput("right", false)}
            onPointerCancel={() => setInput("right", false)}
            className="group relative flex h-14 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-slate-200 shadow-md backdrop-blur-md active:bg-emerald-500/20 active:border-emerald-500/50 active:scale-95 transition-all"
            aria-label="Sağa koş"
          >
            <ArrowRight className="h-6 w-6 transition-transform group-active:translate-x-1" />
            <span className="absolute bottom-1 font-mono text-[8px] text-muted-foreground/60 hidden sm:block">
              D / →
            </span>
          </button>
        </div>

        {/* Large Ergonomic Jump Pad */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setInput("jump", true);
          }}
          onPointerLeave={() => setInput("jump", false)}
          onPointerUp={() => setInput("jump", false)}
          onPointerCancel={() => setInput("jump", false)}
          className="relative flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-950/40 active:brightness-90 active:scale-[0.98] transition-all"
          aria-label="Zıpla"
        >
          <ChevronsUp className="h-5 w-5" />
          <div className="flex flex-col items-start leading-none">
            <span className="font-display text-sm font-extrabold tracking-wider">ZIPLA</span>
            <span className="font-mono text-[9px] text-emerald-100/75 hidden sm:block">
              SPACE / W / ↑
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-low rounded-xl p-2.5 border border-white/6">
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-white mt-0.5">{value}</div>
    </div>
  );
}

function formatStopwatch(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function deterministicWave(index: number, amp: number) {
  return Math.sin(index * 12.9898) * amp + Math.cos(index * 7.233) * amp * 0.35;
}

function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  color: string,
  strength: number,
) {
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI + (Math.PI * i) / Math.max(1, count - 1);
    const speed = (34 + (i % 3) * 14) * strength;
    const life = 0.22 + (i % 4) * 0.035;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 16 * strength,
      size: 2.5 + (i % 2),
      life,
      maxLife: life,
      color,
    });
  }
}

function spawnDoubleJumpBurst(particles: Particle[], x: number, y: number) {
  const count = 12;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 48 + (i % 2) * 18;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7 + 10,
      size: 3,
      life: 0.26,
      maxLife: 0.26,
      color: i % 2 === 0 ? "#34d399" : "#38bdf8",
    });
  }
}

function drawHintBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
) {
  ctx.font = "bold 10px JetBrains Mono, monospace";
  const w = ctx.measureText(text).width + 20;
  ctx.fillStyle = "rgba(11, 15, 25, 0.75)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, x + 10, y + 17);
}

function drawDollarBill(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  const tilt = Math.sin(now / 240) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tilt * Math.PI) / 180);

  // Soft shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  roundRect(ctx, -12, -5, 25, 14, 2);
  ctx.fill();

  // Banknote body (Solid fast fill, zero gradient allocation)
  ctx.fillStyle = "#059669";
  roundRect(ctx, -13, -7, 26, 14, 2);
  ctx.fill();

  // Crisp inner rim
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 1;
  roundRect(ctx, -11, -5, 22, 10, 1.5);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px JetBrains Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText("$", 0, 3.5);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawGoldCoin(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  // Soft drop shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.arc(x, y + 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Gold Coin Base (Solid fast fill, zero gradient allocation)
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(x, y, radius - 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#451a03";
  ctx.font = "bold 10px JetBrains Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText("C", x, y + 3.5);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawPowerupItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: CollectibleKind,
  _now: number,
) {
  ctx.save();
  ctx.translate(x, y);

  // Soft shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.arc(0, 2, 12, 0, Math.PI * 2);
  ctx.fill();

  if (kind === "kalkan") {
    // Stop-Loss Shield Orb
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛡️", 0, 3.5);
  } else if (kind === "miknatis") {
    // Magnet Orb
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🧲", 0, 3.5);
  } else if (kind === "roket") {
    // Rocket Orb
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚀", 0, 3.5);
  }

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  const alpha = Math.max(0, particle.life / particle.maxLife);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    hue: number;
    sprite: string;
    facing: number;
    animation: PlayerAnimation;
    runClock: number;
    squashX: number;
    squashY: number;
    jumpSpin: number;
    now: number;
  },
) {
  const isRunning = opts.animation === "sol" || opts.animation === "sag";
  const isJumping = opts.animation === "zipla";
  const isFalling = opts.animation === "dus";

  // Natural athletic running dynamics
  const runStride = isRunning ? Math.sin(opts.runClock * 13) : 0;
  const runBob = isRunning ? Math.abs(Math.sin(opts.runClock * 13)) * 3.2 : 0;
  const idleBreathing = opts.animation === "bekle" ? Math.sin(opts.now / 350) * 1.5 : 0;

  // Athletic forward tilt when running or aerodynamic jump lean
  const forwardLean = isRunning
    ? opts.facing * 0.12
    : isJumping
      ? -opts.facing * 0.16
      : isFalling
        ? opts.facing * 0.12
        : 0;

  const totalRotation = forwardLean + opts.jumpSpin;

  // Stride squash & stretch (feet impact ground -> squash, leap -> stretch)
  const dynamicSquashX = isRunning ? 1 - runStride * 0.04 : isJumping ? 0.9 : isFalling ? 1.1 : 1;
  const dynamicSquashY = isRunning ? 1 + runStride * 0.05 : isJumping ? 1.15 : isFalling ? 0.92 : 1;

  const scaleX = dynamicSquashX * opts.squashX;
  const scaleY = dynamicSquashY * opts.squashY;

  // Ground Contact Shadow
  const shadowW =
    w * (isJumping ? 0.65 : isFalling ? 0.95 : 0.85 + (isRunning ? runStride * 0.1 : 0));
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h, shadowW / 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const sprite = getSpriteImage(opts.sprite);
  const drawW = 50;
  const drawH = 50;
  const drawX = x + w / 2 - drawW / 2;
  const drawY = y + h - drawH - (isJumping ? 2 : isFalling ? -1 : 0) - runBob + idleBreathing;

  // Clean, complete sprite rendering (NEVER chopped into rectangles!)
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.rotate(totalRotation);
    ctx.scale(opts.facing < 0 ? -scaleX : scaleX, scaleY);
    ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    return;
  }

  // Fallback vector runner
  const px = w / 8;
  const py = h / 10;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 - runBob + idleBreathing);
  ctx.rotate(totalRotation);
  ctx.scale(opts.facing < 0 ? -scaleX : scaleX, scaleY);

  // Body
  ctx.fillStyle = `hsl(${opts.hue} 70% 50%)`;
  roundRect(ctx, -w / 2 + px, -h / 2 + py * 3, w - px * 2, py * 4.5, 3);
  ctx.fill();

  // Head
  ctx.fillStyle = "#f5d0b5";
  roundRect(ctx, -px * 2.5, -h / 2, px * 5, py * 3.5, 4);
  ctx.fill();

  // Visor
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(px * 0.5, -h / 2 + py * 1.2, px * 2, py * 1);

  // Legs with real stride angles
  const legAngle = isRunning ? Math.sin(opts.runClock * 13) * 0.45 : 0;
  ctx.strokeStyle = `hsl(${(opts.hue + 200) % 360} 40% 28%)`;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-px * 1.5, py * 2);
  ctx.lineTo(-px * 1.5 + Math.sin(legAngle) * 8, py * 2 + Math.cos(legAngle) * 10);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(px * 1.5, py * 2);
  ctx.lineTo(px * 1.5 - Math.sin(legAngle) * 8, py * 2 - Math.cos(legAngle) * 10);
  ctx.stroke();

  ctx.restore();
}

const spriteCache = new Map<string, HTMLImageElement>();

function getSpriteImage(src: string) {
  let image = spriteCache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    spriteCache.set(src, image);
  }
  return image;
}

function getTimeframeLayout(timeframeId: TimeframeConfig["id"]) {
  switch (timeframeId) {
    case "1y":
      return { topY: 130, groundY: 460 };
    case "1ay":
      return { topY: 140, groundY: 465 };
    case "1h":
      return { topY: 150, groundY: 470 };
    case "1g":
    default:
      return { topY: 155, groundY: 470 };
  }
}
