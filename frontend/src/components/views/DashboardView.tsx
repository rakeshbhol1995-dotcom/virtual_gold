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
  Target,
  Rocket,
  ArrowRight,
  Gem,
  Lock,
  Coins,
  BarChart4,
  CheckCircle2
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
      className="space-y-20 pb-40 px-4"
    >
      {/* 🌌 HERO SECTION 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950 border border-gold/20 rounded-[4rem] min-h-[700px] md:min-h-[850px] flex items-center justify-center group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.1)_0%,transparent_80%)] pointer-events-none" />
            
            <div className="absolute top-16 left-16 z-50">
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
                    GOLD <span className="text-gold">CHAIN</span>
                </h1>
                <p className="text-sm md:text-base font-black text-slate-500 uppercase tracking-[0.6em] mt-4">Galaxy Standard V2</p>
            </div>

            {/* ☀️ BURNING SURYA (CLEAN - NO TEXT) ☀️ */}
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.div className="relative z-30">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1], rotate: 360 }}
                            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-[60px] md:blur-[100px] ${i === 0 ? 'bg-red-600' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-400' : 'bg-gold'}`}
                            style={{ margin: `-${i * 20}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-40 h-40 md:w-64 md:h-64 bg-gradient-to-tr from-yellow-700 via-gold to-white rounded-full border-[10px] border-white/20 shadow-[0_0_120px_rgba(255,215,0,0.6)]"
                    />
                </motion.div>

                {/* 🪐 ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-white/10" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full">
                            <div className="absolute flex flex-col items-center group/planet pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full shadow-2xl border-2 border-white/40" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color, boxShadow: `0 0 30px ${planet.color}` }} />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-16 left-0 right-0 px-16 flex items-center justify-between z-50">
                <div className="flex gap-12">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Target Price</p>
                        <p className="text-3xl font-black text-white text-left">$100,000.00</p>
                    </div>
                </div>
                <button className="px-12 py-5 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,215,0,0.4)]">Invest Now</button>
            </div>
        </div>
      </motion.div>

      {/* 🚀 WHY INVEST IN GOLD CHAIN? (NEW SECTION) 🚀 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-10">
          <motion.div variants={item} className="space-y-6">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl border border-gold/20 flex items-center justify-center">
                  <Gem className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Absolute Scarcity</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                  Only 21,000,000 Gold Chains will ever exist. Just like Bitcoin, this scarcity ensures that as demand grows, the price must skyrocket. 
              </p>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Exponential Growth</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                  Our bonding curve math is designed for massive growth. Every purchase increases the price, targeting a valuation of $100,000 per gram.
              </p>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">100% Backed</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                  Every Gold Chain is 100% backed by USDT in the protocol reserve. No middlemen, no centralized risk—just pure on-chain security.
              </p>
          </motion.div>
      </div>

      {/* 💰 INVESTOR BENEFITS (LABHA) 💰 */}
      <motion.div variants={item} className="bg-slate-900/40 border border-white/10 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-20">
              <div className="flex-1">
                  <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none italic">
                      INVESTOR <span className="text-gold">BENEFITS</span>
                  </h2>
                  <p className="text-xl text-slate-400 font-medium mb-10 leading-relaxed">
                      Gold Chain is built for the community. We've removed all centralized barriers to give you the best investment experience.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {[
                        { title: 'Direct Ownership', desc: 'No banks or middlemen. You own your gold tokens 100%.', icon: <CheckCircle2 className="text-gold" /> },
                        { title: 'Zero Middlemen', desc: 'Fees go back to the protocol and holders, not to centralized bosses.', icon: <CheckCircle2 className="text-gold" /> },
                        { title: 'Instant Liquidity', desc: 'Sell back to the bonding curve anytime. Instant USDT withdrawal.', icon: <CheckCircle2 className="text-gold" /> },
                        { title: 'Transparent Math', desc: 'Watch the price and reserve grow in real-time on-chain.', icon: <CheckCircle2 className="text-gold" /> }
                      ].map((benefit, i) => (
                          <div key={i} className="flex gap-4">
                              <div className="mt-1">{benefit.icon}</div>
                              <div>
                                  <h4 className="font-black text-white uppercase text-sm mb-1">{benefit.title}</h4>
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{benefit.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="lg:w-1/3 bg-gold/10 border border-gold/20 rounded-[3rem] p-10 flex flex-col justify-center text-center">
                  <Coins className="w-20 h-20 text-gold mx-auto mb-6 drop-shadow-lg" />
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">Moon Ready</h3>
                  <p className="text-slate-400 font-medium mb-8">Start your journey today with as little as 1 USDT and watch your investment grow with the galaxy.</p>
                  <button className="w-full py-5 bg-gold text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">Start Investing</button>
              </div>
          </div>
      </motion.div>

      {/* 📊 MAIN STATS GRID 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[{ label: 'Live Price', value: `$${currentPrice}`, icon: <Activity className="text-gold" /> },
          { label: 'Total Reserve', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" /> },
          { label: 'Trading Volume', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" /> },
          { label: 'Global Pioneers', value: holdersCount?.toString() || '1', icon: <Users className="text-white" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className="p-8 border-white/10 bg-slate-900/40 group relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-gold/10 transition-colors">
                        {stat.icon}
                    </div>
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
