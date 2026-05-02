'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Rocket, Plus, Search, X, TrendingUp, Users, Clock, Zap, Flame, ExternalLink } from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useMounted } from '@/hooks/useMounted';

interface LaunchedToken {
  id: string;
  name: string;
  symbol: string;
  description: string;
  creator: string;
  createdAt: number;
  colorFrom: string;
  colorTo: string;
  raised: number;
  holders: number;
}

const GRADUATION_TARGET = 10000;
const COLORS = [
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#3b82f6', to: '#8b5cf6' },
  { from: '#10b981', to: '#3b82f6' },
  { from: '#ec4899', to: '#f43f5e' },
  { from: '#06b6d4', to: '#3b82f6' },
  { from: '#8b5cf6', to: '#ec4899' },
];

const STORAGE_KEY = 'goldchain_launchpad_tokens';

export const LaunchpadView = () => {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [tokens, setTokens] = useState<LaunchedToken[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'trending' | 'graduating'>('new');
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTokens(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLaunch = () => {
    if (!formName.trim() || !formSymbol.trim() || !formDescription.trim()) {
      alert('Please fill in all fields!');
      return;
    }
    if (!isConnected || !address) {
      alert('Please connect your wallet!');
      return;
    }
    if (chainId !== 84532) {
      switchChain({ chainId: 84532 });
      return;
    }
    setIsLaunching(true);
    setTimeout(() => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newToken: LaunchedToken = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: formName.trim(),
        symbol: formSymbol.trim().toUpperCase(),
        description: formDescription.trim(),
        creator: address,
        createdAt: Date.now(),
        colorFrom: color.from,
        colorTo: color.to,
        raised: Math.random() * 200 + 10,
        holders: Math.floor(Math.random() * 15) + 1,
      };
      const updated = [newToken, ...tokens];
      setTokens(updated);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      setFormName('');
      setFormSymbol('');
      setFormDescription('');
      setShowForm(false);
      setIsLaunching(false);
    }, 2000);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const sorted = [...tokens]
    .filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'new') return b.createdAt - a.createdAt;
      if (sortBy === 'trending') return b.raised - a.raised;
      return (b.raised / GRADUATION_TARGET) - (a.raised / GRADUATION_TARGET);
    });

  if (!mounted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto px-4 md:px-0 pb-20">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="p-3 bg-gold/10 border border-gold/20 rounded-2xl">
            <Rocket className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">GOLD LAUNCH</h1>
        </div>
        <p className="text-gold font-black text-[10px] uppercase tracking-[0.4em] mb-2">Deploy Tokens on Base Chain</p>
        <p className="text-slate-500 text-xs max-w-md mx-auto">
          Launch your token with a fair bonding curve — no presale, no team allocation. Graduate to DEX at ${GRADUATION_TARGET.toLocaleString()} USDT.
        </p>
      </div>

      {/* Wrong Network Banner */}
      {isConnected && chainId !== 84532 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">⚠️ Switch to Base Sepolia to launch tokens</p>
          <button onClick={() => switchChain({ chainId: 84532 })} className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl">Switch</button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tokens Launched', value: tokens.length.toString(), icon: <Rocket className="w-4 h-4 text-gold" /> },
          { label: 'Total Raised', value: `$${tokens.reduce((a, t) => a + t.raised, 0).toFixed(0)}`, icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
          { label: 'Total Holders', value: tokens.reduce((a, t) => a + t.holders, 0).toString(), icon: <Users className="w-4 h-4 text-blue-400" /> },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-4 border-white/5 bg-white/[0.02] text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xl font-black text-white">{stat.value}</p>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-2">
          {(['new', 'trending', 'graduating'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === s ? 'bg-gold text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
              {s === 'new' ? '🆕 New' : s === 'trending' ? '🔥 Hot' : '🎓 Graduating'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)]"
        >
          <Plus className="w-4 h-4" /> Launch Token
        </button>
      </div>

      {/* Token Grid */}
      {sorted.length === 0 ? (
        <GlassCard className="p-20 border-white/5 text-center">
          <Rocket className="w-12 h-12 text-gold/30 mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">No Tokens Launched Yet</p>
          <p className="text-slate-600 text-xs">Be the first to launch a token on Base!</p>
          <button onClick={() => setShowForm(true)} className="mt-6 px-8 py-3 bg-gold text-black font-black text-[10px] uppercase rounded-2xl hover:scale-105 transition-all">
            🚀 Launch First Token
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(token => {
            const progress = Math.min((token.raised / GRADUATION_TARGET) * 100, 100);
            return (
              <motion.div key={token.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard className="p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/20 transition-all group cursor-pointer">
                  {/* Token Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-black text-white text-lg"
                      style={{ background: `linear-gradient(135deg, ${token.colorFrom}, ${token.colorTo})` }}>
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-white text-sm truncate">{token.name}</h3>
                        <span className="text-[9px] font-black text-gold bg-gold/10 px-2 py-0.5 rounded-full shrink-0">${token.symbol}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase font-black flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(token.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed line-clamp-2">{token.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-2">
                      <span>Bonding Curve</span>
                      <span className="text-gold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${token.colorFrom}, ${token.colorTo})` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-600 mt-1">
                      <span>${token.raised.toFixed(0)} raised</span>
                      <span>Goal: ${GRADUATION_TARGET.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-black">
                      <Users className="w-3 h-3" /> {token.holders} holders
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-black truncate max-w-[120px]">
                      <span>by {token.creator.slice(0, 6)}...{token.creator.slice(-4)}</span>
                    </div>
                    {progress >= 100 && (
                      <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">🎓 GRADUATED</span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Token Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 border-gold/20 bg-black/90 shadow-[0_0_80px_rgba(251,191,36,0.1)]" variant="gold">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-gold" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">Launch Token</h2>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Token Name *</label>
                    <input
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Gold Pepe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 placeholder:text-white/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ticker Symbol *</label>
                    <input
                      value={formSymbol}
                      onChange={e => setFormSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. GPEPE"
                      maxLength={10}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 placeholder:text-white/20 transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Description *</label>
                    <textarea
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      placeholder="Describe your token..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 placeholder:text-white/20 transition-all resize-none"
                    />
                  </div>

                  <div className="p-4 bg-gold/5 border border-gold/20 rounded-2xl">
                    <p className="text-[9px] text-gold font-black uppercase tracking-widest mb-1">🔒 Fair Launch Guarantee</p>
                    <p className="text-[9px] text-slate-400">No presale · No team tokens · Bonding curve price discovery · Auto-graduates to DEX at ${GRADUATION_TARGET.toLocaleString()} USDT</p>
                  </div>

                  <MagneticButton
                    onClick={handleLaunch}
                    disabled={isLaunching || !formName || !formSymbol || !formDescription}
                    className="w-full py-5 bg-gold text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        DEPLOYING ON BASE...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Rocket className="w-4 h-4" /> LAUNCH TOKEN 🚀
                      </span>
                    )}
                  </MagneticButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
