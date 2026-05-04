const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CycleToken", function () {
  let cycleToken, owner, addr1, addr2;
  const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100M

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CycleToken = await ethers.getContractFactory("CycleToken");
    cycleToken = await CycleToken.deploy(owner.address);
  });

  it("T1: mints 100M CYCLE on deploy", async function () {
    expect(await cycleToken.totalSupply()).to.equal(TOTAL_SUPPLY);
  });

  it("T2: all tokens go to deployer", async function () {
    expect(await cycleToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
  });

  it("T3: correct name and symbol", async function () {
    expect(await cycleToken.name()).to.equal("Cycle Token");
    expect(await cycleToken.symbol()).to.equal("CYCLE");
  });

  it("T4: 18 decimals", async function () {
    expect(await cycleToken.decimals()).to.equal(18);
  });

  it("T5: owner can mint additional tokens", async function () {
    await cycleToken.mint(addr1.address, ethers.parseEther("1000"));
    expect(await cycleToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
  });

  it("T6: non-owner cannot mint", async function () {
    await expect(
      cycleToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
    ).to.be.revertedWithCustomError(cycleToken, "OwnableUnauthorizedAccount");
  });

  it("T7: transfer works correctly", async function () {
    await cycleToken.transfer(addr1.address, ethers.parseEther("500"));
    expect(await cycleToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("500"));
    expect(await cycleToken.balanceOf(owner.address)).to.equal(
      TOTAL_SUPPLY - ethers.parseEther("500")
    );
  });

  it("T8: approve and transferFrom", async function () {
    await cycleToken.approve(addr1.address, ethers.parseEther("100"));
    await cycleToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("100"));
    expect(await cycleToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
  });

  it("T9: cannot transfer more than balance", async function () {
    await expect(
      cycleToken.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(cycleToken, "ERC20InsufficientBalance");
  });

  it("T10: burn reduces supply", async function () {
    await cycleToken.burn(ethers.parseEther("1000"));
    expect(await cycleToken.totalSupply()).to.equal(TOTAL_SUPPLY - ethers.parseEther("1000"));
  });
});
