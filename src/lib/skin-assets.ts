import type { Character } from "@/lib/game-data";

export function getSkinSpritePath(characterId: string, skinId: string) {
  const fileKey = skinId === "volt" ? "volt" : skinId;
  return `/characters/skins/${characterId}-${fileKey}.png`;
}

export function getSkinPortraitPath(characterId: string, skinId: string) {
  const fileKey = skinId === "volt" ? "volt" : skinId;
  return `/characters/portraits/${characterId}-${fileKey}.png`;
}

export function getCharacterSkin(character: Character, skinId: string) {
  return character.skins.find((skin) => skin.id === skinId) ?? character.skins[0];
}
