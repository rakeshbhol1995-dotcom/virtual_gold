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
// ⚠️ IMPORTANT: Use 10-20 different Wallets for organic look
const PRIVATE_KEYS = [
    "0xPRIVATE_KEY_1",
    "0xPRIVATE_KEY_2",
    "0xPRIVATE_KEY_3",
    "0xPRIVATE_KEY_4",
    "0xPRIVATE_KEY_5"
];

const MIN_USDT = "2.0"; 
const MAX_USDT = "15.0"; 

async function performTrade() {
    try {
        // 1. Pick a RANDOM wallet from the list
        const randomKey = PRIVATE_KEYS[Math.floor(Math.random() * PRIVATE_KEYS.length)];
        const account = privateKeyToAccount(randomKey);
        const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });
        
        console.log(`\n🕵️ Organic Trader: ${account.address.slice(0, 10)}...`);

        const goldBal = await publicClient.readContract({
            address: GOLD_TOKEN, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address]
        });

        // 70% Buy / 30% Sell ratio to pump the chart
        const isBuy = goldBal < parseUnits("0.1", 18) || Math.random() > 0.3;
        
        if (isBuy) {
            // Random amount with decimal jitter
            const usdtAmount = (Math.random() * (parseFloat(MAX_USDT) - parseFloat(MIN_USDT)) + parseFloat(MIN_USDT)).toFixed(6);
            const collateral = parseUnits(usdtAmount, 6);
            
            const goldToBuy = await publicClient.readContract({
                address: BONDING_CURVE, abi: BC_ABI, functionName: 'getGoldOut', args: [collateral]
            });

            console.log(`🚀 [ORGANIC BUY] ${account.address.slice(0,6)} buying ${usdtAmount} USDT...`);
            
            const { request } = await publicClient.simulateContract({
                account, address: BONDING_CURVE, abi: BC_ABI, functionName: 'buy',
                args: [collateral, (goldToBuy * 95n) / 100n, "0x0000000000000000000000000000000000000000"]
            });
            await walletClient.writeContract(request);

        } else {
            // Sell a RANDOM portion (10% to 40%)
            const sellPercent = Math.floor(Math.random() * 30 + 10);
            const sellAmount = (goldBal * BigInt(sellPercent)) / 100n;
            
            console.log(`🔻 [ORGANIC SELL] ${account.address.slice(0,6)} selling ${sellPercent}%...`);

            const { request } = await publicClient.simulateContract({
                account, address: BONDING_CURVE, abi: BC_ABI, functionName: 'sell',
                args: [sellAmount, 0n]
            });
            await walletClient.writeContract(request);
        }

    } catch (e) {
        console.log(`⏳ Skipping... (Balance or Network issue)`);
    }
}

async function runLoop() {
    console.log("🔥 Banana Gun Style Volume Bot Active!");
    while (true) {
        await performTrade();
        // Random Delay between 15s to 90s
        const wait = Math.floor(Math.random() * (90000 - 15000) + 15000);
        console.log(`💤 Next organic trade in ${Math.floor(wait/1000)}s...`);
        await new Promise(r => setTimeout(r, wait));
    }
}

runLoop();
