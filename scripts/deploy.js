const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ── Deploy CycleToken ──────────────────────────────────────────────
  console.log("\n1. Deploying CycleToken...");
  const CycleToken = await ethers.getContractFactory("CycleToken");
  const cycleToken = await CycleToken.deploy(deployer.address);
  await cycleToken.waitForDeployment();
  const tokenAddress = await cycleToken.getAddress();
  console.log("   CycleToken deployed to:", tokenAddress);

  // ── Deploy CycleStaking ────────────────────────────────────────────
  console.log("\n2. Deploying CycleStaking...");
  const CycleStaking = await ethers.getContractFactory("CycleStaking");
  const staking = await CycleStaking.deploy(tokenAddress, deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("   CycleStaking deployed to:", stakingAddress);

  // ── Fund Reward Pool ───────────────────────────────────────────────
  console.log("\n3. Funding reward pool with 1,000,000 CYCLE...");
  const rewardAmount = ethers.parseEther("1000000");

  // Must wait for approval to be mined before fundRewardPool calls safeTransferFrom
  console.log("   Approving spend...");
  const approveTx = await cycleToken.approve(stakingAddress, rewardAmount);
  await approveTx.wait();
  console.log("   Approval confirmed. Funding pool...");

  const fundTx = await staking.fundRewardPool(rewardAmount);
  await fundTx.wait();
  console.log("   Reward pool funded.");

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("Network:         Sepolia Testnet");
  console.log("Deployer:        ", deployer.address);
  console.log("CycleToken:      ", tokenAddress);
  console.log("CycleStaking:    ", stakingAddress);
  console.log("Reward Pool:      1,000,000 CYCLE");
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("1. Update frontend/src/lib/contracts.ts with above addresses");
  console.log("2. Verify contracts:");
  console.log(`   npx hardhat verify --network sepolia ${tokenAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network sepolia ${stakingAddress} "${tokenAddress}" "${deployer.address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
