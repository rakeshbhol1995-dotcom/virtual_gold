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
  Calculator
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
    transition: { staggerChildren: 0.25 }
  }
};

const cinematicReveal = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const PLANETS = [
  { name: 'Mercury', color: '#B59410', size: 12, orbit: 140, speed: 18 },
  { name: 'Venus', color: '#E3BB76', size: 18, orbit: 190, speed: 28 },
  { name: 'Earth', color: '#2271B3', size: 20, orbit: 250, speed: 38 },
  { name: 'Mars', color: '#E27B58', size: 16, orbit: 310, speed: 48 },
  { name: 'Jupiter', color: '#D39C7E', size: 34, orbit: 390, speed: 68 },
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
      {/* 🌌 HERO SECTION: 24 KARAT SOLAR SYSTEM 🌌 */}
      <motion.div variants={cinematicReveal} className="relative">
        <div className="relative overflow-hidden bg-slate-950/95 border border-gold/30 rounded-[4rem] min-h-[650px] md:min-h-[850px] flex items-center justify-center group shadow-2xl">
            
            {/* Cinematic Branding */}
            <div className="absolute top-16 text-center z-50">
                <h2 className="text-4xl md:text-7xl font-black italic tracking-[0.05em] uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-100 to-yellow-600 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    GOLD CHAIN
                </h2>
                <div className="w-24 h-1 bg-gold/50 mx-auto mt-4 rounded-full shadow-gold" />
                <p className="text-[10px] md:text-sm font-black text-gold/40 uppercase tracking-[0.6em] mt-8 italic">The Purest On-Chain Gold Standard</p>
            </div>

            {/* ☀️ 24 KARAT GOLD SURYA ☀️ */}
            <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-90 lg:scale-100">
                <motion.div className="relative z-30 group/sun cursor-pointer">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1], rotate: 360 }}
                            transition={{ duration: 6 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-[70px] md:blur-[130px] ${i % 2 === 0 ? 'bg-yellow-600' : 'bg-gold'}`}
                            style={{ margin: `-${i * 15}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-40 h-40 md:w-64 md:h-64 bg-gradient-to-tr from-yellow-800 via-gold to-yellow-400 rounded-full border-[12px] border-gold/30 shadow-[0_0_150px_rgba(255,215,0,0.6)] flex items-center justify-center"
                    >
                        <div className="text-center z-10">
                            <span className="block text-2xl md:text-4xl font-black text-white italic tracking-tighter drop-shadow-xl">24 KARAT</span>
                            <span className="block text-[8px] md:text-[10px] font-black text-black bg-white/40 rounded px-2 mt-1 uppercase tracking-widest">Pure Gold</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* 🪐 GOLDEN ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-gold/10 pointer-events-none" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full top-0 left-0">
                            <div className="absolute flex flex-col items-center group/planet pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full shadow-2xl border-2 border-white/30" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color, boxShadow: `0 0 40px ${planet.color}CC` }} />
                                <div className="absolute top-full mt-3 opacity-0 group-hover/planet:opacity-100 transition-all scale-75 group-hover/planet:scale-100">
                                    <span className="text-[10px] font-black text-white bg-black/95 px-4 py-1 rounded-full border border-gold/40 shadow-2xl uppercase tracking-widest whitespace-nowrap">
                                        {planet.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-16 flex flex-col items-center gap-6 z-50">
                <button className="px-14 py-6 bg-gold text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,215,0,0.4)]">Launch Terminal</button>
            </div>
        </div>
      </motion.div>

      {/* 📊 PROTOCOL OVERVIEW 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Protocol Reserve', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" /> },
          { label: 'Total Pioneers', value: holdersCount?.toString() || '1', icon: <Users className="text-white" /> },
          { label: 'Market Price', value: `$${currentPrice}`, icon: <Activity className="text-gold" /> },
          { label: 'Trading Volume', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={cinematicReveal}>
            <GlassCard className="p-10 border-white/10 bg-slate-900/60 hover:bg-white/[0.03] transition-all duration-500">
                <div className="flex items-center justify-between mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">{stat.icon}</div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-left">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter text-left">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* 🚀 THE 1 USDT INVESTMENT JOURNEY (NEW) 🚀 */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900/40 border border-gold/30 rounded-[4rem] p-12 md:p-24 relative overflow-hidden"
      >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/10 blur-[150px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 text-left space-y-10">
                  <div className="flex items-center gap-4">
                      <Calculator className="w-10 h-10 text-gold" />
                      <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
                          INVEST <span className="text-gold">1 USDT</span>
                      </h2>
                  </div>
                  
                  <div className="space-y-8">
                      <p className="text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl">
                          What happens when you invest just <span className="text-white font-bold">1 USDT</span> today? Due to our <span className="text-gold font-bold">4762 Slope</span> and <span className="text-white font-bold">21M Hard-Cap</span>, your investment is on a moon-bound trajectory.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                              <h4 className="text-gold font-black uppercase text-xs mb-2 tracking-widest">Year 1 Projection</h4>
                              <p className="text-4xl font-black text-white">$100 - $1,000+</p>
                              <p className="text-[10px] text-slate-500 mt-2">Based on scarcity math & bonding curve growth.</p>
                          </div>
                          <div className="p-8 bg-gold/10 rounded-3xl border border-gold/30">
                              <h4 className="text-white font-black uppercase text-xs mb-2 tracking-widest">Max Supply Target</h4>
                              <p className="text-4xl font-black text-gold">$100,000 / Gram</p>
                              <p className="text-[10px] text-slate-500 mt-2">The ultimate scarcity goal of Gold Chain.</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="lg:w-1/3 text-center bg-black/40 backdrop-blur-2xl border border-white/10 p-16 rounded-[4rem] shadow-2xl relative">
                  <Rocket className="w-20 h-20 text-gold mx-auto mb-8 animate-bounce" />
                  <h3 className="text-4xl font-black text-white uppercase italic mb-4">Start Your Journey</h3>
                  <p className="text-slate-400 text-base font-medium mb-12">Small investment today, astronomical growth tomorrow.</p>
                  <button className="w-full py-6 bg-gold text-black rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-gold">Invest Now</button>
              </div>
          </div>
      </motion.div>

      {/* 💰 INVESTOR BENEFITS 💰 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: 'Extreme Scarcity', desc: 'A hard cap of 21,000,000 tokens ensures your investment stays rare and valuable.', icon: <Gem className="text-gold" /> },
            { title: 'Liquidity Guarantee', desc: '100% USDT backed reserve. Sell back to the protocol anytime.', icon: <CheckCircle2 className="text-emerald-400" /> },
            { title: 'Zero Middlemen', desc: 'Fees go back to the protocol and holders, not to banks.', icon: <Lock className="text-blue-400" /> }
          ].map((item, i) => (
              <motion.div key={i} variants={cinematicReveal} className="p-10 bg-slate-900/60 border border-white/5 rounded-[3rem] hover:border-gold/20 transition-all">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10">{item.icon}</div>
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium text-left">{item.desc}</p>
              </motion.div>
          ))}
      </div>
    </motion.div>
  );
};
