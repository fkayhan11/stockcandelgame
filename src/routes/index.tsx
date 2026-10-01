import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PortraitCanvas } from "@/components/PortraitCanvas";
import { CHARACTERS } from "@/lib/game-data";
import { useGameStore } from "@/lib/store";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  CheckCircle2,
  Sparkles,
  Shirt,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";
import { LegalNoticeModal } from "@/components/LegalNoticeModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Block Jumper — Mum Koşusu" },
      { name: "description", content: "Canlı borsa mumlarında zıpla, dolar topla, $COIN kazan." },
    ],
  }),
  component: Home,
});

function Home() {
  const selected = useGameStore((s) => s.selectedCharacter);
  const selectCharacter = useGameStore((s) => s.selectCharacter);
  const selectedSkinId = useGameStore((s) => s.selectedSkins[selected] || "base");
  const highScore = useGameStore((s) => s.highScore);
  const records = useGameStore((s) => s.characterRecords);
  const claimedMissions = useGameStore((s) => s.claimedMissions);
  const claimMission = useGameStore((s) => s.claimMission);

  const charIndex = CHARACTERS.findIndex((c) => c.id === selected);
  const character = charIndex >= 0 ? CHARACTERS[charIndex] : CHARACTERS[0];
  const charRecord = records[character.id] || 0;

  const handlePrevChar = () => {
    sound.click();
    haptic.light();
    const prevIdx = (charIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    selectCharacter(CHARACTERS[prevIdx].id);
  };

  const handleNextChar = () => {
    sound.click();
    haptic.light();
    const nextIdx = (charIndex + 1) % CHARACTERS.length;
    selectCharacter(CHARACTERS[nextIdx].id);
  };

  const handleStartClick = () => {
    haptic.medium();
    sound.click();
  };

  // Primary active mission
  const activeMission = {
    id: "run_300m",
    title: "300m Boğa Koşusu",
    desc: "Tek koşuda 300 metreye ulaş",
    reward: 50,
    current: Math.min(300, highScore),
    target: 300,
    completed: highScore >= 300,
  };
  const isMissionClaimed = claimedMissions.includes(activeMission.id);
  const missionPct = Math.min(
    100,
    Math.round((activeMission.current / activeMission.target) * 100),
  );

  const handleClaim = () => {
    sound.gold();
    haptic.heavy();
    claimMission(activeMission.id, activeMission.reward);
  };

  return (
    <AppShell>
      <div className="px-4.5 pt-3 pb-3 flex flex-col gap-3.5">
        {/* Top Header info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-300">
              CANLI PİYASA · 60 HİSSE
            </span>
          </div>

          <div className="glass-low flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-amber-500/25 shadow-sm">
            <Trophy className="h-3.5 w-3.5" />
            <span>{highScore}m</span>
          </div>
        </div>

        {/* Central Character Hero Stage */}
        <section className="glass relative overflow-hidden rounded-3xl p-5 border border-white/[0.08] shadow-2xl">
          {/* Subtle Ambient Radial Backlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 blur-3xl transition-all duration-500"
            style={{ background: character.bgGradient }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Stage Header with Category & Costume Link */}
            <div className="w-full flex items-center justify-between pb-1">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                {character.industry}
              </span>
              <Link
                to="/skins"
                onClick={() => {
                  haptic.light();
                  sound.click();
                }}
                className="glass-low flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-300 hover:text-white transition-all border border-white/8 active:scale-95"
              >
                <Shirt className="h-3 w-3 text-amber-400" />
                <span>Kostümler</span>
              </Link>
            </div>

            {/* Character Carousel Stage */}
            <div className="relative w-full flex items-center justify-between my-2">
              {/* Previous Character Arrow */}
              <button
                onClick={handlePrevChar}
                className="glass-low grid h-10 w-10 place-items-center rounded-2xl text-slate-400 hover:text-white active:scale-90 transition-all border border-white/8 shadow-sm"
                aria-label="Önceki Kahraman"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Character Portrait with Pedestal Shadow */}
              <div className="relative flex flex-col items-center">
                <div
                  className="grid h-[150px] w-[150px] place-items-center rounded-3xl p-2 border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-105"
                  style={{ background: character.bgGradient }}
                >
                  <PortraitCanvas character={character} size={134} skinId={selectedSkinId} />
                </div>
                {/* Elliptical Ground Pedestal Shadow */}
                <div className="mt-2 h-2.5 w-24 rounded-full bg-black/60 blur-[3px]" />
              </div>

              {/* Next Character Arrow */}
              <button
                onClick={handleNextChar}
                className="glass-low grid h-10 w-10 place-items-center rounded-2xl text-slate-400 hover:text-white active:scale-90 transition-all border border-white/8 shadow-sm"
                aria-label="Sonraki Kahraman"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Character Name & Title */}
            <div className="mt-1">
              <h2 className="font-display text-2xl font-black tracking-tight text-white">
                {character.name}
              </h2>
              <div className="text-xs text-muted-foreground font-medium">{character.title}</div>
            </div>

            {/* Micro Stats Bar */}
            <div className="mt-3.5 flex items-center justify-center gap-3 w-full font-mono text-xs">
              <div className="glass-low rounded-xl px-3 py-1 border border-white/6 text-slate-300">
                <span className="text-muted-foreground text-[10px]">EN İYİ: </span>
                <span className="font-bold text-emerald-400">{charRecord}m</span>
              </div>
              <div className="glass-low rounded-xl px-3 py-1 border border-white/6 text-slate-300">
                <span className="text-muted-foreground text-[10px]">ÇARPAN: </span>
                <span className="font-bold text-amber-400">x2.0</span>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Play Button */}
        <Link
          to="/play"
          onClick={handleStartClick}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 py-4 font-display text-lg font-black tracking-wide text-slate-950 shadow-xl shadow-emerald-950/40 active:scale-[0.98] transition-all border border-emerald-300/40"
        >
          <Play className="h-6 w-6 fill-current text-slate-950" />
          <span>PİYASAYA GİR</span>
        </Link>

        {/* Simplified Daily Goal Card */}
        <div className="glass rounded-2xl p-3.5 border border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-xs font-bold text-white">
              <Target className="h-4 w-4 text-amber-400" />
              <span>Günün Hedefi: {activeMission.title}</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">
              +{activeMission.reward} $COIN
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${missionPct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>{activeMission.desc}</span>
                <span>
                  {activeMission.current}/{activeMission.target}m
                </span>
              </div>
            </div>

            <div>
              {isMissionClaimed ? (
                <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ALINDI
                </div>
              ) : activeMission.completed ? (
                <button
                  onClick={handleClaim}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold px-3 py-1.5 active:scale-95 transition-all shadow-md"
                >
                  ÖDÜLÜ AL
                </button>
              ) : (
                <div className="font-mono text-xs font-bold text-slate-400 px-2">%{missionPct}</div>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe & Mechanic Showcase */}
        <div className="glass-low rounded-2xl p-3.5 border border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/6">
            <span className="font-mono text-[10px] font-bold tracking-wider text-slate-300 uppercase">
              MUM DİLİMLERİ & ZORLUK SEVİYELERİ
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold">
              ÖĞREN & KAZAN
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">1G · 1 Günlük</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Kolay</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">
                Geniş kalın mumlar, sağlam basamaklar, düşük düşme riski.
              </p>
            </div>
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">1Y · 1 Yıllık</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300">Uzman</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">
                İncecik mumlar, hassas atlama, kenardan düşme tehlikesi!
              </p>
            </div>
          </div>
        </div>

        {/* Live Ticker Teaser */}
        <div className="glass-low flex items-center justify-between rounded-xl px-3.5 py-2 font-mono text-[11px] border border-white/6 text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">THYAO +3.4%</span>
            <span className="text-emerald-400 font-bold">BTC +5.2%</span>
            <span className="text-emerald-400 font-bold">GARAN +2.1%</span>
            <span className="text-emerald-400 font-bold">NVDA +4.1%</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">CANLI OHLC</span>
        </div>

        {/* Legal & Privacy Compliance */}
        <LegalNoticeModal />
      </div>
    </AppShell>
  );
}
