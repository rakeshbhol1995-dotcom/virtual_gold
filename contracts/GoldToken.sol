// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoldToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    
    address public bondingCurve;
    error OnlyBondingCurve();
    event BondingCurveSet(address indexed bondingCurve);

    constructor(address _initialOwner) ERC20("Gold Grams", "GOLD") Ownable(_initialOwner) {}

    function setBondingCurve(address _bondingCurve) external onlyOwner {
        require(bondingCurve == address(0), "Already set");
        bondingCurve = _bondingCurve;
        emit BondingCurveSet(_bondingCurve); 
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != bondingCurve) revert OnlyBondingCurve();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != bondingCurve) revert OnlyBondingCurve();
        _burn(from, amount);
    }
}
