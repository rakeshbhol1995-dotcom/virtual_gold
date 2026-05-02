// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GoldToken.sol";

contract GoldBondingCurve is Ownable {
    GoldToken public immutable goldToken;
    IERC20 public immutable collateralToken; // USDT/USDC

    uint256 public constant INITIAL_PRICE = 10 * 10**6; // $10
    uint256 public constant PRICE_INCREMENT = 1 * 10**2; 
    uint256 public constant PRECISION = 10**18;
    
    uint256 public constant FEE_PERCENT = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;
    
    address public feeRecipient;

    event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee, address indexed referrer);
    event Sold(address indexed user, uint256 goldAmount, uint256 collateralAmount, uint256 fee);

    constructor(address _goldToken, address _collateralToken, address _feeRecipient) Ownable(msg.sender) {
        goldToken = GoldToken(_goldToken);
        collateralToken = IERC20(_collateralToken);
        feeRecipient = _feeRecipient;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        return INITIAL_PRICE + (PRICE_INCREMENT * supply / PRECISION);
    }

    function getGoldOut(uint256 collateralAmount) public view returns (uint256) {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 collateralAfterFee = collateralAmount - fee;
        uint256 currentPrice = getCurrentPrice();
        return (collateralAfterFee * PRECISION) / currentPrice;
    }

    function getSellProceeds(uint256 goldAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        uint256 totalCollateral = (goldAmount * currentPrice) / PRECISION;
        uint256 fee = (totalCollateral * FEE_PERCENT) / BASIS_POINTS;
        return totalCollateral - fee;
    }

    function buy(uint256 collateralAmount, uint256 minGoldOut, address referrer) external {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 collateralAfterFee = collateralAmount - fee;
        
        uint256 currentPrice = getCurrentPrice();
        uint256 goldToMint = (collateralAfterFee * PRECISION) / currentPrice;
        
        require(goldToMint >= minGoldOut, "Slippage too high");
        
        collateralToken.transferFrom(msg.sender, address(this), collateralAfterFee);
        collateralToken.transferFrom(msg.sender, feeRecipient, fee); // Direct 1% tax to admin
        
        goldToken.mint(msg.sender, goldToMint);
        
        emit Bought(msg.sender, collateralAmount, goldToMint, fee, referrer);
    }

    function systemBuyAndBurn(uint256 collateralAmount) external {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 collateralAfterFee = collateralAmount - fee;
        
        uint256 currentPrice = getCurrentPrice();
        uint256 goldToMint = (collateralAfterFee * PRECISION) / currentPrice;
        
        // Transfer collateral from the calling contract
        collateralToken.transferFrom(msg.sender, address(this), collateralAfterFee);
        collateralToken.transferFrom(msg.sender, feeRecipient, fee); // Admin still gets 1%
        
        // Mint to dead address to increase total supply and pump price
        goldToken.mint(address(0xdead), goldToMint);
        
        emit Bought(address(0xdead), collateralAmount, goldToMint, fee, address(0));
    }

    function sell(uint256 goldAmount, uint256 minCollateralOut) external {
        uint256 currentPrice = getCurrentPrice();
        uint256 totalCollateral = (goldAmount * currentPrice) / PRECISION;
        
        uint256 fee = (totalCollateral * FEE_PERCENT) / BASIS_POINTS;
        uint256 collateralToReturn = totalCollateral - fee;
        
        require(collateralToReturn >= minCollateralOut, "Slippage too high");
        
        goldToken.burn(msg.sender, goldAmount);
        collateralToken.transfer(msg.sender, collateralToReturn);
        collateralToken.transfer(feeRecipient, fee); // Direct 1% tax to admin
        
        emit Sold(msg.sender, goldAmount, collateralToReturn, fee);
    }
    
    // NO WITHDRAW FUNCTION FOR RESERVE - RUG PROOF!
}
