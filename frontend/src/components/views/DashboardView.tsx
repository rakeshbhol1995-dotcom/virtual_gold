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
  ArrowDownRight,
  Sparkles
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

const brandReveal = {
  hidden: { opacity: 0, y: 20, letterSpacing: '0.6em' },
  show: { 
    opacity: 1, 
    y: 0, 
    letterSpacing: '0.4em',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  }
};

const PLANETS = [
  { name: 'Mercury', color: '#B59410', size: 10, orbit: 160, speed: 20 },
  { name: 'Venus', color: '#E3BB76', size: 16, orbit: 220, speed: 30 },
  { name: 'Earth', color: '#2271B3', size: 18, orbit: 280, speed: 40 },
  { name: 'Mars', color: '#E27B58', size: 14, orbit: 340, speed: 50 },
  { name: 'Jupiter', color: '#D39C7E', size: 30, orbit: 420, speed: 70 },
];

const MOCK_TRADES = [
  { id: '0x7a...4e21', type: 'BUY', amount: '1,250.00', time: '2 mins ago' },
  { id: '0x3b...9a12', type: 'SELL', amount: '420.50', time: '5 mins ago' },
  { id: '0x9d...f003', type: 'BUY', amount: '2,100.00', time: '12 mins ago' },
  { id: '0x1e...bb45', type: 'BUY', amount: '85.20', time: '15 mins ago' },
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
      className="space-y-24 pb-40 px-4 pt-10"
    >
      {/* 🌌 PREMIUM BRANDED HERO 🌌 */}
      <div className="relative overflow-hidden bg-slate-950/95 border border-gold/30 rounded-[4rem] min-h-[700px] md:min-h-[850px] flex flex-col items-center justify-center shadow-2xl">
            
            {/* ✨ STARS BACKGROUND ✨ */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(60)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.1, 0.6, 0.1] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_5px_white]"
                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>

            {/* 🏆 ROYAL GOLD CHAIN BRANDING 🏆 */}
            <div className="text-center z-50 mb-10">
                <motion.div variants={brandReveal} className="relative inline-block">
                    <h1 className="text-5xl md:text-9xl font-black uppercase tracking-[0.3em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FFF3A0] via-gold to-[#B8860B] drop-shadow-[0_10px_40px_rgba(255,215,0,0.4)]">
                        GOLD CHAIN
                    </h1>
                    {/* Glowing Underline */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent mt-6 shadow-[0_0_20px_gold]"
                    />
                </motion.div>
                <motion.p variants={brandReveal} className="text-[10px] md:text-sm font-black text-gold/30 uppercase tracking-[1.2em] mt-10">THE SUPREME ON-CHAIN GOLD STANDARD</motion.p>
            </div>

            {/* GOLDEN SINGULARITY ANIMATION */}
            <div className="relative w-full flex items-center justify-center scale-75 md:scale-90 lg:scale-100 mt-10">
                <motion.div className="relative z-30">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.2, 0.05], rotate: 360 }}
                            transition={{ duration: 5 + i, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gold blur-[70px]"
                            style={{ margin: `-${i * 25}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="relative w-40 h-40 md:w-60 md:h-60 border-2 border-gold/20 rounded-full flex items-center justify-center p-4"
                    >
                        <div className="absolute w-4/5 h-4/5 border-[3px] border-gold/50 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3)]" />
                        <div className="absolute w-1/3 h-1/3 bg-gradient-to-tr from-yellow-700 to-gold rounded-full shadow-[0_0_60px_rgba(255,215,0,0.5)]" />
                    </motion.div>
                </motion.div>

                {/* 🪐 GOLDEN ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-white/5 pointer-events-none" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full">
                            <div className="absolute flex flex-col items-center pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full border-2 border-white/20 shadow-2xl" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color }} />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-16 flex items-center gap-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md opacity-40">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Protocol Active</span>
            </div>
      </div>

      {/* 📊 PROTOCOL METRICS 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'MARKET PRICE', value: `$${currentPrice}`, icon: <Activity className="text-gold" /> },
          { label: 'PROTOCOL TVL', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" /> },
          { label: 'GLOBAL HOLDERS', value: holdersCount?.toString() || '1', icon: <Users className="text-white" /> },
          { label: 'TRADE VOLUME', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={brandReveal}>
            <GlassCard className="p-12 border-white/5 bg-slate-900/60 hover:bg-gold/5 transition-all text-center group">
                <div className="flex justify-center mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">{stat.icon}</div>
                </div>
                <h3 className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-2">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* 🚀 LIVE MARKET ACTIVITY LOG 🚀 */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto w-full"
      >
        <GlassCard className="border-gold/20 bg-slate-900/40 rounded-[3rem] overflow-hidden">
            <div className="p-10 md:p-14 space-y-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-10">
                    <div className="space-y-2 text-left">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">LIVE <span className="text-gold">ACTIVITY</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Real-time Trading Pulse</p>
                    </div>
                    <Activity className="w-10 h-10 text-gold opacity-20 animate-pulse" />
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Wallet ID</th>
                                <th className="pb-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Action</th>
                                <th className="pb-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Amount (GOLD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_TRADES.map((trade, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-8 text-sm font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">{trade.id}</td>
                                    <td className="py-8">
                                        <div className={`mx-auto flex items-center justify-center gap-2 w-24 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {trade.type === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {trade.type}
                                        </div>
                                    </td>
                                    <td className="py-8 text-lg font-black text-white text-right tracking-tighter">{trade.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
