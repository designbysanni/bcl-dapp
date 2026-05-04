// ─────────────────────────────────────────────────────────
//  Contract Addresses (update after deployment)
// ─────────────────────────────────────────────────────────
export const CYCLE_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_CYCLE_TOKEN_ADDRESS as `0x${string}`) ||
  "0xBF059Bd2D017f22853A1D692A2a1713E2a38310A";

export const CYCLE_STAKING_ADDRESS =
  (process.env.NEXT_PUBLIC_CYCLE_STAKING_ADDRESS as `0x${string}`) ||
  "0xc30B9Bf7ebb0e071755b2195C04e8aF85EF0FAf3";

export const SEPOLIA_CHAIN_ID = 11155111;

// ─────────────────────────────────────────────────────────
//  CycleToken ABI (minimal subset used by frontend)
// ─────────────────────────────────────────────────────────
export const CYCLE_TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ─────────────────────────────────────────────────────────
//  CycleStaking ABI
// ─────────────────────────────────────────────────────────
export const CYCLE_STAKING_ABI = [
  {
    name: "stake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "unstake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "pendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "stakedBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalStaked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "rewardPool",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Events
  {
    name: "Staked",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Unstaked",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "rewards", type: "uint256", indexed: false },
    ],
  },
  {
    name: "RewardsClaimed",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "rewards", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────
export const SEPOLIA_ETHERSCAN = "https://sepolia.etherscan.io";

export function etherscanTx(hash: string) {
  return `${SEPOLIA_ETHERSCAN}/tx/${hash}`;
}

export function etherscanAddress(addr: string) {
  return `${SEPOLIA_ETHERSCAN}/address/${addr}`;
}
