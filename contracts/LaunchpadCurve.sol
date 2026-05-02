// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LaunchpadToken.sol";

/**
 * @title LaunchpadCurve
 * @dev Bonding curve for each token launched via TokenFactory.
 *
 * Fee structure:
 *   - 0.3% on every buy  -> protocol treasury (feeRecipient)
 *   - 0.3% on every sell -> protocol treasury (feeRecipient)
 *
 * Graduation:
 *   Once GRADUATION_TARGET USDT is raised, the token is marked
 *   as graduated. The factory owner can then add liquidity to a DEX.
 *
 * L1 Migration ready:
 *   - feeRecipient is settable -> can point to bridge contract on new L1
 *   - graduated flag signals DEX listing readiness
 */
contract LaunchpadCurve is ReentrancyGuard {
    LaunchpadToken public immutable token;
    IERC20 public immutable collateral; // USDT

    address public feeRecipient;
    address public factory;

    // ─── Curve params ────────────────────────────────────────
    uint256 public constant INITIAL_PRICE    = 1 * 10**3;  // $0.001 USDT (6 decimals)
    uint256 public constant PRICE_INCREMENT  = 1 * 10**1;  // tiny increment per token
    uint256 public constant PRECISION        = 1e18;
    uint256 public constant FEE_BPS          = 30;         // 0.3%
    uint256 public constant BASIS_POINTS     = 10000;
    uint256 public constant GRADUATION_TARGET = 10_000 * 10**6; // $10,000 USDT

    // ─── State ───────────────────────────────────────────────
    uint256 public totalRaised;
    bool    public graduated;
    uint256 public totalVolume;
    uint256 public tradeCount;

    // ─── Events ──────────────────────────────────────────────
    event Bought(address indexed user, uint256 collateralIn, uint256 tokensOut, uint256 fee);
    event Sold(address indexed user, uint256 tokensIn, uint256 collateralOut, uint256 fee);
    event Graduated(uint256 totalRaised, uint256 timestamp);

    constructor(
        address _token,
        address _collateral,
        address _feeRecipient,
        address _factory
    ) {
        token        = LaunchpadToken(_token);
        collateral   = IERC20(_collateral);
        feeRecipient = _feeRecipient;
        factory      = _factory;
    }

    // ─── View: Current Price ─────────────────────────────────
    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = token.totalSupply();
        return INITIAL_PRICE + (PRICE_INCREMENT * supply / PRECISION);
    }

    function getTokensOut(uint256 collateralAmount) public view returns (uint256) {
        uint256 fee           = (collateralAmount * FEE_BPS) / BASIS_POINTS;
        uint256 afterFee      = collateralAmount - fee;
        uint256 currentPrice  = getCurrentPrice();
        return (afterFee * PRECISION) / currentPrice;
    }

    function getSellProceeds(uint256 tokenAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        uint256 gross        = (tokenAmount * currentPrice) / PRECISION;
        uint256 fee          = (gross * FEE_BPS) / BASIS_POINTS;
        return gross - fee;
    }

    function bondingProgress() public view returns (uint256) {
        if (graduated) return 100;
        return (totalRaised * 100) / GRADUATION_TARGET;
    }

    // ─── Buy ─────────────────────────────────────────────────
    function buy(uint256 collateralAmount, uint256 minTokensOut) external nonReentrant {
        require(!graduated, "Token graduated - trade on DEX");
        require(collateralAmount > 0, "Amount must be > 0");

        uint256 fee      = (collateralAmount * FEE_BPS) / BASIS_POINTS;
        uint256 afterFee = collateralAmount - fee;

        uint256 price      = getCurrentPrice();
        uint256 tokensOut  = (afterFee * PRECISION) / price;
        require(tokensOut >= minTokensOut, "Slippage too high");

        // Transfer collateral: afterFee -> this contract, fee -> treasury
        require(collateral.transferFrom(msg.sender, address(this), afterFee), "Transfer failed");
        require(collateral.transferFrom(msg.sender, feeRecipient, fee), "Fee failed");

        token.mint(msg.sender, tokensOut);

        totalRaised  += afterFee;
        totalVolume  += collateralAmount;
        tradeCount   += 1;

        emit Bought(msg.sender, collateralAmount, tokensOut, fee);

        // Check graduation
        if (totalRaised >= GRADUATION_TARGET && !graduated) {
            graduated = true;
            emit Graduated(totalRaised, block.timestamp);
        }
    }

    // ─── Sell ────────────────────────────────────────────────
    function sell(uint256 tokenAmount, uint256 minCollateralOut) external nonReentrant {
        require(!graduated, "Token graduated - trade on DEX");
        require(tokenAmount > 0, "Amount must be > 0");

        uint256 price        = getCurrentPrice();
        uint256 gross        = (tokenAmount * price) / PRECISION;
        uint256 fee          = (gross * FEE_BPS) / BASIS_POINTS;
        uint256 collateralOut = gross - fee;

        require(collateralOut >= minCollateralOut, "Slippage too high");

        token.burn(msg.sender, tokenAmount);

        require(collateral.transfer(msg.sender, collateralOut), "Transfer failed");
        require(collateral.transfer(feeRecipient, fee), "Fee failed");

        totalVolume += gross;
        tradeCount  += 1;

        emit Sold(msg.sender, tokenAmount, collateralOut, fee);
    }

    // ─── Admin: withdraw raised funds after graduation ───────
    function withdrawGraduated(address to) external {
        require(msg.sender == factory, "Only factory");
        require(graduated, "Not graduated yet");
        uint256 bal = collateral.balanceOf(address(this));
        require(collateral.transfer(to, bal), "Withdraw failed");
    }
}
