import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PortraitCanvas } from "@/components/PortraitCanvas";
import { CHARACTERS } from "@/lib/game-data";
import { useGameStore } from "@/lib/store";
import { Play, ChevronRight, Trophy, Zap, ShieldAlert } from "lucide-react";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

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
  const character = CHARACTERS.find((c) => c.id === selected) || CHARACTERS[0];

  const handleStartClick = () => {
    haptic.medium();
    sound.click();
  };

  return (
    <AppShell>
      <div className="px-5 pt-4">
        {/* Top Header info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              PİYASA AÇIK
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
              Mum Koşusu
            </h1>
          </div>

          <div className="glass-low flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-bold">{highScore}m</span>
          </div>
        </div>

        {/* Hero Character Card */}
        <section className="hero-panel glass relative mt-4 overflow-hidden rounded-2xl p-5 border border-white/8">
          <div className="hero-grid absolute inset-0" />
          <div className="relative flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Seçili Kahraman
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-white">
                  {character.name}
                </div>
                <div className="text-xs text-muted-foreground">{character.title} · {character.industry}</div>
              </div>
              <Link
                to="/skins"
                onClick={() => {
                  haptic.light();
                  sound.click();
                }}
                className="glass-low flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-foreground transition-all hover:bg-white/10 active:scale-95"
              >
                <span>Kostüm</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="relative mx-auto my-3 grid h-[142px] w-[142px] place-items-center rounded-2xl shadow-xl border border-white/10"
              style={{ background: character.bgGradient }}
            >
              <div className="relative z-10">
                <PortraitCanvas character={character} size={130} skinId={selectedSkinId} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric label="VOLATİLİTE" value="Yüksek" />
              <Metric label="CARPAN" value="x2.0" />
              <Metric label="PİYASA" value="Canlı" />
            </div>
          </div>
        </section>

        {/* Primary Play Button */}
        <Link
          to="/play"
          onClick={handleStartClick}
          className="primary-cta mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary py-4 font-display text-base font-bold text-white shadow-lg active:scale-95 transition-all"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>KOŞUYA BAŞLA</span>
        </Link>

        {/* Quick Mechanics Guide */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="glass-low flex items-center gap-2.5 rounded-xl p-3 border border-emerald-500/15">
            <div className="h-7 w-2 rounded-full bg-emerald-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Boğa Mumu <Zap className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Güvenli platform, hız kazan</div>
            </div>
          </div>

          <div className="glass-low flex items-center gap-2.5 rounded-xl p-3 border border-rose-500/15">
            <div className="h-7 w-2 rounded-full bg-rose-500" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Ayı Mumu <ShieldAlert className="h-3 w-3 text-rose-400" />
              </div>
              <div className="text-[10px] text-muted-foreground">Kaydırır & hızla çöker</div>
            </div>
          </div>
        </div>

        {/* Economy summary */}
        <div className="glass-low mt-2.5 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs text-muted-foreground">
          <span>Toplanan her <strong>100 Dolar</strong></span>
          <span className="font-mono font-bold text-amber-400">= 1 $COIN</span>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-low rounded-xl py-2 px-1 text-center">
      <div className="font-mono text-[9px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-xs font-bold text-white">{value}</div>
    </div>
  );
}
