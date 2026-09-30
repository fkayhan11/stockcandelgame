import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CHARACTERS } from "./game-data";
import { secureStorage, validateRunReward, clampSafeInteger } from "./security";

type State = {
  dollars: number; // raw dollars collected in runs
  coin: number; // $COIN currency (100 dollars = 1 coin)
  highScore: number;
  totalWealth: number;
  characterRecords: Record<string, number>;
  selectedCharacter: string;
  selectedSkins: Record<string, string>; // characterId -> skinId
  ownedSkins: Record<string, string[]>; // characterId -> [skinIds]
  claimedMissions: string[];
  addDollars: (n: number) => void;
  addCoin: (n: number) => void;
  claimMission: (id: string, rewardCoins: number) => boolean;
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
      claimedMissions: [],

      addDollars: (n) => {
        const safeN = clampSafeInteger(n, 0, 500_000);
        if (safeN <= 0) return;
        set((s) => ({ dollars: clampSafeInteger(s.dollars + safeN, 0, 1_000_000_000) }));
      },

      addCoin: (n) => {
        const safeN = clampSafeInteger(n, 0, 100_000);
        if (safeN <= 0) return;
        set((s) => ({ coin: clampSafeInteger(s.coin + safeN, 0, 1_000_000_000) }));
      },

      claimMission: (id, rewardCoins) => {
        const s = get();
        if (s.claimedMissions.includes(id)) return false;
        const safeReward = clampSafeInteger(rewardCoins, 1, 10_000);
        set({
          claimedMissions: [...s.claimedMissions, id],
          coin: clampSafeInteger(s.coin + safeReward, 0, 1_000_000_000),
        });
        return true;
      },

      exchange: (dollars) => {
        set((s) => {
          const safeAmt = clampSafeInteger(dollars, 0, s.dollars);
          const coins = Math.floor(safeAmt / 100);
          const used = coins * 100;
          return {
            dollars: Math.max(0, s.dollars - used),
            coin: clampSafeInteger(s.coin + coins, 0, 1_000_000_000),
          };
        });
      },

      selectCharacter: (id) => {
        if (!CHARACTERS.some((c) => c.id === id)) return;
        set({ selectedCharacter: id });
      },

      selectSkin: (charId, skinId) => {
        const owned = get().ownedSkins[charId] || [];
        if (!owned.includes(skinId)) return;
        set((s) => ({ selectedSkins: { ...s.selectedSkins, [charId]: skinId } }));
      },

      buySkin: (charId, skinId, cost) => {
        const s = get();
        const safeCost = clampSafeInteger(cost, 0, 1_000_000);
        if (s.coin < safeCost) return false;

        const owned = s.ownedSkins[charId] || [];
        if (owned.includes(skinId)) return true;

        set({
          coin: Math.max(0, s.coin - safeCost),
          ownedSkins: { ...s.ownedSkins, [charId]: [...owned, skinId] },
        });
        return true;
      },

      recordRun: (distance, charId, dollarsEarned) => {
        const safeDist = clampSafeInteger(distance, 0, 100_000);
        const safeEarned = clampSafeInteger(dollarsEarned, 0, 10_000_000);

        // Anti-cheat verification
        if (!validateRunReward(safeDist, safeEarned)) {
          return;
        }

        set((s) => ({
          highScore: Math.max(s.highScore, safeDist),
          totalWealth: clampSafeInteger(s.totalWealth + safeEarned, 0, 2_000_000_000),
          characterRecords: {
            ...s.characterRecords,
            [charId]: Math.max(s.characterRecords[charId] || 0, safeDist),
          },
        }));
      },
    }),
    {
      name: "bj_profile_v2",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
