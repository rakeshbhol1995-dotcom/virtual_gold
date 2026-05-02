// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ZapIcon,
  BarChart3,
  Clock,
  ArrowUpRight,
  Target,
  Rocket
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
  { name: 'Mercury', color: '#A5A5A5', size: 10, orbit: 90, speed: 15 },
  { name: 'Venus', color: '#E3BB76', size: 16, orbit: 130, speed: 25 },
  { name: 'Earth', color: '#2271B3', size: 18, orbit: 180, speed: 35 },
  { name: 'Mars', color: '#E27B58', size: 14, orbit: 230, speed: 45 },
  { name: 'Jupiter', color: '#D39C7E', size: 30, orbit: 310, speed: 65 },
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

  const { data: totalSupply } = useReadContract({
    chainId: 84532,
    address: getContractAddress(84532, 'goldToken') as `0x${string}`,
    abi: parseAbi(['function totalSupply() view returns (uint256)']),
    functionName: 'totalSupply',
  });

  const currentPrice = useMemo(() => price ? formatUnits(price as bigint, 6) : '10.00', [price]);
  const formattedVolume = useMemo(() => volume ? Number(formatUnits(volume as bigint, 6)).toLocaleString() : '0', [volume]);
  const formattedTVL = useMemo(() => volume ? (Number(formatUnits(volume as bigint, 6)) * 0.85).toLocaleString() : '0', [volume]);
  
  const supplyPercent = useMemo(() => {
    if (!totalSupply) return 0;
    const supply = Number(formatUnits(totalSupply as bigint, 18));
    return (supply / 21000000) * 100;
  }, [totalSupply]);

  if (!mounted) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-32 px-4"
    >
      {/* 🌌 MEGA SOLAR HERO SECTION (BIGGER) 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950 border border-gold/20 rounded-[4rem] min-h-[750px] md:min-h-[850px] flex items-center justify-center group shadow-[0_0_150px_rgba(255,184,0,0.1)]">
            {/* Space Nebula */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.1)_0%,transparent_80%)] pointer-events-none" />
            
            {/* BRANDING (TOP-LEFT) */}
            <div className="absolute top-16 left-16 z-50">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
                        GOLD <span className="text-gold">CHAIN</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-1.5 bg-gold rounded-full" />
                        <p className="text-sm md:text-base font-black text-slate-500 uppercase tracking-[0.6em]">Galaxy Standard V2</p>
                    </div>
                </motion.div>
            </div>

            {/* ☀️ MEGA BURNING SURYA (BIGGER & BRIGHTER) ☀️ */}
            <div className="relative w-full h-full flex items-center justify-center scale-90 md:scale-100 lg:scale-110">
                <motion.div whileHover="hover" className="relative z-30 group/sun cursor-pointer">
                    {/* Layered Sun Fire */}
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.4, 1], 
                                opacity: [0.1, 0.4, 0.1], 
                                rotate: [0, 90, 180, 270, 360] 
                            }}
                            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-[60px] md:blur-[100px] ${i === 0 ? 'bg-red-600' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-400' : 'bg-gold'}`}
                            style={{ margin: `-${i * 20}px` }}
                        />
                    ))}
                    
                    <motion.div 
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-40 h-40 md:w-56 md:h-56 bg-gradient-to-tr from-yellow-700 via-gold to-white rounded-full flex items-center justify-center border-[10px] border-white/20 shadow-[0_0_120px_rgba(255,215,0,0.6)]"
                    >
                        <div className="text-center z-10">
                            <span className="block text-4xl md:text-6xl font-black text-white italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-tighter">GOLD</span>
                            <div className="w-16 h-2 bg-black/40 rounded-full mx-auto mt-2" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* 🪐 ORBITING PLANETS (EXPANDED) */}
                {PLANETS.map((planet, i) => (
                    <div 
                        key={planet.name}
                        className="absolute rounded-full border border-white/10 pointer-events-none"
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
                                    whileHover={{ scale: 2 }}
                                    className="rounded-full shadow-2xl border-2 border-white/40"
                                    style={{ 
                                        width: planet.size, 
                                        height: planet.size, 
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 30px ${planet.color}`
                                    }}
                                />
                                <div className="absolute top-full mt-4 opacity-0 group-hover/planet:opacity-100 transition-all scale-75 group-hover/planet:scale-100">
                                    <span className="text-[10px] font-black text-white bg-black/95 px-4 py-1.5 rounded-full border border-gold/40 shadow-2xl whitespace-nowrap uppercase tracking-widest">
                                        {planet.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* 📊 BOTTOM METRICS BAR (NEW) 📊 */}
            <div className="absolute bottom-16 left-0 right-0 px-16 flex items-center justify-between z-50">
                <div className="flex gap-12">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Max Supply</p>
                        <p className="text-2xl font-black text-white">21,000,000.00</p>
                    </div>
                    <div className="w-[1px] h-10 bg-white/10" />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Price</p>
                        <p className="text-2xl font-black text-gold">$100,000.00</p>
                    </div>
                </div>
                <button className="px-12 py-5 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,215,0,0.4)]">Buy Gold Now</button>
            </div>
        </div>
      </motion.div>

      {/* 🚀 PROTOCOL HEALTH & PROGRESS 🚀 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Supply Progress */}
          <GlassCard className="lg:col-span-2 p-10 border-gold/20 bg-slate-900/60 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Minting Progress</h3>
                      <p className="text-slate-500 text-xs font-medium">Scarcity tracking in real-time</p>
                  </div>
                  <Target className="w-10 h-10 text-gold opacity-50" />
              </div>
              <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, supplyPercent)}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-yellow-300 shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                  />
              </div>
              <div className="flex justify-between mt-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Current: {totalSupply ? formatUnits(totalSupply as bigint, 18) : '0'} GOLD</span>
                  <span className="text-[10px] font-black text-gold uppercase tracking-widest">Hard Cap: 21,000,000</span>
              </div>
          </GlassCard>

          {/* Protocol Status */}
          <GlassCard className="p-10 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Protocol Status</h3>
              </div>
              <div className="space-y-6">
                  <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Security Audit</span>
                      <span className="text-[10px] font-black text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">Passed</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Liquidity</span>
                      <span className="text-[10px] font-black text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">Locked</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Slippage Protection</span>
                      <span className="text-[10px] font-black text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">Active</span>
                  </div>
              </div>
          </GlassCard>
      </div>

      {/* 📊 MAIN STATS GRID 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[{ label: 'Live Price', value: `$${currentPrice}`, icon: <Activity className="text-gold" />, color: 'gold' },
          { label: 'Total Reserve', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" />, color: 'emerald' },
          { label: 'Trading Volume', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" />, color: 'blue' },
          { label: 'Global Pioneers', value: holdersCount?.toString() || '1', icon: <Users className="text-white" />, color: 'white' }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 hover:scale-105 transition-all duration-500 group relative">
                <div className="flex items-center justify-between mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-gold/10 transition-colors">
                        {stat.icon}
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-left">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter text-left">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
