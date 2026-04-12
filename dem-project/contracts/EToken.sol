// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EToken is ERC20, Ownable {
    
    constructor() ERC20("EnergyToken", "ETK") Ownable(msg.sender) {
        // Mint 1000 ETK to the deployer at launch
        // 1 ETK = 1 kWh of energy
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    // Only the owner (admin) can mint new tokens
    // This prevents anyone from creating fake energy tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10 ** decimals());
    }
}