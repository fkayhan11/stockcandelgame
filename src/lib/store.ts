import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CHARACTERS } from "./game-data";

type State = {
  dollars: number; // raw dollars collected
  coin: number; // $COIN currency (100 dollars = 1 coin)
  highScore: number;
  totalWealth: number;
  characterRecords: Record<string, number>;
  selectedCharacter: string;
  selectedSkins: Record<string, string>; // characterId -> skinId
  ownedSkins: Record<string, string[]>; // characterId -> [skinIds]
  addDollars: (n: number) => void;
  exchange: (dollars: number) => void;
  selectCharacter: (id: string) => void;
  selectSkin: (charId: string, skinId: string) => void;
  buySkin: (charId: string, skinId: string, cost: number) => boolean;
  recordRun: (distance: number, charId: string, dollarsEarned: number) => void;
};

const initialOwned: Record<string, string[]> = {};
const initialSkins: Record<string, string> = {};
CHARACTERS.forEach((c) => {
  initialOwned[c.id] = ["base"];
  initialSkins[c.id] = "base";
});

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      dollars: 0,
      coin: 5000,
      highScore: 0,
      totalWealth: 0,
      characterRecords: {},
      selectedCharacter: "elanus",
      selectedSkins: initialSkins,
      ownedSkins: initialOwned,
      addDollars: (n) => set((s) => ({ dollars: s.dollars + n })),
      exchange: (dollars) =>
        set((s) => {
          const amt = Math.min(s.dollars, Math.max(0, Math.floor(dollars)));
          const coins = Math.floor(amt / 100);
          const used = coins * 100;
          return { dollars: s.dollars - used, coin: s.coin + coins };
        }),
      selectCharacter: (id) => set({ selectedCharacter: id }),
      selectSkin: (charId, skinId) =>
        set((s) => ({ selectedSkins: { ...s.selectedSkins, [charId]: skinId } })),
      buySkin: (charId, skinId, cost) => {
        const s = get();
        if (s.coin < cost) return false;
        const owned = s.ownedSkins[charId] || [];
        if (owned.includes(skinId)) return true;
        set({
          coin: s.coin - cost,
          ownedSkins: { ...s.ownedSkins, [charId]: [...owned, skinId] },
        });
        return true;
      },
      recordRun: (distance, charId, dollarsEarned) =>
        set((s) => ({
          highScore: Math.max(s.highScore, distance),
          totalWealth: s.totalWealth + dollarsEarned,
          characterRecords: {
            ...s.characterRecords,
            [charId]: Math.max(s.characterRecords[charId] || 0, distance),
          },
        })),
    }),
    { name: "block-jumper-store-v1" },
  ),
);
