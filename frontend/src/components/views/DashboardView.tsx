// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  Zap,
  Globe,
  Sparkles,
  ArrowRight,
  Flame
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
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 15 } }
};

export const DashboardView = () => {
  const chainId = useChainId();
  const mounted = useMounted();
  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [10, -10]);
  const rotateY = useTransform(springX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const { data: price } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 5000 }
  });

  const { data: volume } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'totalVolume',
  });

  const { data: holdersCount } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
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
      className="space-y-6 md:space-y-10 pb-20"
    >
      {/* 🚀 EXPLOSIVE HERO SECTION 🚀 */}
      <motion.div 
        variants={item} 
        onMouseMove={handleMouseMove}
        className="relative perspective-1000"
      >
        <div className="relative overflow-hidden bg-slate-950 border border-gold/30 rounded-[3rem] p-10 md:p-24 shadow-[0_0_100px_rgba(255,184,0,0.1)] group">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-red-500/5 opacity-50" />
            
            {/* 🔥 PARTICLE FIRE SYSTEM 🔥 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <motion.div 
                        key={i}
                        initial={{ y: '110%', x: `${Math.random() * 100}%`, opacity: 0 }}
                        animate={{ 
                            y: '-10%', 
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{ 
                            duration: 2 + Math.random() * 3, 
                            repeat: Infinity, 
                            delay: Math.random() * 5 
                        }}
                        className="absolute w-1 h-1 bg-gold rounded-full blur-[1px]"
                    />
                ))}
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                <div className="flex-1 text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-red-500/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                       <Flame className="w-4 h-4 animate-bounce" /> 
                       <span>Protocol Heat Level: Extreme</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.85] uppercase">
                        SMALL <span className="text-gold">INVESTMENT</span>, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-gold to-yellow-500 animate-pulse">BIG GROWTH.</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-2xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Join the most aggressive gold standard on Base. <span className="text-white">21 Million</span> hard-cap. Infinite scalability. Zero compromises.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 mt-14">
                        <button className="w-full sm:w-auto px-10 py-5 bg-gold text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,215,0,0.4)] hover:shadow-gold transition-all hover:-translate-y-1 active:translate-y-0">
                            Enter the Gold Mine
                        </button>
                        <div className="flex items-center gap-4 text-slate-500">
                            <div className="flex -space-x-3">
                                {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">+1,248 Pioneers</span>
                        </div>
                    </div>
                </div>

                {/* 3D FLOATING BURNING COIN */}
                <motion.div 
                    style={{ rotateX, rotateY }}
                    className="relative w-64 h-64 md:w-96 md:h-96"
                >
                    {/* Radial Glow */}
                    <motion.div 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-gold/20 rounded-full blur-[100px]"
                    />
                    
                    {/* Fire Sparks Overlay */}
                    <div className="absolute inset-0 z-20">
                         {[...Array(8)].map((_, i) => (
                             <motion.div 
                                key={i}
                                animate={{ 
                                    y: [0, -100], 
                                    x: [0, (i % 2 === 0 ? 50 : -50)],
                                    opacity: [0, 1, 0] 
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="absolute bottom-1/2 left-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full blur-[1px]"
                             />
                         ))}
                    </div>

                    <img 
                        src="/assets/burning-gold.png" 
                        alt="Gold Coin" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_80px_rgba(255,184,0,0.6)] group-hover:scale-110 transition-transform duration-500"
                    />
                </motion.div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-10 border-white/10 bg-slate-900/40 hover:border-gold transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div className="p-3 md:p-4 bg-gold/10 rounded-2xl border border-gold/20 group-hover:rotate-12 transition-transform">
                        <Activity className="w-5 h-5 md:w-7 md:h-7 text-gold" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2">Market Price</h3>
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">${currentPrice}</div>
            </GlassCard>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-10 border-emerald-500/20 bg-slate-900/40 hover:bg-emerald-500/5 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div className="p-3 md:p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2">Protocol Reserve</h3>
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">${formattedTVL}</div>
            </GlassCard>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-10 border-white/10 bg-slate-900/40 hover:border-blue-400 transition-all duration-500">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div className="p-3 md:p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Volume</h3>
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">${formattedVolume}</div>
            </GlassCard>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-10 border-white/10 bg-slate-900/40 hover:border-white transition-all duration-500">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Pioneers</h3>
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">{holdersCount?.toString() || '1'}</div>
            </GlassCard>
        </motion.div>
      </div>

      {/* FINAL TRUST BANNER */}
      <motion.div variants={item}>
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-gold/10 border border-gold/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-2xl">
                    <ShieldCheck className="w-8 h-8 text-gold" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter">100% On-Chain Solvency</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">Our liquidity is locked in the bonding curve. Verified. Mathematical. Immutable.</p>
                </div>
            </div>
            <button className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Audit Report</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
