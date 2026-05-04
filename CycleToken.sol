// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CycleToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Cycle Token", "CYCLE")
        Ownable(initialOwner)
    {
        // Mint 100,000,000 CYCLE to the deployer
        _mint(initialOwner, 100_000_000 * 10 ** decimals());
    }

    // Owner can mint more if needed (for rewards pool, etc.)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}