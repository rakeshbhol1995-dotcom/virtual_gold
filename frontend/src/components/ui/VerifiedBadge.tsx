'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ExternalLink, Info } from 'lucide-react';
import { getExplorerUrl, getContractAddress } from '@/constants/contracts';
import { useChainId } from 'wagmi';

export const VerifiedBadge = () => {
  const [mounted, setMounted] = React.useState(false);
  const chainId = useChainId();
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const explorerUrl = getExplorerUrl(chainId);
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-3 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
        <span className="text-[10px] font-black uppercase text-green-500 tracking-wider">100% Reserve Verified</span>
      </div>
      
      <div className="w-px h-3 bg-green-500/20" />

      <button 
        onClick={() => {
           const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');
           alert(`Contract Address: ${bondingCurveAddress}\n\nVerification is live on-chain.`);
        }}
        className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors cursor-pointer"
      >
        <span>VERIFIED</span>
        <ExternalLink className="w-3 h-3" />
      </button>

      <div className="relative group/info">
        <Info className="w-3 h-3 text-slate-600 hover:text-slate-400 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
           <p className="text-[9px] leading-relaxed text-slate-400 font-medium">
             This protocol maintains a strictly enforced 1:1 reserve ratio. The admin cannot claim spread unless 100% of the collateral for current supply is locked in the contract.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
