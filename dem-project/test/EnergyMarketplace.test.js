const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyMarketplace", function () {

  let token;
  let marketplace;
  let owner;
  let seller;
  let buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy EToken
    const EToken = await ethers.getContractFactory("EToken");
    token = await EToken.deploy();
    await token.waitForDeployment();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("EnergyMarketplace");
    marketplace = await Marketplace.deploy(await token.getAddress());
    await marketplace.waitForDeployment();

    // Mint 500 ETK to seller
    await token.mint(seller.address, 500);

    // Seller approves marketplace to move their ETK
    await token.connect(seller).approve(
      await marketplace.getAddress(),
      ethers.parseUnits("500", 18)
    );
  });

  // Test 1
  it("Should list energy and lock ETK in escrow", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    const listing = await marketplace.getListing(0);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.amountETK).to.equal(10);
    expect(listing.isActive).to.equal(true);
  });

  // Test 2
  it("Should transfer ETK to buyer and ETH to seller on purchase", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));

    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.05")
    });

    const buyerTokenBalance = await token.balanceOf(buyer.address);
    expect(buyerTokenBalance).to.equal(ethers.parseUnits("10", 18));

    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
  });

  // Test 3
  it("Should deduct 2% fee from seller payment", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.1"));
    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.1")
    });
    const fees = await marketplace.collectedFees();
    expect(fees).to.equal(ethers.parseEther("0.002")); // 2% of 0.1
  });

  // Test 4
  it("Should award loyalty points to both buyer and seller", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.05")
    });
    expect(await marketplace.loyaltyPoints(buyer.address)).to.equal(10);
    expect(await marketplace.loyaltyPoints(seller.address)).to.equal(10);
  });

  // Test 5
  it("Should apply 10% discount when buyer has 10+ loyalty points", async function () {
    // First trade to earn 10 points
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.1"));
    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.1")
    });

    // Approve more tokens for second listing
    await token.connect(seller).approve(
      await marketplace.getAddress(),
      ethers.parseUnits("500", 18)
    );

    // Second trade — buyer now has 10 points = 10% discount
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.1"));
    await marketplace.connect(buyer).buyEnergy(1, {
      value: ethers.parseEther("0.1")
    });

    const fees = await marketplace.collectedFees();
    // First trade fee: 0.002 ETH (no discount)
    // Second trade fee: 0.0018 ETH (10% discount on 2%)
    expect(fees).to.equal(ethers.parseEther("0.0038"));
  });

  // Test 6
  it("Should cancel listing and return ETK to seller", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    const balanceBefore = await token.balanceOf(seller.address);
    await marketplace.connect(seller).cancelListing(0);
    const balanceAfter = await token.balanceOf(seller.address);
    expect(balanceAfter).to.be.gt(balanceBefore);

    const listing = await marketplace.getListing(0);
    expect(listing.isActive).to.equal(false);
  });

  // Test 7
  it("Should prevent buying an inactive listing", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.05")
    });
    await expect(
      marketplace.connect(buyer).buyEnergy(0, {
        value: ethers.parseEther("0.05")
      })
    ).to.be.revertedWith("Listing is not active");
  });

  // Test 8
  it("Should prevent seller from buying own listing", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    await expect(
      marketplace.connect(seller).buyEnergy(0, {
        value: ethers.parseEther("0.05")
      })
    ).to.be.revertedWith("Seller cannot buy own listing");
  });

  // Test 9
  it("Should revert if wrong ETH amount sent", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.05"));
    await expect(
      marketplace.connect(buyer).buyEnergy(0, {
        value: ethers.parseEther("0.03")
      })
    ).to.be.revertedWith("Incorrect ETH amount");
  });

  // Test 10
  it("Owner can withdraw collected fees", async function () {
    await marketplace.connect(seller).listEnergy(10, ethers.parseEther("0.1"));
    await marketplace.connect(buyer).buyEnergy(0, {
      value: ethers.parseEther("0.1")
    });
    const ownerBefore = await ethers.provider.getBalance(owner.address);
    await marketplace.connect(owner).withdrawFees();
    const ownerAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerAfter).to.be.gt(ownerBefore);
  });

});