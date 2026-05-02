'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MouseGlow } from '@/components/ui/MouseGlow';
import { LaserBackground } from '@/components/ui/LaserBackground';
import { MagneticButton } from '@/components/ui/MagneticButton';
import dynamic from 'next/dynamic';

const DashboardView = dynamic(() => import('@/components/views/DashboardView').then(mod => mod.DashboardView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING DASHBOARD...</div> });
const SwapView = dynamic(() => import('@/components/views/SwapView').then(mod => mod.SwapView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING SWAP ENGINE...</div> });
const BridgeView = dynamic(() => import('@/components/views/BridgeView').then(mod => mod.BridgeView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING CROSS-CHAIN BRIDGE...</div> });
const WhitepaperView = dynamic(() => import('@/components/views/WhitepaperView').then(mod => mod.WhitepaperView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING WHITEPAPER...</div> });
const LaunchpadView = dynamic(() => import('@/components/views/LaunchpadView').then(mod => mod.LaunchpadView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING LAUNCHPAD...</div> });
const TransactionView = dynamic(() => import('@/components/views/TransactionView').then(mod => mod.TransactionView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING TX DETAILS...</div> });
const FuturesView = dynamic(() => import('@/components/views/FuturesView').then(mod => mod.FuturesView), { ssr: false, loading: () => <div className="p-20 text-gold font-black animate-pulse">LOADING FUTURES...</div> });

import { Wallet, Sparkles, LogOut, Gift, Loader2, Zap } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getContractAddress, ERC20_ABI } from '@/constants/contracts';

type ViewType = 'dashboard' | 'swap' | 'bridge' | 'launchpad' | 'transaction' | 'futures';

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const [activeTab, setActiveTab] = useState<ViewType>('dashboard');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleFaucet = async () => {
    if (!address || chainId !== 84532) return;
    try {
      writeContract({
        address: getContractAddress(chainId, 'collateralToken'),
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [address, BigInt(1000 * 10**6)],
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
      case 'bridge': return <BridgeView />;
      case 'whitepaper': return <WhitepaperView onJoin={() => setActiveTab('swap')} />;
      case 'transaction': return <TransactionView hash={selectedTx || ""} onBack={() => setActiveTab('dashboard')} />;
      default: return <DashboardView />;
    }
  };

  // Add global listener for tx details
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

  const isWrongNetwork = isConnected && chainId !== 84532;

  return (
    <div className="flex flex-col min-h-screen text-slate-200 selection:bg-gold/30 selection:text-gold overflow-x-hidden">
      <MouseGlow />
      <LaserBackground />

      {/* Navigation Backdrop */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 z-40" />

      {/* Modern Header - Compact for Mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="relative">
             <div className="absolute inset-0 bg-gold/20 rounded-full blur-md group-hover:bg-gold/40 transition-all" />
             <img src="/gold-logo.png" alt="Gold Chain" className="w-8 h-8 md:w-10 md:h-10 relative z-10 drop-shadow-[0_0_10px_rgba(255,184,0,0.3)]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-tight">
              GOLD <span className="text-gold">CHAIN</span>
            </h1>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 p-1 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
          {(['dashboard', 'swap', 'whitepaper'] as ViewType[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase transition-all duration-500 relative overflow-hidden group ${
                activeTab === tab 
                  ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,184,0,0.3)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase text-slate-400">BASE</span>
          </div>
          <button 
            className="group relative px-4 md:px-6 py-2 md:py-3 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-[1.5rem] hover:bg-gold transition-all duration-500 overflow-hidden"
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          >
             <span className="relative z-10">{isConnected ? truncateAddress(address!) : 'CONNECT'}</span>
             <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
         <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
            {(['dashboard', 'swap', 'whitepaper'] as ViewType[]).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[2rem] transition-all duration-500 ${
                  activeTab === tab 
                    ? 'bg-gold text-black shadow-lg scale-105' 
                    : 'text-slate-500'
                }`}
              >
                {tab === 'dashboard' && <Activity size={18} />}
                {tab === 'swap' && <Zap size={18} />}
                {tab === 'whitepaper' && <ShieldCheck size={18} />}
                <span className="text-[8px] font-black uppercase tracking-tighter">{tab}</span>
              </button>
            ))}
         </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-24 pb-32 md:pb-40 px-4 md:px-6 w-full relative">
        <div className="w-full flex justify-center items-start min-h-[700px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="px-10 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="text-[10px] font-black tracking-widest uppercase opacity-40">© 2026 GOLD CHAIN</span>
        
        <div className="flex items-center gap-8">
          <a href="https://x.com/virtualgold26" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-gold uppercase tracking-widest transition-all">
             Twitter
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-gold uppercase tracking-widest transition-all">
             Instagram
          </a>
          <a href="https://www.linkedin.com/in/virtual-gold-138400406/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-gold uppercase tracking-widest transition-all">
             LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
