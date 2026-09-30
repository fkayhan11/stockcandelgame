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
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  bull: boolean;
  price: number;
  label: string;
  wickTop: number;
  wickBottom: number;
  sinkOffset: number;
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

const DEFAULT_TIMEFRAME = TIMEFRAMES.find((t) => t.id === "1dk") ?? TIMEFRAMES[0];
const TRADE_SYMBOLS = TOP_VOLUME_SYMBOLS;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const initialTickerIdx = Math.floor(Math.random() * TRADE_SYMBOLS.length);
  const [timeframe, setTimeframe] = useState<TimeframeConfig>(DEFAULT_TIMEFRAME);
  const [tickerIdx, setTickerIdx] = useState(initialTickerIdx);
  const [draftTimeframe, setDraftTimeframe] = useState<TimeframeConfig>(DEFAULT_TIMEFRAME);
  const [draftTickerIdx, setDraftTickerIdx] = useState(initialTickerIdx);
  const [hasStartedRun, setHasStartedRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"canlı" | "gerçek-tarihi">("gerçek-tarihi");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(() => sound.muted);
  const [search, setSearch] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [hud, setHud] = useState({
    lives: 3,
    dollars: 0,
    distance: 0,
    gameOver: false,
    elapsedMs: 0,
    streak: 0,
    multiplier: 1,
    isNewRecord: false,
    hasShield: false,
    magnetSeconds: 0,
    rocketSeconds: 0,
  });

  const selectedCharId = useGameStore((s) => s.selectedCharacter);
  const selectedSkinId = useGameStore((s) => s.selectedSkins[selectedCharId] || "base");
  const character = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const addDollarsGlobal = useGameStore((s) => s.addDollars);
  const recordRun = useGameStore((s) => s.recordRun);
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
    cameraX: 0,
    bullStreak: 0,
    multiplier: 1,
    isNewRecord: false,
    hasShield: false,
    magnetTimer: 0,
    rocketTimer: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    player: {
      x: 80,
      y: 0,
      vx: 0,
      vy: 0,
      w: 26,
      h: 32,
      onGround: false,
      facing: 1,
      animation: "bekle" as PlayerAnimation,
      runClock: 0,
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
    if (!hasStartedRun) {
      setLoading(false);
      return;
    }
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
  }, [hasStartedRun, timeframe, tickerIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        if (down && hasStartedRun && !stateRef.current.gameOver) {
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
  }, [hasStartedRun]);

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
      haptic.light();
    } else {
      sound.resume();
      haptic.light();
    }
    setIsPaused(next);
  };

  const toggleMuteInGame = () => {
    haptic.light();
    const muted = sound.toggleMute();
    setIsMuted(muted);
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
    const priceToY = (price: number) => groundY - ((price - minPrice) / range) * (groundY - topY);
    const platforms: Platform[] = [];
    const collectibles: Collectible[] = [];
    let cursorX = 56;
    let currentY = 360;

    candles.forEach((candle, i) => {
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
      const h = Math.max(38, Math.min(100, rawH * 0.6 + 28));
      const wickTop = bodyTop - Math.min(42, Math.abs(priceToY(candle.h) - rawTargetY) * 0.4 + 16);
      const wickBottom =
        bodyTop + h + Math.min(42, Math.abs(priceToY(candle.l) - rawTargetY) * 0.4 + 16);
      const w = Math.max(72, tf.candleWidth * (0.95 + deterministicWave(i, 0.12)));
      const gap = Math.max(28, Math.min(48, tf.gap * (0.9 + deterministicWave(i + 11, 0.18))));

      platforms.push({
        x: cursorX,
        y: bodyTop,
        w,
        h,
        bull,
        price: candle.c,
        label: candle.label,
        wickTop,
        wickBottom,
        sinkOffset: 0,
      });

      if (i > 1 && i % 2 === 0) {
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
    state.player.x = first.x + 20;
    state.player.y = first.y - state.player.h;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.animation = "bekle";
    state.coyoteTimer = 0.14;
    state.jumpBufferTimer = 0;
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
    state.gameOver = false;
    state.particles = [];
    state.floatingTexts = [];
    state.started = false;
    state.startAt = 0;
    state.elapsedMs = 0;
    state.jumpPower = -560 * tf.jumpBoost;
    setIsPaused(false);

    // Ambient background volume bars for depth
    state.bgBars = Array.from({ length: 42 }, (_, i) => ({
      x: i * 70,
      h: 30 + ((i * 37) % 110),
      w: 36,
    }));

    setHud({
      lives: 3,
      dollars: 0,
      distance: 0,
      gameOver: false,
      elapsedMs: 0,
      streak: 0,
      multiplier: 1,
      isNewRecord: false,
      hasShield: false,
      magnetSeconds: 0,
      rocketSeconds: 0,
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
    }
    if (state.started) state.elapsedMs = now - state.startAt;

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
    } else {
      state.coyoteTimer = Math.max(0, state.coyoteTimer - dt);
    }

    // Jump buffering
    if (state.input.jumpPressed) {
      state.jumpBufferTimer = 0.14;
    }
    state.jumpBufferTimer = Math.max(0, state.jumpBufferTimer - dt);

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

      // Execute jump with coyote time and jump buffer!
      if (state.jumpBufferTimer > 0 && state.coyoteTimer > 0) {
        player.vy = state.jumpPower;
        player.onGround = false;
        state.coyoteTimer = 0;
        state.jumpBufferTimer = 0;
        sound.jump();
        haptic.light();
        spawnBurst(state.particles, player.x + player.w / 2, player.y + player.h, 7, "#10b981", 1);
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

    // Platform side wall collision: prevent character from passing horizontally through candle bodies when falling
    for (const platform of state.platforms) {
      const py = platform.y + platform.sinkOffset;
      const candleBottom = py + platform.h;
      if (player.y + player.h > py + 4 && player.y < candleBottom) {
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
      const py = platform.y + platform.sinkOffset;

      // Platform foot check: character center of mass must be horizontally on top of this candle.
      // In the gap between candles, this is false for all platforms, so the character falls!
      const onPlatform = footCenter >= platform.x && footCenter <= platform.x + platform.w;
      if (!onPlatform) continue;

      const crossedTop = player.vy >= 0 && previousBottom <= py + 12 && currentBottom >= py;
      const alreadyStanding = wasOnGround && Math.abs(currentBottom - py) <= 8 && player.vy >= -30;

      if ((crossedTop || alreadyStanding) && py < supportY) {
        supportPlatform = platform;
        supportY = py;
      }
    }

    if (supportPlatform) {
      player.y = supportY - player.h;
      player.vy = 0;
      player.onGround = true;

      if (!wasOnGround) {
        sound.land();
        spawnBurst(
          state.particles,
          player.x + player.w / 2,
          player.y + player.h + 1,
          6,
          supportPlatform.bull ? "#10b981" : "#f43f5e",
          0.75,
        );

        if (supportPlatform.bull) {
          state.bullStreak += 1;
          if (state.bullStreak >= 10) {
            state.multiplier = 3;
            if (state.bullStreak === 10) {
              sound.combo(10);
              haptic.heavy();
              state.floatingTexts.push({
                x: player.x,
                y: player.y - 25,
                text: "🚀 MOONSHOT x3!",
                life: 1.4,
                color: "#10b981",
              });
            }
          } else if (state.bullStreak >= 5) {
            state.multiplier = 2;
            if (state.bullStreak === 5) {
              sound.combo(5);
              haptic.medium();
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
          if (state.hasShield) {
            state.hasShield = false;
            sound.shield();
            haptic.success();
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
            sound.bearWarning();
            haptic.warning();
          }
        }
      }

      if (!supportPlatform.bull && !state.hasShield) {
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
      const grabRadius = item.r + 18 + (state.magnetTimer > 0 ? 15 : 0);

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
      if (state.hasShield) {
        // Shield saves from abyss fall!
        state.hasShield = false;
        sound.shield();
        haptic.success();
        const safe = [...state.platforms].reverse().find((p) => p.x + p.w < player.x && p.bull);
        const target = safe ?? state.platforms[0];
        player.x = target.x + 10;
        player.y = target.y - player.h - 8;
        player.vx = 0;
        player.vy = -340;
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
        haptic.warning();

        if (state.lives <= 0) {
          sound.gameOver();
          endRun();
        } else {
          sound.bearWarning();
          const safe = [...state.platforms].reverse().find((p) => p.x + p.w < player.x && p.bull);
          const target = safe ?? state.platforms[0];
          player.x = target.x + 10;
          player.y = target.y - player.h - 8;
          player.vx = 0;
          player.vy = 0;
        }
      }
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

    if (Math.floor(now / 50) !== Math.floor((now - dt * 1000) / 50)) {
      setHud({
        lives: state.lives,
        dollars: state.dollars,
        distance: currentMeters,
        gameOver: state.gameOver,
        elapsedMs: state.elapsedMs,
        streak: state.bullStreak,
        multiplier: state.multiplier,
        isNewRecord: state.isNewRecord,
        hasShield: state.hasShield,
        magnetSeconds: Math.ceil(state.magnetTimer),
        rocketSeconds: Math.ceil(state.rocketTimer),
      });
    }
  };

  const endRun = () => {
    const state = stateRef.current;
    state.gameOver = true;
    addDollarsGlobal(state.dollars);
    recordRun(Math.floor(state.distance / 20), selectedCharId, state.dollars);
    setHud({
      lives: 0,
      dollars: state.dollars,
      distance: Math.floor(state.distance / 20),
      gameOver: true,
      elapsedMs: state.elapsedMs,
      streak: 0,
      multiplier: 1,
      isNewRecord: state.isNewRecord,
      hasShield: false,
      magnetSeconds: 0,
      rocketSeconds: 0,
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

    // Premium natural dark background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0b0f19");
    bgGrad.addColorStop(1, "#111827");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle financial chart grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
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

    // Ambient background volume profile (faint depth)
    ctx.fillStyle = "rgba(16, 185, 129, 0.025)";
    state.bgBars.forEach((bar) => {
      const bx = ((bar.x - state.cameraX * 0.15) % (width + 140)) - 70;
      ctx.fillRect(bx < -70 ? bx + width + 140 : bx, height - bar.h, bar.w, bar.h);
    });

    ctx.save();
    ctx.translate(-state.cameraX, 0);

    // Candlesticks
    state.platforms.forEach((platform) => {
      const y = platform.y + platform.sinkOffset;
      const isBull = platform.bull;

      // Realistic wick
      ctx.strokeStyle = isBull ? "rgba(16, 185, 129, 0.85)" : "rgba(244, 63, 94, 0.85)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(platform.x + platform.w / 2, platform.wickTop + platform.sinkOffset);
      ctx.lineTo(platform.x + platform.w / 2, platform.wickBottom + platform.sinkOffset);
      ctx.stroke();

      // Soft candle shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      roundRect(ctx, platform.x + 2, y + 4, platform.w, platform.h, 4);
      ctx.fill();

      // Rounded candlestick body with natural gradient
      const bodyGrad = ctx.createLinearGradient(0, y, 0, y + platform.h);
      if (isBull) {
        bodyGrad.addColorStop(0, "#10b981");
        bodyGrad.addColorStop(1, "#059669");
      } else {
        bodyGrad.addColorStop(0, "#f43f5e");
        bodyGrad.addColorStop(1, "#be123c");
      }
      ctx.fillStyle = bodyGrad;
      roundRect(ctx, platform.x, y, platform.w, platform.h, 4);
      ctx.fill();

      // Subtle top highlight sheen
      ctx.strokeStyle = isBull ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(platform.x + 3, y + 1);
      ctx.lineTo(platform.x + platform.w - 3, y + 1);
      ctx.stroke();
    });

    // Price tags under candles
    ctx.font = "600 10px JetBrains Mono, monospace";
    state.platforms.forEach((platform, i) => {
      if (i % 6 !== 0) return;
      ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
      ctx.fillText(platform.label, platform.x, platform.y + platform.h + 24);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(`$${platform.price.toFixed(2)}`, platform.x, platform.y + platform.h + 38);
    });

    // Collectibles & Power-ups
    state.collectibles.forEach((item) => {
      if (item.collected) return;
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

    // Data source indicator
    drawHintBox(
      ctx,
      14,
      14,
      `VERİ: ${dataSourceRef.current === "canlı" ? "CANLI PİYASA" : "SİMÜLASYON"}`,
      "#10b981",
    );
  };

  const restart = () => {
    sound.click();
    haptic.medium();
    setIsPaused(false);
    if (!hasStartedRun) return;
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
  const draftSymbol = TRADE_SYMBOLS[draftTickerIdx];
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
      if (hasStartedRun) setTickerIdx(idx);
      else setDraftTickerIdx(idx);
    }
    setSelectorOpen(false);
    setSearch("");
  };

  const startConfiguredGame = () => {
    sound.click();
    haptic.medium();
    setTimeframe(draftTimeframe);
    setTickerIdx(draftTickerIdx);
    setHasStartedRun(true);
  };

  return (
    <div className="relative flex h-[calc(100dvh-72px)] flex-col px-3 pb-3">
      {/* Top HUD: Hearts, Active Power-ups, Combo Streak, Pause & Stopwatch */}
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="glass-low flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border border-white/8">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={
                "h-4 w-4 transition-all " +
                (i < hud.lives
                  ? "fill-rose-500 text-rose-500 scale-100"
                  : "text-slate-600 scale-90")
              }
            />
          ))}
        </div>

        {/* Active Power-up Badges */}
        <div className="flex items-center gap-1.5">
          {hud.hasShield && (
            <div className="flex items-center gap-1 rounded-xl bg-sky-500/20 px-2 py-1 border border-sky-500/40 text-[10px] font-bold font-mono text-sky-400 animate-pulse">
              <Shield className="h-3 w-3" />
              <span>STOP-LOSS</span>
            </div>
          )}
          {hud.magnetSeconds > 0 && (
            <div className="flex items-center gap-1 rounded-xl bg-amber-500/20 px-2 py-1 border border-amber-500/40 text-[10px] font-bold font-mono text-amber-400">
              <Magnet className="h-3 w-3" />
              <span>{hud.magnetSeconds}s</span>
            </div>
          )}
          {hud.rocketSeconds > 0 && (
            <div className="flex items-center gap-1 rounded-xl bg-orange-500/20 px-2 py-1 border border-orange-500/40 text-[10px] font-bold font-mono text-orange-400 animate-bounce">
              <Flame className="h-3 w-3" />
              <span>ROKET {hud.rocketSeconds}s</span>
            </div>
          )}
          {hud.multiplier > 1 && (
            <div className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-2.5 py-1 border border-emerald-500/40 text-xs font-bold font-mono text-emerald-400">
              <Zap className="h-3 w-3 fill-current" />
              <span>x{hud.multiplier}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hasStartedRun && !hud.gameOver && (
            <button
              onClick={togglePause}
              className="glass-low grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
              aria-label="Duraklat"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <div className="glass-low min-w-[80px] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs font-bold text-emerald-400 border border-white/8">
            {formatStopwatch(hud.elapsedMs)}
          </div>
        </div>
      </div>

      {/* Timeframe Chips */}
      <div className="mb-2 grid grid-cols-4 gap-1.5 rounded-xl border border-white/8 bg-slate-900/40 p-1.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            onClick={() => {
              sound.click();
              haptic.light();
              if (hasStartedRun) {
                setTimeframe(tf);
              } else {
                setDraftTimeframe(tf);
              }
            }}
            className={
              "rounded-lg py-1.5 text-center font-mono text-xs font-bold transition-all " +
              ((hasStartedRun ? timeframe.id : draftTimeframe.id) === tf.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-white active:scale-95")
            }
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Stock Ticker Banner & Distance */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <button
          onClick={() => {
            sound.click();
            haptic.light();
            setSelectorOpen(true);
          }}
          className="glass-low flex items-center gap-2 truncate rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-foreground border border-white/8 active:scale-95 transition-all"
        >
          <span className="text-emerald-400">{currentSymbol.symbol}</span>
          <span className="text-muted-foreground text-[11px]">· {currentSymbol.name}</span>
        </button>
        <div className="font-mono text-xs text-muted-foreground">
          MESAFE <span className="font-bold text-white">{hud.distance}m</span>
        </div>
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

        {/* Game Over Modal */}
        {hud.gameOver && (
          <div className="absolute inset-0 grid place-items-center bg-black/75 backdrop-blur-md p-4">
            <div className="glass w-full max-w-[320px] rounded-2xl p-6 text-center border border-white/10 shadow-2xl">
              {hud.isNewRecord && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-bounce">
                  🏆 YENİ EN İYİ SKOR!
                </div>
              )}
              <div className="font-display text-2xl font-bold text-rose-500">PİYASA KAPANDI</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Koşu sona erdi, kazanç cüzdanına aktarıldı.
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-xs">
                <Result label="SÜRE" value={formatStopwatch(hud.elapsedMs)} />
                <Result label="MESAFE" value={`${hud.distance}m`} />
                <Result label="KAZANÇ" value={`$${hud.dollars}`} />
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  onClick={restart}
                  className="primary-cta inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white active:scale-95 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> TEKRAR DENE
                </button>

                <button
                  onClick={shareScore}
                  className="glass-low inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
                >
                  <Share2 className="h-4 w-4" /> {copiedShare ? "KOPYALANDI!" : "SKORU PAYLAŞ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bear warning indicator */}
        <div className="pointer-events-none absolute left-3 top-14 flex items-center gap-2 text-[10px] font-bold">
          <div className="glass-low flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" /> AYI MUMLARI KAYDIRIR
          </div>
        </div>

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
                    const active = hasStartedRun
                      ? symbol.symbol === currentSymbol.symbol
                      : symbol.symbol === draftSymbol.symbol;
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

        {/* Pre-run start modal */}
        {!hasStartedRun && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 backdrop-blur-md p-4">
            <div className="glass w-full max-w-[340px] rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="font-display text-xl font-bold text-white">Koşuyu Başlat</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Piyasa sembolü ve mum zaman dilimini belirle.
              </div>

              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase font-semibold text-muted-foreground">
                  HİSSE / KRİPTO
                </div>
                <button
                  onClick={() => {
                    sound.click();
                    setSelectorOpen(true);
                  }}
                  className="glass-low mt-1.5 flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left border border-white/8 active:scale-95 transition-all"
                >
                  <div>
                    <div className="font-mono text-sm font-bold text-emerald-400">
                      {draftSymbol.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">{draftSymbol.name}</div>
                  </div>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase font-semibold text-muted-foreground">
                  ZAMAN DİLİMİ
                </div>
                <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-xl border border-white/8 bg-slate-900/40 p-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        sound.click();
                        setDraftTimeframe(tf);
                      }}
                      className={
                        "rounded-lg py-1 text-center font-mono text-xs font-bold transition-all " +
                        (draftTimeframe.id === tf.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-white")
                      }
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startConfiguredGame}
                className="primary-cta mt-5 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 font-display text-base font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                PİYASAYA GİR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls with Haptics */}
      <div className="mt-3 grid grid-cols-[auto_auto_1fr] items-center gap-2.5">
        <button
          onPointerDown={() => {
            haptic.light();
            setInput("left", true);
          }}
          onPointerLeave={() => setInput("left", false)}
          onPointerUp={() => setInput("left", false)}
          className="glass-low grid h-14 w-14 place-items-center rounded-2xl text-white active:bg-primary/20 active:scale-95 transition-transform border border-white/8 shadow-md"
          aria-label="Sola koş"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          onPointerDown={() => {
            haptic.light();
            setInput("right", true);
          }}
          onPointerLeave={() => setInput("right", false)}
          onPointerUp={() => setInput("right", false)}
          className="glass-low grid h-14 w-14 place-items-center rounded-2xl text-white active:bg-primary/20 active:scale-95 transition-transform border border-white/8 shadow-md"
          aria-label="Sağa koş"
        >
          <ArrowRight className="h-6 w-6" />
        </button>

        <button
          onPointerDown={() => {
            setInput("jump", true);
          }}
          onPointerLeave={() => setInput("jump", false)}
          onPointerUp={() => setInput("jump", false)}
          className="primary-cta grid h-14 w-full place-items-center rounded-2xl bg-primary text-white active:scale-95 transition-transform shadow-lg"
          aria-label="Zıpla"
        >
          <div className="flex flex-col items-center">
            <ChevronsUp className="h-5 w-5" />
            <span className="font-mono text-[10px] font-bold tracking-widest">ZIPLA</span>
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
  const tilt = Math.sin(now / 240) * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tilt * Math.PI) / 180);

  // Modern banknote styling
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  roundRect(ctx, -12, -6, 26, 15, 2);
  ctx.fill();

  const billGrad = ctx.createLinearGradient(-13, -7, 13, 7);
  billGrad.addColorStop(0, "#10b981");
  billGrad.addColorStop(1, "#047857");
  ctx.fillStyle = billGrad;
  roundRect(ctx, -13, -7, 26, 14, 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
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
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.arc(x, y + 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Natural warm gold gradient
  const grad = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, radius);
  grad.addColorStop(0, "#fef08a");
  grad.addColorStop(0.5, "#f59e0b");
  grad.addColorStop(1, "#b45309");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "rgba(69, 26, 3, 0.9)";
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
  now: number,
) {
  ctx.save();
  ctx.translate(x, y);

  // Soft shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.arc(0, 2, 12, 0, Math.PI * 2);
  ctx.fill();

  if (kind === "kalkan") {
    // Stop-Loss Shield Orb
    const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
    grad.addColorStop(0, "#bae6fd");
    grad.addColorStop(0.6, "#0284c7");
    grad.addColorStop(1, "#0369a1");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛡️", 0, 3.5);
  } else if (kind === "miknatis") {
    // Magnet Orb
    const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
    grad.addColorStop(0, "#fde68a");
    grad.addColorStop(0.6, "#d97706");
    grad.addColorStop(1, "#b45309");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🧲", 0, 3.5);
  } else if (kind === "roket") {
    // Rocket Orb
    const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
    grad.addColorStop(0, "#fed7aa");
    grad.addColorStop(0.6, "#ea580c");
    grad.addColorStop(1, "#c2410c");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
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
  },
) {
  const px = w / 8;
  const py = h / 10;
  const legSwing =
    opts.animation === "sol" || opts.animation === "sag"
      ? Math.round(Math.sin(opts.runClock * 7) * py)
      : 0;
  const jumpLift = opts.animation === "zipla" ? -2 : opts.animation === "dus" ? 2 : 0;

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  const shadowScale =
    opts.animation === "zipla"
      ? 0.62
      : opts.animation === "dus"
        ? 0.9
        : 0.82 + Math.abs(legSwing) * 0.035;
  ctx.fillRect(x + w * (1 - shadowScale) * 0.5, y + h, w * shadowScale, 3);

  const sprite = getSpriteImage(opts.sprite);
  if (sprite.complete && sprite.naturalWidth > 0) {
    const isRunning = opts.animation === "sol" || opts.animation === "sag";
    const walkBob = isRunning ? Math.sin(opts.runClock * 9) * 3.1 : 0;
    const tilt =
      opts.animation === "zipla"
        ? -0.16 * opts.facing
        : opts.animation === "dus"
          ? 0.18 * opts.facing
          : isRunning
            ? Math.sin(opts.runClock * 9) * 0.085
            : 0;
    const scaleX =
      opts.animation === "zipla"
        ? 0.9
        : opts.animation === "dus"
          ? 1.12
          : isRunning
            ? 1 + Math.sin(opts.runClock * 9) * 0.045
            : 1;
    const scaleY =
      opts.animation === "zipla"
        ? 1.16
        : opts.animation === "dus"
          ? 0.88
          : isRunning
            ? 1 - Math.sin(opts.runClock * 9) * 0.03
            : 1;
    const drawW = 52;
    const drawH = 52;
    const drawX = x + w / 2 - drawW / 2;
    const drawY = y + h - drawH + jumpLift + walkBob;

    if (isRunning) {
      drawSpriteGhost(
        ctx,
        sprite,
        drawX - opts.facing * 7,
        drawY + 1,
        drawW,
        drawH,
        opts.facing,
        0.18,
      );
      drawAnimatedRunSprite(ctx, sprite, drawX, drawY, drawW, drawH, opts.facing, opts.runClock);
      return;
    }

    if (opts.animation === "dus") {
      drawFallStreaks(ctx, drawX, drawY, drawW, drawH, opts.runClock);
    }

    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.rotate(tilt);
    ctx.scale(opts.facing < 0 ? -scaleX : scaleX, scaleY);
    ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    return;
  }

  // Natural fallback character rendering
  ctx.fillStyle = `hsl(${(opts.hue + 200) % 360} 40% 28%)`;
  ctx.fillRect(x, y + py * 4 + jumpLift, w, py * 4.6);
  ctx.fillStyle = `hsl(${opts.hue} 70% 50%)`;
  ctx.fillRect(x + px * 3, y + py * 4 + jumpLift, px * 2, py * 4);
  ctx.fillStyle = "#f5d0b5";
  ctx.fillRect(x + px, y + jumpLift, px * 6, py * 4);
  ctx.fillStyle = `hsl(${(opts.hue + 30) % 360} 60% 25%)`;
  ctx.fillRect(x + px, y + jumpLift, px * 6, py);
  ctx.fillStyle = "#111827";
  const eyeX = opts.facing > 0 ? x + px * 4.6 : x + px * 2.5;
  ctx.fillRect(eyeX, y + py * 1.8 + jumpLift, px * 0.8, py * 0.8);
  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(x + px, y + h - py + legSwing, px * 2.4, py);
  ctx.fillRect(x + w - px * 3.4, y + h - py - legSwing, px * 2.4, py);
}

function drawSpriteGhost(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  facing: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (facing < 0) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, 0, w, h);
  } else {
    ctx.drawImage(sprite, x, y, w, h);
  }
  ctx.restore();
}

function drawFallStreaks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  clock: number,
) {
  ctx.save();
  ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i += 1) {
    const sx = x + 5 + i * 13 + Math.sin(clock * 8 + i) * 2;
    const sy = y - 9 - i * 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 4, sy + h * 0.42);
    ctx.stroke();
  }
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
    case "1ay":
      return { topY: 182, groundY: 476 };
    default:
      return { topY: 145, groundY: 470 };
  }
}

function drawAnimatedRunSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  facing: number,
  clock: number,
) {
  const srcW = sprite.naturalWidth;
  const srcH = sprite.naturalHeight;
  const bob = Math.sin(clock * 9) * 1.6;
  const legA = Math.sin(clock * 9) * 0.42;
  const legB = -legA;
  const torsoTilt = facing * 0.06;

  const torso = {
    sx: 0,
    sy: 0,
    sw: srcW,
    sh: Math.floor(srcH * 0.66),
  };
  const leftLeg = {
    sx: Math.floor(srcW * 0.2),
    sy: Math.floor(srcH * 0.58),
    sw: Math.floor(srcW * 0.24),
    sh: Math.floor(srcH * 0.42),
  };
  const rightLeg = {
    sx: Math.floor(srcW * 0.52),
    sy: Math.floor(srcH * 0.58),
    sw: Math.floor(srcW * 0.24),
    sh: Math.floor(srcH * 0.42),
  };

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + bob);
  if (facing < 0) ctx.scale(-1, 1);

  drawSpriteLimb(ctx, sprite, leftLeg, -w * 0.12, h * 0.1, w * 0.18, h * 0.4, legA);
  drawSpriteLimb(ctx, sprite, rightLeg, w * 0.1, h * 0.1, w * 0.18, h * 0.4, legB);

  ctx.save();
  ctx.rotate(torsoTilt);
  ctx.drawImage(sprite, torso.sx, torso.sy, torso.sw, torso.sh, -w / 2, -h / 2, w, h * 0.66);
  ctx.restore();
  ctx.restore();
}

function drawSpriteLimb(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  source: { sx: number; sy: number; sw: number; sh: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(angle);
  ctx.drawImage(sprite, source.sx, source.sy, source.sw, source.sh, -dw / 2, 0, dw, dh);
  ctx.restore();
}
