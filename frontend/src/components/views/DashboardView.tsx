// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Target,
  Rocket,
  Gem,
  Lock,
  Coins,
  CheckCircle2,
  ZapIcon,
  Calculator,
  MessageSquare,
  Share2,
  Globe,
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
    transition: { staggerChildren: 0.2 }
  }
};

const straightCinematic = {
  hidden: { opacity: 0, y: 30, letterSpacing: '0.4em' },
  show: { 
    opacity: 1, 
    y: 0, 
    letterSpacing: '0.2em',
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const PLANETS = [
  { name: 'Mercury', color: '#B59410', size: 10, orbit: 160, speed: 20 },
  { name: 'Venus', color: '#E3BB76', size: 16, orbit: 220, speed: 30 },
  { name: 'Earth', color: '#2271B3', size: 18, orbit: 280, speed: 40 },
  { name: 'Mars', color: '#E27B58', size: 14, orbit: 340, speed: 50 },
  { name: 'Jupiter', color: '#D39C7E', size: 30, orbit: 420, speed: 70 },
];

const RECENT_MINT_MSGS = [
  "NEW PIONEER JOINED: 520 GOLD MINTED",
  "WHALE ALERT: 1,250 GOLD LOCKED",
  "GROWTH MILESTONE: PRICE HIT $10.45",
  "DIRECT SWAP: 100 USDT -> GOLD",
  "PIONEER REWARD: 12 GOLD HARVESTED"
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
      className="space-y-32 pb-40 px-4 pt-10"
    >
      {/* 🌌 HERO SECTION: GOLDEN SINGULARITY 🌌 */}
      <motion.div variants={straightCinematic} className="relative">
        <div className="relative overflow-hidden bg-slate-950/95 border border-gold/20 rounded-[4rem] min-h-[650px] md:min-h-[850px] flex items-center justify-center group shadow-2xl">
            
            {/* BACKGROUND FLOATING PARTICLES */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [-20, 20, -20], 
                            x: [-10, 10, -10],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity }}
                        className="absolute w-1 h-1 bg-gold rounded-full"
                        style={{ 
                            top: `${Math.random() * 100}%`, 
                            left: `${Math.random() * 100}%` 
                        }}
                    />
                ))}
            </div>

            {/* STRAIGHT CINEMATIC BRANDING */}
            <div className="absolute top-20 text-center z-50">
                <motion.h2 
                    variants={straightCinematic}
                    className="text-4xl md:text-8xl font-black tracking-[0.3em] uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-200 to-yellow-700 drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]"
                >
                    GOLD CHAIN
                </motion.h2>
                <motion.p 
                    variants={straightCinematic}
                    className="text-[10px] md:text-xs font-black text-gold/40 uppercase tracking-[1em] mt-8"
                >
                    Mathematical Galaxy Protocol
                </motion.p>
            </div>

            {/* ✨ NEW GOLDEN SINGULARITY ANIMATION ✨ */}
            <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-90 lg:scale-100">
                
                {/* CORE PULSE */}
                <motion.div className="relative z-30">
                    {[...Array(5)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.2, 0.05] }}
                            transition={{ duration: 4 + i, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gold blur-[80px]"
                            style={{ margin: `-${i * 30}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="relative w-48 h-48 md:w-72 md:h-72 border-2 border-gold/20 rounded-full flex items-center justify-center p-4"
                    >
                        {/* Internal Rings */}
                        <div className="w-full h-full border-[1px] border-gold/40 rounded-full animate-ping opacity-20" />
                        <div className="absolute w-4/5 h-4/5 border-[4px] border-gold/60 rounded-full shadow-[0_0_40px_rgba(255,215,0,0.4)]" />
                        <div className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-yellow-700 to-gold rounded-full shadow-[0_0_80px_rgba(255,215,0,0.6)]" />
                    </motion.div>
                </motion.div>

                {/* 🪐 WIDE ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-white/5 pointer-events-none" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full top-0 left-0">
                            <div className="absolute flex flex-col items-center group/planet pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full shadow-2xl border-2 border-white/20" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color, boxShadow: `0 0 30px ${planet.color}` }} />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* LIVE ACTIVITY TICKER */}
            <div className="absolute bottom-16 w-full px-12 z-50 overflow-hidden">
                <div className="flex justify-center items-center gap-12 animate-marquee whitespace-nowrap">
                    {RECENT_MINT_MSGS.map((msg, i) => (
                        <div key={i} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(255,215,0,1)]" />
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">{msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </motion.div>

      {/* 🚀 THE 1 USDT INVESTMENT JOURNEY 🚀 */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900/60 border border-gold/20 rounded-[4rem] p-12 md:p-24 relative overflow-hidden"
      >
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gold/5 blur-[180px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-24 items-center">
              <div className="flex-1 text-left space-y-16">
                  <div className="space-y-6">
                      <motion.h2 
                        variants={straightCinematic}
                        className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none"
                      >
                          INVEST <span className="text-gold">1 USDT</span>
                      </motion.h2>
                      <div className="w-24 h-2 bg-gold rounded-full" />
                  </div>
                  
                  <div className="space-y-10">
                      <p className="text-2xl text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                          WHAT HAPPENS WHEN YOU INVEST JUST <span className="text-white">1 USDT</span> TODAY? DUE TO OUR <span className="text-gold">4762 SLOPE</span> AND <span className="text-white">21M HARD-CAP</span>, YOUR INVESTMENT IS ON A MOON-BOUND TRAJECTORY.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                          <div className="p-12 bg-white/5 rounded-[3rem] border border-white/10 group hover:border-gold/30 transition-all">
                              <h4 className="text-gold font-black uppercase text-[10px] mb-4 tracking-[0.4em]">YEAR 1 PROJECTION</h4>
                              <p className="text-5xl font-black text-white tracking-tighter">$100 - $1,000+</p>
                              <p className="text-[10px] text-slate-600 mt-6 uppercase tracking-widest font-black">PROTOCOL FORECAST</p>
                          </div>
                          <div className="p-12 bg-gold/5 rounded-[3rem] border border-gold/20 group hover:scale-105 transition-all">
                              <h4 className="text-white font-black uppercase text-[10px] mb-4 tracking-[0.4em]">MAX SUPPLY TARGET</h4>
                              <p className="text-5xl font-black text-gold tracking-tighter">$100,000</p>
                              <p className="text-[10px] text-slate-600 mt-6 uppercase tracking-widest font-black">SCARCITY VALUE</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="lg:w-1/3 text-center bg-black/60 backdrop-blur-3xl border border-white/10 p-20 rounded-[4rem] shadow-2xl relative">
                  <Rocket className="w-24 h-24 text-gold mx-auto mb-10 animate-bounce" />
                  <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">BUY GOLD</h3>
                  <p className="text-slate-500 text-sm font-black uppercase tracking-widest mb-12">Small seed, massive galaxy growth.</p>
                  <button className="w-full py-8 bg-gold text-black rounded-3xl font-black uppercase tracking-[0.4em] text-xs hover:shadow-gold transition-all">Invest Now</button>
              </div>
          </div>
      </motion.div>

      {/* 📊 MAIN STATS GRID 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'GLOBAL PIONEERS', value: holdersCount?.toString() || '1', icon: <Users className="text-white" /> },
          { label: 'MARKET PRICE', value: `$${currentPrice}`, icon: <Activity className="text-gold" /> },
          { label: 'PROTOCOL RESERVE', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" /> },
          { label: 'TRADE VOLUME', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={straightCinematic}>
            <GlassCard className="p-12 border-white/5 bg-slate-900/60 hover:bg-gold/5 transition-all duration-500 text-center relative overflow-hidden group">
                <div className="flex justify-center mb-10">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group-hover:scale-110 transition-transform">{stat.icon}</div>
                </div>
                <h3 className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-3">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
