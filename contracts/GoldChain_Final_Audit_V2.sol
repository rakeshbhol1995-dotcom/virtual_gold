// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Gold Chain Protocol - Final Production V3
 * @notice High-precision Bonding Curve with Automatic Rising Floor (No Manual Mining).
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// --- GOLD TOKEN ---
contract GoldToken is ERC20, Ownable {
    address public minter;
    uint256 public constant MAX_WALLET_LIMIT = 200000 * 10**18; 

    constructor() ERC20("Gold Chain", "GOLD") Ownable(msg.sender) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);
        if (to != address(0) && to != owner() && to != minter) {
            require(balanceOf(to) <= MAX_WALLET_LIMIT, "Exceeds Max Wallet Limit");
        }
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only authorized minter can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == minter, "Only authorized minter can burn");
        _burn(from, amount);
    }
}

// --- GOLD BONDING CURVE ---
contract GoldBondingCurve is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    GoldToken public goldToken;
    IERC20 public collateralToken; 
    
    uint256 public constant SLOPE = 4762; 
    uint256 public constant PRECISION = 10**18;
    
    uint256 public constant MAX_TX_AMOUNT = 50000 * 10**18; 
    uint256 public virtualBasePrice = 10 * 10**6; 
    
    uint256 public constant FEE_PERCENT = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;
    
    address public feeRecipient;
    uint256 public totalVolume;
    uint256 public holdersCount;

    mapping(address => bool) public hasHeld;

    event Bought(address indexed user, uint256 collateralIn, uint256 goldOut, uint256 fee);
    event Sold(address indexed user, uint256 goldIn, uint256 collateralOut, uint256 fee);
    event FloorBoosted(uint256 newBasePrice);

    constructor(address _goldToken, address _collateralToken, address _feeRecipient) Ownable(msg.sender) {
        goldToken = GoldToken(_goldToken);
        collateralToken = IERC20(_collateralToken);
        feeRecipient = _feeRecipient;
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        return virtualBasePrice + (SLOPE * supply / PRECISION);
    }

    function calculateCost(uint256 supply, uint256 amount) public view returns (uint256) {
        uint256 newSupply = supply + amount;
        uint256 term1 = (virtualBasePrice * amount) / PRECISION;
        uint256 squareDifference = (newSupply * newSupply) - (supply * supply);
        uint256 term2 = (SLOPE * squareDifference) / (2 * PRECISION * PRECISION);
        return term1 + term2;
    }

    function getGoldOut(uint256 collateralAmount) public view returns (uint256) {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 netCollateral = collateralAmount - fee;
        if (netCollateral == 0) return 0;

        uint256 supply = goldToken.totalSupply();
        uint256 low = 0;
        uint256 high = (netCollateral * PRECISION) / virtualBasePrice;

        for (uint i = 0; i < 64; i++) {
            uint256 mid = (low + high + 1) / 2;
            if (mid > MAX_TX_AMOUNT) { high = MAX_TX_AMOUNT; continue; }
            if (calculateCost(supply, mid) <= netCollateral) {
                low = mid;
            } else {
                high = mid - 1;
            }
            if (low == high) break;
        }
        return low;
    }

    function getSellProceeds(uint256 goldAmount) public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        if (supply < goldAmount) return 0;
        uint256 rawReturn = calculateCost(supply - goldAmount, goldAmount);
        uint256 fee = (rawReturn * FEE_PERCENT) / BASIS_POINTS;
        return rawReturn - fee;
    }

    function buy(uint256 goldAmount, uint256 maxCollateralIn) external nonReentrant {
        require(goldAmount > 0, "Amount must be > 0");
        require(goldAmount <= MAX_TX_AMOUNT, "Exceeds Max Transaction Limit");

        uint256 supply = goldToken.totalSupply();
        uint256 cost = calculateCost(supply, goldAmount);
        uint256 fee = (cost * FEE_PERCENT) / BASIS_POINTS;
        uint256 totalRequired = cost + fee;
        require(totalRequired <= maxCollateralIn, "Price exceeds limit");
        
        if (!hasHeld[msg.sender]) {
            hasHeld[msg.sender] = true;
            holdersCount++;
        }

        goldToken.mint(msg.sender, goldAmount);
        totalVolume += cost;

        collateralToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // --- AUTOMATIC RISING FLOOR (50% of Fees) ---
        uint256 floorBoost = fee / 2; 
        if (supply + goldAmount > 0) {
            virtualBasePrice += (floorBoost * PRECISION) / (supply + goldAmount);
            emit FloorBoosted(virtualBasePrice);
        }

        // Owner gets the other 50%
        collateralToken.safeTransfer(feeRecipient, fee - floorBoost);

        emit Bought(msg.sender, totalRequired, goldAmount, fee);
    }

    function sell(uint256 goldAmount, uint256 minCollateralOut) external nonReentrant {
        require(goldAmount <= MAX_TX_AMOUNT, "Exceeds Max Transaction Limit");
        uint256 supply = goldToken.totalSupply();
        require(supply >= goldAmount, "Invalid supply");

        uint256 rawReturn = calculateCost(supply - goldAmount, goldAmount);
        uint256 fee = (rawReturn * FEE_PERCENT) / BASIS_POINTS;
        uint256 netReturn = rawReturn - fee;
        require(netReturn >= minCollateralOut, "Slippage too high");

        goldToken.burn(msg.sender, goldAmount);
        totalVolume += rawReturn;

        // 50% of sell fees also boost the floor
        uint256 floorBoost = fee / 2;
        if (supply > goldAmount) {
             virtualBasePrice += (floorBoost * PRECISION) / (supply - goldAmount);
             emit FloorBoosted(virtualBasePrice);
        }

        collateralToken.safeTransfer(msg.sender, netReturn);
        collateralToken.safeTransfer(feeRecipient, fee - floorBoost);

        emit Sold(msg.sender, goldAmount, netReturn, fee);
    }

    function rescueToken(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(collateralToken), "Cannot rescue collateral");
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}
