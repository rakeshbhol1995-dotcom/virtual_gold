// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\constants\contracts.ts
import { Address } from 'viem';

export const CONTRACTS = {
  84532: { // Base Sepolia
    goldToken: '0xBa3F5a2dA0134f328Ca9F829D993c1D664011720' as Address,
    bondingCurve: '0x77DB2Ba2E1fA4AbCd51dcE9FC0da2eb20f4A8704' as Address,
    collateralToken: '0x2343e4ae9170E1E87c42a3fA661d02D8955963d5' as Address, // Mock USDT
  },
  8453: { // Base Mainnet
    goldToken: '0x0000000000000000000000000000000000000000' as Address,
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
  "function calculateCost(uint256 supply, uint256 amount) view returns (uint256)",
  "function buy(uint256 collateralLimit, uint256 goldAmount, address referrer) external",
  "function sell(uint256 goldAmount, uint256 minCollateralOut) external",
  "function getGoldOut(uint256 collateralAmount) view returns (uint256)",
  "function getSellProceeds(uint256 goldAmount) view returns (uint256)",
  "function getHoldersCount() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee, address indexed referrer)",
  "event Sold(address indexed user, uint256 goldAmount, uint256 collateralAmount, uint256 fee)"
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
