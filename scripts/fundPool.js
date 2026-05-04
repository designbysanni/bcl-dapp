/**
 * Run this script to fund the staking reward pool for already-deployed contracts.
 *
 *   npx hardhat run scripts/fundPool.js --network sepolia
 */
const { ethers } = require("hardhat");

const CYCLE_TOKEN_ADDRESS  = "0xBF059Bd2D017f22853A1D692A2a1713E2a38310A";
const CYCLE_STAKING_ADDRESS = "0xc30B9Bf7ebb0e071755b2195C04e8aF85EF0FAf3";
const FUND_AMOUNT = ethers.parseEther("1000000"); // 1,000,000 CYCLE

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];
const STAKING_ABI = [
  "function fundRewardPool(uint256 amount) external",
  "function rewardPool() view returns (uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Wallet:", deployer.address);

  const token   = new ethers.Contract(CYCLE_TOKEN_ADDRESS,   TOKEN_ABI,   deployer);
  const staking = new ethers.Contract(CYCLE_STAKING_ADDRESS, STAKING_ABI, deployer);

  const balance = await token.balanceOf(deployer.address);
  console.log("CYCLE balance:", ethers.formatEther(balance));

  if (balance < FUND_AMOUNT) {
    console.error("Insufficient CYCLE balance. Need 1,000,000 CYCLE.");
    process.exit(1);
  }

  // Step 1 — Approve (wait for confirmation before next TX)
  console.log("\nStep 1: Approving 1,000,000 CYCLE spend...");
  const approveTx = await token.approve(CYCLE_STAKING_ADDRESS, FUND_AMOUNT);
  console.log("  TX submitted:", approveTx.hash);
  await approveTx.wait();
  console.log("  ✅ Approval confirmed.");

  // Step 2 — Fund pool
  console.log("\nStep 2: Funding reward pool...");
  const fundTx = await staking.fundRewardPool(FUND_AMOUNT);
  console.log("  TX submitted:", fundTx.hash);
  await fundTx.wait();
  console.log("  ✅ Reward pool funded.");

  const pool = await staking.rewardPool();
  console.log("\nReward pool balance:", ethers.formatEther(pool), "CYCLE");
  console.log("\nDone — the staking contract is ready.");
}

main().catch((e) => { console.error(e); process.exit(1); });
