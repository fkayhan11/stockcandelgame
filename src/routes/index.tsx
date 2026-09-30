import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PortraitCanvas } from "@/components/PortraitCanvas";
import { CHARACTERS } from "@/lib/game-data";
import { useGameStore } from "@/lib/store";
import {
  Play,
  ChevronRight,
  Trophy,
  Zap,
  ShieldAlert,
  Target,
  CheckCircle2,
  Flame,
  ArrowUpCircle,
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
  const selectedSkinId = useGameStore((s) => s.selectedSkins[selected] || "base");
  const highScore = useGameStore((s) => s.highScore);
  const totalWealth = useGameStore((s) => s.totalWealth);
  const claimedMissions = useGameStore((s) => s.claimedMissions);
  const claimMission = useGameStore((s) => s.claimMission);
  const character = CHARACTERS.find((c) => c.id === selected) || CHARACTERS[0];

  const handleStartClick = () => {
    haptic.medium();
    sound.click();
  };

  const handleClaim = (id: string, coins: number) => {
    sound.gold();
    haptic.heavy();
    claimMission(id, coins);
  };

  const missions = [
    {
      id: "run_300m",
      title: "300m Mesafe Kat Et",
      desc: "En iyi koşunda 300 metreye ulaş",
      reward: 50,
      current: Math.min(300, highScore),
      target: 300,
      completed: highScore >= 300,
    },
    {
      id: "earn_200d",
      title: "Toplam $200 Kazan",
      desc: "Koşulardan $200 servet biriktir",
      reward: 75,
      current: Math.min(200, totalWealth),
      target: 200,
      completed: totalWealth >= 200,
    },
    {
      id: "run_1000m",
      title: "1.000m Maratoncu",
      desc: "Piyasanın zirvesine tırman",
      reward: 150,
      current: Math.min(1000, highScore),
      target: 1000,
      completed: highScore >= 1000,
    },
  ];

  return (
    <AppShell>
      <div className="px-4.5 pt-3.5 pb-2">
        {/* Top Header info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
              PİYASA AÇIK
            </div>
            <h1 className="mt-0.5 font-display text-2xl font-black tracking-tight text-white">
              Mum Koşusu
            </h1>
          </div>

          <div className="glass-low flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-xs text-amber-400 border border-amber-500/25 shadow-sm">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-bold">{highScore}m</span>
          </div>
        </div>

        {/* Hero Character Card */}
        <section className="glass relative mt-3.5 overflow-hidden rounded-2xl p-4.5 border border-white/[0.08] shadow-2xl">
          <div className="relative flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Seçili Portföy Lideri
                </span>
                <div className="mt-0.5 font-display text-xl font-black text-white">
                  {character.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {character.title} · {character.industry}
                </div>
              </div>
              <Link
                to="/skins"
                onClick={() => {
                  haptic.light();
                  sound.click();
                }}
                className="glass-low flex h-8 items-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95 border border-white/8"
              >
                <span>Kostüm</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div
              className="relative mx-auto my-3 grid h-[136px] w-[136px] place-items-center rounded-2xl shadow-xl border border-white/10"
              style={{ background: character.bgGradient }}
            >
              <div className="relative z-10">
                <PortraitCanvas character={character} size={124} skinId={selectedSkinId} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric label="VOLATİLİTE" value="Yüksek" />
              <Metric label="ÇARPAN" value="x2.0" />
              <Metric label="PİYASA" value="Canlı" />
            </div>
          </div>
        </section>

        {/* Primary Play Button */}
        <Link
          to="/play"
          onClick={handleStartClick}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 py-3.5 font-display text-base font-black text-white shadow-xl shadow-emerald-950/40 active:scale-[0.98] transition-all border border-emerald-400/40"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>KOŞUYA BAŞLA</span>
        </Link>

        {/* Daily Quests / Günün Görevleri */}
        <div className="mt-3.5 rounded-2xl glass p-4 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 font-display text-xs font-bold text-white">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <span>Günün Görevleri</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {missions.filter((m) => claimedMissions.includes(m.id)).length}/3 Tamamlandı
            </span>
          </div>

          <div className="mt-2.5 space-y-2">
            {missions.map((m) => {
              const isClaimed = claimedMissions.includes(m.id);
              const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

              return (
                <div
                  key={m.id}
                  className="glass-low flex items-center justify-between gap-3 rounded-xl p-2.5 border border-white/6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <span>{m.title}</span>
                      <span className="font-mono text-[10px] text-amber-400">+{m.reward} C</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{m.desc}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {m.current}/{m.target}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-muted-foreground px-2 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> ALINDI
                      </div>
                    ) : m.completed ? (
                      <button
                        onClick={() => handleClaim(m.id, m.reward)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[11px] font-bold px-3 py-1.5 active:scale-95 transition-all shadow-md"
                      >
                        ÖDÜLÜ AL
                      </button>
                    ) : (
                      <div className="rounded-xl bg-slate-800/80 text-muted-foreground font-mono text-[10px] font-semibold px-2.5 py-1">
                        %{progressPct}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Grid Mechanics Showcase */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <div className="glass-low flex items-center gap-2.5 rounded-xl p-2.5 border border-emerald-500/20">
            <div className="h-6 w-1.5 rounded-full bg-emerald-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Boğa Mumu <Zap className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Stabil platform & seri</div>
            </div>
          </div>

          <div className="glass-low flex items-center gap-2.5 rounded-xl p-2.5 border border-rose-500/20">
            <div className="h-6 w-1.5 rounded-full bg-rose-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Ayı / Kırılgan <ShieldAlert className="h-3 w-3 text-rose-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Kaydırır & anında çöker</div>
            </div>
          </div>

          <div className="glass-low flex items-center gap-2.5 rounded-xl p-2.5 border border-amber-500/20">
            <div className="h-6 w-1.5 rounded-full bg-amber-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Short Squeeze <ArrowUpCircle className="h-3 w-3 text-amber-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Göğe fırlatır & altın yayar</div>
            </div>
          </div>

          <div className="glass-low flex items-center gap-2.5 rounded-xl p-2.5 border border-purple-500/20">
            <div className="h-6 w-1.5 rounded-full bg-purple-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Boğa Çılgınlığı <Flame className="h-3 w-3 text-purple-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Moonshot x5 & dokunulmaz</div>
            </div>
          </div>
        </div>

        {/* Legal & Privacy Compliance */}
        <LegalNoticeModal />
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-low rounded-xl py-2 px-1 text-center border border-white/6">
      <div className="font-mono text-[9px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-xs font-bold text-white">{value}</div>
    </div>
  );
}
