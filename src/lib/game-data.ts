// Characters: parody names of real billionaires using "-us" etc. NO "-ium" suffix.
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
    name: "ELANUS",
    title: "Mars Lordu",
    industry: "Roket & Elektrik",
    bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e 0%, #7a1a3c 45%, #0f131e 100%)",
    emoji: "🚀",
    hue: 350,
    sprite: "/characters/char-0.png",
    portrait: "/characters/portrait-0.png",
    skins: [
      {
        id: "base",
        name: "Uzay Yolcusu",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e, #7a1a3c, #0f131e)",
      },
      {
        id: "tesla",
        name: "Volt Sürücü",
        cost: 1200,
        bgGradient: "radial-gradient(circle at 30% 30%, #b51bff, #2b0a6b, #0f131e)",
      },
      {
        id: "mars",
        name: "Kızıl Vali",
        cost: 2400,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff8a3d, #5a1a00, #0f131e)",
      },
      {
        id: "neural",
        name: "Sinir Bağı",
        cost: 4800,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
    ],
  },
  {
    id: "jeffrus",
    name: "JEFFRUS",
    title: "Lojistik Kralı",
    industry: "E-Ticaret",
    bgGradient: "radial-gradient(circle at 30% 30%, #ffb84d 0%, #5a3a00 45%, #0f131e 100%)",
    emoji: "📦",
    hue: 35,
    sprite: "/characters/char-1.png",
    portrait: "/characters/portrait-1.png",
    skins: [
      {
        id: "base",
        name: "Depo Şefi",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #ffb84d, #5a3a00, #0f131e)",
      },
      {
        id: "blue",
        name: "Mavi Origin",
        cost: 1500,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dd0ff, #002a4a, #0f131e)",
      },
      {
        id: "press",
        name: "Manşet Baronu",
        cost: 3000,
        bgGradient: "radial-gradient(circle at 30% 30%, #dfe2f2, #2c303c, #0f131e)",
      },
      {
        id: "yacht",
        name: "Yat Kaptanı",
        cost: 6000,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #0a3a4a, #0f131e)",
      },
    ],
  },
  {
    id: "markus",
    name: "MARKUS",
    title: "Meta Mimarı",
    industry: "Sosyal & VR",
    bgGradient: "radial-gradient(circle at 30% 30%, #4dabff 0%, #0a2a6b 45%, #0f131e 100%)",
    emoji: "🥽",
    hue: 215,
    sprite: "/characters/char-2.png",
    portrait: "/characters/portrait-2.png",
    skins: [
      {
        id: "base",
        name: "Hoodie Kodlayıcı",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dabff, #0a2a6b, #0f131e)",
      },
      {
        id: "vr",
        name: "Metaverse Avatarı",
        cost: 1800,
        bgGradient: "radial-gradient(circle at 30% 30%, #b51bff, #1a0a4a, #0f131e)",
      },
      {
        id: "toga",
        name: "Roma Senatörü",
        cost: 3500,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
      {
        id: "mma",
        name: "Kafes Dövüşçüsü",
        cost: 7000,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e, #4a0a1a, #0f131e)",
      },
    ],
  },
  {
    id: "billimus",
    name: "BILLIMUS",
    title: "Yazılım Patriği",
    industry: "Yazılım",
    bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc 0%, #003732 45%, #0f131e 100%)",
    emoji: "💻",
    hue: 175,
    sprite: "/characters/char-3.png",
    portrait: "/characters/portrait-3.png",
    skins: [
      {
        id: "base",
        name: "Sistem Yöneticisi",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
      {
        id: "philanthrop",
        name: "Hayırsever",
        cost: 1600,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dff8a, #003a1a, #0f131e)",
      },
      {
        id: "vaccine",
        name: "Aşı Akademisyeni",
        cost: 3200,
        bgGradient: "radial-gradient(circle at 30% 30%, #dfe2f2, #2c303c, #0f131e)",
      },
      {
        id: "windows",
        name: "Pencere Mimarı",
        cost: 6400,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dabff, #0a2a6b, #0f131e)",
      },
    ],
  },
  {
    id: "warrus",
    name: "WARRUS",
    title: "Omaha Bilgesi",
    industry: "Yatırım",
    bgGradient: "radial-gradient(circle at 30% 30%, #e9c400 0%, #4a3a00 45%, #0f131e 100%)",
    emoji: "🎩",
    hue: 48,
    sprite: "/characters/char-5.png",
    portrait: "/characters/portrait-5.png",
    skins: [
      {
        id: "base",
        name: "Değer Avcısı",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
      {
        id: "cola",
        name: "Kola Bağımlısı",
        cost: 1400,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e, #4a0a1a, #0f131e)",
      },
      {
        id: "berkshire",
        name: "Berkshire Kralı",
        cost: 2800,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
      {
        id: "buffet",
        name: "Akşam Yemeği",
        cost: 5600,
        bgGradient: "radial-gradient(circle at 30% 30%, #dfe2f2, #2c303c, #0f131e)",
      },
    ],
  },
  {
    id: "oprahus",
    name: "OPRAHUS",
    title: "Medya İmparatoriçesi",
    industry: "Medya & Yayın",
    bgGradient: "radial-gradient(circle at 30% 30%, #b51bff 0%, #2b0a6b 45%, #0f131e 100%)",
    emoji: "🎤",
    hue: 290,
    sprite: "/characters/char-4.png",
    portrait: "/characters/portrait-4.png",
    skins: [
      {
        id: "base",
        name: "Stüdyo Yıldızı",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #b51bff, #2b0a6b, #0f131e)",
      },
      {
        id: "book",
        name: "Kitap Kulübü",
        cost: 1300,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff8a3d, #5a1a00, #0f131e)",
      },
      {
        id: "talk",
        name: "Talk Show Diva",
        cost: 2600,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
      {
        id: "mogul",
        name: "Magnat",
        cost: 5200,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
    ],
  },
  {
    id: "markust",
    name: "MARKUST",
    title: "Lüks Baronu",
    industry: "Moda & Lüks",
    bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e 0%, #4a0a1a 45%, #0f131e 100%)",
    emoji: "💼",
    hue: 0,
    sprite: "/characters/char-6.png",
    portrait: "/characters/portrait-6.png",
    skins: [
      {
        id: "base",
        name: "Atelier Şefi",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e, #4a0a1a, #0f131e)",
      },
      {
        id: "champ",
        name: "Şampanya Kontu",
        cost: 1700,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
      {
        id: "vuit",
        name: "Bavul Ustası",
        cost: 3400,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
      {
        id: "icon",
        name: "Moda İkonu",
        cost: 6800,
        bgGradient: "radial-gradient(circle at 30% 30%, #b51bff, #2b0a6b, #0f131e)",
      },
    ],
  },
  {
    id: "larrus",
    name: "LARRUS",
    title: "Bulut Korsanı",
    industry: "Veritabanı",
    bgGradient: "radial-gradient(circle at 30% 30%, #ff8a3d 0%, #5a1a00 45%, #0f131e 100%)",
    emoji: "⛵",
    hue: 20,
    sprite: "/characters/char-7.png",
    portrait: "/characters/portrait-7.png",
    skins: [
      {
        id: "base",
        name: "Sunucu Sahibi",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff8a3d, #5a1a00, #0f131e)",
      },
      {
        id: "yacht",
        name: "Yarış Yelkencisi",
        cost: 1500,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dabff, #0a2a6b, #0f131e)",
      },
      {
        id: "island",
        name: "Ada Sahibi",
        cost: 3000,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dff8a, #003a1a, #0f131e)",
      },
      {
        id: "samurai",
        name: "Veri Samurayı",
        cost: 6000,
        bgGradient: "radial-gradient(circle at 30% 30%, #ff5e5e, #4a0a1a, #0f131e)",
      },
    ],
  },
  {
    id: "stevus",
    name: "STEVUS",
    title: "Vizyoner Minimalist",
    industry: "Donanım & Tasarım",
    bgGradient: "radial-gradient(circle at 30% 30%, #dfe2f2 0%, #2c303c 45%, #0f131e 100%)",
    emoji: "📱",
    hue: 210,
    sprite: "/characters/char-8.png",
    portrait: "/characters/portrait-8.png",
    skins: [
      {
        id: "base",
        name: "Siyah Balıkçı",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #dfe2f2, #2c303c, #0f131e)",
      },
      {
        id: "keynote",
        name: "Sahne Ustası",
        cost: 1800,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
      },
      {
        id: "vision",
        name: "Vizyon Pro",
        cost: 3600,
        bgGradient: "radial-gradient(circle at 30% 30%, #4dabff, #0a2a6b, #0f131e)",
      },
      {
        id: "orchard",
        name: "Meyve Baronu",
        cost: 7200,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
    ],
  },
  {
    id: "cathrus",
    name: "CATHRUS",
    title: "Kamera Patroniçesi",
    industry: "Medya & Yayın",
    bgGradient: "radial-gradient(circle at 30% 30%, #ef5350 0%, #4a0a1a 45%, #0f131e 100%)",
    emoji: "🎥",
    hue: 5,
    sprite: "/characters/char-9.png",
    portrait: "/characters/portrait-9.png",
    skins: [
      {
        id: "base",
        name: "Saha Muhabiri",
        cost: 0,
        bgGradient: "radial-gradient(circle at 30% 30%, #ef5350, #4a0a1a, #0f131e)",
      },
      {
        id: "studio",
        name: "Stüdyo Işığı",
        cost: 1600,
        bgGradient: "radial-gradient(circle at 30% 30%, #b51bff, #2b0a6b, #0f131e)",
      },
      {
        id: "breaking",
        name: "Son Dakika",
        cost: 3200,
        bgGradient: "radial-gradient(circle at 30% 30%, #e9c400, #4a3a00, #0f131e)",
      },
      {
        id: "anchor",
        name: "Ana Haber",
        cost: 6400,
        bgGradient: "radial-gradient(circle at 30% 30%, #66d9cc, #003732, #0f131e)",
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
