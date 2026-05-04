# Stage 2 — Auto Flows
> **Reusable Workflow:** Map every user interaction as a state machine before writing a single line of UI code. This prevents dead-end states and missing loading/error branches.

---

## Overview
Auto Flows converts the feature list from Stage 1 into complete interaction diagrams — every screen state, every branch (success / error / loading / empty), every wallet state. These flows are the contract between design and engineering.

---

## Global State Machine

```
APP STATE
├── WALLET_DISCONNECTED
│   ├── → User clicks "Connect Wallet"
│   └── → WALLET_CONNECTING
│       ├── Success → WALLET_CONNECTED (correct network)
│       ├── Wrong chain → WRONG_NETWORK
│       └── Rejected → WALLET_DISCONNECTED
│
├── WRONG_NETWORK
│   ├── → User clicks "Switch to Sepolia"
│   └── → WALLET_CONNECTED
│
└── WALLET_CONNECTED
    ├── Reads: ETH balance, CYCLE balance, staked amount, pending rewards
    └── → All page flows below
```

---

## Flow 1 — Wallet Connection

```
[Landing Page]
      │
      ▼
[Connect Wallet Button]
      │
      ├──► [Modal: Choose Wallet]
      │         │
      │         ├── MetaMask selected
      │         │       ├── MetaMask not installed → [Install MetaMask prompt]
      │         │       └── MetaMask installed → [MetaMask popup: Approve]
      │         │               ├── Approved → Check network
      │         │               └── Rejected → Back to disconnected state
      │         │
      │         └── WalletConnect selected → [QR Code modal]
      │                 ├── Scanned + Approved → Check network
      │                 └── Cancelled → Back to disconnected state
      │
      ▼
[Network Check]
      ├── chainId === 11155111 (Sepolia) → [CONNECTED ✅]
      └── chainId !== 11155111 → [Wrong Network Banner]
                                        │
                                        └── "Switch to Sepolia" button
                                                ├── Approved → [CONNECTED ✅]
                                                └── Rejected → Banner persists
```

**States to render:**
- `idle` — "Connect Wallet" button
- `connecting` — spinner on button, disabled
- `wrong_network` — banner with switch CTA
- `connected` — wallet address (truncated), disconnect option

---

## Flow 2 — Dashboard Load

```
[WALLET_CONNECTED]
      │
      ▼
[Fetch on-chain data] — parallel multicall
      ├── cycleToken.balanceOf(user)         → USER_CYCLE_BALANCE
      ├── cycleToken.allowance(user, staking) → ALLOWANCE
      ├── staking.stakedBalance(user)         → STAKED_AMOUNT
      ├── staking.pendingRewards(user)        → PENDING_REWARDS
      ├── staking.totalStaked()              → PROTOCOL_TVL
      └── staking.rewardPool()               → REWARD_POOL_BALANCE
      │
      ▼
[Loading skeleton] ──► [Populated Dashboard]
      │
      └── Error fetching → [Error toast] + [Retry button]
```

**Reward counter behavior:**
- `pendingRewards` auto-increments client-side every second
- Formula: `displayRewards = pendingRewards + (stakedAmount * 0.12 * secondsSinceLastFetch) / (365 * 86400)`
- Resets to chain value on next block / manual refresh

---

## Flow 3 — Stake Tokens

```
[Stake Tab]
      │
      ▼
[Input: Amount]
      │
      ├── Input = 0 or empty → [Stake button disabled]
      ├── Input > CYCLE balance → [Error: "Insufficient balance"]
      └── Input valid → [Stake button enabled]
                              │
                              ▼
                     [Check allowance]
                              │
                              ├── allowance >= amount → Skip to [Send Stake TX]
                              └── allowance < amount  → [Approve Step]
                                        │
                                        ▼
                               [Approve TX]
                                        ├── Pending → [Spinner: "Approving..."]
                                        ├── Confirmed → [Send Stake TX]
                                        └── Rejected/Error → [Error toast]
                                                    │
                                                    ▼
                                           [Send Stake TX]
                                                    ├── Pending → [Spinner: "Staking..."]
                                                    ├── Confirmed → [Success toast + Refresh balances]
                                                    └── Rejected/Error → [Error toast]
```

**UX notes:**
- Show "Max" button → fills input with full CYCLE balance
- Show estimated annual rewards below input: `amount × 0.12 CYCLE/year`
- 2-step flow (approve + stake) shown as a step indicator when approval is needed

---

## Flow 4 — Unstake Tokens

```
[Unstake Tab]
      │
      ▼
[Input: Amount]
      │
      ├── Input = 0 or empty → [Unstake button disabled]
      ├── Input > stakedBalance → [Error: "Insufficient staked balance"]
      └── Input valid → [Unstake button enabled]
                              │
                              ▼
                     [Send Unstake TX]
                              ├── Pending → [Spinner: "Unstaking..."]
                              ├── Confirmed → [Success toast + Refresh balances]
                              │              Note: Pending rewards auto-claimed on unstake
                              └── Rejected/Error → [Error toast]
```

**UX notes:**
- Show "Max" button → fills input with full staked balance
- Show notice: "Unstaking will also claim your pending rewards"
- Testnet: no lockup period

---

## Flow 5 — Claim Rewards

```
[Rewards Panel]
      │
      ├── pendingRewards === 0 → [Claim button disabled, "No rewards yet"]
      └── pendingRewards > 0  → [Claim button enabled]
                                        │
                                        ▼
                               [Send Claim TX]
                                        ├── Pending → [Spinner: "Claiming..."]
                                        ├── Confirmed → [Success toast: "+X CYCLE claimed"] + Refresh
                                        └── Rejected/Error → [Error toast]
```

---

## Flow 6 — Token Approval (sub-flow, referenced by Flow 3)

```
[Check: cycleToken.allowance(user, stakingContract)]
      │
      ├── >= requested amount → Skip (already approved)
      └── < requested amount  →
                [Request approval for exact amount OR max uint256]
                        ├── User approves → receipt confirmed → continue
                        └── User rejects → abort with toast
```

**Decision:** Approve exact amount (safer) vs max uint256 (fewer future txs).
For testnet: approve exact amount to demonstrate the full flow.

---

## Flow 7 — Wrong Network Recovery

```
[Any page load with wallet connected]
      │
      └── window.ethereum.chainId !== '0xaa36a7' (Sepolia hex)
                │
                ▼
      [Full-page overlay OR top banner]
      "You're on the wrong network. Switch to Sepolia Testnet."
                │
                ▼
      [Switch Network button]
                ├── wallet_switchEthereumChain({ chainId: '0xaa36a7' })
                │       ├── Success → dismiss overlay → load app
                │       └── Not added → wallet_addEthereumChain (add Sepolia)
                └── User closes/ignores → app remains locked (read-only)
```

---

## Page-Level State Map

### `/` Dashboard
```
States: loading | loaded | error | wallet_disconnected
Components that change per state:
  - StatsBar: skeleton → real data
  - UserPosition: "Connect wallet to view" → balances
  - StakeCTA: always visible
```

### `/stake`
```
States:
  - Tab: stake | unstake
  - TX flow: idle | approving | staking | unstaking | claiming | success | error
  - Input: empty | valid | over_balance
```

---

## Notification System

| Event | Type | Message |
|---|---|---|
| Wallet connected | info | "Connected: 0xB96...A1b" |
| Wrong network | warning | "Please switch to Sepolia Testnet" |
| Approve pending | info | "Approving CYCLE spend..." |
| Approve confirmed | success | "Approval confirmed" |
| Stake pending | info | "Staking X CYCLE..." |
| Stake confirmed | success | "Successfully staked X CYCLE" |
| Unstake confirmed | success | "Unstaked X CYCLE + rewards claimed" |
| Claim confirmed | success | "+X CYCLE added to your wallet" |
| Any TX error | error | Human-readable message from contract revert |

---

## How to Replicate This Stage for Any Client

```
REQUIRED INPUTS:
  - Feature list from Stage 1
  - Smart contract function signatures

STEPS:
  1. Map the global wallet state machine (always the same base)
  2. For each feature: draw the happy path first (3-5 steps)
  3. Add all branches: loading, error, empty, disabled states
  4. Identify sub-flows (approval, network switch) and extract them
  5. Build the notification table (maps every event to a toast type)
  6. Output: this filled document before writing any UI component

RULE: If you can't draw the flow in ASCII, you don't understand it well
      enough to build it.
```

---

**Stage 2 complete.** Proceed to Stage 3: Design Systems.
