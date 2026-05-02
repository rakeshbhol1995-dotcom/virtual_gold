// market-maker-bot/bot.js
const { createWalletClient, createPublicClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

/**
 * 🤖 GOLD CHAIN - ELITE MARKET MAKER BOT
 * This script runs independently to generate trading volume.
 * Supports: Multiple wallets, Random Buy/Sell, Auto-Rebalancing.
 */

// --- CONFIGURATION ---
const RPC_URL = "https://sepolia.base.org";
const BONDING_CURVE = "0xb63aA4ee644FEB16FD7D6f34b6c560D1A6aDDBb5"; // Audited V5
const GOLD_TOKEN = "0x723803C05dB5dE1Ca50DAf008D809C581AED99d7";
const USDT_TOKEN = "0xD9305b7E1135Fc09af1D325D538393A55029E0d8";

// ⚠️ IMPORTANT: Add your Bot Wallets here (Base Sepolia Private Keys)
const PRIVATE_KEYS = [
    "0xeca9a2554064c2a6f53f12c716046bbc8e64f3d242b0d4d15bc2fe0f8fe26503", // Example: Dev Wallet
    // Add more for higher volume
];

const MIN_USDT = "5.0"; // Minimum USDT per trade
const MAX_USDT = "20.0"; // Maximum USDT per trade
const DELAY_MS = 30000;  // 30 seconds between trades

// --- ABIs ---
const BC_ABI = [
    { name: 'buy', type: 'function', inputs: [{name:'limit',type:'uint256'},{name:'gold',type:'uint256'},{name:'ref',type:'address'}] },
    { name: 'sell', type: 'function', inputs: [{name:'gold',type:'uint256'},{name:'min',type:'uint256'}] },
    { name: 'getGoldOut', type: 'function', inputs: [{name:'c',type:'uint256'}], outputs: [{type:'uint256'}] }
];

const ERC20_ABI = [
    { name: 'balanceOf', type: 'function', inputs: [{name:'a',type:'address'}], outputs: [{type:'uint256'}] },
    { name: 'approve', type: 'function', inputs: [{name:'s',type:'address'},{name:'v',type:'uint256'}], outputs: [{type:'bool'}] }
];

const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });

async function performTrade(pk) {
    try {
        const account = privateKeyToAccount(pk);
        const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });
        
        console.log(`\n🤖 Bot Active: ${account.address.slice(0, 10)}...`);

        // 1. Check Gold Balance to decide Buy or Sell
        const goldBal = await publicClient.readContract({
            address: GOLD_TOKEN, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address]
        });

        // If no gold, must buy. If has gold, 60% chance to buy, 40% chance to sell.
        const isBuy = goldBal === 0n || Math.random() > 0.4;
        const usdtAmount = (Math.random() * (parseFloat(MAX_USDT) - parseFloat(MIN_USDT)) + parseFloat(MIN_USDT)).toFixed(2);
        
        if (isBuy) {
            const collateral = parseUnits(usdtAmount, 6);
            // Calculate gold amount to buy
            const goldToBuy = await publicClient.readContract({
                address: BONDING_CURVE, abi: BC_ABI, functionName: 'getGoldOut', args: [collateral]
            });

            console.log(`🟢 [BUY] Spending ${usdtAmount} USDT for ${formatUnits(goldToBuy, 18)} GOLD...`);
            
            // Execute Buy
            const { request } = await publicClient.simulateContract({
                account, address: BONDING_CURVE, abi: BC_ABI, functionName: 'buy',
                args: [collateral, goldToBuy, "0x0000000000000000000000000000000000000000"]
            });
            const hash = await walletClient.writeContract(request);
            console.log(`✅ Buy Hash: ${hash}`);

        } else {
            // Sell 20-50% of current gold balance
            const sellAmount = (goldBal * BigInt(Math.floor(Math.random() * 30 + 20))) / 100n;
            console.log(`🔴 [SELL] Selling ${formatUnits(sellAmount, 18)} GOLD...`);

            const { request } = await publicClient.simulateContract({
                account, address: BONDING_CURVE, abi: BC_ABI, functionName: 'sell',
                args: [sellAmount, 0n] // No slippage limit for bot
            });
            const hash = await walletClient.writeContract(request);
            console.log(`✅ Sell Hash: ${hash}`);
        }

    } catch (e) {
        console.error(`❌ Bot Error: ${e.shortMessage || e.message}`);
    }
}

async function runLoop() {
    console.log("🚀 Gold Chain Market Maker Bot Started!");
    while (true) {
        for (const pk of PRIVATE_KEYS) {
            await performTrade(pk);
            const wait = DELAY_MS + (Math.random() * 10000); // Random delay
            console.log(`⏳ Waiting ${Math.floor(wait/1000)}s...`);
            await new Promise(r => setTimeout(r, wait));
        }
    }
}

runLoop();
