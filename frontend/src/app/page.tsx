// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\app\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MouseGlow } from '@/components/ui/MouseGlow';
import { LaserBackground } from '@/components/ui/LaserBackground';
import dynamic from 'next/dynamic';
import { Activity, Zap, ShieldCheck, Clock } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getContractAddress, ERC20_ABI } from '@/constants/contracts';

const DashboardView = dynamic(() => import('@/components/views/DashboardView').then(mod => mod.DashboardView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse text-center">LOADING DASHBOARD...</div> });
const SwapView = dynamic(() => import('@/components/views/SwapView').then(mod => mod.SwapView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse text-center">LOADING SWAP ENGINE...</div> });
const WhitepaperView = dynamic(() => import('@/components/views/WhitepaperView').then(mod => mod.WhitepaperView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse text-center">LOADING WHITEPAPER...</div> });
const TransactionView = dynamic(() => import('@/components/views/TransactionView').then(mod => mod.TransactionView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse text-center">LOADING TX DETAILS...</div> });
const ActivityScanner = dynamic(() => import('@/components/ui/ActivityScanner').then(mod => mod.ActivityScanner), { ssr: false });

type ViewType = 'dashboard' | 'swap' | 'activity' | 'whitepaper' | 'transaction';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const [activeTab, setActiveTab] = useState<ViewType>('dashboard');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const truncateAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'swap': return <SwapView onSwap={() => setActiveTab('activity')} />;
      case 'activity': return (
        <div className="w-full max-w-4xl mx-auto py-10">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-10 text-center italic">
            YOUR <span className="text-gold">ACTIVITY</span>
          </h2>
          <div className="bg-slate-900/40 border border-gold/20 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-[0_0_50px_rgba(255,215,0,0.1)]">
            <ActivityScanner />
          </div>
        </div>
      );
      case 'whitepaper': return <WhitepaperView onJoin={() => setActiveTab('swap')} />;
      case 'transaction': return <TransactionView hash={selectedTx || ''} onBack={() => setActiveTab('activity')} />;
      default: return <DashboardView />;
    }
  };

  useEffect(() => {
    const handleTxClick = (e: any) => {
      if (e.detail && e.detail.hash) {
        setSelectedTx(e.detail.hash);
        setActiveTab('transaction');
      }
    };
    window.addEventListener('view-tx', handleTxClick as any);
    return () => window.removeEventListener('view-tx', handleTxClick as any);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black flex items-center justify-center text-gold font-black">INITIALIZING GOLD PROTOCOL...</div>;

  const tabs: ViewType[] = ['dashboard', 'swap', 'activity', 'whitepaper'];

  return (
    <div className="flex flex-col min-h-screen text-slate-200 selection:bg-gold/30 selection:text-gold overflow-x-hidden">
      <MouseGlow />
      <LaserBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-24 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <img src="/gold-logo.png?v=5" alt="Gold Chain" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
          <div className="hidden sm:block">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-tight">
              GOLD <span className="text-gold">CHAIN</span>
            </h1>
            <p className="text-[8px] font-black tracking-[0.4em] uppercase text-gold/40">Base Native Protocol</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 p-2 bg-white/5 rounded-full border border-white/10 shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gold text-black shadow-[0_0_25px_rgba(255,215,0,0.4)] scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-blue-400">BASE SEP</span>
          </div>
          <button
            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gold hover:scale-105 transition-all shadow-xl"
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          >
            {isConnected ? truncateAddress(address!) : 'CONNECT'}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-2.5 flex items-center justify-around shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[2.5rem] transition-all duration-300 ${
                activeTab === tab ? 'bg-gold text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'text-slate-500'
              }`}
            >
              {tab === 'dashboard' && <Activity size={18} />}
              {tab === 'swap' && <Zap size={18} />}
              {tab === 'activity' && <Clock size={18} />}
              {tab === 'whitepaper' && <ShieldCheck size={18} />}
              <span className="text-[8px] font-black uppercase tracking-widest">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-32 md:pb-20 px-4 md:px-6 w-full">
        <div className="w-full max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="px-10 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40">
        <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gold/60 italic">GOLD CHAIN PROTOCOL</span>
            <span className="text-[8px] font-black tracking-widest uppercase opacity-20">© 2026 MATHEMATICAL SINGULARITY</span>
        </div>
        <div className="flex items-center gap-8">
          {[
            { label: 'Twitter', href: 'https://x.com/virtualgold26' },
            { label: 'Instagram', href: 'https://www.instagram.com/' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/virtual-gold-138400406/' },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
              className="text-[9px] font-black text-slate-500 hover:text-gold uppercase tracking-[0.2em] transition-all">
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
