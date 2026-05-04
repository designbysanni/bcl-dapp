# Stage 4 — Simulated Tests
> **Reusable Workflow:** Define every test scenario before writing a single test file. Tests are the spec — if a behavior isn't tested, it doesn't officially exist.

---

## Overview
Simulated Tests covers three layers: smart contract unit tests, UI integration tests, and user acceptance test (UAT) checklists. Running all three gives full confidence before code export and deployment.

---

## Layer 1 — Smart Contract Tests (Hardhat + ethers.js)

### CycleToken.sol

| # | Test Case | Input | Expected Output |
|---|---|---|---|
| T1 | Deployment mints correct supply | deploy | totalSupply = 100,000,000 CYCLE |
| T2 | Initial balance goes to deployer | deploy | balanceOf(deployer) = 100,000,000 |
| T3 | Token name and symbol | deploy | name = "Cycle Token", symbol = "CYCLE" |
| T4 | Token decimals | deploy | decimals() = 18 |
| T5 | Owner can mint additional tokens | mint(addr, 1000) | balanceOf(addr) += 1000 |
| T6 | Non-owner cannot mint | mint from addr2 | revert "OwnableUnauthorizedAccount" |
| T7 | Transfer works correctly | transfer(addr2, 100) | balances update correctly |
| T8 | Approve and transferFrom | approve + transferFrom | allowance decreases, balance transfers |
| T9 | Cannot transfer more than balance | transfer exceeds balance | revert "ERC20InsufficientBalance" |
| T10 | Burn reduces supply | burn(100) | totalSupply decreases, balance decreases |

### CycleStaking.sol

| # | Test Case | Input | Expected Output |
|---|---|---|---|
| S1 | Deploy staking with correct token | deploy | cycleToken address stored |
| S2 | Stake tokens updates state | stake(1000) | stakedBalance[user] = 1000, totalStaked += 1000 |
| S3 | Stake requires token approval | stake without approve | revert ERC20 allowance error |
| S4 | Cannot stake 0 tokens | stake(0) | revert "Cannot stake zero" |
| S5 | Pending rewards = 0 at stake time | immediately after stake | pendingRewards = 0 |
| S6 | Rewards accrue over time | stake → mine blocks → check | pendingRewards > 0 |
| S7 | 12% APY math is correct | stake 1000, wait 1 year | rewards ≈ 120 CYCLE (±dust) |
| S8 | Claim rewards transfers tokens | claimRewards() | CYCLE transferred to user |
| S9 | Rewards reset after claim | claim → check pending | pendingRewards = 0 |
| S10 | Unstake returns principal | unstake(1000) | user receives 1000 CYCLE back |
| S11 | Unstake also claims rewards | unstake with pending rewards | rewards auto-claimed |
| S12 | Cannot unstake more than staked | unstake(stakedBalance + 1) | revert "Insufficient staked balance" |
| S13 | Cannot unstake 0 | unstake(0) | revert "Cannot unstake zero" |
| S14 | Total staked tracks correctly | multiple users stake/unstake | totalStaked always accurate |
| S15 | Reward pool depletes correctly | claim rewards | rewardPool decreases |
| S16 | Cannot claim with empty pool | drain pool, then claim | revert "Insufficient reward pool" |
| S17 | Owner can fund reward pool | fundRewardPool(amount) | rewardPool increases |
| S18 | Non-owner cannot drain pool | withdraw from non-owner | revert |
| S19 | Multiple users independent rewards | user A and B stake different amounts | rewards proportional to stake |
| S20 | Reentrancy protection | reentrancy attack on claim | revert (ReentrancyGuard) |

---

## APY Verification Test (Critical)

```javascript
// Stake 1000 CYCLE, advance time by 1 year, verify ~120 CYCLE rewards
it("should calculate 12% APY correctly over 1 year", async () => {
  const stakeAmount = ethers.parseEther("1000");
  
  await cycleToken.approve(stakingAddr, stakeAmount);
  await staking.stake(stakeAmount);
  
  // Advance blockchain time by 1 year
  await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");
  
  const rewards = await staking.pendingRewards(user.address);
  const expectedRewards = ethers.parseEther("120");
  const tolerance = ethers.parseEther("0.01"); // 0.01 CYCLE dust tolerance
  
  expect(rewards).to.be.closeTo(expectedRewards, tolerance);
});
```

---

## Layer 2 — Frontend Integration Tests (Manual Scenarios)

### Wallet Connection
```
TEST-W1: Fresh load, no wallet connected
  → EXPECT: "Connect Wallet" button visible, no balance shown

TEST-W2: Connect MetaMask on correct network (Sepolia)
  → EXPECT: Address shown truncated (0xB96...A1b), balance loads

TEST-W3: Connect MetaMask on wrong network (Mainnet)
  → EXPECT: Wrong network banner visible, app locked

TEST-W4: Switch to Sepolia from wrong network banner
  → EXPECT: Banner dismisses, app loads normally

TEST-W5: Disconnect wallet
  → EXPECT: Reverts to disconnected state, balances hide
```

### Staking Flow
```
TEST-S1: Empty stake input
  → EXPECT: Stake button disabled

TEST-S2: Input amount exceeding CYCLE balance
  → EXPECT: "Insufficient balance" error inline, button disabled

TEST-S3: Valid amount, no prior approval
  → EXPECT: Step 1 (Approve) shown, MetaMask opens for approval TX

TEST-S4: After approval, stake TX fires
  → EXPECT: "Staking..." spinner, MetaMask for stake TX

TEST-S5: Stake TX confirmed
  → EXPECT: Success toast, balances refresh, staked amount updated

TEST-S6: Click MAX button
  → EXPECT: Input fills with full CYCLE balance

TEST-S7: Annual reward estimate shown
  → EXPECT: "Estimated annual rewards: X CYCLE" below input, updates with input
```

### Reward Counter
```
TEST-R1: User has staked tokens
  → EXPECT: Reward counter increments every second (visible tick)

TEST-R2: No staked tokens
  → EXPECT: Rewards show "0.000000 CYCLE", no ticking

TEST-R3: Claim rewards (with rewards > 0)
  → EXPECT: MetaMask opens, TX fires, counter resets to 0 then resumes

TEST-R4: Claim rewards (with rewards = 0)
  → EXPECT: Claim button disabled
```

### Unstake Flow
```
TEST-U1: Empty unstake input → button disabled
TEST-U2: Input > staked balance → error shown
TEST-U3: Valid unstake → MetaMask → success toast + rewards notice
TEST-U4: Balances refresh correctly after unstake
```

---

## Layer 3 — User Acceptance Tests (UAT Checklist)

### Visual / Design
- [ ] Dark background (`#040D1A`) on all pages
- [ ] BCL logo renders correctly in navbar
- [ ] All text passes WCAG AA contrast ratio (4.5:1 minimum)
- [ ] Accent cyan used for primary CTAs only
- [ ] Green used for reward values only
- [ ] Cards have subtle cyan border glow
- [ ] Responsive: single column on mobile (< 640px)
- [ ] Responsive: two-column on desktop (> 1024px)
- [ ] Fonts loaded: Space Grotesk (headings) + Inter (body) + JetBrains Mono (numbers)
- [ ] Sepolia testnet badge visible in navbar

### Functionality
- [ ] Wallet connects and disconnects cleanly
- [ ] Wrong network triggers switch prompt
- [ ] Stake flow completes (approve + stake) in correct order
- [ ] Unstake returns principal + claims rewards
- [ ] Rewards counter ticks in real-time
- [ ] MAX button fills input accurately
- [ ] Annual estimate updates on input change
- [ ] All toasts fire for all events (see notification table, Stage 2)
- [ ] Contract addresses shown/linkable to Sepolia Etherscan

### Edge Cases
- [ ] User stakes, immediately unstakes — no rewards (< 1 second)
- [ ] User stakes with exact CYCLE balance (no remainder)
- [ ] Reward pool reaches 0 — claim reverts with clear message
- [ ] Very large number (100M CYCLE) renders correctly without overflow
- [ ] MetaMask TX rejection shows friendly error (no raw revert reason)

---

## Test Coverage Targets
| Layer | Target Coverage |
|---|---|
| Smart contracts (unit) | ≥ 90% line coverage |
| Smart contracts (branch) | ≥ 80% branch coverage |
| Frontend flows (manual) | 100% of flows from Stage 2 |
| UAT checklist | 100% pass before mainnet |

---

## How to Replicate This Stage for Any Client

```
REQUIRED INPUTS:
  - Smart contract functions (from Stage 1 specs)
  - Interaction flows (from Stage 2)
  - Design tokens (from Stage 3)

STEPS:
  1. Write contract test table first (happy path rows)
  2. Add one error/revert row for every write function
  3. Add the APY/math verification test explicitly
  4. Write frontend tests following Stage 2 flows exactly
  5. Convert Stage 2 notification table to UAT checklist rows
  6. Add edge case rows (always: zero input, max input, empty state)

RULE: Every test scenario needs: Input → Expected Output.
      No vague tests like "it should work" — be specific.
```

---

**Stage 4 complete.** Proceed to Stage 5: Code Export.
