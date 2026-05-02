'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MouseGlow } from '@/components/ui/MouseGlow';
import { LaserBackground } from '@/components/ui/LaserBackground';
import dynamic from 'next/dynamic';
import { Activity, Zap, ShieldCheck } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getContractAddress, ERC20_ABI } from '@/constants/contracts';

const DashboardView = dynamic(() => import('@/components/views/DashboardView').then(mod => mod.DashboardView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING DASHBOARD...</div> });
const SwapView = dynamic(() => import('@/components/views/SwapView').then(mod => mod.SwapView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING SWAP ENGINE...</div> });
const WhitepaperView = dynamic(() => import('@/components/views/WhitepaperView').then(mod => mod.WhitepaperView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING WHITEPAPER...</div> });
const TransactionView = dynamic(() => import('@/components/views/TransactionView').then(mod => mod.TransactionView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING TX DETAILS...</div> });

type ViewType = 'dashboard' | 'swap' | 'whitepaper' | 'transaction';

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

  const handleFaucet = async () => {
    if (!address || chainId !== 84532) return;
    try {
      writeContract({
        address: getContractAddress(chainId, 'collateralToken'),
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [address, BigInt(1000 * 10 ** 6)],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'swap': return <SwapView onSwap={() => setActiveTab('dashboard')} />;
      case 'whitepaper': return <WhitepaperView onJoin={() => setActiveTab('swap')} />;
      case 'transaction': return <TransactionView hash={selectedTx || ''} onBack={() => setActiveTab('dashboard')} />;
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

  const tabs: ViewType[] = ['dashboard', 'swap', 'whitepaper'];

  return (
    <div className="flex flex-col min-h-screen text-slate-200 selection:bg-gold/30 selection:text-gold overflow-x-hidden">
      <MouseGlow />
      <LaserBackground />

      {/* Navigation Backdrop */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-slate-950/70 backdrop-blur-2xl border-b border-white/5 z-40 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-md group-hover:bg-gold/40 transition-all" />
            <img src="/gold-logo.png" alt="Gold Chain" className="w-9 h-9 md:w-10 md:h-10 relative z-10 drop-shadow-[0_0_10px_rgba(255,184,0,0.3)]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-tight">
              GOLD <span className="text-gold">CHAIN</span>
            </h1>
            <p className="text-[7px] font-black tracking-[0.3em] uppercase text-slate-500">The Gold Standard</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 p-1.5 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gold text-black shadow-[0_0_20px_rgba(255,184,0,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase text-slate-400">BASE</span>
          </div>
          <button
            className="relative px-4 md:px-6 py-2 md:py-2.5 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-[1.5rem] hover:bg-gold transition-all duration-300 overflow-hidden"
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          >
            {isConnected ? truncateAddress(address!) : 'CONNECT'}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-5 left-4 right-4 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[2rem] transition-all duration-300 ${
                activeTab === tab ? 'bg-gold text-black scale-105' : 'text-slate-500'
              }`}
            >
              {tab === 'dashboard' && <Activity size={16} />}
              {tab === 'swap' && <Zap size={16} />}
              {tab === 'whitepaper' && <ShieldCheck size={16} />}
              <span className="text-[7px] font-black uppercase tracking-tight">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-32 md:pb-20 px-4 md:px-6 w-full relative">
        <div className="w-full max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] font-black tracking-widest uppercase opacity-40">© 2026 GOLD CHAIN</span>
        <div className="flex items-center gap-6">
          {[
            { label: 'Twitter', href: 'https://x.com/virtualgold26' },
            { label: 'Instagram', href: 'https://www.instagram.com/' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/virtual-gold-138400406/' },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
              className="text-[10px] font-black text-slate-500 hover:text-gold uppercase tracking-widest transition-all">
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
