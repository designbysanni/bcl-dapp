# Stage 5 — Code Export
> **Reusable Workflow:** Translate all prior stage outputs into production-ready code. No feature is added here that wasn't documented in Stages 1–4.

---

## Overview
Code Export is purely mechanical translation: design tokens → Tailwind config, component specs → React components, flow maps → hooks, contract specs → Solidity. Every design decision was already made in previous stages.

---

## Deliverables Checklist

### Smart Contracts
- [x] `contracts/CycleToken.sol` — ERC-20, 100M supply, mintable
- [x] `contracts/CycleStaking.sol` — 12% APY, stake/unstake/claim
- [x] `hardhat.config.js` — Hardhat + Sepolia config
- [x] `scripts/deploy.js` — deploy both contracts
- [x] `test/CycleToken.test.js` — unit tests
- [x] `test/CycleStaking.test.js` — unit tests

### Frontend
- [x] `frontend/package.json` — Next.js 14 + wagmi v2 + RainbowKit
- [x] `frontend/tailwind.config.js` — design tokens from Stage 3
- [x] `frontend/src/app/layout.tsx` — root layout + providers
- [x] `frontend/src/app/page.tsx` — main dashboard
- [x] `frontend/src/app/globals.css` — base styles + animations
- [x] `frontend/src/app/providers.tsx` — wagmi + RainbowKit providers
- [x] `frontend/src/components/Navbar.tsx`
- [x] `frontend/src/components/Hero.tsx`
- [x] `frontend/src/components/StakingPanel.tsx` — stake + unstake tabs
- [x] `frontend/src/components/UserPosition.tsx` — staked + rewards
- [x] `frontend/src/components/StatsBar.tsx` — protocol stats
- [x] `frontend/src/components/RewardCounter.tsx` — live ticking counter
- [x] `frontend/src/hooks/useStaking.ts` — stake/unstake/claim/read
- [x] `frontend/src/hooks/useToken.ts` — balance + approve
- [x] `frontend/src/lib/contracts.ts` — ABIs + deployed addresses
- [x] `frontend/src/config/wagmi.ts` — wagmi + RainbowKit config

---

## Deployment Instructions

### 1. Install Dependencies
```bash
# Root (contracts)
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Fill in:
# PRIVATE_KEY=<deployer private key>
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-key>
# ETHERSCAN_API_KEY=<optional, for verification>
```

### 3. Deploy Contracts to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Update Contract Addresses
After deployment, update `frontend/src/lib/contracts.ts` with:
- `CYCLE_TOKEN_ADDRESS`
- `CYCLE_STAKING_ADDRESS`

### 5. Run Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 6. Fund Reward Pool
After deploying, the owner must transfer CYCLE to the staking contract:
```bash
# In Hardhat console or via UI
await cycleToken.transfer(stakingAddress, ethers.parseEther("1000000"));
```

---

## Post-Deploy Checklist
- [ ] CycleToken deployed and verified on Sepolia Etherscan
- [ ] CycleStaking deployed and verified on Sepolia Etherscan
- [ ] Reward pool funded (minimum 1M CYCLE recommended for testing)
- [ ] Contract addresses updated in frontend config
- [ ] Frontend deployed to app.blockcycle.org
- [ ] CORS / RPC limits confirmed for production traffic
- [ ] MetaMask tested end-to-end on Sepolia

---

## How to Replicate This Stage for Any Client

```
REQUIRED INPUTS:
  - All prior stage outputs (Stages 1–4)

STEPS:
  1. Generate contracts from Stage 1 specs + Stage 4 test cases
  2. Generate Tailwind config from Stage 3 tokens (1:1 mapping)
  3. Generate components from Stage 3 component specs
  4. Wire hooks to Stage 2 flows (each flow = one hook function)
  5. Add toast notifications per Stage 2 notification table
  6. Run Stage 4 tests — all must pass before calling done

RULE: If code adds something not in Stages 1–4, it's scope creep.
      Document it, ask the client, then add it properly.
```

---

**Stage 5 complete.** All workflow documents written. See code files for full implementation.
