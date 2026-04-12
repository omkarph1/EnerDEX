const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EToken", function () {

  let token;
  let owner;
  let alice;
  let bob;

  // This runs before every test — deploys a fresh contract
  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const EToken = await ethers.getContractFactory("EToken");
    token = await EToken.deploy();
    await token.waitForDeployment();
  });

  // Test 1
  it("Should give 1000 ETK to deployer at launch", async function () {
    const balance = await token.balanceOf(owner.address);
    const expected = ethers.parseUnits("1000", 18);
    expect(balance).to.equal(expected);
  });

  // Test 2
  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("EnergyToken");
    expect(await token.symbol()).to.equal("ETK");
  });

  // Test 3
  it("Owner can mint tokens to any address", async function () {
    await token.mint(alice.address, 500);
    const balance = await token.balanceOf(alice.address);
    const expected = ethers.parseUnits("500", 18);
    expect(balance).to.equal(expected);
  });

  // Test 4
  it("Non-owner cannot mint tokens", async function () {
    await expect(
      token.connect(alice).mint(bob.address, 100)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

});