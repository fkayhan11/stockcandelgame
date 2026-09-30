import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useGameStore } from "@/lib/store";
import { CHARACTERS } from "@/lib/game-data";
import { Trophy, Wallet, Target, Medal, Flame } from "lucide-react";
import { PortraitCanvas } from "@/components/PortraitCanvas";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "İstatistikler — Block Jumper" },
      { name: "description", content: "Skor ve portföy performans kayıtların." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const highScore = useGameStore((s) => s.highScore);
  const totalWealth = useGameStore((s) => s.totalWealth);
  const records = useGameStore((s) => s.characterRecords);
  const coin = useGameStore((s) => s.coin);

  return (
    <AppShell>
      <div className="px-5 pt-4">
        <h1 className="font-display text-2xl font-bold text-white">İstatistikler</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          GENEL PORTFÖY VE KOŞU REKORLARI
        </p>

        {/* 3 Metric Cards */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <StatTile
            icon={<Trophy className="h-4 w-4 text-emerald-400" />}
            label="EN UZAK"
            value={`${highScore}m`}
            valueColor="text-emerald-400"
          />
          <StatTile
            icon={<Wallet className="h-4 w-4 text-amber-400" />}
            label="TOPLAM"
            value={`$${totalWealth.toLocaleString("tr-TR")}`}
            valueColor="text-white"
          />
          <StatTile
            icon={<Target className="h-4 w-4 text-amber-400" />}
            label="$COIN"
            value={coin.toLocaleString("tr-TR")}
            valueColor="text-amber-400"
          />
        </div>

        {/* Mastery / Tier Banner */}
        <div className="glass-low mt-4 flex items-center justify-between rounded-2xl p-4 border border-white/8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {highScore >= 1000
                  ? "Wall Street Efsanesi"
                  : highScore >= 500
                    ? "Kıdemli Fon Yöneticisi"
                    : "Piyasa Çırağı"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {highScore >= 1000
                  ? "Tüm zamanların en iyi koşucusu"
                  : "1000m hedefine ulaşmak için koş"}
              </div>
            </div>
          </div>
          <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>

        {/* Character Records */}
        <h2 className="mt-6 font-display text-base font-bold text-white flex items-center gap-2">
          <span>Karakter Bazlı Rekorlar</span>
        </h2>
        <div className="mt-3 space-y-2 pb-6">
          {CHARACTERS.map((c) => {
            const r = records[c.id] || 0;
            return (
              <div
                key={c.id}
                className="glass-low flex items-center justify-between rounded-2xl p-3.5 border border-white/6 hover:border-white/12 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/10 shadow-sm"
                    style={{ background: c.bgGradient }}
                  >
                    <PortraitCanvas character={c} size={40} />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-white">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.title}</div>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {r}m
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function StatTile({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="glass-low rounded-2xl p-3 border border-white/6">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="font-mono text-[9px] font-semibold tracking-wider">{label}</span>
      </div>
      <div className={"mt-1.5 font-mono text-sm font-bold truncate " + valueColor}>{value}</div>
    </div>
  );
}
