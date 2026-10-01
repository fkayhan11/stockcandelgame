/**
 * Roster configuration for playable runner characters and skins.
 */
export type Character = {
  id: string;
  name: string;
  title: string;
  industry: string;
  bgGradient: string; // CSS gradient for portrait background
  emoji: string; // fallback pixel-art glyph
  hue: number;
  sprite: string;
  portrait: string;
  skins: { id: string; name: string; badge?: string; cost: number; bgGradient: string }[];
};

export const CHARACTERS: Character[] = [
  {
    id: "elanus",
    name: "ALEXANDER VANCE",
    title: "Senior Macro & FX Lead",
    industry: "Global Macro Hedge Fund",
    bgGradient: "radial-gradient(circle at 30% 30%, #10b981 0%, #064e3b 50%, #070a12 100%)",
    emoji: "📈",
    hue: 155,
    sprite: "/characters/char-0.png",
    portrait: "/characters/portrait-0.png",
    skins: [
      {
        id: "base",
        name: "Bespoke Navy Pinstripe",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #10b981, #064e3b, #070a12)",
      },
      {
        id: "volt",
        name: "London Trading Floor",
        cost: 1200,
        bgGradient: "radial-gradient(circle at 30% 30%, #38bdf8, #0c4a6e, #070a12)",
      },
      {
        id: "mars",
        name: "Tokyo Session Executive",
        cost: 2400,
        bgGradient: "radial-gradient(circle at 30% 30%, #f59e0b, #78350f, #070a12)",
      },
      {
        id: "neural",
        name: "Zurich Private Banker",
        cost: 4800,
        bgGradient: "radial-gradient(circle at 30% 30%, #6366f1, #1e1b4b, #070a12)",
      },
    ],
  },
  {
    id: "jeffrus",
    name: "SARAH JENNINGS",
    title: "Quantitative Volatility Architect",
    industry: "Algorithmic Arbitrage & HFT",
    bgGradient: "radial-gradient(circle at 30% 30%, #38bdf8 0%, #0c4a6e 50%, #070a12 100%)",
    emoji: "⚡",
    hue: 195,
    sprite: "/characters/char-1.png",
    portrait: "/characters/portrait-1.png",
    skins: [
      {
        id: "base",
        name: "Savile Row Charcoal",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #38bdf8, #0c4a6e, #070a12)",
      },
      {
        id: "blue",
        name: "Chicago Merc Specialist",
        cost: 1500,
        bgGradient: "radial-gradient(circle at 30% 30%, #0284c7, #082f49, #070a12)",
      },
      {
        id: "press",
        name: "Executive Boardroom",
        cost: 3000,
        bgGradient: "radial-gradient(circle at 30% 30%, #94a3b8, #334155, #070a12)",
      },
      {
        id: "yacht",
        name: "Monaco Alpha Suite",
        cost: 6000,
        bgGradient: "radial-gradient(circle at 30% 30%, #2dd4bf, #134e4a, #070a12)",
      },
    ],
  },
  {
    id: "markus",
    name: "MARCUS CHEN",
    title: "Head of Derivatives & Swaps",
    industry: "Options & Synthetic Alpha",
    bgGradient: "radial-gradient(circle at 30% 30%, #6366f1 0%, #1e1b4b 50%, #070a12 100%)",
    emoji: "📊",
    hue: 235,
    sprite: "/characters/char-2.png",
    portrait: "/characters/portrait-2.png",
    skins: [
      {
        id: "base",
        name: "Terminal Dark Blazer",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #6366f1, #1e1b4b, #070a12)",
      },
      {
        id: "vr",
        name: "Synthetic Gamma Suite",
        cost: 1800,
        bgGradient: "radial-gradient(circle at 30% 30%, #8b5cf6, #3b0764, #070a12)",
      },
      {
        id: "toga",
        name: "Mayfair Private Office",
        cost: 3500,
        bgGradient: "radial-gradient(circle at 30% 30%, #eab308, #713f12, #070a12)",
      },
      {
        id: "mma",
        name: "HFT Speedrun Tuxedo",
        cost: 7000,
        bgGradient: "radial-gradient(circle at 30% 30%, #f43f5e, #881337, #070a12)",
      },
    ],
  },
  {
    id: "billimus",
    name: "WILLIAM STERLING",
    title: "Chief Investment Officer (CIO)",
    industry: "Tech Equity & Semis Desk",
    bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6 0%, #134e4a 50%, #070a12 100%)",
    emoji: "💻",
    hue: 175,
    sprite: "/characters/char-3.png",
    portrait: "/characters/portrait-3.png",
    skins: [
      {
        id: "base",
        name: "Oxford Tailored Wool",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6, #134e4a, #070a12)",
      },
      {
        id: "philanthrop",
        name: "Sovereign Wealth Director",
        cost: 1600,
        bgGradient: "radial-gradient(circle at 30% 30%, #10b981, #064e3b, #070a12)",
      },
      {
        id: "vaccine",
        name: "Biotech Equity Analyst",
        cost: 3200,
        bgGradient: "radial-gradient(circle at 30% 30%, #64748b, #1e293b, #070a12)",
      },
      {
        id: "windows",
        name: "Silicon Core Venture",
        cost: 6400,
        bgGradient: "radial-gradient(circle at 30% 30%, #0ea5e9, #0369a1, #070a12)",
      },
    ],
  },
  {
    id: "warrus",
    name: "VICTORIA STONE",
    title: "Deep Value & Special Situations",
    industry: "Long/Short Equity & M&A",
    bgGradient: "radial-gradient(circle at 30% 30%, #f59e0b 0%, #78350f 50%, #070a12 100%)",
    emoji: "🏛️",
    hue: 42,
    sprite: "/characters/char-5.png",
    portrait: "/characters/portrait-5.png",
    skins: [
      {
        id: "base",
        name: "Heritage Tweed Classic",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #f59e0b, #78350f, #070a12)",
      },
      {
        id: "cola",
        name: "Compound Interest Icon",
        cost: 1400,
        bgGradient: "radial-gradient(circle at 30% 30%, #ef4444, #7f1d1d, #070a12)",
      },
      {
        id: "berkshire",
        name: "Chairman's Reserve",
        cost: 2800,
        bgGradient: "radial-gradient(circle at 30% 30%, #10b981, #064e3b, #070a12)",
      },
      {
        id: "buffet",
        name: "Wall Street Gala",
        cost: 5600,
        bgGradient: "radial-gradient(circle at 30% 30%, #cbd5e1, #334155, #070a12)",
      },
    ],
  },
  {
    id: "oprahus",
    name: "OPHELIA CROSS",
    title: "Managing Director of Institutional Sales",
    industry: "Global Capital Markets",
    bgGradient: "radial-gradient(circle at 30% 30%, #a855f7 0%, #581c87 50%, #070a12 100%)",
    emoji: "💎",
    hue: 280,
    sprite: "/characters/char-4.png",
    portrait: "/characters/portrait-4.png",
    skins: [
      {
        id: "base",
        name: "Haute Couture Finance",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #a855f7, #581c87, #070a12)",
      },
      {
        id: "book",
        name: "Investor Relations Lead",
        cost: 1300,
        bgGradient: "radial-gradient(circle at 30% 30%, #f97316, #7c2d12, #070a12)",
      },
      {
        id: "talk",
        name: "Global Economic Forum",
        cost: 2600,
        bgGradient: "radial-gradient(circle at 30% 30%, #eab308, #713f12, #070a12)",
      },
      {
        id: "mogul",
        name: "Capital Syndicate Partner",
        cost: 5200,
        bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6, #134e4a, #070a12)",
      },
    ],
  },
  {
    id: "markust",
    name: "JULIAN DUPONT",
    title: "Luxury Equity & Consumer Discretionary",
    industry: "Parisian Capital Partners",
    bgGradient: "radial-gradient(circle at 30% 30%, #e11d48 0%, #4c0519 50%, #070a12 100%)",
    emoji: "✨",
    hue: 345,
    sprite: "/characters/char-6.png",
    portrait: "/characters/portrait-6.png",
    skins: [
      {
        id: "base",
        name: "Place Vendôme Cut",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #e11d48, #4c0519, #070a12)",
      },
      {
        id: "champ",
        name: "Vintage Reserve Club",
        cost: 1700,
        bgGradient: "radial-gradient(circle at 30% 30%, #eab308, #713f12, #070a12)",
      },
      {
        id: "vuit",
        name: "Global Prestige Portfolio",
        cost: 3400,
        bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6, #134e4a, #070a12)",
      },
      {
        id: "icon",
        name: "Milano Private Runway",
        cost: 6800,
        bgGradient: "radial-gradient(circle at 30% 30%, #a855f7, #581c87, #070a12)",
      },
    ],
  },
  {
    id: "larrus",
    name: "LAWRENCE VANE",
    title: "Enterprise Cloud & Infrastructure",
    industry: "Venture Buyout & Tech LBO",
    bgGradient: "radial-gradient(circle at 30% 30%, #0284c7 0%, #075985 50%, #070a12 100%)",
    emoji: "🌊",
    hue: 205,
    sprite: "/characters/char-7.png",
    portrait: "/characters/portrait-7.png",
    skins: [
      {
        id: "base",
        name: "Regatta Cashmere",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #0284c7, #075985, #070a12)",
      },
      {
        id: "yacht",
        name: "America's Cup Strategist",
        cost: 1500,
        bgGradient: "radial-gradient(circle at 30% 30%, #0ea5e9, #0369a1, #070a12)",
      },
      {
        id: "island",
        name: "Lanai Private Reserve",
        cost: 3000,
        bgGradient: "radial-gradient(circle at 30% 30%, #10b981, #064e3b, #070a12)",
      },
      {
        id: "samurai",
        name: "Silicon Shogun",
        cost: 6000,
        bgGradient: "radial-gradient(circle at 30% 30%, #f43f5e, #881337, #070a12)",
      },
    ],
  },
  {
    id: "stevus",
    name: "STEVEN ARDEN",
    title: "Industrial Hardware & System Architect",
    industry: "Hardware Alpha & Design Equity",
    bgGradient: "radial-gradient(circle at 30% 30%, #94a3b8 0%, #334155 50%, #070a12 100%)",
    emoji: "⚡",
    hue: 215,
    sprite: "/characters/char-8.png",
    portrait: "/characters/portrait-8.png",
    skins: [
      {
        id: "base",
        name: "Issey Minimalist Black",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #94a3b8, #334155, #070a12)",
      },
      {
        id: "keynote",
        name: "Cupertino Keynote Suit",
        cost: 1800,
        bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6, #134e4a, #070a12)",
      },
      {
        id: "vision",
        name: "Spatial Computing Apex",
        cost: 3600,
        bgGradient: "radial-gradient(circle at 30% 30%, #6366f1, #1e1b4b, #070a12)",
      },
      {
        id: "orchard",
        name: "Infinite Loop Executive",
        cost: 7200,
        bgGradient: "radial-gradient(circle at 30% 30%, #f59e0b, #78350f, #070a12)",
      },
    ],
  },
  {
    id: "cathrus",
    name: "ELENA ROSTOVA",
    title: "Disruptive Innovation & Growth Equity",
    industry: "Next-Gen Tech & Ark Funds",
    bgGradient: "radial-gradient(circle at 30% 30%, #f43f5e 0%, #881337 50%, #070a12 100%)",
    emoji: "🚀",
    hue: 350,
    sprite: "/characters/char-9.png",
    portrait: "/characters/portrait-9.png",
    skins: [
      {
        id: "base",
        name: "Modern FinTech Blazer",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #f43f5e, #881337, #070a12)",
      },
      {
        id: "studio",
        name: "Bloomberg Markets Anchor",
        cost: 1600,
        bgGradient: "radial-gradient(circle at 30% 30%, #a855f7, #581c87, #070a12)",
      },
      {
        id: "breaking",
        name: "Closing Bell Exclusive",
        cost: 3200,
        bgGradient: "radial-gradient(circle at 30% 30%, #eab308, #713f12, #070a12)",
      },
      {
        id: "anchor",
        name: "Institutional Keynote",
        cost: 6400,
        bgGradient: "radial-gradient(circle at 30% 30%, #14b8a6, #134e4a, #070a12)",
      },
    ],
  },
];

// Top global high-volume tickers (mock). Each holds seed and base price.
export type Ticker = { symbol: string; name: string; base: number; vol: number; seed: number };

const RAW_TICKERS: Omit<Ticker, "seed">[] = [
  { symbol: "AAPL", name: "Apple", base: 195, vol: 0.018 },
  { symbol: "MSFT", name: "Microsoft", base: 430, vol: 0.015 },
  { symbol: "NVDA", name: "Nvidia", base: 880, vol: 0.04 },
  { symbol: "GOOGL", name: "Alphabet", base: 175, vol: 0.02 },
  { symbol: "AMZN", name: "Amazon", base: 185, vol: 0.022 },
  { symbol: "META", name: "Meta", base: 495, vol: 0.025 },
  { symbol: "TSLA", name: "Tesla", base: 245, vol: 0.05 },
  { symbol: "BRK.B", name: "Berkshire", base: 420, vol: 0.012 },
  { symbol: "JPM", name: "JPMorgan", base: 205, vol: 0.018 },
  { symbol: "V", name: "Visa", base: 280, vol: 0.014 },
  { symbol: "WMT", name: "Walmart", base: 75, vol: 0.013 },
  { symbol: "XOM", name: "Exxon", base: 115, vol: 0.022 },
  { symbol: "UNH", name: "UnitedHealth", base: 510, vol: 0.02 },
  { symbol: "MA", name: "Mastercard", base: 460, vol: 0.014 },
  { symbol: "PG", name: "P&G", base: 165, vol: 0.012 },
  { symbol: "HD", name: "Home Depot", base: 345, vol: 0.018 },
  { symbol: "AVGO", name: "Broadcom", base: 1300, vol: 0.03 },
  { symbol: "LLY", name: "Eli Lilly", base: 790, vol: 0.025 },
  { symbol: "ORCL", name: "Oracle", base: 130, vol: 0.02 },
  { symbol: "COST", name: "Costco", base: 720, vol: 0.015 },
  { symbol: "BAC", name: "Bank of America", base: 38, vol: 0.022 },
  { symbol: "NFLX", name: "Netflix", base: 615, vol: 0.028 },
  { symbol: "AMD", name: "AMD", base: 165, vol: 0.04 },
  { symbol: "INTC", name: "Intel", base: 30, vol: 0.03 },
  { symbol: "DIS", name: "Disney", base: 105, vol: 0.022 },
  { symbol: "KO", name: "Coca-Cola", base: 62, vol: 0.012 },
  { symbol: "PEP", name: "Pepsi", base: 170, vol: 0.013 },
  { symbol: "CSCO", name: "Cisco", base: 50, vol: 0.015 },
  { symbol: "ABBV", name: "AbbVie", base: 180, vol: 0.018 },
  { symbol: "TMO", name: "Thermo Fisher", base: 580, vol: 0.018 },
  { symbol: "ADBE", name: "Adobe", base: 520, vol: 0.025 },
  { symbol: "CRM", name: "Salesforce", base: 270, vol: 0.025 },
  { symbol: "NKE", name: "Nike", base: 80, vol: 0.022 },
  { symbol: "MCD", name: "McDonald's", base: 270, vol: 0.013 },
  { symbol: "QCOM", name: "Qualcomm", base: 175, vol: 0.025 },
  { symbol: "TXN", name: "Texas Instr", base: 195, vol: 0.018 },
  { symbol: "PYPL", name: "PayPal", base: 70, vol: 0.025 },
  { symbol: "UBER", name: "Uber", base: 68, vol: 0.03 },
  { symbol: "SHOP", name: "Shopify", base: 95, vol: 0.035 },
  { symbol: "SQ", name: "Block", base: 75, vol: 0.035 },
  { symbol: "BABA", name: "Alibaba", base: 88, vol: 0.03 },
  { symbol: "TSM", name: "TSMC", base: 195, vol: 0.025 },
  { symbol: "SONY", name: "Sony", base: 90, vol: 0.02 },
  { symbol: "BA", name: "Boeing", base: 180, vol: 0.025 },
  { symbol: "CAT", name: "Caterpillar", base: 340, vol: 0.018 },
  { symbol: "GE", name: "GE", base: 165, vol: 0.02 },
  { symbol: "F", name: "Ford", base: 12, vol: 0.028 },
  { symbol: "GM", name: "GM", base: 48, vol: 0.025 },
  { symbol: "PLTR", name: "Palantir", base: 25, vol: 0.045 },
  { symbol: "SNOW", name: "Snowflake", base: 145, vol: 0.035 },
  { symbol: "ZM", name: "Zoom", base: 65, vol: 0.025 },
  // BIST 100 heavyweights
  { symbol: "THYAO", name: "Türk Hava Yolları", base: 280, vol: 0.03 },
  { symbol: "GARAN", name: "Garanti BBVA", base: 95, vol: 0.025 },
  { symbol: "AKBNK", name: "Akbank", base: 65, vol: 0.025 },
  { symbol: "ASELS", name: "Aselsan", base: 75, vol: 0.03 },
  { symbol: "EREGL", name: "Ereğli Demir", base: 50, vol: 0.025 },
  { symbol: "KCHOL", name: "Koç Holding", base: 175, vol: 0.022 },
  { symbol: "SAHOL", name: "Sabancı Holding", base: 88, vol: 0.022 },
  { symbol: "TUPRS", name: "Tüpraş", base: 160, vol: 0.025 },
  { symbol: "BIMAS", name: "BİM", base: 485, vol: 0.02 },
  { symbol: "SISE", name: "Şişecam", base: 42, vol: 0.025 },
];

// Daily seed so data changes once per day
function dailySeed() {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

export const TICKERS: Ticker[] = RAW_TICKERS.map((t, i) => ({
  ...t,
  seed: dailySeed() + i * 7919,
}));

// Seeded RNG (mulberry32)
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Candle = { o: number; h: number; l: number; c: number; t: number };
export type Timeframe = "1G" | "1H" | "1A" | "1Y";

export const TIMEFRAMES: Timeframe[] = ["1G", "1H", "1A", "1Y"];

export function generateCandles(ticker: Ticker, tf: Timeframe, count = 80): Candle[] {
  const r = rng(ticker.seed + hashTf(tf));
  const tfMult: Record<Timeframe, number> = {
    "1G": 1, // erratic, thin (1 day intra-hour)
    "1H": 0.6,
    "1A": 1.4,
    "1Y": 3.2,
  };
  const vol = ticker.vol * tfMult[tf];
  const candles: Candle[] = [];
  let price = ticker.base;
  let trend = (r() - 0.4) * 0.001;
  for (let i = 0; i < count; i++) {
    trend += (r() - 0.5) * 0.002;
    trend = Math.max(-0.01, Math.min(0.01, trend));
    const o = price;
    const change = (r() - 0.5) * vol * 2 + trend;
    const c = Math.max(0.5, o * (1 + change));
    const range = Math.abs(o - c) + o * vol * (0.4 + r() * 0.6);
    const h = Math.max(o, c) + range * r();
    const l = Math.min(o, c) - range * r();
    candles.push({ o, h, l: Math.max(0.1, l), c, t: i });
    price = c;
  }
  return candles;
}

function hashTf(tf: Timeframe) {
  return tf.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}
