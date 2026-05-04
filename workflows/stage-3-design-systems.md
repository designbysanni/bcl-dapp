# Stage 3 — Design Systems
> **Reusable Workflow:** Convert Stage 1 palette + Stage 2 flows into a coded design token system and reusable component set before building any page.

---

## Overview
The design system is the single source of truth for every visual decision. Everything in the UI — spacing, color, shadow, radius, animation — traces back to a token defined here. No magic numbers in component code.

---

## Design Tokens

### Color Tokens (Tailwind custom theme)
```js
colors: {
  bg: {
    deep:     '#040D1A',   // page root
    surface:  '#0A1929',   // cards
    elevated: '#0F2744',   // hover/active cards
  },
  accent: {
    cyan:     '#00C6FF',   // primary CTA, links
    purple:   '#A855F7',   // secondary, gradients
    green:    '#00FF94',   // rewards, success
  },
  text: {
    primary:  '#F1F5F9',
    secondary:'#94A3B8',
    muted:    '#475569',
  },
  border: {
    subtle:   'rgba(0,198,255,0.15)',
    strong:   'rgba(0,198,255,0.35)',
  },
  status: {
    success:  '#00FF94',
    warning:  '#FBBF24',
    error:    '#F87171',
    info:     '#60A5FA',
  }
}
```

### Spacing Scale
```
4px  → space-1   (tight internal padding)
8px  → space-2   (icon gap, small gap)
12px → space-3   (button padding x)
16px → space-4   (card padding, standard gap)
24px → space-6   (section gap)
32px → space-8   (large gap)
48px → space-12  (section padding)
64px → space-16  (hero padding)
```

### Border Radius
```
4px  → rounded-sm   (tags, badges)
8px  → rounded      (buttons, inputs)
12px → rounded-xl   (cards)
16px → rounded-2xl  (hero panels)
full → rounded-full (pills, avatars)
```

### Typography Scale
```
xs:   12px / 1.4  — captions, footnotes
sm:   14px / 1.5  — labels, secondary text
base: 16px / 1.6  — body
lg:   18px / 1.5  — lead text, card values
xl:   20px / 1.4  — card headings
2xl:  24px / 1.3  — section headings
3xl:  30px / 1.2  — page headings
4xl:  36px / 1.1  — hero numbers
5xl:  48px / 1.0  — hero heading
```

### Shadow System
```css
--shadow-card:    0 4px 24px rgba(0, 198, 255, 0.06);
--shadow-glow:    0 0 40px rgba(0, 198, 255, 0.15);
--shadow-purple:  0 0 40px rgba(168, 85, 247, 0.15);
--shadow-green:   0 0 20px rgba(0, 255, 148, 0.2);
```

---

## Component Library

### Button
```
Variants:
  primary   — bg-accent-cyan, text-bg-deep, hover: opacity-90
  secondary — border border-accent-cyan/30, text-accent-cyan, hover: bg-accent-cyan/10
  ghost     — text-text-secondary, hover: text-text-primary
  danger    — bg-status-error/20, text-status-error, border border-status-error/30

Sizes:
  sm — h-8, px-3, text-sm
  md — h-10, px-4, text-base  (default)
  lg — h-12, px-6, text-lg

States:
  loading — spinner icon replaces label, disabled
  disabled — opacity-50, cursor-not-allowed
```

### Card
```
Base:      bg-bg-surface, rounded-2xl, border border-border-subtle, p-6
Glow:      + shadow-[0_0_40px_rgba(0,198,255,0.08)]
Elevated:  bg-bg-elevated (for active/selected state)
```

### Input
```
Base:     bg-bg-elevated, rounded-xl, border border-border-subtle
          h-14, px-4, text-text-primary, text-lg, font-mono
Focus:    ring-2 ring-accent-cyan/50, border-accent-cyan/50
Error:    border-status-error/60, ring-status-error/30
Addon:    right-side slot for "MAX" button and token symbol
```

### Stat Item
```
Layout:   vertical stack
Label:    text-text-secondary, text-sm, uppercase tracking-wider
Value:    text-2xl or 3xl, font-bold, text-text-primary
Sub:      optional trend (green up arrow / red down arrow)
```

### Badge
```
Variants:
  network  — "Sepolia Testnet" cyan pill
  apy      — "12% APY" green pill
  status   — "Active" / "Paused" colored pill
```

### Toast / Notification
```
Position:    top-right, stacked
Variants:    success (green left border) | error (red) | warning (yellow) | info (blue)
Auto-dismiss: 5 seconds
Content:     icon + title + optional description + optional TX link
```

### Navbar
```
Height:    64px
Style:     sticky top-0, backdrop-blur-xl, bg-bg-deep/80, border-b border-border-subtle
Left:      BCL Logo + "BCL DApp" wordmark
Center:    Nav links (Dashboard, Stake, Docs)
Right:     Network badge + Connect Wallet button
Mobile:    hamburger → slide-in drawer
```

### Reward Counter
```
Type:      animated number (ticking up in real-time)
Color:     text-accent-green, font-mono
Animation: CSS counter increment, smooth
Refresh:   Re-syncs to on-chain value each block
```

---

## Page Templates

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO                                                   │
│  "Stake. Earn. Cycle."  [Protocol stats bar]            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────┐  ┌────────────────────────────┐ │
│  │  STAKING PANEL     │  │  YOUR POSITION             │ │
│  │  [Stake / Unstake  │  │  Staked: X CYCLE           │ │
│  │   tabs + input]    │  │  Rewards: X CYCLE (live)   │ │
│  │                    │  │  [Claim Rewards btn]        │ │
│  └────────────────────┘  └────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  PROTOCOL INFO                                          │
│  [APY card] [Total Staked] [Reward Pool] [Contract]     │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
```
mobile:  < 640px   — stacked single column
tablet:  640–1024px — 1–2 column
desktop: > 1024px  — full 2-col layout as above
```

---

## Animation Tokens
```
transition-fast:    150ms ease
transition-base:    250ms ease
transition-slow:    400ms ease-in-out
hover-lift:         translateY(-2px)
pulse-glow:         box-shadow keyframe, 2s infinite (for CTAs)
```

---

## How to Replicate This Stage for Any Client

```
REQUIRED INPUTS:
  - Color palette from Stage 1
  - Component needs from Stage 2 flows

STEPS:
  1. Define color tokens first — every color must have a semantic name
  2. Build spacing + radius + shadow scales (keep it numeric/consistent)
  3. Define each component as: variants × sizes × states
  4. Sketch ASCII layout for each page template
  5. Add animation tokens last (always minimal)
  6. Validate: every color from the UI must trace to a token name

OUTPUT: tailwind.config.js + globals.css + component specs
```

---

**Stage 3 complete.** Proceed to Stage 4: Simulated Tests.
