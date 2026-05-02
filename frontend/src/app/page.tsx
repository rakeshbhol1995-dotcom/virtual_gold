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
      <div className="fixed top-0 left-0 right-0 h-24 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 z-40 pointer-events-none" />

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="relative">
             <div className="absolute inset-0 bg-gold/20 rounded-full blur-md group-hover:bg-gold/40 transition-all" />
             <img src="/gold-logo.png" alt="Gold Chain" className="w-10 h-10 relative z-10 drop-shadow-[0_0_10px_rgba(255,184,0,0.3)] group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-tight">
              GOLD <span className="text-gold">CHAIN</span>
            </h1>
            <p className="text-[8px] font-black tracking-[0.3em] uppercase text-slate-500">The Gold Standard</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-2 p-1.5 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
          {(['dashboard', 'swap', 'whitepaper'] as ViewType[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase transition-all duration-500 relative overflow-hidden group ${
                activeTab === tab 
                  ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,184,0,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase text-slate-400">BASE MAINNET</span>
          </div>
          <button 
            className="group relative px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-gold transition-all duration-500 overflow-hidden"
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          >
             <span className="relative z-10">{isConnected ? truncateAddress(address!) : 'CONNECT'}</span>
             <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100 transition-all">
              <img src="https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg" className="w-4 h-4 invert" alt="Instagram" />
            </a>
            <a href="https://www.linkedin.com/in/virtual-gold-138400406/" target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100 transition-all">
              <img src="https://www.vectorlogo.zone/logos/linkedin/linkedin-icon.svg" className="w-4 h-4 invert" alt="LinkedIn" />
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-10 pb-40 px-6 w-full relative">
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
