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

export const DashboardView = () => {
  const chainId = useChainId();
  const mounted = useMounted();
  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');

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
      className="space-y-6 md:space-y-10 pb-20 px-1 md:px-4"
    >
      {/* 🛡️ CINEMATIC HERO SECTION */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950/60 border border-gold/20 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-20 group shadow-2xl">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            
            {/* 🔥 CINEMATIC BURNING COIN - MOBILE RESPONSIVE 🔥 */}
            <div className="md:absolute relative flex justify-center md:block md:-top-10 md:-right-10 lg:right-10 lg:top-10 z-0 mb-8 md:mb-0">
                <motion.div 
                    animate={{ 
                        y: [0, -20, 0],
                        scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-48 h-48 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px]"
                >
                    {/* Atmospheric Glow */}
                    <motion.div 
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-gold/20 rounded-full blur-[60px] md:blur-[100px]"
                    />
                    
                    {/* The Generated Cinematic Image */}
                    <img 
                        src="/assets/burning-gold.png" 
                        alt="Burning Gold Coin" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(255,184,0,0.4)]"
                    />
                </motion.div>
            </div>

            <div className="relative z-10 max-w-3xl text-center md:text-left">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-2 bg-gold/10 text-gold rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-10 border border-gold/20"
                >
                   <Sparkles className="w-3.5 h-3.5 fill-gold animate-pulse" /> 
                   <span>Verified Protocol V2</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white mb-6 md:mb-8 leading-[0.95] uppercase">
                    SMALL INVESTMENT, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-yellow-600">BIG GROWTH.</span>
                </h1>

                <p className="text-slate-400 text-base md:text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                    Join the digital gold revolution with a <span className="text-white font-bold">21 Million</span> hard-capped supply. Built on Base for security, speed, and 100% transparency.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 mt-10 md:mt-14">
                    <button className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:scale-105 transition-all">
                        Launch Terminal <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Network Active</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID - MOBILE RESPONSIVE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 hover:border-gold/40 transition-all duration-500 group relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="p-3 md:p-4 bg-gold/10 rounded-xl md:rounded-2xl border border-gold/20">
                        <Activity className="w-5 h-5 md:w-7 md:h-7 text-gold" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest hidden sm:block">Live</span>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Price (Gram)</h3>
                <div className="text-xl md:text-4xl font-black text-white tracking-tighter">${currentPrice}</div>
            </div>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 hover:bg-emerald-500/[0.02] transition-all duration-500 group shadow-lg">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="p-3 md:p-4 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest hidden sm:block">100% Backed</span>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Reserve (USDT)</h3>
                <div className="text-xl md:text-4xl font-black text-white tracking-tighter">${formattedTVL}</div>
            </div>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 hover:border-blue-400/40 transition-all duration-500">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="p-3 md:p-4 bg-blue-500/10 rounded-xl md:rounded-2xl border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
                    </div>
                    <Globe className="w-4 h-4 text-slate-700" />
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Volume</h3>
                <div className="text-xl md:text-4xl font-black text-white tracking-tighter">${formattedVolume}</div>
            </div>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 hover:border-white/30 transition-all duration-500">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                        <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Holders</h3>
                <div className="text-xl md:text-4xl font-black text-white tracking-tighter">{holdersCount?.toString() || '1'}</div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
