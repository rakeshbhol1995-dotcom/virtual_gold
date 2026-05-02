// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GoldFutures.sol";

contract DeployFuturesUpgrade is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        address pyth = 0xa2Aa501B19AFF2D01826548486199617529f21d9;
        address usdt = 0xb90Ec2984F904e743ac4138D11740cF0911F5a42;

        GoldFutures futures = new GoldFutures(pyth, usdt, deployerAddress);
        console.log("New GoldFutures deployed at:", address(futures));

        vm.stopBroadcast();
    }
}
