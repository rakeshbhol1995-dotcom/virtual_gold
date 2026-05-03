// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GoldChain_Final_Audit_V2.sol";

contract DeployFinal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Token
        GoldToken token = new GoldToken();
        
        // 2. Deploy Curve
        // _goldToken, _collateralToken (Mock USDT), _feeRecipient (Deployer)
        address collateralToken = 0x526d075C81cb3451B436943BF999667Ba659ffC8;
        address feeRecipient = deployerAddress;
        
        GoldBondingCurve curve = new GoldBondingCurve(address(token), collateralToken, feeRecipient);
        
        // 3. Set Minter
        token.setMinter(address(curve));

        vm.stopBroadcast();
        
        console.log("---------------------------");
        console.log("FINAL DEPLOYMENT SUCCESSFUL");
        console.log("---------------------------");
        console.log("Token Address:", address(token));
        console.log("Curve Address:", address(curve));
        console.log("Fee Recipient:", feeRecipient);
        console.log("---------------------------");
    }
}
