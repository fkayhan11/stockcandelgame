import type { Character } from "@/lib/game-data";
import { getSkinPortraitPath } from "@/lib/skin-assets";

export function PortraitCanvas({
  character,
  size = 96,
  variant = 0,
  skinId,
}: {
  character: Character;
  size?: number;
  variant?: number;
  skinId?: string;
}) {
  const activeSkinId = skinId ?? character.skins[variant]?.id ?? "base";

  return (
    <img
      src={getSkinPortraitPath(character.id, activeSkinId)}
      alt={character.name}
      className="pixelated block select-none"
      draggable={false}
      loading="eager"
      decoding="sync"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}
