# Stage 1 — Insight Synthesis
> **Reusable Workflow:** Run this stage for any new DApp client using only their most basic inputs (logo, brand name, wallet address, token details).

---

## Overview
Insight Synthesis converts raw client inputs — website screenshots, PDFs, wallet addresses, token specs — into a structured design brief that every subsequent stage can execute against. No assumptions are carried forward without documentation here.

---

## Inputs Checklist
| Input | Source | Status |
|---|---|---|
| Brand name | Client brief | ✅ Block Cycle Labs (BCL) |
| Token name / symbol | Client brief | ✅ Cycle / $CYCLE |
| Token supply | Client brief | ✅ 100,000,000 CYCLE |
| Token standard | Client brief | ✅ ERC-20 (Industry Standard) |
| APY type / rate | Client brief | ✅ 12% Fixed APY |
| Network | Client brief | ✅ Ethereum Sepolia Testnet |
| Deployer wallet | Client brief | ✅ `0xB96aE535B226fDab92Bd047750Bc9a72D443cA1b` |
| App domain | Client brief | ✅ app.blockcycle.org |
| Visual asset | SVG file (Rectangle-85.svg) | ✅ Provided |
| Brand PDF | Block Cycle Labs.pdf | ✅ Provided (image-based) |

---

## Brand Extraction

### Name & Identity
- **Project:** BCL DApp (Block Cycle Labs Decentralized Application)
- **Token:** $CYCLE — evokes perpetual motion, compounding yield, the "cycle" of capital in DeFi
- **Tagline (synthesized):** *"Stake. Earn. Cycle."*
- **Positioning:** Institutional-grade fixed-yield staking protocol on Ethereum

### Visual Identity (from SVG asset)
- Asset dimensions: 705 × 729 px — near-square, icon-grade logo
- The SVG is a complex geometric/mechanical path illustration
- **Implied aesthetic:** Precision engineering, blockchain infrastructure, mechanical cycles
- **Contrast rule:** Logo works on dark backgrounds — the DApp must use a **dark theme as primary**

### Synthesized Color Palette
| Role | Hex | Usage |
|---|---|---|
| Background Deep | `#040D1A` | Page root, full-bleed sections |
| Background Surface | `#0A1929` | Card backgrounds |
| Background Elevated | `#0F2744` | Active states, hover cards |
| Accent Cyan | `#00C6FF` | Primary CTA, highlights, borders |
| Accent Purple | `#A855F7` | Secondary accent, gradients |
| Accent Green | `#00FF94` | Success states, reward values |
| Text Primary | `#F1F5F9` | Headings, primary text |
| Text Secondary | `#94A3B8` | Labels, captions, muted |
| Border Subtle | `rgba(0,198,255,0.15)` | Card borders, dividers |
| Danger | `#F87171` | Errors, warnings |

### Typography
- **Display / Headings:** Space Grotesk (Google Fonts) — technical, modern, slightly geometric
- **Body / UI:** Inter (Google Fonts) — readable, standard DeFi choice
- **Monospace (addresses, numbers):** JetBrains Mono — clear for hex values and token amounts

---

## Feature Requirements

### Core Protocol
| Feature | Spec | Notes |
|---|---|---|
| Token contract | ERC-20, 100M supply | Mintable by owner (for rewards pool) |
| Staking | Deposit CYCLE | Instant stake, no minimum |
| APY | 12% fixed | Calculated per-second, accrues continuously |
| Rewards | Claimable anytime | Separate from stake principal |
| Unstaking | Instant | Testnet — no lockup period |
| Rewards pool | Owner-funded | Owner transfers CYCLE to staking contract |

### Frontend Pages
| Page | Path | Purpose |
|---|---|---|
| Dashboard | `/` | Protocol stats, user position, CTAs |
| Stake | `/stake` | Stake + Unstake tabs, rewards claim |
| About | `/#about` | Protocol overview, tokenomics |

### Wallet Integration
- Connect via MetaMask / WalletConnect
- Network: Sepolia (chainId: 11155111)
- Auto-prompt network switch if wrong chain

---

## User Personas

### Persona 1 — The Yield Seeker
- DeFi-familiar, holds ETH + ERC-20 tokens
- Goal: Passive yield on idle CYCLE tokens
- Pain point: Complex staking UIs, unclear APY math
- Needs: Simple stake/unstake, real-time reward counter

### Persona 2 — The Testnet Explorer
- Developer or early tester evaluating BCL protocol
- Goal: Understand contract mechanics before mainnet
- Pain point: Missing faucet info, confusing testnet UX
- Needs: Clear Sepolia context, testnet ETH guidance

### Persona 3 — The Protocol Investor
- Evaluating BCL for larger capital allocation
- Goal: Understand TVL, APY sustainability, tokenomics
- Pain point: No on-chain transparency, opaque rewards
- Needs: Protocol stats, contract addresses, audit links

---

## Tokenomics Summary
```
Total Supply:        100,000,000 CYCLE
Staking Rewards:     ~12,000,000 CYCLE/year at full stake (funded by owner)
APY:                 12% fixed (not inflationary — comes from rewards pool)
Decimals:            18
Standard:            ERC-20
Network:             Ethereum Sepolia Testnet (ChainID: 11155111)
Deployer:            0xB96aE535B226fDab92Bd047750Bc9a72D443cA1b
```

---

## Technical Stack Decision
| Layer | Choice | Reason |
|---|---|---|
| Smart Contracts | Solidity 0.8.20 + OpenZeppelin 5 | Industry standard, audited base |
| Contract Dev | Hardhat + ethers.js | Most mature tooling |
| Frontend | Next.js 14 (App Router) | SEO, performance, React ecosystem |
| Styling | Tailwind CSS v3 | Rapid design token system |
| Web3 | wagmi v2 + viem | Modern, type-safe Ethereum hooks |
| Wallet UI | RainbowKit v2 | Best wallet UX library |
| Fonts | Google Fonts (Space Grotesk + Inter + JetBrains Mono) | Free, self-hostable |

---

## How to Replicate This Stage for Any Client

```
REQUIRED INPUTS (minimum viable):
  1. Brand name
  2. Logo (PNG/SVG) — extract dominant colors from it
  3. Wallet address (deployer)
  4. Token name, symbol, supply
  5. Yield/staking mechanism details
  6. Target network

STEPS:
  1. Extract colors from logo → build palette table above
  2. Identify dark/light bg requirement from logo contrast
  3. Map features to the Feature Requirements table
  4. Define 2-3 user personas from the product type
  5. Decide tech stack (keep standard unless client specifies)
  6. Output: this filled document before writing any code
```

---

**Stage 1 complete.** Proceed to Stage 2: Auto Flows.
