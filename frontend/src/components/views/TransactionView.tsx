'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Hash, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  ExternalLink,
  ChevronLeft,
  Activity
} from 'lucide-react';
import { useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { useMounted } from '@/hooks/useMounted';

export const TransactionView = ({ hash, onBack }: { hash: string, onBack: () => void }) => {
  const mounted = useMounted();
  const chainId = useChainId();
  
  const { data: receipt, isLoading, isError } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
  });

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[900px] px-4 md:px-0 py-10"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-gold transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Return to Fleet Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Live</span>
        </div>
      </div>

      <GlassCard className="border-white/10 overflow-hidden relative" variant="gold">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="p-6 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                <Activity className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">TX RECEIPT</h2>
                <div className="flex items-center gap-3 mt-1 text-slate-500">
                  <Hash className="w-3 h-3" />
                  <span className="text-xs font-mono select-all hover:text-gold transition-colors">{hash}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
               <div className={`w-full md:w-auto px-6 py-3 rounded-2xl border-2 flex items-center justify-center gap-3 ${
                receipt?.status === 'success' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
                  : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
              }`}>
                {receipt?.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  {receipt?.status === 'success' ? 'TRANSACTION CONFIRMED' : 'EXECUTION FAILED'}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validated on Gold Chain L2</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sender Origin</span>
                  </div>
                  <p className="text-[11px] font-mono text-white break-all">{receipt?.from || '---'}</p>
                </div>
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</span>
                  </div>
                  <p className="text-[11px] font-mono text-white break-all">{receipt?.to || '---'}</p>
                </div>
              </div>

              <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-3 mb-8">
                   <Clock className="w-5 h-5 text-gold" />
                   <h3 className="text-lg font-black uppercase text-white tracking-tight">On-Chain Metadata</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Block Confirmation</span>
                      <span className="text-sm font-bold text-white">#{receipt?.blockNumber?.toString() || '---'}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gas Expenditure</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white block">{receipt?.gasUsed?.toString() || '---'}</span>
                        <span className="text-[8px] font-black text-gold uppercase tracking-tighter">Gold Units</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consensus Hash</span>
                      <span className="text-[10px] font-mono text-slate-400">{receipt?.blockHash?.slice(0, 20)}...</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gold/5 p-8 rounded-[2rem] border border-gold/10 flex flex-col items-center text-center">
                <Database className="w-10 h-10 text-gold mb-4" />
                <h4 className="text-xs font-black text-white uppercase mb-2">Protocol Layer</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                  This transaction is permanently immutable on the Gold Chain L2 ledger.
                </p>
              </div>

              {receipt?.status === 'reverted' && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem]">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-xs font-black text-red-500 uppercase tracking-tight">EVM REVERT</span>
                  </div>
                  <p className="text-[10px] text-red-200/60 leading-relaxed uppercase font-medium">
                    The execution failed. Please verify your token allowance and USDT balance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
