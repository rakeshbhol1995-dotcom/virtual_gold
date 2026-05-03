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
import { FloatingGem } from '@/components/ui/FloatingGem';
import { useReadContract, useChainId, useAccount } from 'wagmi';
import { getContractAddress, CONTRACTS, GOLD_BONDING_CURVE_ABI, ERC20_ABI } from '@/constants/contracts';
import { formatUnits, parseAbi } from 'viem';
import { useMounted } from '@/hooks/useMounted';
import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { TradingChart } from '@/components/ui/TradingChart';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const brandReveal = {
  hidden: { opacity: 0, y: 20, letterSpacing: '0.4em' },
  show: { 
    opacity: 1, 
    y: 0, 
    letterSpacing: '0.25em',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
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
  const goldTokenAddress = '0x2DE2FAacA36a2BD434276126966F32453B7d1849';
  const bondingCurveAddress = '0x15C3EC22A9DB635B3B5FbE49B9dd2b567Cd31e85';
  const collateralTokenAddress = CONTRACTS[84532].collateralToken;

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    chainId: 84532,
    address: goldTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'totalSupply',
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: price, refetch: refetchPrice } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: volume, refetch: refetchVolume } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'totalVolume',
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: holdersCount, refetch: refetchHolders } = useReadContract({
    chainId: 84532,
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'holdersCount',
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: tvlBalance, refetch: refetchTVL } = useReadContract({
    chainId: 84532,
    address: collateralTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'balanceOf',
    args: [bondingCurveAddress as `0x${string}`],
    query: { refetchInterval: 1000, staleTime: 0 }
  });


  const currentPrice = useMemo(() => price ? formatUnits(price as bigint, 6) : '10.00', [price]);
  const formattedVolume = useMemo(() => volume ? Number(formatUnits(volume as bigint, 6)).toLocaleString() : '0', [volume]);
  const formattedTVL = useMemo(() => tvlBalance ? Number(formatUnits(tvlBalance as bigint, 6)).toLocaleString() : '0', [tvlBalance]);
  const formattedTotalSupply = useMemo(() => totalSupply ? Number(formatUnits(totalSupply as bigint, 18)).toLocaleString() : '0', [totalSupply]);
  const formattedHolders = useMemo(() => holdersCount ? Number(holdersCount).toLocaleString() : '0', [holdersCount]);

  if (!mounted) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-24 pb-40 px-4 pt-10"
    >
      {/* 🌌 HERO SECTION: RESIZED BRANDING 🌌 */}
      <div className="relative overflow-hidden bg-slate-950/95 border border-gold/30 rounded-[4rem] min-h-[700px] md:min-h-[800px] flex flex-col items-center justify-center shadow-2xl">
            
            {/* ✨ STARS ✨ */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(60)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.1, 0.6, 0.1] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full"
                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>

            {/* 🏆 RESIZED BRANDING 🏆 */}
            <div className="text-center z-50 mb-8">
                <motion.div variants={brandReveal} className="relative inline-block">
                    {/* Resized Text: md:text-7xl for better balance */}
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FFF3A0] via-gold to-[#B8860B] drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                        GOLD CHAIN
                    </h1>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                      className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent mt-4 shadow-[0_0_15px_gold]"
                    />
                </motion.div>
                {/* New Base Subtext */}
                <motion.p variants={brandReveal} className="text-[10px] md:text-xs font-black text-gold/40 uppercase tracking-[0.8em] mt-8">
                    BASE NATIVE GOLD STANDARD
                </motion.p>
            </div>

            {/* GOLDEN SINGULARITY (REVERTED TO STABLE DESIGN) */}
            <div className="relative w-full flex items-center justify-center scale-75 md:scale-90 lg:scale-100 mt-6">
                <motion.div className="relative z-30">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.2, 0.05], rotate: 360 }}
                            transition={{ duration: 5 + i, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gold blur-[60px]"
                            style={{ margin: `-${i * 20}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="relative w-40 h-40 md:w-56 md:h-56 border-2 border-gold/20 rounded-full flex items-center justify-center p-4"
                    >
                        <div className="absolute w-4/5 h-4/5 border-[2px] border-gold/40 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.2)]" />
                        <div className="absolute w-1/3 h-1/3 bg-gradient-to-tr from-yellow-700 to-gold rounded-full shadow-[0_0_50px_rgba(255,215,0,0.4)]" />
                    </motion.div>
                </motion.div>

                {/* 🪐 ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-white/5 pointer-events-none" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full">
                            <div className="absolute flex flex-col items-center pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full border border-white/10" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color }} />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-16 flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md opacity-50">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Verified on Base</span>
            </div>
      </div>

      {/* 📊 PROTOCOL METRICS 📊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'MARKET PRICE', value: `$${currentPrice}`, icon: <Activity className="text-gold" /> },
          { label: 'PROTOCOL TVL', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" /> },
          { label: 'GLOBAL HOLDERS', value: formattedHolders, icon: <Users className="text-white" /> },
          { label: 'TRADE VOLUME', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={brandReveal}>
            <GlassCard className="p-6 md:p-10 border-white/5 bg-slate-900/60 hover:bg-gold/5 transition-all text-center group">
                <div className="flex justify-center mb-6 md:mb-8">
                    <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">{stat.icon}</div>
                </div>
                <h3 className="text-slate-600 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-2">{stat.label}</h3>
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* 🚀 TERMINAL FOOTER: ACTIVITY & CHAT 🚀 */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto w-full"
      >
        <div className="grid lg:grid-cols-12 gap-8">
            {/* Trading Chart (Left - 8 columns) */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-6">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter italic">MARKET <span className="text-gold">CHART</span></h2>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Real-time Candlestick Feed</p>
                    </div>
                </div>
                <div className="w-full h-[500px] md:h-[600px]">
                    <GlassCard className="h-full border-gold/10 bg-black/40 overflow-hidden">
                        <TradingChart />
                    </GlassCard>
                </div>
            </div>

            {/* Live Activity (Right - 4 columns) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between px-6">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter italic">LIVE <span className="text-gold">FEED</span></h2>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Real-time Syncing</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                        <div className="w-1 h-1 bg-gold rounded-full animate-pulse" />
                        <span className="text-[7px] font-black text-gold uppercase tracking-widest">Sync</span>
                    </div>
                </div>
                <div className="w-full h-[500px] md:h-[600px] overflow-hidden">
                    <ActivityScanner />
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
