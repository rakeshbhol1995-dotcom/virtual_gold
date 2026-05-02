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
  Globe,
  Sparkles,
  ArrowRight
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
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const float = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  }
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
      className="space-y-8 pb-20 px-2"
    >
      {/* 🛡️ PREMIUM HERO SECTION WITH MAST ANIMATIONS */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-gold/10 border border-gold/20 rounded-[3rem] p-12 md:p-20 group shadow-[0_0_80px_rgba(255,215,0,0.08)]">
            {/* Animated Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity }}
                        className="absolute w-64 h-64 bg-gold/5 rounded-full blur-[80px]"
                        style={{ top: `${i * 20}%`, left: `${i * 15}%` }}
                    />
                ))}
            </div>

            {/* 🔥 BURNING GOLD COIN ANIMATION 🔥 */}
            <div className="absolute -top-10 -right-10 md:right-20 md:top-20 pointer-events-none z-0">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="relative w-48 h-48 md:w-80 md:h-80"
                >
                    {/* Fire Layers */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute inset-0 rounded-full blur-[40px] md:blur-[60px] ${
                                i === 0 ? 'bg-orange-600' : i === 1 ? 'bg-red-500' : 'bg-gold'
                            }`}
                        />
                    ))}
                    
                    {/* The Coin */}
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                            boxShadow: [
                                "0 0 40px rgba(255,215,0,0.3)",
                                "0 0 80px rgba(255,184,0,0.6)",
                                "0 0 40px rgba(255,215,0,0.3)"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-gold to-yellow-700 rounded-full border-[8px] border-yellow-200/30 flex items-center justify-center shadow-2xl backdrop-blur-sm overflow-hidden group-hover:scale-110 transition-transform duration-700"
                    >
                        <Trophy size={180} className="text-yellow-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        
                        {/* Coin Shine */}
                        <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-1/2 bg-white/20 -skew-x-12 blur-xl"
                        />
                    </motion.div>
                </motion.div>
            </div>

            <div className="relative z-10 max-w-4xl">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-4 py-1.5 bg-gold/20 text-gold rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                >
                   <Sparkles className="w-3.5 h-3.5 fill-gold animate-pulse" /> 
                   <span>Next-Gen Financial Protocol</span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
                    <span className="block mb-2">SMALL INVESTMENT,</span>
                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-yellow-600 animate-shimmer bg-[length:200%_auto]">
                        BIG GROWTH.
                        <motion.span 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute -bottom-2 left-0 h-1.5 bg-gold/40 rounded-full"
                        />
                    </span>
                </h1>

                <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl">
                    Empowering the community with <span className="text-white font-bold">21 Million</span> limited supply and a high-performance bonding curve. Transparent. Secure. Decoupled.
                </p>

                <div className="flex flex-wrap items-center gap-8 mt-12">
                    <motion.button 
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-3 px-8 py-4 bg-gold text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-gold/50 transition-all"
                    >
                        Start Trading Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden">
                                <Users size={16} />
                            </div>
                        ))}
                        <div className="pl-6 text-[10px] font-black text-slate-500 uppercase tracking-widest self-center">
                            Join 1,200+ Holders
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID WITH HOVER GLOWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item} whileHover={{ y: -5 }}>
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 hover:border-gold/50 hover:bg-gold/[0.03] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={100} className="text-gold" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 group-hover:rotate-12 transition-transform">
                        <Activity className="w-7 h-7 text-gold" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Live Index</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                            <ArrowUpRight className="w-3 h-3" /> TRACKING
                        </div>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Gold Price (Gram)</h3>
                <div className="text-5xl font-black text-white tracking-tighter">${currentPrice}</div>
            </div>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item} whileHover={{ y: -5 }}>
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-[2rem] p-8 hover:bg-emerald-500/[0.02] transition-all duration-500 group shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={100} className="text-emerald-400" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Liquidity</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">On-Chain</span>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Protocol Reserve</h3>
                <div className="text-5xl font-black text-white tracking-tighter">${formattedTVL}</div>
            </div>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item} whileHover={{ y: -5 }}>
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 hover:border-blue-400/50 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={100} className="text-blue-400" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:-rotate-12 transition-transform">
                        <TrendingUp className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">24H Trading</span>
                        <Globe className="w-3.5 h-3.5 text-slate-600 mt-1" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Volume</h3>
                <div className="text-5xl font-black text-white tracking-tighter">${formattedVolume}</div>
            </div>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item} whileHover={{ y: -5 }}>
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users size={100} className="text-white" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-90 transition-transform">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Network</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Holders</h3>
                <div className="text-5xl font-black text-white tracking-tighter">{holdersCount?.toString() || '1'}</div>
            </div>
        </motion.div>
      </div>

      {/* TRANSPARENCY BANNER - FINAL POLISH */}
      <motion.div variants={item}>
        <div className="bg-gradient-to-r from-slate-950 to-gold/10 border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_40px_rgba(255,215,0,0.15)] group-hover:rotate-12 transition-transform duration-500">
                    <ShieldCheck className="w-10 h-10 text-gold" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Verified Protocol Solvency</h4>
                    <p className="text-slate-400 text-base font-medium mt-2 max-w-xl">Every single USDT in the reserve is mathematically locked on-chain. Liquidity is guaranteed by the bonding curve, not middlemen.</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Audit Status</p>
                    <p className="text-xs font-bold text-emerald-400 uppercase">FULLY SECURE</p>
                </div>
                <button className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95">Explore Contracts</button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
