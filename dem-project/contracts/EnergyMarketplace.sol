// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EToken.sol";

contract EnergyMarketplace is Ownable {

    EToken public energyToken;

    // ─── Structs ───────────────────────────────────────────
    struct Listing {
        address seller;
        uint256 amountETK;
        uint256 priceWei;
        bool isActive;
    }

    // ─── State Variables ───────────────────────────────────
    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => uint256) public loyaltyPoints;
    uint256 public collectedFees;

    uint256 public constant FEE_PERCENT = 2;
    uint256 public constant POINTS_PER_TRADE = 10;

    // ─── Events ────────────────────────────────────────────
    event EnergyListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amountETK,
        uint256 priceWei
    );

    event EnergyTraded(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 amountETK,
        uint256 priceWei
    );

    event ListingCancelled(uint256 indexed listingId);

    // ─── Constructor ───────────────────────────────────────
    constructor(address tokenAddress) Ownable(msg.sender) {
        energyToken = EToken(tokenAddress);
    }

    // ─── Get Loyalty Discount ──────────────────────────────
    function getDiscount(address user) public view returns (uint256) {
        uint256 pts = loyaltyPoints[user];
        if (pts >= 100) return 50;
        if (pts >= 50)  return 25;
        if (pts >= 10)  return 10;
        return 0;
    }

    // ─── List Energy for Sale ──────────────────────────────
    function listEnergy(uint256 amountETK, uint256 priceWei) external {
        require(amountETK > 0, "Amount must be greater than 0");
        require(priceWei > 0, "Price must be greater than 0");

        // Pull tokens from seller into escrow (this contract)
        energyToken.transferFrom(
            msg.sender,
            address(this),
            amountETK * 10 ** 18
        );

        listings[listingCount] = Listing({
            seller: msg.sender,
            amountETK: amountETK,
            priceWei: priceWei,
            isActive: true
        });

        emit EnergyListed(listingCount, msg.sender, amountETK, priceWei);
        listingCount++;
    }

    // ─── Buy Energy ────────────────────────────────────────
    function buyEnergy(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];

        require(listing.isActive, "Listing is not active");
        require(msg.sender != listing.seller, "Seller cannot buy own listing");
        require(msg.value == listing.priceWei, "Incorrect ETH amount");

        // Calculate fee with loyalty discount
        uint256 discount = getDiscount(msg.sender);
        uint256 fee = (listing.priceWei * FEE_PERCENT * (100 - discount)) / 10000;
        uint256 sellerAmount = listing.priceWei - fee;

        // Mark inactive BEFORE transfers (security best practice)
        listing.isActive = false;
        collectedFees += fee;

        // Transfer ETK to buyer
        energyToken.transfer(msg.sender, listing.amountETK * 10 ** 18);

        // Transfer ETH to seller
        (bool sent, ) = listing.seller.call{value: sellerAmount}("");
        require(sent, "ETH transfer failed");

        // Award loyalty points to both parties
        loyaltyPoints[msg.sender] += POINTS_PER_TRADE;
        loyaltyPoints[listing.seller] += POINTS_PER_TRADE;

        emit EnergyTraded(
            listingId,
            msg.sender,
            listing.seller,
            listing.amountETK,
            listing.priceWei
        );
    }

    // ─── Cancel Listing ────────────────────────────────────
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        require(listing.isActive, "Listing is not active");
        require(msg.sender == listing.seller, "Only seller can cancel");

        listing.isActive = false;

        // Return ETK back to seller
        energyToken.transfer(msg.sender, listing.amountETK * 10 ** 18);

        emit ListingCancelled(listingId);
    }

    // ─── Owner Withdraw Fees ───────────────────────────────
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "Withdrawal failed");
    }

    // ─── View Listing ──────────────────────────────────────
    function getListing(uint256 listingId) external view returns (
        address seller,
        uint256 amountETK,
        uint256 priceWei,
        bool isActive
    ) {
        Listing storage l = listings[listingId];
        return (l.seller, l.amountETK, l.priceWei, l.isActive);
    }
}