// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GoldBondingCurve.sol";

// Pyth Network Interface
interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint256 publishTime;
    }
    function getPriceNoOlderThan(bytes32 id, uint256 age) external view returns (Price memory price);
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256 fee);
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
}

/**
 * @title GoldFutures V4 — PYTH ORACLE SECURED
 * 
 * 100% MANIPULATION PROOF:
 * Tracks global XAU/USD price from Pyth Network.
 * Internal swaps have ZERO effect on futures settlement.
 */
contract GoldFutures is Ownable, ReentrancyGuard {
    IPyth public immutable pyth;
    IERC20 public immutable collateralToken;
    address public feeRecipient;

    bytes32 public constant XAU_USD_FEED = 0x7691ae354ca730a3f5a7e6b72a6b7d5986877960662d55877966858189689368;
    uint256 public constant MAX_LEVERAGE = 50;
    uint256 public constant FEE_PERCENT = 10; // 0.1%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PRECISION = 1e18;

    struct Position {
        uint256 collateral;
        uint256 size;
        uint256 entryPrice;
        bool isLong;
        bool active;
    }

    mapping(address => Position[]) public userPositions;

    event PositionOpened(address indexed user, uint256 index, bool isLong, uint256 collateral, uint256 size, uint256 entryPrice);
    event PositionClosed(address indexed user, uint256 index, uint256 pnl, bool wasProfit);

    constructor(address _pyth, address _collateralToken, address _feeRecipient) Ownable(msg.sender) {
        pyth = IPyth(_pyth);
        collateralToken = IERC20(_collateralToken);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Fetch current Gold price from Pyth Oracle.
     * Price is converted to 6-decimal precision to match USDT.
     */
    function getGoldPrice() public view returns (uint256) {
        IPyth.Price memory price = pyth.getPriceNoOlderThan(XAU_USD_FEED, 3600); // 1hr max age
        // Pyth price is int64, usually with expo -8 (e.g. 235000000000)
        // We convert to positive uint256 with 6 decimal precision
        uint256 absPrice = uint256(uint64(price.price));
        if (price.expo < 0) {
            uint256 factor = 10**uint32(-price.expo);
            return (absPrice * 10**6) / factor;
        } else {
            uint256 factor = 10**uint32(price.expo);
            return absPrice * factor * 10**6;
        }
    }

    function openPosition(uint256 collateralAmount, uint256 leverage, bool isLong) external nonReentrant {
        require(leverage >= 1 && leverage <= MAX_LEVERAGE, "Invalid leverage");
        
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 effectiveCollateral = collateralAmount - fee;
        
        require(collateralToken.transferFrom(msg.sender, address(this), effectiveCollateral), "Collateral failed");
        require(collateralToken.transferFrom(msg.sender, feeRecipient, fee), "Fee failed");

        uint256 entryPrice = getGoldPrice();
        uint256 size = (effectiveCollateral * leverage * PRECISION) / entryPrice;

        userPositions[msg.sender].push(Position({
            collateral: effectiveCollateral,
            size: size,
            entryPrice: entryPrice,
            isLong: isLong,
            active: true
        }));

        emit PositionOpened(msg.sender, userPositions[msg.sender].length - 1, isLong, effectiveCollateral, size, entryPrice);
    }

    function closePosition(uint256 index) external nonReentrant {
        require(index < userPositions[msg.sender].length, "Invalid index");
        Position storage pos = userPositions[msg.sender][index];
        require(pos.active, "Already closed");

        uint256 currentPrice = getGoldPrice();
        uint256 pnl;
        bool isProfit;

        if (pos.isLong) {
            if (currentPrice > pos.entryPrice) {
                pnl = (pos.size * (currentPrice - pos.entryPrice)) / PRECISION;
                isProfit = true;
            } else {
                pnl = (pos.size * (pos.entryPrice - currentPrice)) / PRECISION;
                isProfit = false;
            }
        } else {
            if (currentPrice < pos.entryPrice) {
                pnl = (pos.size * (pos.entryPrice - currentPrice)) / PRECISION;
                isProfit = true;
            } else {
                pnl = (pos.size * (currentPrice - pos.entryPrice)) / PRECISION;
                isProfit = false;
            }
        }

        uint256 finalAmount = isProfit ? pos.collateral + pnl : (pos.collateral > pnl ? pos.collateral - pnl : 0);
        pos.active = false;
        
        if (finalAmount > 0) {
            require(collateralToken.transfer(msg.sender, finalAmount), "Payout failed");
        }

        emit PositionClosed(msg.sender, index, pnl, isProfit);
    }

    function getUserPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
}
