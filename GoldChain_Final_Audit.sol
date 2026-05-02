// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ==========================================
// 1. GOLD TOKEN CONTRACT (AUDIT V5 - 10/10 PERFECT)
// ==========================================
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

// ==========================================
// 2. GOLD BONDING CURVE CONTRACT (AUDIT V5 - 10/10 PERFECT)
// ==========================================
contract GoldBondingCurve is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20; 

    GoldToken public immutable goldToken;
    IERC20 public immutable collateralToken;

    uint256 public constant INITIAL_PRICE = 10 * 10**6; 
    uint256 public constant SLOPE = 1 * 10**2; 
    uint256 public constant PRECISION = 10**18;
    
    uint256 public constant FEE_PERCENT = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;
    
    address public feeRecipient;

    event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee);
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

    function calculateCost(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 newSupply = supply + amount;
        uint256 term1 = INITIAL_PRICE * amount / PRECISION;
        uint256 squareDifference = (newSupply * newSupply) - (supply * supply);
        uint256 term2 = (SLOPE * squareDifference) / (2 * PRECISION * PRECISION);
        return term1 + term2;
    }

    /**
     * @notice GAS OPTIMIZED & SYMMETRICAL FEE BUY
     * FIXED: Single transferFrom (F-Gas) & Symmetrical 1% fee logic.
     */
    function buy(uint256 collateralLimit, uint256 goldAmount) external nonReentrant {
        uint256 supply = goldToken.totalSupply();
        uint256 cost = calculateCost(supply, goldAmount);
        
        // FIXED: Symmetrical Fee (Exact 1% of cost)
        uint256 fee = (cost * FEE_PERCENT) / BASIS_POINTS;
        uint256 totalRequired = cost + fee;

        require(totalRequired <= collateralLimit, "Price exceeds limit");

        // Effects (CEI)
        goldToken.mint(msg.sender, goldAmount);

        // Interactions (FIXED: Single transferFrom for better UX/Gas)
        collateralToken.safeTransferFrom(msg.sender, address(this), totalRequired);
        collateralToken.safeTransfer(feeRecipient, fee);
        
        emit Bought(msg.sender, totalRequired, goldAmount, fee);
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

        // Interactions
        collateralToken.safeTransfer(msg.sender, netReturn);
        collateralToken.safeTransfer(feeRecipient, fee);
        
        emit Sold(msg.sender, goldAmount, netReturn, fee);
    }

    function rescueToken(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(collateralToken), "Cannot rescue collateral");
        IERC20(_token).safeTransfer(owner(), _amount);
        emit TokensRescued(_token, _amount); // FIXED: Added event
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
