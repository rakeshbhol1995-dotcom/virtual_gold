'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle2, Clock, XCircle, Activity, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getExplorerUrl, getContractAddress, GOLD_BONDING_CURVE_ABI, GOLD_FUTURES_ABI } from '@/constants/contracts';
import { useChainId, useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useMounted } from '@/hooks/useMounted';


export interface Transaction {
  hash: string;
  type: 'Buy' | 'Sell' | 'Stake' | 'Unstake' | 'Claim' | 'Bridge' | 'Long' | 'Short';
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  amount?: string;
  symbol?: string;
  isGlobal?: boolean;
}

// Global state mechanism for transaction scanning
let globalTransactions: Transaction[] = [];
const listeners = new Set<(txs: Transaction[]) => void>();

const notify = () => listeners.forEach(l => l([...globalTransactions]));

export const useTransactionScanner = () => {
  const addTransaction = (tx: Omit<Transaction, 'timestamp'>) => {
    const newTx: Transaction = { ...tx, timestamp: Date.now() };
    globalTransactions = [newTx, ...globalTransactions].slice(0, 10);
    notify();
  };

  const updateTransactionStatus = (hash: string, status: Transaction['status']) => {
    globalTransactions = globalTransactions.map(tx => 
      tx.hash === hash ? { ...tx, status } : tx
    );
    notify();
  };

  return { addTransaction, updateTransactionStatus };
};


export const ActivityScanner = () => {
  const mounted = useMounted();
  const [transactions, setTransactions] = useState<Transaction[]>(globalTransactions);

  const chainId = 84532; // Force Base Sepolia for scanning
  const publicClient = usePublicClient({ chainId });

  const explorerUrl = getExplorerUrl(chainId);
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');
  const futuresAddress = getContractAddress(chainId, 'goldFutures');

  useEffect(() => {
    listeners.add(setTransactions);
    return () => {
      listeners.delete(setTransactions);
    };
  }, []);


  // 1. Fetch Recent Events on Mount
  useEffect(() => {
    const fetchRecentEvents = async () => {
        if (!bondingCurveAddress || bondingCurveAddress === "0x0000000000000000000000000000000000000000") return;

        try {
            const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0);

        const buyLogs = await publicClient.getContractEvents({
          address: bondingCurveAddress,
          abi: GOLD_BONDING_CURVE_ABI,
          eventName: 'Bought',
          fromBlock,
          toBlock: currentBlock
        });

        const sellLogs = await publicClient.getContractEvents({
          address: bondingCurveAddress,
          abi: GOLD_BONDING_CURVE_ABI,
          eventName: 'Sold',
          fromBlock,
          toBlock: currentBlock
        });


        const formatted = [
          ...buyLogs.map((log: any) => ({
            hash: log.transactionHash,
            type: 'Buy' as const,
            status: 'success' as const,
            timestamp: Date.now() - 10000, 
            amount: formatUnits(log.args.collateralAmount || 0n, 6),
            symbol: 'USDT',
            isGlobal: true
          })),
          ...sellLogs.map((log: any) => ({
            hash: log.transactionHash,
            type: 'Sell' as const,
            status: 'success' as const,
            timestamp: Date.now() - 20000,
            amount: formatUnits(log.args.collateralAmount || 0n, 6),
            symbol: 'USDT',
            isGlobal: true
          }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        setTransactions(formatted);
      } catch (e) {
        console.error("Failed to fetch logs", e);
      }
    };

    const interval = setInterval(fetchRecentEvents, 5000);
    fetchRecentEvents();
    return () => clearInterval(interval);
  }, [publicClient, bondingCurveAddress]);

  // 2. Watch for Live Buy Events
  useWatchContractEvent({
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    eventName: 'Bought',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: 'Buy',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.collateralAmount, 6),
          symbol: 'USDT',
          isGlobal: true
        };
        setTransactions(prev => {
          const combined = [newTx, ...prev];
          const unique = Array.from(new Map(combined.map(tx => [tx.hash + tx.type, tx])).values());
          return unique.slice(0, 10);
        });
      });
    },
  });

  // 3. Watch for Live Sell Events
  useWatchContractEvent({
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    eventName: 'Sold',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: 'Sell',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.collateralAmount, 6),
          symbol: 'USDT',
          isGlobal: true
        };
        setTransactions(prev => {
          const combined = [newTx, ...prev];
          const unique = Array.from(new Map(combined.map(tx => [tx.hash + tx.type, tx])).values());
          return unique.slice(0, 10);
        });
      });
    },
  });

  // 4. Watch for Live Futures Events
  useWatchContractEvent({
    address: futuresAddress,
    abi: GOLD_FUTURES_ABI,
    eventName: 'PositionOpened',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: log.args.isLong ? 'Long' : 'Short',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.collateral, 6),
          symbol: 'USDT',
          isGlobal: true
        };
        setTransactions(prev => {
          const combined = [newTx, ...prev];
          const unique = Array.from(new Map(combined.map(tx => [tx.hash + tx.type, tx])).values());
          return unique.slice(0, 10);
        });
      });
    },
  });

  // 5. Watch for Live Position Closed Events
  useWatchContractEvent({
    address: futuresAddress,
    abi: GOLD_FUTURES_ABI,
    eventName: 'PositionClosed',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: 'Sell',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.pnl || 0n, 6),
          symbol: log.args.wasProfit ? 'PROFIT' : 'LOSS',
          isGlobal: true
        };
        setTransactions(prev => {
          const combined = [newTx, ...prev];
          const unique = Array.from(new Map(combined.map(tx => [tx.hash + tx.type, tx])).values());
          return unique.slice(0, 10);
        });
      });
    },
  });

  if (!mounted) return null;

  return (

    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h3 className="font-black uppercase tracking-tight text-[10px] md:text-sm">Network Scan</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {transactions.length === 0 ? (
            <div className="py-10 text-center border box-border border-white/5 rounded-2xl bg-white/[0.01]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Awaiting Transactions...</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <motion.div
                key={`${tx.hash}-${tx.type}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-black/20 border border-white/5 rounded-2xl p-4 hover:border-gold/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      (tx.type === 'Buy' || tx.type === 'Long') 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-black'
                    }`}>
                      {(tx.type === 'Buy' || tx.type === 'Long') ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${
                           (tx.type === 'Buy' || tx.type === 'Long') ? 'text-emerald-500' : 'text-rose-500'
                        }`}>{tx.type}</span>
                        {tx.amount && (
                          <span className="text-[12px] font-display font-light text-white tracking-wide">{Number(tx.amount).toLocaleString()} <span className="text-[8px] font-sans font-black opacity-40 uppercase ml-0.5">{tx.symbol}</span></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                        <Hash className="w-2.5 h-2.5" />
                        <span className="text-[10px] font-mono tracking-tighter opacity-60">{tx.hash.slice(0, 10)}...</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {tx.isGlobal && (
                      <span className="text-[8px] font-black text-gold border border-gold/30 px-2 py-0.5 rounded-lg uppercase tracking-widest bg-gold/5 shadow-[0_0_15px_rgba(251,191,36,0.1)]">LIVE</span>
                    )}
                    <button 
                      onClick={() => {
                        const url = `${explorerUrl}/tx/${tx.hash}`;
                        window.open(url, '_blank');
                      }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Subtle edge glow */}
                <div className={`absolute top-0 left-0 w-[2px] h-full transition-all duration-500 ${
                  (tx.type === 'Buy' || tx.type === 'Long') ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                }`} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
