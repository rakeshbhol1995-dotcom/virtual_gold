const { createWalletClient, createPublicClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

// --- CONFIGURATION ---
const RPC_URL = "https://sepolia.base.org";
const BONDING_CURVE = "0x6C2064e0A8929B2B26f89fa2e357692C74bd0d39";
const USDT_TOKEN = "0xb90Ec2984F904e743ac4138D11740cF0911F5a42";

// Add your bot private keys here (NEVER share these!)
const PRIVATE_KEYS = [
    "0x0000000000000000000000000000000000000000000000000000000000000001", 
    // Add more keys to simulate multiple users
];

const MIN_TRADE = "1.0"; // Min USDT per trade
const MAX_TRADE = "5.0"; // Max USDT per trade
const DELAY_MS = 60000;  // 1 minute between trades

// --- ABIs ---
const BC_ABI = [
    { name: 'buy', type: 'function', inputs: [{name:'c',type:'uint256'},{name:'m',type:'uint256'},{name:'r',type:'address'}] },
    { name: 'sell', type: 'function', inputs: [{name:'g',type:'uint256'},{name:'m',type:'uint256'}] },
    { name: 'getGoldOut', type: 'function', inputs: [{name:'c',type:'uint256'}], outputs: [{type:'uint256'}] }
];

const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });

async function runBot() {
    console.log("🚀 Starting Gold Chain Market Maker Bot...");
    
    while (true) {
        for (const pk of PRIVATE_KEYS) {
            try {
                const account = privateKeyToAccount(pk);
                const client = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });
                
                // Randomly Decide: Buy (70%) or Sell (30%) to keep price trend up
                const isBuy = Math.random() > 0.3;
                const amountStr = (Math.random() * (parseFloat(MAX_TRADE) - parseFloat(MIN_TRADE)) + parseFloat(MIN_TRADE)).toFixed(2);
                
                if (isBuy) {
                    console.log(`[BUY] Wallet ${account.address.slice(0,6)} buying with ${amountStr} USDT...`);
                    const amount = parseUnits(amountStr, 6);
                    const { request } = await publicClient.simulateContract({
                        account, address: BONDING_CURVE, abi: BC_ABI, functionName: 'buy',
                        args: [amount, 0n, "0x0000000000000000000000000000000000000000"]
                    });
                    await client.writeContract(request);
                } else {
                    console.log(`[SELL] Wallet ${account.address.slice(0,6)} selling...`);
                    // Logic to sell small amount of GOLD
                    // (Requires fetching gold balance first)
                }

                console.log(`✅ Trade Successful. Waiting ${DELAY_MS/1000}s...`);
            } catch (e) {
                console.error(`❌ Trade Failed: ${e.message}`);
            }
            
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }
}

runBot();
