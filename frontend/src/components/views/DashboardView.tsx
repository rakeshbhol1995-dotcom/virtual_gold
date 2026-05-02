'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, Wallet, ShieldCheck, Zap, Globe, ArrowUpRight, Crown, Star } from 'lucide-react';
import { TradingChart } from '@/components/ui/TradingChart';
import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { HoldersView } from '@/components/views/HoldersView';
import { GlassCard } from '@/components/ui/GlassCard';

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

export const DashboardView = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {/* Hero Section: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Gold Price (Grams)', value: '$2,342.10', change: '+2.4%', icon: <Zap className="text-gold" />, color: 'gold' },
          { label: 'Total Holders', value: '1,248', change: '+124', icon: <Users className="text-emerald-400" />, color: 'emerald' },
          { label: 'Market Cap', value: '$45.2M', change: '+5.2%', icon: <Globe className="text-blue-400" />, color: 'blue' },
          { label: 'Treasury Backing', value: '100%', change: 'Stable', icon: <ShieldCheck className="text-gold" />, color: 'gold' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className="p-6 border-white/5 bg-slate-900/40 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 64 })}
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                     {stat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</span>
               </div>
               <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-white/5 ${stat.color === 'gold' ? 'text-gold' : 'text-emerald-400'}`}>
                     {stat.change}
                  </span>
               </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Chart & Primary Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard className="border-white/5 bg-slate-900/60 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <TrendingUp className="text-gold w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Price Chart</h3>
               </div>
               <div className="flex gap-2">
                  {['1H', '1D', '1W', 'ALL'].map((t) => (
                    <button key={t} className="text-[10px] font-black px-3 py-1 rounded-lg bg-white/5 hover:bg-gold hover:text-black transition-all">
                      {t}
                    </button>
                  ))}
               </div>
            </div>
            <div className="p-6 h-[400px]">
               <TradingChart />
            </div>
          </GlassCard>
        </motion.div>

        <div className="space-y-6">
           {/* Moon Mission Card */}
           <motion.div variants={item}>
              <GlassCard className="p-8 border-gold/20 bg-gold/5 relative overflow-hidden group">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all" />
                 <Crown className="w-12 h-12 text-gold mb-6 animate-float" />
                 <h3 className="text-2xl font-black text-white mb-2 italic tracking-tighter">THE MOON IS <span className="text-gold underline decoration-2 underline-offset-4">CALLING</span></h3>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">
                    Join 1,200+ holders and start your journey with the world's most stable gold-backed protocol.
                 </p>
                 <button className="w-full py-4 bg-gold text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(255,184,0,0.2)]">
                    Join The Mission
                 </button>
              </GlassCard>
           </motion.div>

           {/* Quick Stats Card */}
           <motion.div variants={item}>
              <GlassCard className="p-6 border-white/5 bg-slate-900/40">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Protocol Health
                 </h4>
                 <div className="space-y-4">
                    {[
                       { l: 'Liquidity Locked', v: '98%', p: 98, c: 'bg-gold' },
                       { l: 'Community Score', v: '9.2/10', p: 92, c: 'bg-emerald-400' },
                       { l: 'L1 Migration Status', v: 'Phase 2', p: 45, c: 'bg-blue-400' },
                    ].map((row, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                             <span className="text-slate-400">{row.l}</span>
                             <span>{row.v}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full ${row.c} transition-all duration-1000`} style={{ width: `${row.p}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </GlassCard>
           </motion.div>
        </div>
      </div>

      {/* Row 2: Activities & Holders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
           <GlassCard className="border-white/5 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3 mb-8">
                 <Zap className="text-gold w-5 h-5" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Transactions</h3>
              </div>
              <ActivityScanner />
           </GlassCard>
        </motion.div>

        <motion.div variants={item}>
           <GlassCard className="border-white/5 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3 mb-8">
                 <Star className="text-gold w-5 h-5" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Elite Holders</h3>
              </div>
              <HoldersView />
           </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};
