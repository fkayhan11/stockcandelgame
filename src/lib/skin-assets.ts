import type { Character } from "@/lib/game-data";

export function getSkinSpritePath(characterId: string, skinId: string) {
  return `/characters/skins/${characterId}-${skinId}.png`;
}

export function getSkinPortraitPath(characterId: string, skinId: string) {
  return `/characters/portraits/${characterId}-${skinId}.png`;
}

export function getCharacterSkin(character: Character, skinId: string) {
  return character.skins.find((skin) => skin.id === skinId) ?? character.skins[0];
}
