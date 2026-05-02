'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Rocket, Shield, Globe, Zap, ChevronRight, Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

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

const ROADMAP = [
  {
    phase: 'Phase 1: Genesis',
    status: 'COMPLETED',
    title: 'Protocol Launch on Base',
    desc: 'Fair launch of GOLD token, Bonding Curve integration, and 100% Liquidity locking.',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-emerald-500'
  },
  {
    phase: 'Phase 2: Growth',
    status: 'IN PROGRESS',
    title: 'Community Expansion',
    desc: 'Marketing push, Holder Leaderboard launch, and Staking rewards implementation.',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-gold'
  },
  {
    phase: 'Phase 3: Ascension',
    status: 'UPCOMING',
    title: 'Price Moon Mission',
    desc: 'CEX listings, High-volume partnerships, and price appreciation to new ATHs.',
    icon: <Rocket className="w-5 h-5" />,
    color: 'bg-rose-500'
  },
  {
    phase: 'Phase 4: Sovereign',
    status: 'FUTURE',
    title: 'Gold Chain L1 Migration',
    desc: 'Launching our own sovereign blockchain. $GOLD becomes the native gas token.',
    icon: <Globe className="w-5 h-5" />,
    color: 'bg-blue-500'
  }
];

export const WhitepaperView = ({ onJoin }: { onJoin?: () => void }) => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1000px] mx-auto space-y-16 pb-20"
    >
      {/* Header */}
      <motion.div variants={item} className="text-center space-y-4">
        <div className="inline-block p-3 bg-gold/10 border border-gold/20 rounded-2xl mb-4">
          <FileText className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
          White<span className="text-gold">paper</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-[0.4em]">Official Protocol Documentation & Roadmap</p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Docs Content */}
        <div className="md:col-span-2 space-y-8">
          <motion.div variants={item}>
            <GlassCard className="p-8 border-white/5 bg-white/[0.02]">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                PROTOCOL SECURITY
              </h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Gold Chain is built on a "Zero Trust" architecture. Every gram of Gold is backed by the logarithmic bonding curve, ensuring that the protocol is 100% rug-proof and always liquid. No admin can withdraw the liquidity, as it is locked mathematically in the smart contract.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gold uppercase mb-1">Contract Status</p>
                  <p className="text-sm font-bold">Verified & Locked</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gold uppercase mb-1">Audit Score</p>
                  <p className="text-sm font-bold">98/100 (Est.)</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="p-8 border-white/5 bg-gold/5 shadow-[0_0_50px_rgba(255,184,0,0.05)]">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Rocket className="w-6 h-6 text-gold" />
                MOON MISSION
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg italic">
                "We don't just trade gold; we set the gold standard for growth."
              </p>
              <p className="mt-4 text-slate-400 font-medium">
                Our deflationary mechanics and buy-back protocols are designed to ensure constant upward pressure. As the community grows, the bonding curve scarcity kicks in, driving the price to the moon.
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Roadmap Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2">Ecosystem Roadmap</h3>
          {ROADMAP.map((step, i) => (
            <motion.div key={i} variants={item}>
              <div className="relative pl-8 pb-8 border-l border-white/10 last:pb-0">
                <div className={`absolute left-[-12px] top-0 w-6 h-6 rounded-full ${step.color} flex items-center justify-center shadow-lg`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{step.phase}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${step.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gold/20 text-gold'}`}>{step.status}</span>
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-gold transition-colors">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div variants={item} className="text-center">
        <button 
          onClick={onJoin}
          className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs rounded-full hover:bg-gold transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          Join the Moon Mission
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full blur-sm group-hover:blur-md transition-all" />
        </button>
      </motion.div>
    </motion.div>
  );
};
