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

      <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-6 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[100] gap-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/gold-logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-tighter text-gold uppercase">GOLD CHAIN</span>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-black tracking-widest uppercase overflow-x-auto no-scrollbar">
          {(['dashboard', 'swap', 'whitepaper'] as ViewType[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? "text-gold" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === 'futures' ? 'F&O Trade' : tab === 'launchpad' ? '🚀 Launch' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="px-6 py-2 rounded-xl border border-gold/40 text-gold text-[10px] font-black uppercase"
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          >
            {isConnected ? truncateAddress(address!) : 'Connect Wallet'}
          </button>

          <div className="hidden md:flex items-center gap-5 border-l border-white/10 pl-5">
            <a href="https://x.com/virtualgold26" target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100 transition-all">
              <img src="https://www.vectorlogo.zone/logos/twitter/twitter-official.svg" className="w-4 h-4 invert" alt="Twitter" />
            </a>
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
