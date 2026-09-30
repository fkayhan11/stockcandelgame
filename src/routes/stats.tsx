import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useGameStore } from "@/lib/store";
import { CHARACTERS } from "@/lib/game-data";
import { Trophy, Wallet, Target, Medal, Flame, Timer, Zap, Play } from "lucide-react";
import { PortraitCanvas } from "@/components/PortraitCanvas";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "İstatistikler — Block Jumper" },
      { name: "description", content: "Skor, portföy ve günün en hızlıları liderlik tablosu." },
    ],
  }),
  component: StatsPage,
});

function formatStopwatch(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function StatsPage() {
  const [tab, setTab] = useState<"speedrun" | "characters">("speedrun");
  const highScore = useGameStore((s) => s.highScore);
  const totalWealth = useGameStore((s) => s.totalWealth);
  const records = useGameStore((s) => s.characterRecords);
  const coin = useGameStore((s) => s.coin);
  const getTodayLeaderboard = useGameStore((s) => s.getTodayLeaderboard);
  const dailyPlayerBestMs = useGameStore((s) => s.dailyPlayerBestMs);

  const leaderboard = getTodayLeaderboard();
  const playerRankEntry = leaderboard.find((e) => e.isPlayer);

  return (
    <AppShell>
      <div className="px-5 pt-4">
        <h1 className="font-display text-2xl font-bold text-white">İstatistikler</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          GENEL PORTFÖY VE GÜNLÜK HIZ SIRALAMASI
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
                {dailyPlayerBestMs
                  ? `Bugünkü En Hızlı Bitiş: ${formatStopwatch(dailyPlayerBestMs)} (${playerRankEntry ? `${playerRankEntry.rank}. Sıra` : ""})`
                  : "Bugün piyasa zirvesine koşarak liderlik tablosuna adını yazdır!"}
              </div>
            </div>
          </div>
          <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/8 bg-slate-900/60 p-1">
          <button
            onClick={() => setTab("speedrun")}
            className={
              "flex items-center justify-center gap-1.5 rounded-xl py-2 font-mono text-xs font-bold transition-all " +
              (tab === "speedrun"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-white")
            }
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Günün En Hızlıları</span>
          </button>
          <button
            onClick={() => setTab("characters")}
            className={
              "flex items-center justify-center gap-1.5 rounded-xl py-2 font-mono text-xs font-bold transition-all " +
              (tab === "characters"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-white")
            }
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Karakter Rekorları</span>
          </button>
        </div>

        {/* Tab 1: Daily Speedrun Leaderboard */}
        {tab === "speedrun" && (
          <div className="mt-4 pb-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1 pb-1">
              <span>BUGÜNÜN SIRALAMASI</span>
              <span>BİTİŞ SÜRESİ</span>
            </div>

            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={
                  "glass-low flex items-center justify-between rounded-2xl p-3 border transition-all " +
                  (entry.isPlayer
                    ? "bg-emerald-500/20 border-emerald-500/40 shadow-sm"
                    : "border-white/6 hover:border-white/10")
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "grid h-6 w-6 place-items-center rounded-lg text-xs font-black " +
                      (entry.rank === 1
                        ? "bg-amber-500 text-black shadow-sm"
                        : entry.rank === 2
                          ? "bg-slate-300 text-black shadow-sm"
                          : entry.rank === 3
                            ? "bg-amber-700 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400")
                    }
                  >
                    {entry.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          "font-display text-sm font-bold " +
                          (entry.isPlayer ? "text-emerald-400" : "text-white")
                        }
                      >
                        {entry.runnerName}
                      </span>
                      {entry.isPlayer && (
                        <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
                          SEN
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {entry.charName} · {entry.symbol}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {formatStopwatch(entry.timeMs)}
                </div>
              </div>
            ))}

            <Link
              to="/play"
              className="primary-cta mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-display text-sm font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>ZİRVEYE KOŞ VE REKOR KIR</span>
            </Link>
          </div>
        )}

        {/* Tab 2: Character Distance Highscores */}
        {tab === "characters" && (
          <div className="mt-4 space-y-2 pb-8">
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
        )}
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
