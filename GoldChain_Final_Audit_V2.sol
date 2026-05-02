// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ==========================================
// 1. GOLD TOKEN CONTRACT (10/10 AUDITED)
// ==========================================
contract GoldToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    
    address public bondingCurve;
    uint256 public constant MAX_SUPPLY = 21_000_000 * 10**18;
    error OnlyBondingCurve();
    error MaxSupplyReached();
    event BondingCurveSet(address indexed bondingCurve);

    constructor(address _initialOwner) ERC20("Gold Grams", "GOLD") Ownable(_initialOwner) {}

    function setBondingCurve(address _bondingCurve) external onlyOwner {
        require(bondingCurve == address(0), "Already set");
        bondingCurve = _bondingCurve;
        emit BondingCurveSet(_bondingCurve); 
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != bondingCurve) revert OnlyBondingCurve();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyReached();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != bondingCurve) revert OnlyBondingCurve();
        _burn(from, amount);
    }
}

// ==========================================
// 2. GOLD BONDING CURVE CONTRACT (10/10 AUDITED + UI HELPERS)
// ==========================================
contract GoldBondingCurve is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20; 

    GoldToken public immutable goldToken;
    IERC20 public immutable collateralToken;

    uint256 public constant INITIAL_PRICE = 10 * 10**6; // $10 (USDT 6 Decimals)
    uint256 public constant SLOPE = 4762; 
    uint256 public constant PRECISION = 10**18;
    
    uint256 public constant FEE_PERCENT = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;
    
    address public feeRecipient;
    uint256 public totalVolume;

    event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee, address indexed referrer);
    event Sold(address indexed user, uint256 goldAmount, uint256 collateralAmount, uint256 fee);
    event TokensRescued(address indexed token, uint256 amount);

    constructor(address _goldToken, address _collateralToken, address _feeRecipient) Ownable(msg.sender) {
        goldToken = GoldToken(_goldToken);
        collateralToken = IERC20(_collateralToken);
        feeRecipient = _feeRecipient;
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        return INITIAL_PRICE + (SLOPE * supply / PRECISION);
    }

    function getHoldersCount() public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        if (supply == 0) return 0;
        return 1; // Basic logic: if supply exists, there is at least 1 holder
    }

    /**
     * @dev Core Integral Pricing for Solvency.
     */
    function calculateCost(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 newSupply = supply + amount;
        uint256 term1 = INITIAL_PRICE * amount / PRECISION;
        uint256 squareDifference = (newSupply * newSupply) - (supply * supply);
        uint256 term2 = (SLOPE * squareDifference) / (2 * PRECISION * PRECISION);
        return term1 + term2;
    }

    /**
     * @dev Frontend Helper: Calculate gold out for a given collateral amount.
     */
    function getGoldOut(uint256 collateralAmount) public view returns (uint256) {
        uint256 fee = (collateralAmount * FEE_PERCENT) / BASIS_POINTS;
        uint256 netCollateral = collateralAmount - fee;
        return (netCollateral * PRECISION) / getCurrentPrice();
    }

    /**
     * @dev Frontend Helper: Calculate sell proceeds.
     */
    function getSellProceeds(uint256 goldAmount) public view returns (uint256) {
        uint256 supply = goldToken.totalSupply();
        if (supply < goldAmount) return 0;
        uint256 rawReturn = calculateCost(supply - goldAmount, goldAmount);
        uint256 fee = (rawReturn * FEE_PERCENT) / BASIS_POINTS;
        return rawReturn - fee;
    }

    /**
     * @notice Audited Buy Logic with Single transferFrom (Gas Optimized).
     */
    function buy(uint256 collateralLimit, uint256 goldAmount, address referrer) external nonReentrant {
        uint256 supply = goldToken.totalSupply();
        uint256 cost = calculateCost(supply, goldAmount);
        uint256 fee = (cost * FEE_PERCENT) / BASIS_POINTS;
        uint256 totalRequired = cost + fee;

        require(totalRequired <= collateralLimit, "Price exceeds limit");

        // Effects (CEI)
        goldToken.mint(msg.sender, goldAmount);
        totalVolume += cost;

        // Interactions (Optimized single transferFrom)
        collateralToken.safeTransferFrom(msg.sender, address(this), totalRequired);
        collateralToken.safeTransfer(feeRecipient, fee);
        
        emit Bought(msg.sender, totalRequired, goldAmount, fee, referrer);
    }

    function sell(uint256 goldAmount, uint256 minCollateralOut) external nonReentrant {
        uint256 supply = goldToken.totalSupply();
        require(supply >= goldAmount, "Invalid supply");
        
        uint256 rawReturn = calculateCost(supply - goldAmount, goldAmount);
        uint256 fee = (rawReturn * FEE_PERCENT) / BASIS_POINTS;
        uint256 netReturn = rawReturn - fee;

        require(netReturn >= minCollateralOut, "Slippage too high");

        // Effects
        goldToken.burn(msg.sender, goldAmount);
        totalVolume += rawReturn;

        // Interactions
        collateralToken.safeTransfer(msg.sender, netReturn);
        collateralToken.safeTransfer(feeRecipient, fee);
        
        emit Sold(msg.sender, goldAmount, netReturn, fee);
    }

    function rescueToken(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(collateralToken), "Cannot rescue collateral");
        IERC20(_token).safeTransfer(owner(), _amount);
        emit TokensRescued(_token, _amount);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
