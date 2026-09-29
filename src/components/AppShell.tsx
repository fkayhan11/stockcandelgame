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
    <div className="app-frame relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col overflow-x-hidden bg-background">
      {!hideHeader && (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/6 bg-background/90 px-5 pb-3.5 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="brand-mark grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
              <span className="font-mono text-xs font-black tracking-wider text-white">BJ</span>
            </div>
            <div>
              <div className="font-display text-base font-bold leading-none tracking-tight text-foreground">
                BLOCK JUMPER
              </div>
              <div className="mt-1 font-mono text-[10px] font-semibold text-primary">
                CANLI PİYASA RUNNER
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="glass-low grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-all hover:text-foreground active:scale-95"
              title={muted ? "Sesi Aç" : "Sesi Kapat"}
              aria-label="Ses kontrolü"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
            </button>

            <div className="wallet-pill glass-low flex items-center gap-2.5 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/20 font-mono text-[9px] font-bold text-emerald-400">
                  $
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {dollars.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500/20 font-mono text-[9px] font-bold text-amber-400">
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

      <main className="relative z-10 flex-1 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),14px)]">
        <div className="bottom-tabs mx-auto flex h-[68px] items-center justify-around rounded-2xl px-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => haptic.light()}
                className={
                  "bottom-tab flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 font-medium transition-all " +
                  (active
                    ? "bottom-tab-active bg-primary text-white font-semibold"
                    : "text-muted-foreground hover:text-foreground active:scale-95")
                }
              >
                <Icon
                  className="h-4 w-4"
                  strokeWidth={active ? 2.5 : 2}
                  fill={active && it.label === "Oyna" ? "currentColor" : "none"}
                />
                <span className="text-[11px]">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
