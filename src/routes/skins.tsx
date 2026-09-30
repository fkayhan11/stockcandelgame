import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CHARACTERS } from "@/lib/game-data";
import { PortraitCanvas } from "@/components/PortraitCanvas";
import { useGameStore } from "@/lib/store";
import { Check, Lock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getSkinPortraitPath, getSkinSpritePath } from "@/lib/skin-assets";
import { preloadImages } from "@/lib/preload-images";
import { sound } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/skins")({
  head: () => ({
    meta: [
      { title: "Kostümler — Block Jumper" },
      { name: "description", content: "Kahramanını ve piyasa kostümünü seç." },
    ],
  }),
  component: SkinsPage,
});

function SkinsPage() {
  const selectedChar = useGameStore((s) => s.selectedCharacter);
  const selectCharacter = useGameStore((s) => s.selectCharacter);

  useEffect(() => {
    const assets = CHARACTERS.flatMap((character) =>
      character.skins.flatMap((skin) => [
        getSkinPortraitPath(character.id, skin.id),
        getSkinSpritePath(character.id, skin.id),
      ]),
    );
    preloadImages(assets);
  }, []);

  return (
    <AppShell>
      <div className="px-5 pt-4">
        <h1 className="font-display text-2xl font-bold text-white">Kahramanını Seç</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Piyasa koşusunda kullanacağın portföy liderini seç
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3.5 pb-4">
          {CHARACTERS.map((c) => (
            <CharacterCard
              key={c.id}
              charId={c.id}
              isSelected={selectedChar === c.id}
              onSelect={() => {
                sound.click();
                haptic.light();
                selectCharacter(c.id);
              }}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function CharacterCard({
  charId,
  isSelected,
  onSelect,
}: {
  charId: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const character = CHARACTERS.find((c) => c.id === charId)!;
  const owned = useGameStore((s) => s.ownedSkins[charId] || ["base"]);
  const selectedSkinId = useGameStore((s) => s.selectedSkins[charId] || "base");
  const coin = useGameStore((s) => s.coin);
  const buySkin = useGameStore((s) => s.buySkin);
  const selectSkin = useGameStore((s) => s.selectSkin);
  const swipeStartX = useRef<number | null>(null);

  const [idx, setIdx] = useState(() => {
    const i = character.skins.findIndex((s) => s.id === selectedSkinId);
    return i >= 0 ? i : 0;
  });
  const skin = character.skins[idx];
  const isOwned = owned.includes(skin.id);
  const canBuy = coin >= skin.cost;
  const rarityLabel = getRarityLabel(idx);
  const seriesLabel = skin.badge ?? `${character.industry} Serisi`;

  const handleAction = () => {
    onSelect();
    if (isOwned) {
      sound.click();
      haptic.light();
      selectSkin(charId, skin.id);
    } else {
      if (buySkin(charId, skin.id, skin.cost)) {
        sound.gold();
        haptic.success();
        selectSkin(charId, skin.id);
      } else {
        sound.bearWarning();
        haptic.warning();
      }
    }
  };

  const shiftSkin = (direction: -1 | 1) => {
    sound.click();
    haptic.light();
    setIdx((i) => (i + direction + character.skins.length) % character.skins.length);
  };

  const finishSwipe = (x: number) => {
    if (swipeStartX.current == null) return;
    const delta = x - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) < 28) return;
    shiftSkin(delta < 0 ? 1 : -1);
  };

  return (
    <div
      className={
        "character-card glass-low relative overflow-hidden rounded-2xl p-3.5 transition-all border " +
        (isSelected
          ? "border-emerald-500/80 bg-emerald-500/5 shadow-lg"
          : "border-white/8 hover:border-white/16")
      }
    >
      {isSelected && (
        <div className="absolute right-2.5 top-2.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      )}

      <div
        className="portrait-stage relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-white/10 shadow-inner"
        onPointerDown={(event) => {
          swipeStartX.current = event.clientX;
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
        onPointerUp={(event) => finishSwipe(event.clientX)}
        style={{ background: skin.bgGradient }}
      >
        <div className="portrait-crop relative grid h-[120px] w-[120px] place-items-center overflow-hidden">
          <PortraitCanvas character={character} size={120} variant={idx} skinId={skin.id} />
        </div>
        {!isOwned && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-[2px]">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-black/40 text-white/90">
              <Lock className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <button
          onClick={() => shiftSkin(-1)}
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-white active:scale-95"
          aria-label="Önceki"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1">
          {character.skins.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 w-1.5 rounded-full transition-all " +
                (i === idx ? "bg-emerald-400 w-3" : "bg-white/20")
              }
            />
          ))}
        </div>
        <button
          onClick={() => shiftSkin(1)}
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-white active:scale-95"
          aria-label="Sonraki"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1.5 text-center">
        <div
          className={
            "font-display text-sm font-bold " + (isSelected ? "text-emerald-400" : "text-white")
          }
        >
          {character.name}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">{skin.name}</div>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-300">
            {seriesLabel}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-emerald-400">
            {rarityLabel}
          </span>
        </div>
        {!isOwned ? (
          <div className="mt-2 font-mono text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> {skin.cost.toLocaleString("tr-TR")} $COIN
          </div>
        ) : (
          <div className="mt-2 font-mono text-[10px] font-bold text-emerald-400">
            {isSelected ? "AKTİF KOSTÜM" : "SAHİP"}
          </div>
        )}
      </div>

      <button
        onClick={handleAction}
        disabled={!isOwned && coin < skin.cost}
        className={
          "mt-2.5 w-full rounded-xl py-2 font-mono text-xs font-bold transition-all " +
          (isOwned
            ? "bg-primary text-white shadow-md active:scale-95 cursor-pointer"
            : canBuy
              ? "bg-amber-500 text-slate-950 shadow-md active:scale-95 cursor-pointer font-bold"
              : "bg-slate-800/40 text-slate-500 cursor-not-allowed border border-white/5")
        }
      >
        {isOwned ? "SEÇ" : canBuy ? "SATIN AL" : "KİLİTLİ"}
      </button>
    </div>
  );
}

function getRarityLabel(idx: number) {
  if (idx === 0) return "Standart";
  if (idx === 1) return "Nadir";
  if (idx === 2) return "Prestij";
  return "Efsanevi";
}
