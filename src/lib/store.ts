import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CHARACTERS } from "./game-data";
import { secureStorage, validateRunReward, clampSafeInteger } from "./security";

export type DailySpeedrunRecord = {
  rank: number;
  runnerName: string;
  charName: string;
  timeMs: number;
  symbol: string;
  isPlayer?: boolean;
};

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
  dailyLeaderboardDate: string;
  dailyPlayerBestMs: number | null;
  dailyLeaderboard: DailySpeedrunRecord[];
  addDollars: (n: number) => void;
  addCoin: (n: number) => void;
  claimMission: (id: string, rewardCoins: number) => boolean;
  exchange: (dollars: number) => void;
  selectCharacter: (id: string) => void;
  selectSkin: (charId: string, skinId: string) => void;
  buySkin: (charId: string, skinId: string, cost: number) => boolean;
  recordRun: (distance: number, charId: string, dollarsEarned: number) => void;
  recordSpeedrun: (
    timeMs: number,
    symbol: string,
    charId: string,
  ) => { rank: number; isNewBest: boolean; leaderboard: DailySpeedrunRecord[] };
  getTodayLeaderboard: () => DailySpeedrunRecord[];
};

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateDailySeed(dateStr: string): DailySpeedrunRecord[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const BOT_RUNNERS = [
    { runner: "BistBoğası", char: "Gökhan 'Elanus' Varlı", baseMs: 64200 },
    { runner: "KriptoBalina", char: "Kaan 'Cyber' Kripto", baseMs: 68500 },
    { runner: "ScalpUstadı", char: "Ali 'Algos' Demir", baseMs: 72900 },
    { runner: "DeepValue", char: "Selim 'DeFi' Kaya", baseMs: 78400 },
    { runner: "TrendFollower", char: "Can 'Matrix' Yıldız", baseMs: 83100 },
    { runner: "HODLKralı", char: "Gökhan 'Elanus' Varlı", baseMs: 88700 },
    { runner: "AltcoinAvcısı", char: "Kaan 'Cyber' Kripto", baseMs: 94200 },
    { runner: "MumBükücü", char: "Ali 'Algos' Demir", baseMs: 102500 },
  ];

  return BOT_RUNNERS.map((bot, index) => {
    const variance = ((absHash + index * 179) % 3600) - 1800;
    return {
      rank: index + 1,
      runnerName: bot.runner,
      charName: bot.char,
      timeMs: bot.baseMs + variance,
      symbol: ["THYAO", "BTCUSDT", "EREGL", "ETHUSDT", "GARAN", "SOLUSDT"][(absHash + index) % 6],
      isPlayer: false,
    };
  });
}

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
      dailyLeaderboardDate: getTodayDateString(),
      dailyPlayerBestMs: null,
      dailyLeaderboard: generateDailySeed(getTodayDateString()),

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

      getTodayLeaderboard: () => {
        const todayStr = getTodayDateString();
        const s = get();
        if (s.dailyLeaderboardDate !== todayStr) {
          const freshBots = generateDailySeed(todayStr);
          set({
            dailyLeaderboardDate: todayStr,
            dailyPlayerBestMs: null,
            dailyLeaderboard: freshBots,
          });
          return freshBots;
        }
        return s.dailyLeaderboard;
      },

      recordSpeedrun: (timeMs, symbol, charId) => {
        const safeTime = clampSafeInteger(timeMs, 10_000, 3_600_000);
        const todayStr = getTodayDateString();
        const s = get();
        let currentBots = s.dailyLeaderboard;

        if (s.dailyLeaderboardDate !== todayStr) {
          currentBots = generateDailySeed(todayStr);
        }

        const isNewBest = s.dailyPlayerBestMs === null || safeTime < s.dailyPlayerBestMs;
        const bestTime = isNewBest || s.dailyPlayerBestMs === null ? safeTime : s.dailyPlayerBestMs;
        const charObj = CHARACTERS.find((c) => c.id === charId);
        const charName = charObj ? charObj.name : "Gökhan 'Elanus' Varlı";

        // Keep bots, remove previous player entry if any
        const filteredBots = currentBots.filter((e) => !e.isPlayer);
        const playerEntry: DailySpeedrunRecord = {
          rank: 0,
          runnerName: "Sen (Oyuncu)",
          charName,
          timeMs: bestTime,
          symbol,
          isPlayer: true,
        };

        const combined = [...filteredBots, playerEntry].sort((a, b) => a.timeMs - b.timeMs);
        const ranked: DailySpeedrunRecord[] = combined.map((entry, idx) => ({
          ...entry,
          rank: idx + 1,
        }));

        set({
          dailyLeaderboardDate: todayStr,
          dailyPlayerBestMs: bestTime,
          dailyLeaderboard: ranked,
        });

        const playerRank = ranked.find((e) => e.isPlayer)?.rank ?? ranked.length;
        return { rank: playerRank, isNewBest, leaderboard: ranked };
      },
    }),
    {
      name: "bj_profile_v2",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
