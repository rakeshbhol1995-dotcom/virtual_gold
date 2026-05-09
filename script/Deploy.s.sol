// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../GoldChain_Final_Audit_V2.sol";

contract DeployGoldChain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address collateralToken = 0x526d075C81cb3451B436943BF999667Ba659ffC8;
        address feeRecipient = vm.addr(deployerPrivateKey);

        // 1. Deploy GoldToken
        GoldToken goldToken = new GoldToken();
        console.log("GoldToken deployed at:", address(goldToken));

        // 2. Deploy GoldBondingCurve
        GoldBondingCurve bondingCurve = new GoldBondingCurve(
            address(goldToken),
            collateralToken,
            feeRecipient
        );
        console.log("GoldBondingCurve deployed at:", address(bondingCurve));

        // 3. Authorize Minter
        goldToken.setMinter(address(bondingCurve));
        console.log("Minter authorized!");

        vm.stopBroadcast();
    }
}
