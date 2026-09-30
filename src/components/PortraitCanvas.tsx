import type { Character } from "@/lib/game-data";
import { getSkinPortraitPath } from "@/lib/skin-assets";

export function PortraitCanvas({
  character,
  size = 96,
  variant = 0,
  skinId,
  className = "",
}: {
  character: Character;
  size?: number;
  variant?: number;
  skinId?: string;
  className?: string;
}) {
  const activeSkinId = skinId ?? character.skins[variant]?.id ?? "base";

  return (
    <img
      src={getSkinPortraitPath(character.id, activeSkinId)}
      alt={character.name}
      className={`pixelated block select-none pointer-events-none transition-transform duration-300 ${className}`}
      draggable={false}
      loading="eager"
      decoding="sync"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.55))",
      }}
    />
  );
}
