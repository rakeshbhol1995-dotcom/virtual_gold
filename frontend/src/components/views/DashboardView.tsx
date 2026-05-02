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
    transition: { staggerChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15 } }
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
      className="space-y-16 pb-40 px-4 pt-10"
    >
      {/* 📊 TOP SECTION: MAIN STATS 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Protocol Reserve (TVL)', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" />, border: 'border-emerald-500/20' },
          { label: 'Global Holders', value: holdersCount?.toString() || '1', icon: <Users className="text-white" />, border: 'border-white/10' },
          { label: 'Market Price', value: `$${currentPrice}`, icon: <Activity className="text-gold" />, border: 'border-gold/20' },
          { label: 'Trading Volume', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" />, border: 'border-blue-500/20' }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className={`p-8 ${stat.border} bg-slate-900/60 hover:scale-105 transition-all duration-500`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        {stat.icon}
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-left">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter text-left">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* 🌌 MIDDLE SECTION: GOLD SOLAR SYSTEM 🌌 */}
      <motion.div variants={item} className="relative">
        <div className="relative overflow-hidden bg-slate-950/90 border border-gold/30 rounded-[4rem] min-h-[600px] md:min-h-[800px] flex items-center justify-center group shadow-[0_0_100px_rgba(212,175,55,0.1)]">
            
            {/* Cinematic Branding (Logo Style) */}
            <div className="absolute top-16 text-center z-50">
                <motion.div
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative inline-block"
                >
                    <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-200 to-yellow-600 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                        GOLD CHAIN
                    </h2>
                    <div className="absolute -bottom-4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                </motion.div>
                <p className="text-[10px] font-black text-gold/40 uppercase tracking-[0.8em] mt-8 italic">The Moon Mission Standard</p>
            </div>

            {/* ☀️ PURE GOLD SURYA ☀️ */}
            <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-90 lg:scale-110">
                <motion.div className="relative z-30 group/sun cursor-pointer">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1], rotate: 360 }}
                            transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-0 rounded-full blur-[60px] md:blur-[120px] ${i % 2 === 0 ? 'bg-yellow-600' : 'bg-gold'}`}
                            style={{ margin: `-${i * 15}px` }}
                        />
                    ))}
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-36 h-36 md:w-56 md:h-56 bg-gradient-to-tr from-yellow-800 via-gold to-yellow-400 rounded-full border-[10px] border-gold/30 shadow-[0_0_150px_rgba(255,215,0,0.6)]"
                    />
                    
                    {/* Hover Lightning */}
                    <motion.div whileHover={{ opacity: 1, scale: 1.2 }} initial={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <ZapIcon className="text-white w-12 h-12 animate-pulse" />
                    </motion.div>
                </motion.div>

                {/* 🪐 GOLDEN ORBITS */}
                {PLANETS.map((planet, i) => (
                    <div key={planet.name} className="absolute rounded-full border border-gold/5" style={{ width: planet.orbit * 2, height: planet.orbit * 2 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full">
                            <div className="absolute flex flex-col items-center group/planet pointer-events-auto" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}>
                                <div className="rounded-full shadow-2xl border-2 border-white/20" style={{ width: planet.size, height: planet.size, backgroundColor: planet.color, boxShadow: `0 0 30px ${planet.color}80` }} />
                                <div className="absolute top-full mt-3 opacity-0 group-hover/planet:opacity-100 transition-all">
                                    <span className="text-[10px] font-black text-white bg-black/95 px-3 py-1 rounded-full border border-gold/40 shadow-2xl uppercase tracking-widest whitespace-nowrap">
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

      {/* ✍️ BOTTOM MARKETING SECTION ✍️ */}
      <div className="space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Extreme Scarcity', desc: 'A hard cap of 21,000,000 tokens ensures your investment stays rare and valuable.', icon: <Gem className="text-gold" /> },
                { title: 'Growth Engine', desc: 'Our bonding curve targets a $100,000 price point, rewarding early believers.', icon: <Rocket className="text-blue-400" /> },
                { title: 'Iron-Clad Security', desc: '100% USDT backed reserve. Rug-proof logic verified on-chain.', icon: <Lock className="text-emerald-400" /> }
              ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl group hover:border-gold/30 transition-all"
                  >
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                          {item.icon}
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{item.title}</h3>
                      <p className="text-slate-500 text-lg leading-relaxed text-left font-medium">{item.desc}</p>
                  </motion.div>
              ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-slate-900 via-slate-900 to-gold/10 border border-gold/20 rounded-[4rem] p-12 md:p-20 flex flex-col lg:flex-row gap-16 items-center"
          >
              <div className="flex-1 text-left">
                  <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic mb-8">
                      RETAIL <span className="text-gold">LABHA</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      {[
                        { title: 'Direct Control', desc: 'Full custody of your assets. No banks involved.', icon: <CheckCircle2 className="text-emerald-400" /> },
                        { title: 'Instant Liquidity', desc: 'Sell back to the curve instantly, 24/7.', icon: <CheckCircle2 className="text-emerald-400" /> },
                        { title: 'No Middlemen', desc: 'Fees are minimized to maximize your growth.', icon: <CheckCircle2 className="text-emerald-400" /> },
                        { title: 'Full Transparency', desc: 'Audit-ready code and on-chain metrics.', icon: <CheckCircle2 className="text-emerald-400" /> }
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
              <div className="lg:w-1/3 bg-gold/10 border border-gold/20 rounded-[4rem] p-12 text-center">
                  <Coins className="w-20 h-20 text-gold mx-auto mb-6 animate-bounce" />
                  <h3 className="text-4xl font-black text-white uppercase italic mb-4">Join Now</h3>
                  <p className="text-slate-400 font-medium mb-10 text-sm">Start your moon mission with as little as 1 USDT today.</p>
                  <button className="w-full py-6 bg-gold text-black rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_50px_rgba(255,215,0,0.4)] transition-all">Buy Now</button>
              </div>
          </motion.div>
      </div>
    </motion.div>
  );
};
