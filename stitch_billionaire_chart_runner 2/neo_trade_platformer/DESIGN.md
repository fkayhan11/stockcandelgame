---
name: Neo-Trade Platformer
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353945'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b26'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a35'
  surface-container-highest: '#313441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#bcc9c6'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#869391'
  outline-variant: '#3d4947'
  surface-tint: '#66d9cc'
  primary: '#66d9cc'
  on-primary: '#003732'
  primary-container: '#26a69a'
  on-primary-container: '#003430'
  inverse-primary: '#006a62'
  secondary: '#ffb3ae'
  on-secondary: '#68000b'
  secondary-container: '#910816'
  on-secondary-container: '#ff9992'
  tertiary: '#e9c400'
  on-tertiary: '#3a3000'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#84f5e8'
  primary-fixed-dim: '#66d9cc'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#910816'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#313441'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  hud-score:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style
The design system bridges the gap between high-stakes financial trading and nostalgic 16-bit gaming. It targets a "degen" audience—traders who value technical precision but enjoy the culture of retro gaming. 

The style is **Cyber-Financial Pixelism**. It utilizes a dark, immersive background to evoke a professional trading terminal environment, layered with **Glassmorphism** for UI panels to maintain modern depth. Character-focused elements and HUDs transition into a vibrant, pixelated aesthetic, creating a high-contrast experience where professional data meets playful engagement.

## Colors
The palette is rooted in the "Bull vs. Bear" dichotomy. **Success Green** (#26A69A) and **Danger Red** (#EF5350) are the functional drivers, used for positive/negative actions, candlestick obstacles, and UI feedback. 

The **Deep Navy** (#131722) background ensures high legibility for technical data, while **Gold** (#FFD700) is reserved exclusively for rewards, coins, and high-tier achievements. Neutral surfaces use a slightly lighter slate to create separation from the background without breaking the dark-mode immersion.

## Typography
We use a tri-font strategy to balance the professional/technical vibe with game mechanics:
- **Space Grotesk** (Headlines): A geometric sans-serif with a technical edge, used for screen titles and big "Win/Loss" states.
- **Inter** (Body): Provides maximum readability for settings, descriptions, and news feeds.
- **JetBrains Mono** (HUD/Data): Used for scores, coin counts, and ticker symbols to mimic terminal code and retro pixel-grid fonts.

Large displays should use a tighter letter-spacing to feel more "industrial" and compact.

## Layout & Spacing
The layout follows a **Fluid Content Model** within safe zones to accommodate various mobile aspect ratios. 

- **HUD Positioning**: Fixed to the corners with a 20px safe-margin.
- **Trading Panels**: Use a 12-column grid for desktop views, collapsing to a single column scroll for mobile.
- **Gaps**: A consistent 8px base unit (8, 16, 24, 40) ensures that modern UI elements feel structured against the blocky nature of the pixel-art characters.

## Elevation & Depth
This design system utilizes **Glassmorphism** to separate the "Meta" UI from the "Game" world. 

1.  **Background Layer**: The game world with pixel assets.
2.  **Mid Layer (Glass)**: UI panels and modal overlays. These use a 12% white stroke, a 20px background blur, and a semi-transparent fill (`rgba(30, 34, 45, 0.7)`).
3.  **Top Layer (Active)**: Interactive buttons and tooltips. Buttons do not use shadows; instead, they use high-contrast solid fills or "inner-glow" borders to appear luminous against the dark background.

## Shapes
A "Rounded" approach (0.5rem) is used for the modern UI components to provide a soft, premium feel that contrasts with the hard, 90-degree angles of the pixel-art characters. 

- **Containers**: Use `rounded-lg` (1rem) for main glass panels.
- **Interactive Elements**: Buttons use `rounded-md` (0.5rem) to maintain a professional "app" look rather than a toy-like appearance.
- **Avatars**: Character selection frames remain sharp (0px) to honor the pixel-art aesthetic.

## Components
- **Action Buttons**: Primary actions (Buy/Long) use Success Green with white text. Secondary (Sell/Short) use Danger Red. Use a subtle gradient (top-to-bottom, 10% opacity shift) to give them a "tactile plastic" feel.
- **Glass Chips**: Used for multipliers (e.g., "2x Leverage"). These are semi-transparent with a 1px border.
- **Candlestick Progress Bar**: A custom health bar that looks like a moving price chart. "Green" fills up, "Red" represents damage or lost value.
- **Input Fields**: Dark backgrounds with 1px `glass_stroke`. On focus, the border glows with the Primary color.
- **Modals**: Full-screen blur with a centered glass card. Transition should be a crisp "pop-in" scale effect to mimic old game menus.
- **Inventory/Character Cards**: A hybrid component featuring a pixel-art sprite on a high-tech, data-rich background showing "Volatility" and "Market Cap" stats.