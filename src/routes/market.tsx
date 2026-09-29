import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGameStore } from "@/lib/store";
import { ArrowRight, Sparkles, TrendingUp, DollarSign, Coins } from "lucide-react";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Döviz Bürosu — Block Jumper" },
      { name: "description", content: "Toplanan dolarları $COIN'e dönüştür." },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const dollars = useGameStore((s) => s.dollars);
  const coin = useGameStore((s) => s.coin);
  const exchange = useGameStore((s) => s.exchange);

  const [amount, setAmount] = useState("");
  const [flash, setFlash] = useState(false);

  const amt = Math.max(0, Math.min(dollars, Math.floor(Number(amount) || 0)));
  const coins = Math.floor(amt / 100);

  const onExchange = () => {
    if (coins <= 0) return;
    sound.gold();
    haptic.success();
    exchange(amt);
    setAmount("");
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  };

  const quickFill = (pct: number) => {
    sound.click();
    haptic.light();
    const v = Math.floor((dollars * pct) / 100 / 100) * 100;
    setAmount(String(v));
  };

  return (
    <AppShell>
      <div className="px-5 pt-4">
        <h1 className="font-display text-2xl font-bold text-white">Döviz Bürosu</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          100 DOLAR = 1 $COIN · KOSTÜM KİLİTLERİNİ AÇ
        </p>

        {/* Balances */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="glass-low rounded-2xl p-4 border border-white/8">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> CÜZDAN (DOLAR)
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-white">
              ${dollars.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="glass-low rounded-2xl p-4 border border-white/8">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-400" /> BİRİKİM ($COIN)
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
              {coin.toLocaleString("tr-TR")}
            </div>
          </div>
        </div>

        {/* Exchange card */}
        <div
          className={
            "glass relative mt-4 overflow-hidden rounded-2xl p-5 border border-white/8 transition-all shadow-xl " +
            (flash ? "ring-2 ring-emerald-500/50 bg-emerald-500/10" : "")
          }
        >
          <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            DÖNÜŞTÜRÜLECEK DOLAR MİKTARI
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-3 focus-within:border-emerald-500 transition-colors">
            <span className="font-mono text-lg font-bold text-emerald-400">$</span>
            <input
              inputMode="numeric"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-mono text-xl font-bold text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => quickFill(p)}
                className="rounded-xl bg-slate-800/60 py-2 font-mono text-xs font-bold text-muted-foreground hover:text-white hover:bg-slate-700/60 active:scale-95 transition-all border border-white/6"
              >
                %{p}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900/40 p-3.5 border border-white/6">
            <div className="font-mono text-xs text-muted-foreground">HESABINA GEÇECEK</div>
            <div className="flex items-center gap-1.5 font-mono text-lg font-bold text-amber-400">
              <Sparkles className="h-4 w-4" /> {coins.toLocaleString("tr-TR")} $COIN
            </div>
          </div>

          <button
            onClick={onExchange}
            disabled={coins <= 0}
            className={
              "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display text-sm font-bold shadow-lg transition-all " +
              (coins > 0
                ? "primary-cta bg-primary text-white active:scale-95 cursor-pointer"
                : "bg-slate-800/40 text-slate-500 cursor-not-allowed border border-white/5")
            }
          >
            <span>DÖNÜŞTÜRÜ GAYRİMENKUL & KOSTÜME AKTAR</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Live Market Rates */}
        <div className="glass-low mt-4 overflow-hidden rounded-2xl border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> CANLI OYUN İÇİ KUR
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/6 text-center font-mono text-xs">
            <Cell label="DOLAR/COIN" value="100 : 1" trend="neutral" />
            <Cell label="ALTIN SİKKE" value="+$50" trend="up" />
            <Cell label="BOĞA CARPANI" value="x3.0 Max" trend="up" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Cell({ label, value, trend }: { label: string; value: string; trend: "up" | "down" | "neutral" }) {
  return (
    <div className="p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 font-bold " +
          (trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-amber-400")
        }
      >
        {value}
      </div>
    </div>
  );
}
