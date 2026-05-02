// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
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
  { name: 'Mercury', color: '#A5A5A5', size: 8, orbit: 70, speed: 12 },
  { name: 'Venus', color: '#E3BB76', size: 12, orbit: 100, speed: 20 },
  { name: 'Earth', color: '#2271B3', size: 14, orbit: 140, speed: 28 },
  { name: 'Mars', color: '#E27B58', size: 12, orbit: 180, speed: 35 },
  { name: 'Jupiter', color: '#D39C7E', size: 22, orbit: 230, speed: 50 },
];

const FLOATING_WORDS = [
  { text: "Small Investment", top: '20%', left: '15%' },
  { text: "Big Growth", top: '15%', left: '75%' },
  { text: "21 Million Cap", top: '70%', left: '80%' },
  { text: "100% Solvency", top: '75%', left: '20%' }
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
      className="space-y-6 md:space-y-10 pb-20 px-2"
    >
      {/* 🌌 CLEAN SOLAR SYSTEM HERO 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950/60 border border-gold/20 rounded-[3rem] min-h-[550px] md:min-h-[600px] flex items-center justify-center group shadow-2xl">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            {/* BRANDING (TOP-LEFT) */}
            <div className="absolute top-10 left-10 z-50">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                    GOLD <span className="text-gold animate-pulse">CHAIN</span>
                </h1>
                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2">Mathematical Galaxy Standard</p>
                <div className="w-16 h-1 bg-gold/30 mt-4 rounded-full" />
            </div>

            {/* ✨ FLOATING KEYWORDS ✨ */}
            <div className="absolute inset-0 pointer-events-none z-40">
                {FLOATING_WORDS.map((word, i) => (
                    <motion.div 
                        key={i}
                        animate={{ 
                            opacity: [0.3, 0.6, 0.3],
                            y: [0, -15, 0]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute hidden md:block"
                        style={{ top: word.top, left: word.left }}
                    >
                        <span className="text-[10px] font-black text-gold/60 uppercase tracking-[0.3em]">
                            {word.text}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* SOLAR SYSTEM CONTAINER */}
            <div className="relative w-full h-full flex items-center justify-center scale-[0.7] sm:scale-85 md:scale-90 lg:scale-100 transition-all duration-700">
                
                {/* ☀️ BURNING GOLD SUN */}
                <motion.div whileHover="hover" className="relative z-30 group/sun cursor-pointer">
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2], rotate: 360 }}
                            transition={{ duration: 6 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-[30px] md:blur-[50px] ${i === 0 ? 'bg-orange-600' : i === 1 ? 'bg-red-500' : 'bg-gold'}`}
                            style={{ margin: `-${i * 12}px` }}
                        />
                    ))}
                    
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-28 h-28 md:w-36 md:h-36 bg-gradient-to-tr from-yellow-700 via-gold to-yellow-200 rounded-full flex items-center justify-center border-[6px] border-yellow-200/20 shadow-[0_0_60px_rgba(255,215,0,0.4)]"
                    >
                        <span className="text-2xl md:text-3xl font-black text-white italic drop-shadow-2xl tracking-tighter">GOLD</span>
                    </motion.div>

                    {/* Lightning on Hover */}
                    <motion.div 
                        variants={{ hover: { opacity: 1, scale: 1.5 } }}
                        initial={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 z-50 pointer-events-none"
                    >
                        <ZapIcon className="absolute -top-12 left-1/2 -translate-x-1/2 text-white w-10 h-10 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                </motion.div>

                {/* 🪐 ORBITING PLANETS */}
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
                                    whileHover={{ scale: 1.8 }}
                                    className="rounded-full shadow-2xl border border-white/30"
                                    style={{ 
                                        width: planet.size, 
                                        height: planet.size, 
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 20px ${planet.color}80`
                                    }}
                                />
                                <div className="absolute top-full mt-3 opacity-0 group-hover/planet:opacity-100 transition-all">
                                    <span className="text-[9px] font-black text-white bg-black/95 px-3 py-1 rounded-full border border-gold/40 shadow-2xl whitespace-nowrap uppercase tracking-widest">
                                        {planet.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[{ label: 'Market Price', value: `$${currentPrice}`, icon: <Activity className="text-gold" />, border: 'border-gold/20' },
          { label: 'Protocol Reserve', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" />, border: 'border-emerald-500/20' },
          { label: 'Total Volume', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" />, border: 'border-blue-500/20' },
          { label: 'Total Pioneers', value: holdersCount?.toString() || '1', icon: <Users className="text-white" />, border: 'border-white/10' }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className={`p-6 md:p-8 ${stat.border} bg-slate-900/40 hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                        {stat.icon}
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-left">{stat.label}</h3>
                <div className="text-2xl md:text-4xl font-black text-white tracking-tighter text-left">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
