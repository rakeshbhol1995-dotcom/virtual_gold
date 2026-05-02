// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Zap,
  Globe,
  Sparkles,
  Flame,
  ZapIcon
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
  { name: 'Mercury', color: '#A5A5A5', size: 10, orbit: 100, speed: 12 },
  { name: 'Venus', color: '#E3BB76', size: 16, orbit: 150, speed: 20 },
  { name: 'Earth', color: '#2271B3', size: 18, orbit: 210, speed: 28 },
  { name: 'Mars', color: '#E27B58', size: 14, orbit: 260, speed: 35 },
  { name: 'Jupiter', color: '#D39C7E', size: 28, orbit: 340, speed: 50 },
];

const SLOGANS = [
  "Infinite Growth",
  "100% Transparent",
  "Rug-Proof Math",
  "Secure Asset",
  "Community Driven"
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
      {/* 🌌 HYPER-ANIMATED SOLAR SYSTEM HERO 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950 border border-white/10 rounded-[3.5rem] min-h-[650px] flex items-center justify-center group shadow-2xl">
            {/* Starfield & Nebula Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute inset-0 opacity-20">
                {[...Array(80)].map((_, i) => (
                    <motion.div 
                        key={i} 
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full" 
                        style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} 
                    />
                ))}
            </div>

            {/* FLOATING SLOGANS IN EMPTY SPACE */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {SLOGANS.map((text, i) => (
                    <motion.span 
                        key={i}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ 
                            opacity: [0, 0.4, 0], 
                            y: [0, -40, 0],
                            x: [0, (i % 2 === 0 ? 30 : -30), 0]
                        }}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity, 
                            delay: i * 2,
                            ease: "easeInOut"
                        }}
                        className="absolute text-[10px] font-black text-gold uppercase tracking-[0.4em] whitespace-nowrap"
                        style={{ 
                            top: `${20 + i * 15}%`, 
                            left: `${i % 2 === 0 ? '10%' : '75%'}` 
                        }}
                    >
                        {text}
                    </motion.span>
                ))}
            </div>

            {/* SOLAR SYSTEM CONTAINER */}
            <div className="relative w-full h-full flex items-center justify-center scale-90 md:scale-100 transition-transform duration-700">
                
                {/* ☀️ THE BURNING GOLD SUN (CENTER) */}
                <motion.div 
                    whileHover="hover"
                    className="relative z-30 group/sun"
                >
                    {/* Flame Layers */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                                rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-2xl ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-red-500' : 'bg-gold'}`}
                            style={{ margin: `-${i * 10}px` }}
                        />
                    ))}

                    {/* Lightning/Sparks on Hover */}
                    <motion.div 
                        variants={{ hover: { opacity: 1, scale: 1.5 } }}
                        initial={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 z-40 pointer-events-none"
                    >
                        <ZapIcon className="absolute -top-10 left-1/2 -translate-x-1/2 text-white w-8 h-8 animate-pulse drop-shadow-xl" />
                        <ZapIcon className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white w-8 h-8 animate-pulse drop-shadow-xl delay-150" />
                    </motion.div>
                    
                    <motion.div 
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-32 h-32 md:w-44 md:h-44 bg-gradient-to-tr from-yellow-700 via-gold to-yellow-200 rounded-full flex items-center justify-center border-8 border-yellow-200/20 shadow-[0_0_80px_rgba(255,215,0,0.5)]"
                    >
                        <div className="text-center z-10">
                            <span className="block text-3xl md:text-4xl font-black text-white drop-shadow-2xl tracking-tighter italic">GOLD</span>
                            <div className="w-12 h-1.5 bg-black/30 rounded-full mx-auto mt-1" />
                        </div>
                        {/* Sun Shine Effect */}
                        <motion.div 
                            animate={{ x: ['-200%', '300%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 blur-xl pointer-events-none"
                        />
                    </motion.div>
                </motion.div>

                {/* 🪐 ORBITING PLANETS (SLOW & SMOOTH) */}
                {PLANETS.map((planet, i) => (
                    <div 
                        key={planet.name}
                        className="absolute rounded-full border border-white/5 pointer-events-none"
                        style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full top-0 left-0"
                        >
                            <div 
                                className="absolute flex flex-col items-center group/planet pointer-events-auto"
                                style={{ 
                                    top: '50%', 
                                    left: '100%', 
                                    transform: 'translate(-50%, -50%)' 
                                }}
                            >
                                {/* Planet Body */}
                                <motion.div 
                                    whileHover={{ scale: 1.5 }}
                                    className="rounded-full shadow-2xl border border-white/20 relative"
                                    style={{ 
                                        width: planet.size, 
                                        height: planet.size, 
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 20px ${planet.color}60`
                                    }}
                                >
                                    {/* Lighting Sparkle on Planet Hover */}
                                    <div className="absolute inset-0 bg-white/0 group-hover/planet:bg-white/20 transition-colors rounded-full blur-[2px]" />
                                </motion.div>

                                {/* Planet Name Label */}
                                <div className="absolute top-full mt-3 opacity-0 group-hover/planet:opacity-100 transition-all duration-300 translate-y-2 group-hover/planet:translate-y-0">
                                    <span className="text-[10px] font-black text-white bg-black/90 px-3 py-1 rounded-full border border-gold/40 shadow-xl whitespace-nowrap">
                                        {planet.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Hero Branding Overlay */}
            <div className="absolute bottom-12 left-12 z-30 max-w-xl text-left hidden md:block">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-1 bg-gold rounded-full" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.5em]">The Galaxy Standard</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-white mb-4 leading-tight uppercase italic">
                    GOLD <span className="text-gold">CHAIN</span>
                </h1>
                <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm">
                    A celestial financial ecosystem powered by mathematical scarcity. Join the mission.
                </p>
                <div className="flex gap-4 mt-8">
                    <button className="px-10 py-4 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,215,0,0.2)]">Swap Now</button>
                    <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all backdrop-blur-md">View Explorer</button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-gold transition-all duration-500 group overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={120} className="text-gold" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20">
                        <Activity className="w-7 h-7 text-gold" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-left">Market Price</h3>
                <div className="text-4xl font-black text-white tracking-tighter text-left">${currentPrice}</div>
            </GlassCard>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-emerald-500/20 bg-slate-900/40 hover:bg-emerald-500/5 transition-all duration-500 group overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={120} className="text-emerald-400" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-left">Protocol Reserve</h3>
                <div className="text-4xl font-black text-white tracking-tighter text-left">${formattedTVL}</div>
            </GlassCard>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-blue-400 transition-all duration-500 group overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={120} className="text-blue-400" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <TrendingUp className="w-7 h-7 text-blue-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-left">Total Volume</h3>
                <div className="text-4xl font-black text-white tracking-tighter text-left">${formattedVolume}</div>
            </GlassCard>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:border-white transition-all duration-500 group overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users size={120} className="text-white" />
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-left">Total Pioneers</h3>
                <div className="text-4xl font-black text-white tracking-tighter text-left">{holdersCount?.toString() || '1'}</div>
            </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};
