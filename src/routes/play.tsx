import { createFileRoute, Link } from "@tanstack/react-router";
import { GameCanvas } from "@/components/GameCanvas";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Oyna — Block Jumper" },
      { name: "description", content: "Canlı borsa mumlarında zıpla, dolar topla, $COIN kazan." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const [muted, setMuted] = useState(() => sound.muted);

  const toggleSound = () => {
    haptic.light();
    const newMuted = sound.toggleMute();
    setMuted(newMuted);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background">
      <header className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2 border-b border-white/6">
        <Link
          to="/"
          onClick={() => {
            sound.click();
            haptic.light();
          }}
          className="glass-low grid h-9 w-9 place-items-center rounded-xl text-foreground hover:bg-white/10 active:scale-95 transition-all border border-white/8"
          aria-label="Geri dön"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="font-display text-sm font-bold tracking-wider text-white flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>BLOCK JUMPER</span>
        </div>

        <button
          onClick={toggleSound}
          className="glass-low grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-white active:scale-95 transition-all border border-white/8"
          title={muted ? "Sesi Aç" : "Sesi Kapat"}
          aria-label="Ses kontrolü"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
        </button>
      </header>
      <GameCanvas />
    </div>
  );
}
