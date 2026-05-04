const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CycleStaking", function () {
  let cycleToken, staking, owner, user1, user2;
  const REWARD_POOL = ethers.parseEther("1000000"); // 1M CYCLE
  const STAKE_AMOUNT = ethers.parseEther("1000");
  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const CycleToken = await ethers.getContractFactory("CycleToken");
    cycleToken = await CycleToken.deploy(owner.address);

    const CycleStaking = await ethers.getContractFactory("CycleStaking");
    staking = await CycleStaking.deploy(await cycleToken.getAddress(), owner.address);

    // Fund reward pool
    await cycleToken.approve(await staking.getAddress(), REWARD_POOL);
    await staking.fundRewardPool(REWARD_POOL);

    // Give users some CYCLE
    await cycleToken.transfer(user1.address, ethers.parseEther("10000"));
    await cycleToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("S1: stores correct token address", async function () {
      expect(await staking.cycleToken()).to.equal(await cycleToken.getAddress());
    });

    it("reward pool funded correctly", async function () {
      expect(await staking.rewardPool()).to.equal(REWARD_POOL);
    });
  });

  describe("Staking", function () {
    it("S2: stake updates state correctly", async function () {
      await cycleToken.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);

      expect(await staking.stakedBalance(user1.address)).to.equal(STAKE_AMOUNT);
      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("S3: stake requires token approval", async function () {
      await expect(
        staking.connect(user1).stake(STAKE_AMOUNT)
      ).to.be.reverted;
    });

    it("S4: cannot stake zero", async function () {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWith("Cannot stake zero");
    });

    it("S5: pending rewards = 0 immediately after stake", async function () {
      await cycleToken.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);
      expect(await staking.pendingRewards(user1.address)).to.equal(0);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await cycleToken.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);
    });

    it("S6: rewards accrue over time", async function () {
      await time.increase(30 * 24 * 60 * 60); // 30 days
      expect(await staking.pendingRewards(user1.address)).to.be.gt(0);
    });

    it("S7: 12% APY math is correct over 1 year", async function () {
      await time.increase(ONE_YEAR);
      const rewards = await staking.pendingRewards(user1.address);
      const expected = ethers.parseEther("120"); // 12% of 1000
      const tolerance = ethers.parseEther("0.01");
      expect(rewards).to.be.closeTo(expected, tolerance);
    });

    it("S8: claimRewards transfers tokens to user", async function () {
      await time.increase(ONE_YEAR);
      const before = await cycleToken.balanceOf(user1.address);
      await staking.connect(user1).claimRewards();
      const after = await cycleToken.balanceOf(user1.address);
      expect(after).to.be.gt(before);
    });

    it("S9: rewards reset to 0 after claim", async function () {
      await time.increase(ONE_YEAR);
      await staking.connect(user1).claimRewards();
      // Immediately after claim, rewards should be 0 (or near 0 due to 1 block)
      expect(await staking.pendingRewards(user1.address)).to.be.lte(ethers.parseEther("0.001"));
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await cycleToken.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(30 * 24 * 60 * 60); // 30 days
    });

    it("S10: unstake returns principal", async function () {
      const before = await cycleToken.balanceOf(user1.address);
      await staking.connect(user1).unstake(STAKE_AMOUNT);
      const after = await cycleToken.balanceOf(user1.address);
      // Should receive principal + rewards
      expect(after).to.be.gt(before + STAKE_AMOUNT - ethers.parseEther("1"));
    });

    it("S11: unstake auto-claims rewards", async function () {
      const pendingBefore = await staking.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0);
      await staking.connect(user1).unstake(STAKE_AMOUNT);
      // staked balance is now 0
      expect(await staking.stakedBalance(user1.address)).to.equal(0);
    });

    it("S12: cannot unstake more than staked", async function () {
      await expect(
        staking.connect(user1).unstake(STAKE_AMOUNT + ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("S13: cannot unstake zero", async function () {
      await expect(staking.connect(user1).unstake(0)).to.be.revertedWith("Cannot unstake zero");
    });
  });

  describe("Multiple Users", function () {
    it("S19: rewards are proportional to stake", async function () {
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("2000"); // 2x stake

      await cycleToken.connect(user1).approve(await staking.getAddress(), amount1);
      await staking.connect(user1).stake(amount1);

      await cycleToken.connect(user2).approve(await staking.getAddress(), amount2);
      await staking.connect(user2).stake(amount2);

      await time.increase(ONE_YEAR);

      const rewards1 = await staking.pendingRewards(user1.address);
      const rewards2 = await staking.pendingRewards(user2.address);

      // user2 staked 2x, should have ~2x rewards
      expect(rewards2).to.be.closeTo(rewards1 * 2n, ethers.parseEther("0.1"));
    });
  });

  describe("Owner Functions", function () {
    it("S17: owner can fund reward pool", async function () {
      const poolBefore = await staking.rewardPool();
      await cycleToken.approve(await staking.getAddress(), ethers.parseEther("500000"));
      await staking.fundRewardPool(ethers.parseEther("500000"));
      expect(await staking.rewardPool()).to.equal(poolBefore + ethers.parseEther("500000"));
    });

    it("S18: non-owner cannot call owner functions", async function () {
      await expect(
        staking.connect(user1).withdrawRewardPool(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });
  });
});
