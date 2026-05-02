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
  { name: 'Mercury', color: '#A5A5A5', size: 8, orbit: 80, speed: 12 },
  { name: 'Venus', color: '#E3BB76', size: 12, orbit: 110, speed: 20 },
  { name: 'Earth', color: '#2271B3', size: 14, orbit: 150, speed: 28 },
  { name: 'Mars', color: '#E27B58', size: 12, orbit: 190, speed: 35 },
  { name: 'Jupiter', color: '#D39C7E', size: 22, orbit: 250, speed: 50 },
];

const TICKER_TEXT = "SMALL INVESTMENT, BIG GROWTH • 21 MILLION CAP • 100% SOLVENCY • MATHEMATICAL SCARCITY • BASE NETWORK • ";

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
      className="space-y-6 md:space-y-10 pb-20 px-2"
    >
      {/* 🌌 COMPACT SOLAR SYSTEM HERO 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950 border border-white/10 rounded-[3rem] min-h-[550px] md:min-h-[600px] flex flex-col items-center justify-center group shadow-2xl">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            {/* SOLAR SYSTEM CONTAINER (RESIZED) */}
            <div className="relative w-full h-[450px] flex items-center justify-center scale-[0.7] sm:scale-90 md:scale-100 transition-transform duration-700">
                
                {/* ☀️ BURNING GOLD SUN */}
                <motion.div whileHover="hover" className="relative z-30 group/sun">
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], rotate: 360 }}
                            transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-2xl ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-red-500' : 'bg-gold'}`}
                            style={{ margin: `-${i * 8}px` }}
                        />
                    ))}
                    
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-yellow-700 via-gold to-yellow-200 rounded-full flex items-center justify-center border-4 border-yellow-200/20 shadow-2xl"
                    >
                        <span className="text-xl md:text-2xl font-black text-white italic drop-shadow-xl">GOLD</span>
                    </motion.div>
                </motion.div>

                {/* 🪐 ORBITING PLANETS (COMPACT) */}
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
                                style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.5 }}
                                    className="rounded-full shadow-2xl border border-white/20"
                                    style={{ 
                                        width: planet.size, 
                                        height: planet.size, 
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 15px ${planet.color}40`
                                    }}
                                />
                                <div className="absolute top-full mt-2 opacity-0 group-hover/planet:opacity-100 transition-all">
                                    <span className="text-[8px] font-black text-white bg-black/90 px-2 py-0.5 rounded border border-gold/40 whitespace-nowrap uppercase tracking-tighter">
                                        {planet.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* 🎞️ BOTTOM SCROLLING TICKER 🎞️ */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gold/10 backdrop-blur-md border-t border-gold/20 flex items-center overflow-hidden">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap"
                >
                    {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-[12px] md:text-sm font-black text-gold uppercase tracking-[0.3em] px-4">
                            {TICKER_TEXT}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* BRANDING OVERLAY */}
            <div className="absolute top-10 left-10 z-30 hidden md:block">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                    GOLD <span className="text-gold">CHAIN</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mt-1">Galaxy Standard</p>
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* PRICE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-8 border-white/10 bg-slate-900/40 hover:border-gold transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-gold/10 rounded-xl border border-gold/20">
                        <Activity className="w-6 h-6 text-gold" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-left">Market Price</h3>
                <div className="text-2xl md:text-4xl font-black text-white tracking-tighter text-left">${currentPrice}</div>
            </GlassCard>
        </motion.div>

        {/* RESERVE CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-8 border-emerald-500/20 bg-slate-900/40 hover:bg-emerald-500/5 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-left">Protocol Reserve</h3>
                <div className="text-2xl md:text-4xl font-black text-white tracking-tighter text-left">${formattedTVL}</div>
            </GlassCard>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-8 border-white/10 bg-slate-900/40 hover:border-blue-400 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-left">Total Volume</h3>
                <div className="text-2xl md:text-4xl font-black text-white tracking-tighter text-left">${formattedVolume}</div>
            </GlassCard>
        </motion.div>

        {/* HOLDERS CARD */}
        <motion.div variants={item}>
            <GlassCard className="p-6 md:p-8 border-white/10 bg-slate-900/40 hover:border-white transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-left">Total Pioneers</h3>
                <div className="text-2xl md:text-4xl font-black text-white tracking-tighter text-left">{holdersCount?.toString() || '1'}</div>
            </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};
