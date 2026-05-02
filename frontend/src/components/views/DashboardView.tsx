'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  TrendingUp, 
  BarChart3, 
  Flame, 
  Globe, 
  Cpu, 
  Zap,
  Activity,
  Wallet,
  Recycle
} from 'lucide-react';
import { useReadContract, useChainId, useAccount, useWriteContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { 
  getContractAddress, 
  GOLD_BONDING_CURVE_ABI,
  GOLD_FUTURES_ABI,
  ERC20_ABI
} from '@/constants/contracts';
import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { HoldersView } from './HoldersView';
import { ShieldCheck, Lock, Users } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { TradingChart } from '@/components/ui/TradingChart';
import { useVolume24h } from '@/hooks/useVolume24h';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export const DashboardView = () => {
  const mounted = useMounted();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const chainId = useChainId();
  const goldTokenAddress = getContractAddress(chainId || 84532, 'goldToken');
  const bondingCurveAddress = getContractAddress(chainId || 84532, 'bondingCurve');
  const collateralTokenAddress = getContractAddress(chainId || 84532, 'collateralToken');

  // 1. Fetch Total Supply (GOLD)
  const { data: totalSupply } = useReadContract({
    chainId: chainId || 84532,
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 2000 }
  });

  // 2. Fetch TVL (USDT in contract)
  const { data: contractBalance } = useReadContract({
    chainId: chainId || 84532,
    address: collateralTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [bondingCurveAddress],
    query: { refetchInterval: 2000 }
  });

  // 3. Fetch Token Price from Bonding Curve (Local Market)
  const { data: priceData } = useReadContract({
    chainId: chainId || 84532,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 2000 }
  });

  const supply = totalSupply ? Number(formatUnits(totalSupply as bigint, 18)) : 0;
  const currentPrice = priceData ? Number(formatUnits(priceData as bigint, 6)) : 10.00;
  const tvl = contractBalance ? Number(formatUnits(contractBalance as bigint, 6)) : 0;

  // 4. Fetch User Balances
  const { data: userGrams, refetch: refetchGrams } = useReadContract({
    chainId: chainId || 84532,
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 2000 }
  });

  const { data: userUsdt, refetch: refetchUsdt } = useReadContract({
    chainId: chainId || 84532,
    address: collateralTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 2000 }
  });

  const gramsBalance = userGrams ? Number(formatUnits(userGrams as bigint, 18)) : 0;
  const usdtBalance = userUsdt ? Number(formatUnits(userUsdt as bigint, 6)) : 0;

  const { buyVolume, sellVolume, totalVolume, tradeCount, isLoading: volumeLoading } = useVolume24h();

  const [priceColor, setPriceColor] = useState('text-white');
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (address) {
      refetchGrams();
      refetchUsdt();
    }
  }, [address, chainId]);

  useEffect(() => {
    if (currentPrice > prevPriceRef.current) {
      setPriceColor('text-green-400');
      const timer = setTimeout(() => setPriceColor('text-white'), 1000);
      return () => clearTimeout(timer);
    } else if (currentPrice < prevPriceRef.current) {
      setPriceColor('text-red-400');
      const timer = setTimeout(() => setPriceColor('text-white'), 1000);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  if (!mounted) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0"
    >
      {/* Hero Stats */}
      <motion.div variants={item} className="lg:col-span-2">
         <GlassCard className="h-full border-white/10 bg-black/40 shadow-2xl p-6 md:p-10 flex flex-col justify-between" variant="gold" delay={0.1}>
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-[10px] font-black text-gold/60 uppercase tracking-[0.4em] mb-3">Index Price</h3>
                  <p className={`text-4xl md:text-6xl font-display font-light tracking-tighter transition-colors duration-500 ${priceColor}`}>${currentPrice.toFixed(4)}</p>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="bg-green-500/10 px-2 md:px-3 py-1 rounded-full border border-green-500/20 text-green-500 text-[10px] md:text-xs font-black">
                    +{(currentPrice > 10 ? (((currentPrice - 10) / 10) * 100).toFixed(1) : 0)}%
                 </div>
                 <VerifiedBadge />
               </div>
            </div>
            <div className="mt-8 md:mt-10 flex flex-col md:flex-row gap-6">
               <div className="flex-1 min-h-[160px]">
                  <TradingChart currentPrice={currentPrice} />
               </div>
               <div className="flex flex-col gap-4 justify-center">
                  <button 
                    onClick={async () => {
                        const usdtAddress = getContractAddress(chainId || 84532, 'collateralToken');
                        writeContract({
                            address: usdtAddress as `0x${string}`,
                            abi: ERC20_ABI,
                            functionName: 'mint',
                            args: [address, parseUnits("1000", 6)],
                        });
                    }}
                    className="px-8 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.05] group"
                  >
                     <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4" />
                        MINT TEST USDT
                     </div>
                  </button>
                  <p className="text-[8px] text-slate-500 uppercase font-black text-center tracking-widest opacity-60">Base Sepolia Faucet</p>
               </div>
            </div>
         </GlassCard>
      </motion.div>

      <motion.div variants={item}>
         <GlassCard className="h-full border-white/10 bg-black/20 p-6 md:p-10 flex flex-col justify-between group hover:bg-black/40 transition-all duration-500" delay={0.2}>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
               <Flame className="w-6 h-6 md:w-8 md:h-8 text-rose-500" />
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total Value Locked</h3>
               <p className="text-3xl md:text-4xl font-display font-light text-white tracking-tight">${tvl.toLocaleString()} <span className="text-[10px] md:text-xs text-slate-600 font-sans font-black ml-1 uppercase">USDT</span></p>
            </div>
         </GlassCard>
      </motion.div>

      <motion.div variants={item}>
         <GlassCard className="h-full border-white/10 bg-black/40 p-6 md:p-10 flex flex-col justify-between shadow-2xl transition-all duration-500 hover:border-gold/30" variant="gold" delay={0.3}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gold/10 border border-gold/20 rounded-xl">
                    <Wallet className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Portfolio</h3>
                </div>
                <button 
                  onClick={() => { refetchGrams(); refetchUsdt(); }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  title="Sync Balances"
                >
                  <Recycle className="w-3 h-3 text-gold" />
                </button>
            </div>
            <div className="space-y-6">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Gold Balance</p>
                  <p className="text-2xl md:text-3xl font-display font-light text-gold neon-text-gold">{gramsBalance.toLocaleString()} <span className="text-[10px] font-sans font-black text-gold/40">GRAMS</span></p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">USDT Balance</p>
                  <p className="text-2xl md:text-3xl font-display font-light text-white tracking-tight">${usdtBalance.toLocaleString()}</p>
               </div>
            </div>
         </GlassCard>
      </motion.div>

      {/* Row 2: Activities & Holders */}
      <motion.div variants={item} className="lg:col-span-2">
         <GlassCard className="border-white/5 bg-slate-950/40 p-5 md:p-8">
            <div className="space-y-4">
               <ActivityScanner />
            </div>
         </GlassCard>
      </motion.div>

      <motion.div variants={item} className="lg:col-span-2">
         <HoldersView />
      </motion.div>
    </motion.div>
  );
};
