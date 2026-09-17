export interface Theme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  borderStyle: string;
  frameColors: string[];
  framePatterns: Array<{ id: string; name: string }>;
  fontClass: string;
  recommendedFilter: string;
  stickers: string[];
}

export interface Filter {
  id: string;
  name: string;
  css: string;
  canvasFilter: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface PosePrompt {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
}

export const COUPLE_POSES: PosePrompt[] = [
  { id: 1, title: "Half Heart", subtitle: "Join hands to make a big heart", emoji: "🫶" },
  { id: 2, title: "Cheek Kiss", subtitle: "One partner kisses the other's cheek", emoji: "😘" },
  { id: 3, title: "Back-to-Back", subtitle: "Cross arms and look like movie stars", emoji: "🕶️" },
  { id: 4, title: "Funny Faces!", subtitle: "Cross eyes, stick tongue out, make each other laugh", emoji: "🤪" },
  { id: 5, title: "Bear Hug", subtitle: "Wrap arms around each other tight", emoji: "🤗" },
  { id: 6, title: "Eye Contact", subtitle: "Look into each other's eyes and smile", emoji: "😍" },
];

export const THEMES: Record<string, Theme> = {
  korean_pastel: {
    id: "korean_pastel",
    name: "Korean Life4Cuts",
    description: "Soft pinks, aesthetic blush glow & cute aesthetic strip frames",
    primaryColor: "#ff758c",
    bgGradient: "from-pink-100 via-rose-50 to-purple-100",
    cardBg: "bg-white/80 border-pink-200 text-pink-950",
    textColor: "text-pink-900",
    accentColor: "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-300",
    borderStyle: "rounded-2xl border-4 border-pink-200 shadow-xl shadow-pink-200/50",
    frameColors: ["#ffffff", "#ffe4e6", "#f3e8ff", "#dbeafe", "#fef3c7", "#d1fae5", "#fce7f3", "#e0f2fe", "#f5d0fe", "#18181b"],
    framePatterns: [
      { id: "solid", name: "Classic Solid" },
      { id: "hearts", name: "Cute Hearts" },
      { id: "polka", name: "Polka Dots" },
      { id: "stars", name: "Sparkle Stars" },
      { id: "stripes", name: "Soft Stripes" },
      { id: "diamonds", name: "Diamonds" },
    ],
    fontClass: "font-sans",
    recommendedFilter: "pink_blush",
    stickers: [
      "💕","🎀","💖","🌸","✨","🐰","👑","🧁","🍓","💌",
      "🎂","🧸","🐾","💍","🌷","🦋","🍰","🫶","💝","🌺",
      "🎈","🎁","🧡","💛","💚","💙","💜","🤍","🖤","🤎",
      "⭐","🌟","💫","🌙","☁️","🌈","🍒","🍑","🍬","🫧",
    ],
  },
  vintage_romance: {
    id: "vintage_romance",
    name: "Vintage Romance",
    description: "Warm sepia tones, polaroid texture & classic romantic script",
    primaryColor: "#d97706",
    bgGradient: "from-amber-100 via-stone-100 to-orange-100",
    cardBg: "bg-stone-50/90 border-amber-300 text-stone-900",
    textColor: "text-stone-900",
    accentColor: "bg-amber-700 hover:bg-amber-800 text-white shadow-amber-300",
    borderStyle: "rounded-lg border-8 border-stone-100 shadow-2xl shadow-stone-400/40",
    frameColors: ["#fefcbf", "#f5f5f4", "#e7e5e4", "#fde68a", "#fed7aa", "#fca5a1", "#78350f", "#1c1917", "#44403c", "#292524"],
    framePatterns: [
      { id: "solid", name: "Classic Paper" },
      { id: "polka", name: "Polka Dots" },
      { id: "stars", name: "Sparkle Stars" },
      { id: "stripes", name: "Stripes" },
    ],
    fontClass: "font-serif",
    recommendedFilter: "vintage_warmth",
    stickers: [
      "🌹","🕯️","💌","💋","🍷","🗝️","🎟️","📷","🖤","🕊️",
      "⏳","✉️","💐","🎭","🎻","🎶","🌿","🍃","🌾","🧡",
      "📜","🖋️","🎀","🫖","🍵","☕","🍁","🌻","🦉","🌙",
      "⭐","🌟","✨","🕰️","🪞","🗺️","🏺","🎠","🪷","💛",
    ],
  },
  cyber_romance: {
    id: "cyber_romance",
    name: "Cyber Romance",
    description: "Dark glassmorphism with glowing neon pink & cyan future vibes",
    primaryColor: "#ec4899",
    bgGradient: "from-slate-950 via-purple-950 to-slate-900",
    cardBg: "bg-slate-900/80 border-pink-500/40 text-slate-100 backdrop-blur-md",
    textColor: "text-pink-300",
    accentColor: "bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-pink-500/50",
    borderStyle: "rounded-2xl border-2 border-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.3)] bg-slate-900/90",
    frameColors: ["#0f172a", "#1e1b4b", "#311042", "#022c22", "#450a0a", "#0c1a2e", "#1a0533", "#053318", "#1a0505", "#ffffff"],
    framePatterns: [
      { id: "solid", name: "Deep Dark" },
      { id: "pixels", name: "Neon Grid" },
      { id: "polka", name: "Dots" },
      { id: "stars", name: "Stars" },
      { id: "stripes", name: "Scan Lines" },
    ],
    fontClass: "font-mono",
    recommendedFilter: "cyber_glow",
    stickers: [
      "👾","⚡","🔮","💫","🤖","🔥","💎","💿","💥","🪐",
      "🧬","🛸","🌙","🖤","🌌","🔴","🔵","🟣","🌐","⚙️",
      "🎮","📡","🔬","🧲","💡","🪬","🫧","🌑","🟥","🔷",
      "⬛","🎯","🔻","🔺","💠","🔹","🔸","🔶","⚫","⬜",
    ],
  },
  floral_garden: {
    id: "floral_garden",
    name: "Floral Garden",
    description: "Rose gold elegance, botanical borders & soft wedding glow",
    primaryColor: "#fb7185",
    bgGradient: "from-rose-50 via-stone-50 to-emerald-50",
    cardBg: "bg-white/90 border-rose-200 text-stone-900",
    textColor: "text-rose-950",
    accentColor: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200",
    borderStyle: "rounded-xl border-4 border-rose-300 shadow-lg shadow-rose-100",
    frameColors: ["#fff1f2", "#fdf2f8", "#ecfdf5", "#fef8f6", "#ffffff", "#f0fdf4", "#fef9c3", "#fef3c7", "#dbeafe", "#27272a"],
    framePatterns: [
      { id: "solid", name: "Silk White" },
      { id: "hearts", name: "Roses" },
      { id: "polka", name: "Petals" },
      { id: "stars", name: "Sparkles" },
      { id: "diamonds", name: "Diamonds" },
      { id: "stripes", name: "Ribbons" },
    ],
    fontClass: "font-serif",
    recommendedFilter: "soft_glam",
    stickers: [
      "🌺","🌿","💐","🦋","🥂","💍","🌷","🍃","🕊️","✨",
      "🎀","💒","💎","🌸","🌹","🌻","🌼","🍀","🍁","🌾",
      "🫧","🧡","💛","💚","💙","💜","🤍","🌙","⭐","💫",
      "🍓","🍑","🍇","🍒","🫐","🫶","💝","💖","💗","💓",
    ],
  },
  y2k_retro: {
    id: "y2k_retro",
    name: "Y2K Pixel Arcade",
    description: "90s digital camera aesthetic, pixelated heart icons & pop vibrant colors",
    primaryColor: "#a855f7",
    bgGradient: "from-fuchsia-200 via-sky-200 to-yellow-100",
    cardBg: "bg-white border-4 border-black text-black shadow-[4px_4px_0px_#000]",
    textColor: "text-black",
    accentColor: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-2 border-black shadow-[3px_3px_0px_#000]",
    borderStyle: "rounded-none border-4 border-black shadow-[6px_6px_0px_#000] bg-yellow-50",
    frameColors: ["#ffffff", "#f0abfc", "#38bdf8", "#fde047", "#4ade80", "#fb923c", "#f87171", "#a78bfa", "#34d399", "#000000"],
    framePatterns: [
      { id: "solid", name: "Pop Solid" },
      { id: "checkerboard", name: "Checkerboard" },
      { id: "polka", name: "Polka Dots" },
      { id: "stripes", name: "Stripes" },
      { id: "stars", name: "Stars" },
    ],
    fontClass: "font-mono",
    recommendedFilter: "vibrant",
    stickers: [
      "⭐","💿","👾","🧸","🎉","🔥","🦄","🪩","🌈","🍭",
      "⚡","📼","🎮","😎","🎵","🎶","🎸","🎤","🪀","🎲",
      "🍕","🍔","🌮","🍦","🧋","🧃","🫧","🎠","🎡","🎢",
      "🚀","🛹","🏄","🤿","🛼","🕹️","🎳","🎯","🏆","💰",
    ],
  },
};

export const FILTERS: Filter[] = [
  {
    id: "normal",
    name: "Original",
    css: "none",
    canvasFilter: () => {},
  },
  {
    id: "pink_blush",
    name: "Blush Pink",
    css: "sepia(0.25) hue-rotate(310deg) saturate(1.3) contrast(1.05)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(255, 182, 193, 0.12)";
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: "vintage_warmth",
    name: "Retro Warmth",
    css: "sepia(0.4) contrast(1.1) brightness(0.95) saturate(1.2)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: "soft_glam",
    name: "Soft Glam",
    css: "brightness(1.08) contrast(0.95) saturate(1.1) blur(0.3px)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: "bw_classic",
    name: "B&W Classic",
    css: "grayscale(1) contrast(1.25) brightness(1.02)",
    canvasFilter: (ctx, width, height) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = avg; data[i + 1] = avg; data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
    },
  },
  {
    id: "cyber_glow",
    name: "Cyber Neon",
    css: "contrast(1.3) saturate(1.6) hue-rotate(15deg)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(236, 72, 153, 0.08)";
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: "vibrant",
    name: "Vibrant Pop",
    css: "saturate(1.8) contrast(1.15) brightness(1.03)",
    canvasFilter: () => {},
  },
  {
    id: "cool_tone",
    name: "Cool Tone",
    css: "hue-rotate(200deg) saturate(0.9) brightness(1.05)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(147, 197, 253, 0.08)";
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: "golden",
    name: "Golden Hour",
    css: "sepia(0.3) brightness(1.1) saturate(1.4) hue-rotate(-10deg)",
    canvasFilter: (ctx, width, height) => {
      ctx.fillStyle = "rgba(251, 191, 36, 0.1)";
      ctx.fillRect(0, 0, width, height);
    },
  },
];
