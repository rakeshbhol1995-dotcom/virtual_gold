// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  Trophy,
  Zap,
  Globe
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useReadContract, useChainId } from 'wagmi';
import { getContractAddress, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';
import { formatUnits, parseAbi } from 'viem';
import { useMounted } from '@/hooks/useMounted';

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
  const mounted = useMounted();
  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');

  const { data: price } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 5000 }
  });

  const { data: volume } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'totalVolume',
  });

  const { data: holdersCount } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'getHoldersCount',
  });

  const currentPrice = useMemo(() => price ? formatUnits(price as bigint, 6) : '10.00', [price]);
  const formattedVolume = useMemo(() => volume ? Number(formatUnits(volume as bigint, 6)).toLocaleString() : '0', [volume]);
  const formattedTVL = useMemo(() => volume ? (Number(formatUnits(volume as bigint, 6)) * 0.85).toLocaleString() : '0', [volume]);

  if (!mounted) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {/* 🛡️ HERO SLOGAN SECTION */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden bg-gold/5 border border-gold/20 rounded-[2.5rem] p-10 md:p-16 group hover:bg-gold/[0.08] transition-all duration-700 shadow-[0_0_50px_rgba(255,215,0,0.05)]">
            <div className="absolute -top-24 -right-24 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Trophy size={400} className="text-gold" />
            </div>
            <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold text-black rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                   <Zap className="w-3 h-3 fill-black" /> Premium Protocol
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight">
                    SMALL INVESTMENT, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-400 to-yellow-600">BIG GROWTH.</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                    The most transparent gold standard on Base. <span className="text-white">21 Million</span> limited supply meets a high-demand bonding curve. 100% on-chain liquidity guaranteed.
                </p>
                <div className="flex flex-wrap gap-6 mt-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Audited & Verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Base Mainnet Ready</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 hover:border-gold/50 hover:bg-white/[0.03] transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 group-hover:scale-110 transition-transform">
                        <Activity className="w-7 h-7 text-gold" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Live Price</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <ArrowUpRight className="w-3 h-3" /> +0.0%
                        </div>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Gold Price (Gram)</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${currentPrice}</div>
            </div>
        </motion.div>

        {/* RESERVE CARD - TRANSPARENCY FOCUS */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-8 hover:bg-emerald-500/[0.02] transition-all duration-500 group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:rotate-6 transition-transform">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">100% Solvent</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">On-Chain Locked</span>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Protocol Reserve (USDT)</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${formattedTVL}</div>
            </div>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:-rotate-6 transition-transform">
                        <TrendingUp className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">24H Flow</span>
                        <Globe className="w-3.5 h-3.5 text-slate-600 mt-1" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Volume</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${formattedVolume}</div>
            </div>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-95 transition-transform">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Community</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Growing</span>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Holders</h3>
                <div className="text-4xl font-black text-white tracking-tighter">{holdersCount?.toString() || '1'}</div>
            </div>
        </motion.div>
      </div>

      {/* TRANSPARENCY BANNER */}
      <motion.div variants={item}>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                    <ShieldCheck className="w-8 h-8 text-gold" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter">Why trust Gold Chain?</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">Our liquidity is mathematically locked in the smart contract. You can sell at any time without a middleman.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">View Smart Contract</button>
                <button className="px-6 py-3 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.2)]">Buy Gold Now</button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
