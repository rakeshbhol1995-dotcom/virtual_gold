// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\ui\LiveTicker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Users } from 'lucide-react';
import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getContractAddress, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';

const scannerClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

export const LiveTicker = () => {
  const [news, setNews] = useState<string[]>([
    "GOLD CHAIN MAINNET LAUNCHING SOON",
    "BONDING CURVE SOLVENCY RATIO: 100%",
    "TOTAL VOLUME EXCEEDS $10,000",
    "NEW LIQUIDITY ADDED TO BASE POOL",
    "FOLLOW US ON TWITTER @VIRTUALGOLD26"
  ]);

  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');

  useEffect(() => {
    const fetchRecentTxs = async () => {
      if (!bondingCurveAddress) return;
      try {
        const buyLogs = await scannerClient.getContractEvents({
          address: bondingCurveAddress as `0x${string}`,
          abi: parseAbi(GOLD_BONDING_CURVE_ABI),
          eventName: 'Bought',
          maxBlocks: 1000,
        });

        if (buyLogs.length > 0) {
          const latest = buyLogs.slice(-3).map((log: any) => {
            const user = log.args.user?.slice(0, 6);
            const amount = formatUnits(log.args.collateralAmount || 0n, 6);
            return `LATEST BUY: ${user}... BOUGHT ${amount} USDT WORTH OF GOLD! 🚀`;
          });
          setNews(prev => [...latest, ...prev].slice(0, 8));
        }
      } catch (e) {
        console.error("Ticker fetch error", e);
      }
    };

    fetchRecentTxs();
    const interval = setInterval(fetchRecentTxs, 30000);
    return () => clearInterval(interval);
  }, [bondingCurveAddress]);

  return (
    <div className="w-full bg-gold/10 border-y border-gold/20 h-10 flex items-center overflow-hidden whitespace-nowrap relative backdrop-blur-md">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-gold text-black flex items-center gap-2 z-10 font-black text-[10px] uppercase tracking-tighter italic">
        <Zap size={12} className="fill-current" />
        Live Feed
      </div>
      
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 items-center pl-[120px]"
      >
        {news.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gold tracking-widest uppercase">{item}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {news.map((item, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gold tracking-widest uppercase">{item}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
