// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../GoldChain_Final_Audit_V2.sol";
import "../contracts/MockUSDT.sol";

contract DeployV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDT (for testing on Base Sepolia)
        MockUSDT usdt = new MockUSDT();
        console.log("MockUSDT deployed at:", address(usdt));

        // 2. Deploy Gold Token (V2 with 21M Cap)
        GoldToken gold = new GoldToken(deployerAddress);
        console.log("GoldToken V2 deployed at:", address(gold));

        // 3. Deploy Bonding Curve (V2)
        GoldBondingCurve bondingCurve = new GoldBondingCurve(address(gold), address(usdt), deployerAddress);
        console.log("GoldBondingCurve V2 deployed at:", address(bondingCurve));

        // 4. Setup permissions
        gold.setBondingCurve(address(bondingCurve));

        console.log("-----------------------------------------");
        console.log("V2 (21M SUPPLY CAP) DEPLOYMENT COMPLETE!");
        console.log("GOLD TOKEN V2:", address(gold));
        console.log("BONDING CURVE V2:", address(bondingCurve));
        console.log("USDT (MOCK):", address(usdt));
        console.log("-----------------------------------------");

        vm.stopBroadcast();
    }
}
