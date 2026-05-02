'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, Wallet, ShieldCheck, Zap, Globe, ArrowUpRight, Crown, Star } from 'lucide-react';
import { TradingChart } from '@/components/ui/TradingChart';
import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { HoldersView } from '@/components/views/HoldersView';
import { GlassCard } from '@/components/ui/GlassCard';
import { useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { getContractAddress, GOLD_TOKEN_ABI, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const DashboardView = () => {
  const chainId = useChainId();
  const tokenAddress = getContractAddress(chainId, 'goldToken');
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  // Real Data: Current Price
  const { data: priceData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 5000 }
  });

  // Real Data: Total Supply
  const { data: totalSupply } = useReadContract({
    chainId,
    address: tokenAddress,
    abi: GOLD_TOKEN_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 10000 }
  });

  // Real Data: TVL (Reserve)
  const { data: tvlData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getReserveBalance',
    query: { refetchInterval: 10000 }
  });

  const currentPrice = priceData ? Number(formatUnits(priceData as bigint, 6)).toFixed(2) : '0.00';
  const supplyFormatted = totalSupply ? Number(formatUnits(totalSupply as bigint, 18)).toLocaleString() : '0';
  const tvlFormatted = tvlData ? Number(formatUnits(tvlData as bigint, 6)).toLocaleString() : '0';
  const marketCap = priceData && totalSupply ? (Number(formatUnits(priceData as bigint, 6)) * Number(formatUnits(totalSupply as bigint, 18))).toLocaleString() : '0';

  const stats = [
    { label: 'Gold Price (Grams)', value: `$${currentPrice}`, change: 'LIVE', icon: <Zap className="text-gold" />, color: 'gold' },
    { label: 'Total Supply', value: supplyFormatted, change: 'Grams', icon: <Users className="text-emerald-400" />, color: 'emerald' },
    { label: 'Market Cap', value: `$${marketCap}`, change: 'Base Network', icon: <Globe className="text-blue-400" />, color: 'blue' },
    { label: 'Protocol TVL', value: `$${tvlFormatted}`, change: 'USDT', icon: <ShieldCheck className="text-gold" />, color: 'gold' },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {/* Hero Section: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className="p-6 border-white/5 bg-slate-900/40 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 64 })}
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                     {stat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</span>
               </div>
               <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-white/5 ${stat.color === 'gold' ? 'text-gold' : 'text-emerald-400'}`}>
                     {stat.change}
                  </span>
               </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Chart & Primary Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard className="border-white/5 bg-slate-900/60 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <TrendingUp className="text-gold w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Price Chart</h3>
               </div>
               <div className="flex gap-2">
                  {['1H', '1D', '1W', 'ALL'].map((t) => (
                    <button key={t} className="text-[10px] font-black px-3 py-1 rounded-lg bg-white/5 hover:bg-gold hover:text-black transition-all">
                      {t}
                    </button>
                  ))}
               </div>
            </div>
            <div className="p-6 h-[400px]">
               <TradingChart />
            </div>
          </GlassCard>
        </motion.div>

        <div className="space-y-6">
           {/* Quick Stats Card */}
           <motion.div variants={item}>
              <GlassCard className="p-6 border-white/5 bg-slate-900/40">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Protocol Health
                 </h4>
                 <div className="space-y-4">
                    {[
                       { l: 'Liquidity Locked', v: '100%', p: 100, c: 'bg-gold' },
                       { l: 'Base Verification', v: 'Verified', p: 100, c: 'bg-emerald-400' },
                       { l: 'Bonding Progress', v: supplyFormatted + ' / 1M', p: Math.min(100, (Number(totalSupply || 0) / 10**24) * 100), c: 'bg-blue-400' },
                    ].map((row, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                             <span className="text-slate-400">{row.l}</span>
                             <span>{row.v}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full ${row.c} transition-all duration-1000`} style={{ width: `${row.p}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </GlassCard>
           </motion.div>

           {/* Developer API Card */}
           <motion.div variants={item}>
              <GlassCard className="p-6 border-white/5 bg-slate-900/60 group cursor-pointer hover:border-gold/30">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gold/10 rounded-lg text-gold group-hover:scale-110 transition-transform">
                       <Zap size={16} />
                    </div>
                    <span className="text-[8px] font-black text-emerald-400 uppercase">Active</span>
                 </div>
                 <h4 className="text-xs font-black text-white uppercase tracking-tighter mb-2 italic">DEVELOPER API</h4>
                 <p className="text-[9px] text-slate-400 uppercase leading-relaxed">Connect your bots to generate high-frequency volume via our low-latency endpoint.</p>
                 <div className="mt-4 py-2 px-3 bg-black/40 rounded-xl font-mono text-[8px] text-gold/60 border border-white/5 overflow-hidden whitespace-nowrap">
                    GET /v1/gold-chain/volume
                 </div>
              </GlassCard>
           </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityScanner />
        <HoldersView />
      </div>
    </motion.div>
  );
};
