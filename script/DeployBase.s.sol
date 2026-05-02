// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GoldToken.sol";
import "../contracts/GoldBondingCurve.sol";
import "../contracts/GoldFutures.sol";
import "../contracts/MockUSDT.sol";

contract DeployBase is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDT
        MockUSDT usdt = new MockUSDT();
        console.log("MockUSDT deployed at:", address(usdt));

        // 2. Deploy Gold Token
        GoldToken gold = new GoldToken(deployerAddress);
        console.log("GoldToken deployed at:", address(gold));

        // 3. Deploy Bonding Curve (Admin is deployerAddress)
        GoldBondingCurve bondingCurve = new GoldBondingCurve(address(gold), address(usdt), deployerAddress);
        console.log("GoldBondingCurve deployed at:", address(bondingCurve));

        // 4. Deploy Futures Engine
        GoldFutures futures = new GoldFutures(address(bondingCurve), address(usdt), deployerAddress);
        console.log("GoldFutures deployed at:", address(futures));

        // 5. Setup permissions
        gold.setBondingCurve(address(bondingCurve));

        console.log("Initial Setup Complete on Base!");

        vm.stopBroadcast();
    }
}
