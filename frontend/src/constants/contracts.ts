import { parseAbi } from 'viem';

export const CONTRACT_ADDRESSES = {
  84532: { // Base Sepolia
    goldToken: "0x723803C05dB5dE1Ca50DAf008D809C581AED99d7",
    bondingCurve: "0xb63aA4ee644FEB16FD7D6f34b6c560D1A6aDDBb5",
    goldFutures: "0x0000000000000000000000000000000000000000",
    collateralToken: "0xD9305b7E1135Fc09af1D325D538393A55029E0d8", // Mock USDT
    tokenFactory: "0x5af06e6A2Ae0B186286cAedd9593f2aE3b39dB8b", 
    staking: "0x0000000000000000000000000000000000000000",
    bridge: "0x0000000000000000000000000000000000000000",
  },
  137: { // Polygon Mainnet
    bridge: "0x0000000000000000000000000000000000000000",
  }
} as const;

export const GOLD_TOKEN_ADDRESS = CONTRACT_ADDRESSES[84532].goldToken;
export const GOLD_BONDING_CURVE_ADDRESS = CONTRACT_ADDRESSES[84532].bondingCurve;
export const GOLD_FUTURES_ADDRESS = CONTRACT_ADDRESSES[84532].goldFutures;
export const USDT_TOKEN_ADDRESS = CONTRACT_ADDRESSES[84532].collateralToken;

export const getContractAddress = (chainId: number, key: keyof typeof CONTRACT_ADDRESSES[84532]) => {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[84532];
  return (addresses as any)[key] || "0x0000000000000000000000000000000000000000";
};

export const getExplorerUrl = (chainId: number) => {
  if (chainId === 84532) return "https://sepolia.basescan.org";
  return "https://basescan.org";
};

// ABI definitions matching the smart contracts exactly
export const ERC20_ABI = parseAbi([
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function mint(address, uint256) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]);

export const GOLD_BONDING_CURVE_ABI = parseAbi([
  "function buy(uint256 collateralLimit, uint256 goldAmount, address referrer)",
  "function sell(uint256 goldAmount, uint256 minCollateralOut)",
  "function getCurrentPrice() view returns (uint256)",
  "function calculateCost(uint256 supply, uint256 amount) view returns (uint256)",
  "function getGoldOut(uint256 collateralAmount) view returns (uint256)",
  "function getSellProceeds(uint256 goldAmount) view returns (uint256)",
  "function getHoldersCount() view returns (uint256)",
  "event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee, address indexed referrer)",
  "event Sold(address indexed user, uint256 goldAmount, uint256 collateralAmount, uint256 fee)"
]);

export const GOLD_FUTURES_ABI = parseAbi([
  "function openPosition(uint256 collateralAmount, uint256 leverage, bool isLong) external",
  "function closePosition(uint256 index) external",
  "function getUserPositions(address user) view returns ((uint256 collateral, uint256 size, uint256 entryPrice, bool isLong, bool active)[])",
  "function getGoldPrice() view returns (uint256)",
  "event PositionOpened(address indexed user, uint256 index, bool isLong, uint256 collateral, uint256 size, uint256 entryPrice)",
  "event PositionClosed(address indexed user, uint256 index, uint256 pnl, bool wasProfit)"
]);

export const GOLD_STAKING_ABI = parseAbi([
  "function stake(uint256) external",
  "function withdraw(uint256) external",
  "function getReward() external",
  "function earned(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function userLastStakeTime(address) view returns (uint256)"
]);

export const TOKEN_FACTORY_ABI = parseAbi([
  "function launchToken(string name, string symbol, string description, string imageUrl) external payable returns (address tokenAddr, address curveAddr)",
  "function getAll() external view returns ((address token, address curve, address creator, uint256 createdAt)[])",
  "function getToken(uint256 i) external view returns ((address token, address curve, address creator, uint256 createdAt))",
  "function totalLaunched() view returns (uint256)",
  "function launchFeeNative() view returns (uint256)",
  "function migrationPending() view returns (bool)",
  "function l1ChainBridge() view returns (address)",
  "function migrationAt() view returns (uint256)",
  "function announceMigration(address bridge) external",
  "function cancelMigration() external",
  "event TokenLaunched(address indexed creator, address token, address curve, string name, string symbol)"
]);

export const LAUNCHPAD_CURVE_ABI = parseAbi([
  "function getCurrentPrice() view returns (uint256)",
  "function getTokensOut(uint256 collateralAmount) view returns (uint256)",
  "function getSellProceeds(uint256 tokenAmount) view returns (uint256)",
  "function bondingProgress() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "function tradeCount() view returns (uint256)",
  "function graduated() view returns (bool)",
  "function buy(uint256 collateralAmount, uint256 minTokensOut) external",
  "function sell(uint256 tokenAmount, uint256 minCollateralOut) external",
  "event Bought(address indexed user, uint256 collateralIn, uint256 tokensOut, uint256 fee)",
  "event Sold(address indexed user, uint256 tokensIn, uint256 collateralOut, uint256 fee)",
  "event Graduated(uint256 totalRaised, uint256 timestamp)"
]);

export const LAUNCHPAD_TOKEN_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function description() view returns (string)",
  "function imageUrl() view returns (string)",
  "function createdAt() view returns (uint256)",
  "function curve() view returns (address)"
]);

export const GOLD_BRIDGE_ABI = parseAbi([
  "function deposit(uint256) external",
  "function withdraw(uint256) external",
  "function owner() view returns (address)"
]);
