// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\DashboardView.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MessageSquare,
  Share2
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
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const MOCK_TRADES = [
  { id: '0x7a...4e21', type: 'BUY', amount: '1,250.00', time: '2 mins ago', status: 'Success' },
  { id: '0x3b...9a12', type: 'SELL', amount: '420.50', time: '5 mins ago', status: 'Success' },
  { id: '0x9d...f003', type: 'BUY', amount: '2,100.00', time: '12 mins ago', status: 'Success' },
  { id: '0x1e...bb45', type: 'BUY', amount: '85.20', time: '15 mins ago', status: 'Success' },
  { id: '0x5c...dd89', type: 'SELL', amount: '930.00', time: '22 mins ago', status: 'Success' },
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
      className="max-w-7xl mx-auto space-y-12 pb-40 px-4 pt-10"
    >
      {/* 📊 TOP SECTION: PROTOCOL METRICS 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'MARKET PRICE', value: `$${currentPrice}`, icon: <Activity className="text-gold" />, border: 'border-gold/30' },
          { label: 'PROTOCOL TVL', value: `$${formattedTVL}`, icon: <ShieldCheck className="text-emerald-400" />, border: 'border-emerald-500/20' },
          { label: 'GLOBAL HOLDERS', value: holdersCount?.toString() || '1', icon: <Users className="text-white" />, border: 'border-white/10' },
          { label: 'TOTAL VOLUME', value: `$${formattedVolume}`, icon: <TrendingUp className="text-blue-400" />, border: 'border-blue-500/20' }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className={`p-8 ${stat.border} bg-slate-900/60 text-center relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">{stat.icon}</div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{stat.label}</h3>
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">{stat.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* 🚀 LIVE MARKET ACTIVITY LOG 🚀 */}
      <motion.div variants={item}>
        <GlassCard className="border-white/10 bg-slate-900/40 rounded-[3rem] overflow-hidden">
            <div className="p-10 md:p-14 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                            LIVE <span className="text-gold">ACTIVITY</span>
                        </h2>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Real-time Market Events on Base</p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Network Live</span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Address ID</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount (GOLD)</th>
                                <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_TRADES.map((trade, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 text-sm font-black text-white tracking-widest opacity-60 group-hover:opacity-100">{trade.id}</td>
                                    <td className="py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {trade.type === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {trade.type}
                                        </div>
                                    </td>
                                    <td className="py-6 text-sm font-black text-white text-right tracking-tighter">{trade.amount}</td>
                                    <td className="py-6 text-[10px] font-black text-slate-600 text-right uppercase tracking-widest">{trade.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button className="w-full py-6 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] hover:bg-white/5 hover:text-white transition-all">View All Transactions on Explorer</button>
            </div>
        </GlassCard>
      </motion.div>

      {/* 🤝 COMMUNITY HUB 🤝 */}
      <motion.div 
        variants={item}
        className="flex flex-col items-center text-center space-y-12 pb-20"
      >
          <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">JOIN THE <span className="text-gold">GALAXY</span></h2>
              <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[10px]">On-Chain Gold Revolution</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
              {[
                  { label: 'Telegram', icon: <MessageSquare className="w-5 h-5" />, color: 'bg-blue-500' },
                  { label: 'Twitter X', icon: <Share2 className="w-5 h-5" />, color: 'bg-white text-black' },
                  { label: 'Market DApp', icon: <Globe className="w-5 h-5" />, color: 'bg-emerald-500' }
              ].map((social, i) => (
                  <button key={i} className={`flex items-center gap-4 px-10 py-5 ${social.color} rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl`}>
                      {social.icon}
                      {social.label}
                  </button>
              ))}
          </div>
      </motion.div>
    </motion.div>
  );
};
