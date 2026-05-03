// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\ui\ReferralCard.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { GlassCard } from './GlassCard';

export const ReferralCard = () => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const referralLink = isConnected ? `${window.location.origin}/?ref=${address}` : 'Connect Wallet to get Link';

  const handleCopy = () => {
    if (!isConnected) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-8 md:p-12 border-gold/30 bg-slate-900/60 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="p-6 bg-gold/10 rounded-3xl border border-gold/20 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <Users className="w-10 h-10 text-gold" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight italic">
                    EARN <span className="text-gold">20% FEE SHARE</span>
                </h3>
            </div>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] leading-relaxed">
                Invite friends to GOLD CHAIN and earn 20% of their protocol fees instantly in USDT.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between group/link hover:border-gold/30 transition-all">
                    <span className="text-[10px] font-mono text-slate-500 truncate mr-4">
                        {referralLink}
                    </span>
                    <button 
                        onClick={handleCopy}
                        disabled={!isConnected}
                        className="p-2 hover:bg-gold/10 rounded-xl transition-all"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gold" />}
                    </button>
                </div>
                
                <button 
                    className="w-full sm:w-auto px-8 py-4 bg-gold text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(255,215,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    onClick={handleCopy}
                >
                    <Share2 className="w-4 h-4" />
                    Copy Link
                </button>
            </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center md:justify-start gap-8 opacity-40 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Referrals</span>
            <span className="text-lg font-black text-white italic">0</span>
        </div>
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Earned</span>
            <span className="text-lg font-black text-gold italic">$0.00</span>
        </div>
      </div>
    </GlassCard>
  );
};
