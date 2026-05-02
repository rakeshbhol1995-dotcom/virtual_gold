// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/GoldToken.sol";
import "../contracts/GoldBondingCurve.sol";
import "../contracts/MockUSDT.sol";

contract GoldBondingCurveTest is Test {
    GoldToken public token;
    GoldBondingCurve public curve;
    MockUSDT public usdt;
    address public admin = address(1);
    address public user = address(2);

    function setUp() public {
        usdt = new MockUSDT();
        token = new GoldToken(admin);
        curve = new GoldBondingCurve(address(token), address(usdt), admin);
        
        vm.prank(admin);
        token.setBondingCurve(address(curve));
        
        // Give user lots of USDT
        usdt.mint(user, 1_000_000 * 10**6);
        vm.prank(user);
        usdt.approve(address(curve), type(uint256).max);
    }

    /**
     * @dev FUZZ TEST: Random amounts of buys and sells.
     * Checks if contract is always solvent.
     */
    function testFuzz_Solvency(uint256 buyAmount) public {
        // Limit buy amount to reasonable range (1 to 100,000 GOLD)
        buyAmount = bound(buyAmount, 1e18, 100_000e18);
        
        // 1. BUY
        vm.prank(user);
        curve.buy(type(uint256).max, buyAmount);
        
        uint256 supply = token.totalSupply();
        uint256 reserve = usdt.balanceOf(address(curve));
        uint256 requiredToRedeemAll = curve.calculateCost(0, supply);

        // ASSERT: Reserve must be >= what is required to pay back all holders
        // Note: Due to fees, reserve will actually be slightly more.
        assertGe(reserve, requiredToRedeemAll, "INSOLVENT: Reserve too low");
        
        // 2. SELL HALF
        uint256 sellAmount = buyAmount / 2;
        vm.prank(user);
        curve.sell(sellAmount, 0);
        
        uint256 newSupply = token.totalSupply();
        uint256 newReserve = usdt.balanceOf(address(curve));
        uint256 newRequired = curve.calculateCost(0, newSupply);
        
        assertGe(newReserve, newRequired, "INSOLVENT after sell");
    }
}
