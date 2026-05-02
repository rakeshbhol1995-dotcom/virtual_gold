// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/TokenFactory.sol";

contract DeployLaunchpad is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress    = vm.addr(deployerPrivateKey);

        // Existing deployed addresses on Base Sepolia
        address usdt = 0xb90Ec2984F904e743ac4138D11740cF0911F5a42;

        vm.startBroadcast(deployerPrivateKey);

        TokenFactory factory = new TokenFactory(
            usdt,
            deployerAddress // fee recipient = deployer (change to treasury later)
        );

        console.log("=== GOLD CHAIN LAUNCHPAD DEPLOYED ===");
        console.log("TokenFactory:", address(factory));
        console.log("Collateral (USDT):", usdt);
        console.log("Fee Recipient:", deployerAddress);
        console.log("Launch Fee:", factory.launchFeeNative(), "wei (0.01 ETH)");

        vm.stopBroadcast();
    }
}
