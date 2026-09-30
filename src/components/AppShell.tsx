import { Link, useRouterState } from "@tanstack/react-router";
import { Play, UserRound, BarChart3, TrendingUp, Volume2, VolumeX } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useGameStore } from "@/lib/store";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

const items = [
  { to: "/", label: "Oyna", icon: Play },
  { to: "/skins", label: "Kostümler", icon: UserRound },
  { to: "/stats", label: "İstatistikler", icon: BarChart3 },
  { to: "/market", label: "Borsa", icon: TrendingUp },
] as const;

export function AppShell({
  children,
  hideHeader = false,
}: {
  children: ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const coin = useGameStore((s) => s.coin);
  const dollars = useGameStore((s) => s.dollars);
  const [muted, setMuted] = useState(() => sound.muted);

  const toggleSound = () => {
    haptic.light();
    const newMuted = sound.toggleMute();
    setMuted(newMuted);
  };

  return (
    <div className="app-frame relative mx-auto flex min-h-dvh w-full max-w-[500px] flex-col overflow-x-hidden bg-background">
      {!hideHeader && (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/[0.07] bg-background/85 px-4.5 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            {/* Bespoke Candlestick Brand Icon */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-sm">
              <div className="flex items-end gap-1">
                <div className="w-1.5 h-3.5 rounded-sm bg-rose-500/80" />
                <div className="w-1.5 h-5 rounded-sm bg-emerald-400 shadow-sm" />
                <div className="w-1.5 h-2.5 rounded-sm bg-emerald-500/60" />
              </div>
            </div>
            <div>
              <div className="font-display text-sm font-black tracking-tight text-white">
                BLOCK JUMPER
              </div>
              <div className="font-mono text-[9px] font-semibold text-emerald-400/90 tracking-wider">
                CANLI MUM RUNNER
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="glass-low grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition-all hover:text-white active:scale-95 border border-white/8"
              title={muted ? "Sesi Aç" : "Sesi Kapat"}
              aria-label="Ses kontrolü"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>

            <div className="wallet-pill glass-low flex items-center gap-2 rounded-xl px-2.5 py-1.5 border border-white/8">
              <div className="flex items-center gap-1.5">
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500/20 font-mono text-[8px] font-black text-emerald-400">
                  $
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {dollars.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-amber-500/20 font-mono text-[8px] font-black text-amber-400">
                  C
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {coin.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[500px] px-3 pb-[max(env(safe-area-inset-bottom),12px)] pointer-events-none">
        <div className="bottom-tabs pointer-events-auto mx-auto flex h-[62px] items-center justify-around rounded-2xl px-1.5 border border-white/[0.08] shadow-2xl backdrop-blur-2xl bg-[#0c1220]/90">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => haptic.light()}
                className={
                  "bottom-tab flex min-w-[62px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 font-medium transition-all " +
                  (active
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white active:scale-95")
                }
              >
                <Icon
                  className="h-4 w-4"
                  strokeWidth={active ? 2.5 : 2}
                  fill={active && it.label === "Oyna" ? "currentColor" : "none"}
                />
                <span className="text-[10px] font-mono tracking-tight">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
