'use client';
import { usePublicClient, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseAbiItem, formatUnits } from 'viem';
import { getContractAddress } from '@/constants/contracts';

export const useVolume24h = () => {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [buyVolume, setBuyVolume] = useState(0);
  const [sellVolume, setSellVolume] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVolume = async () => {
      if (!publicClient) return;
      setIsLoading(true);
      try {
        const bondingCurveAddress = getContractAddress(chainId || 84532, 'bondingCurve') as `0x${string}`;
        const latestBlock = await publicClient.getBlockNumber();
        // Base Sepolia: ~2s per block => 24h ≈ 43200 blocks
        const fromBlock = latestBlock > BigInt(43200) ? latestBlock - BigInt(43200) : 0n;

        const [buyLogs, sellLogs] = await Promise.all([
          publicClient.getLogs({
            address: bondingCurveAddress,
            event: parseAbiItem('event Bought(address indexed user, uint256 collateralAmount, uint256 goldAmount, uint256 fee, address indexed referrer)'),
            fromBlock,
            toBlock: latestBlock,
          }),
          publicClient.getLogs({
            address: bondingCurveAddress,
            event: parseAbiItem('event Sold(address indexed user, uint256 goldAmount, uint256 collateralAmount, uint256 fee)'),
            fromBlock,
            toBlock: latestBlock,
          }),
        ]);

        let bVol = 0;
        let sVol = 0;
        buyLogs.forEach((log: any) => {
          if (log.args?.collateralAmount) bVol += Number(formatUnits(log.args.collateralAmount, 6));
        });
        sellLogs.forEach((log: any) => {
          if (log.args?.collateralAmount) sVol += Number(formatUnits(log.args.collateralAmount, 6));
        });

        setBuyVolume(bVol);
        setSellVolume(sVol);
        setTradeCount(buyLogs.length + sellLogs.length);
      } catch (e) {
        console.error('Volume fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolume();
    const interval = setInterval(fetchVolume, 60000);
    return () => clearInterval(interval);
  }, [publicClient, chainId]);

  return { buyVolume, sellVolume, totalVolume: buyVolume + sellVolume, tradeCount, isLoading };
};
