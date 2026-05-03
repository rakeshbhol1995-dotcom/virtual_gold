// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\constants\contracts.ts
import { Address } from 'viem';

export const CONTRACTS = {
  84532: { // Base Sepolia V2 (Final Audit V2)
    goldToken: '0xc4a58a1dbe2b78b0aa1fe550a2ced27e5835b6be' as Address,
    bondingCurve: '0xE9C7EEf2D1f1E492Ee0a5B8D5fc26a087be49f75' as Address,
    collateralToken: '0x526d075C81cb3451B436943BF999667Ba659ffC8' as Address, // Mock USDT V2
  },
  8453: { // Base Mainnet
    goldToken: '0xc4a58a1dbe2b78b0aa1fe550a2ced27e5835b6be' as Address,
    bondingCurve: '0x0000000000000000000000000000000000000000' as Address,
    collateralToken: '0xdac17f958d2ee523a2206206994597c13d831ec7' as Address, // Real USDT
  }
};

export const getContractAddress = (chainId: number | undefined, name: keyof typeof CONTRACTS[84532]) => {
  const chain = chainId === 8453 ? 8453 : 84532;
  return CONTRACTS[chain][name];
};

export const getExplorerUrl = (chainId: number | undefined) => {
  const baseUrl = chainId === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';
  return baseUrl;
};

export const GOLD_TOKEN_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const GOLD_BONDING_CURVE_ABI = [
  "function getCurrentPrice() view returns (uint256)",
  "function virtualBasePrice() view returns (uint256)",
  "function calculateCost(uint256 supply, uint256 amount) view returns (uint256)",
  "function buy(uint256 goldAmount, uint256 maxCollateralIn) external",
  "function sell(uint256 goldAmount, uint256 minCollateralOut) external",
  "function getGoldOut(uint256 collateralAmount) view returns (uint256)",
  "function getSellProceeds(uint256 goldAmount) view returns (uint256)",
  "function getHoldersCount() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "function miningPool() view returns (uint256)",
  "function claimMiningReward() external",
  "function lastClaimed(address) view returns (uint256)",
  "event Bought(address indexed user, uint256 collateralIn, uint256 goldOut, uint256 fee)",
  "event Sold(address indexed user, uint256 goldIn, uint256 collateralOut, uint256 fee)",
  "event RewardClaimed(address indexed user, uint256 amount)",
  "event FloorBoosted(uint256 newBasePrice)"
];

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function mint(address, uint256) external"
];
