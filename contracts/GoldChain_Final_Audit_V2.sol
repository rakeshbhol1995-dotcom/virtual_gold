// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    
    // Aggressive Slope for High Volatility
    uint256 public constant SLOPE = 4762; 
    uint256 public constant PRECISION = 10**18;
    uint256 public constant COLLATERAL_PRECISION = 10**6;
    
    uint256 public constant MAX_TX_AMOUNT = 50000 * 10**18; 
    uint256 public virtualBasePrice = 10 * COLLATERAL_PRECISION; 
    
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

    /**
     * @notice Returns current price per Gram in USDT (6 decimals)
     */
    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        // Price = P0 + (SLOPE * Supply)
        return virtualBasePrice + (SLOPE * supply / PRECISION);
    }

    /**
     * @notice Integral of the linear curve: Area = P0*x + (SLOPE * x^2 / 2)
     */
    function calculateCost(uint256 supply, uint256 amount) public view returns (uint256) {
        uint256 newSupply = supply + amount;
        
        // term1 = P0 * amount
        uint256 term1 = (virtualBasePrice * amount) / PRECISION;
        
        // term2 = (SLOPE * (newSupply^2 - supply^2)) / (2 * PRECISION)
        // We use higher precision for intermediate calculation to avoid floor errors
        uint256 squareDiff = (newSupply * newSupply / PRECISION) - (supply * supply / PRECISION);
        uint256 term2 = (SLOPE * squareDiff) / (2 * PRECISION);
        
        return term1 + term2;
    }

    function getGoldOut(uint256 collateralAmount) public view returns (uint256) {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 netCollateral = collateralAmount - fee;
        if (netCollateral == 0) return 0;

        uint256 supply = goldToken.totalSupply();
        uint256 low = 0;
        uint256 high = MAX_TX_AMOUNT;

        // Binary search for exact gold amount
        for (uint i = 0; i < 64; i++) {
            uint256 mid = (low + high + 1) / 2;
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
        require(goldAmount > 0 && goldAmount <= MAX_TX_AMOUNT, "Invalid amount");

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

        // Rising Floor: 50% of fees permanent price increase
        uint256 floorBoost = fee / 2; 
        uint256 currentSupply = goldToken.totalSupply();
        if (currentSupply > 0) {
            virtualBasePrice += (floorBoost * PRECISION) / currentSupply;
            emit FloorBoosted(virtualBasePrice);
        }

        collateralToken.safeTransfer(feeRecipient, fee - floorBoost);
        emit Bought(msg.sender, totalRequired, goldAmount, fee);
    }

    function sell(uint256 goldAmount, uint256 minCollateralOut) external nonReentrant {
        require(goldAmount > 0 && goldAmount <= MAX_TX_AMOUNT, "Invalid amount");
        uint256 supply = goldToken.totalSupply();
        require(supply >= goldAmount, "Invalid supply");

        uint256 rawReturn = calculateCost(supply - goldAmount, goldAmount);
        uint256 fee = (rawReturn * FEE_PERCENT) / BASIS_POINTS;
        uint256 netReturn = rawReturn - fee;
        require(netReturn >= minCollateralOut, "Slippage too high");

        goldToken.burn(msg.sender, goldAmount);
        totalVolume += rawReturn;

        uint256 floorBoost = fee / 2;
        uint256 remainingSupply = goldToken.totalSupply();
        if (remainingSupply > 0) {
             virtualBasePrice += (floorBoost * PRECISION) / remainingSupply;
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
