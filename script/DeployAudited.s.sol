// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GoldToken.sol";
import "../contracts/GoldBondingCurve.sol";
import "../contracts/MockUSDT.sol";

contract DeployAudited is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDT (for testing)
        MockUSDT usdt = new MockUSDT();
        console.log("MockUSDT deployed at:", address(usdt));

        // 2. Deploy Gold Token
        GoldToken gold = new GoldToken(deployerAddress);
        console.log("GoldToken deployed at:", address(gold));

        // 3. Deploy Bonding Curve (10/10 Audited Version)
        GoldBondingCurve bondingCurve = new GoldBondingCurve(address(gold), address(usdt), deployerAddress);
        console.log("GoldBondingCurve deployed at:", address(bondingCurve));

        // 4. Setup permissions
        gold.setBondingCurve(address(bondingCurve));

        console.log("-----------------------------------------");
        console.log("FINAL AUDITED DEPLOYMENT COMPLETE!");
        console.log("GOLD TOKEN:", address(gold));
        console.log("BONDING CURVE:", address(bondingCurve));
        console.log("USDT (MOCK):", address(usdt));
        console.log("-----------------------------------------");

        vm.stopBroadcast();
    }
}
