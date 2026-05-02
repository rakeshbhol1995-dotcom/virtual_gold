'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, ChevronRight, User } from 'lucide-react';
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

const MOCK_HOLDERS = [
  { rank: 1, address: '0xBa88...a2F5', amount: '25,430.22', share: '12.5%' },
  { rank: 2, address: '0x9a22...f41e', amount: '18,210.45', share: '8.9%' },
  { rank: 3, address: '0x12c4...e882', amount: '12,900.00', share: '6.3%' },
  { rank: 4, address: '0x77d1...09a1', amount: '8,450.12', share: '4.1%' },
  { rank: 5, address: '0xec22...b109', amount: '5,120.00', share: '2.5%' },
];

export const HoldersView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl border border-gold/20">
            <Users className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase">Gold Holders</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Ranking (Top 100)</p>
          </div>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Total Holders</p>
           <p className="text-lg font-black text-gold">1,248</p>
        </div>
      </div>

      <GlassCard className="border-white/5 bg-slate-950/40 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (GRAMS)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Share</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-black">
              {MOCK_HOLDERS.map((holder, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={holder.address} 
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {holder.rank <= 3 ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          holder.rank === 1 ? 'bg-gold text-black shadow-[0_0_15px_rgba(255,184,0,0.5)]' : 
                          holder.rank === 2 ? 'bg-slate-300 text-black' : 
                          'bg-amber-600 text-white'
                        }`}>
                          {holder.rank}
                        </div>
                      ) : (
                        <span className="text-slate-500 ml-2">{holder.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      <User className="w-3 h-3 opacity-40" />
                      <span className="font-mono">{holder.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gold/90 font-display text-base tracking-tight">
                    {holder.amount}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {holder.share}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
            <button className="text-[9px] font-black text-gold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto">
              View Full Leaderboard <ChevronRight className="w-3 h-3" />
            </button>
        </div>
      </GlassCard>
    </div>
  );
};
