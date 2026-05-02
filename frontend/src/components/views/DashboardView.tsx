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
  show: { opacity: 1, y: 0 }
};

const PLANETS = [
  { name: 'Mercury', color: '#A5A5A5', size: 8, orbit: 120, speed: 3 },
  { name: 'Venus', color: '#E3BB76', size: 12, orbit: 160, speed: 5 },
  { name: 'Earth', color: '#2271B3', size: 14, orbit: 210, speed: 7 },
  { name: 'Mars', color: '#E27B58', size: 10, orbit: 260, speed: 9 },
  { name: 'Jupiter', color: '#D39C7E', size: 24, orbit: 330, speed: 15 },
];

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
      className="space-y-10 pb-20 px-2"
    >
      {/* 🌌 THE GOLD SOLAR SYSTEM HERO 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950 border border-white/10 rounded-[3rem] min-h-[600px] flex items-center justify-center group shadow-2xl">
            {/* Starfield Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} />
                ))}
            </div>

            {/* SOLAR SYSTEM CONTAINER */}
            <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-100">
                
                {/* ☀️ THE GOLD SUN (CENTER) */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                            "0 0 60px rgba(255,215,0,0.3)",
                            "0 0 100px rgba(255,184,0,0.6)",
                            "0 0 60px rgba(255,215,0,0.3)"
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative z-20 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-yellow-600 via-gold to-yellow-300 rounded-full flex items-center justify-center border-4 border-yellow-200/30"
                >
                    <div className="text-center">
                        <span className="block text-2xl md:text-3xl font-black text-white drop-shadow-lg tracking-tighter">GOLD</span>
                        <span className="block text-[8px] font-black text-black bg-white/40 rounded px-1 mt-1 uppercase">Central</span>
                    </div>
                    {/* Sun Rays */}
                    <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl animate-pulse" />
                </motion.div>

                {/* 🪐 ORBITING PLANETS */}
                {PLANETS.map((planet, i) => (
                    <div 
                        key={planet.name}
                        className="absolute rounded-full border border-white/5"
                        style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full top-0 left-0"
                        >
                            <div 
                                className="absolute flex flex-col items-center group/planet"
                                style={{ 
                                    top: '50%', 
                                    left: '100%', 
                                    transform: 'translate(-50%, -50%)' 
                                }}
                            >
                                {/* Planet Body */}
                                <div 
                                    className="rounded-full shadow-lg border border-white/20"
                                    style={{ 
                                        width: planet.size, 
                                        height: planet.size, 
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 15px ${planet.color}40`
                                    }}
                                />
                                {/* Planet Name Tag */}
                                <span className="absolute top-full mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover/planet:opacity-100 transition-opacity bg-black/80 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
                                    {planet.name}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Hero Text Overlay (Bottom Left) */}
            <div className="absolute bottom-10 left-10 z-30 max-w-xl text-left hidden md:block">
                <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight uppercase">
                    GOLD <span className="text-gold">SOLAR</span> SYSTEM
                </h1>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Expanding across the decentralized galaxy. 21 Million Max Supply. Transparent. Immutable. Infinite.
                </p>
                <div className="flex gap-4 mt-6">
                    <button className="px-8 py-3 bg-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Trade Now</button>
                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Audit Report</button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-gold transition-all duration-500 group">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20">
                        <Activity className="w-7 h-7 text-gold" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Market Price</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${currentPrice}</div>
            </GlassCard>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-emerald-500/20 bg-slate-900/40 hover:bg-emerald-500/5 transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Protocol Reserve</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${formattedTVL}</div>
            </GlassCard>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-blue-400 transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <TrendingUp className="w-7 h-7 text-blue-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Volume</h3>
                <div className="text-4xl font-black text-white tracking-tighter">${formattedVolume}</div>
            </GlassCard>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-white transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Holders</h3>
                <div className="text-4xl font-black text-white tracking-tighter">{holdersCount?.toString() || '1'}</div>
            </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};
