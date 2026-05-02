// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\ui\ActivityScanner.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Activity, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getExplorerUrl, getContractAddress, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { formatUnits, parseAbi, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useMounted } from '@/hooks/useMounted';

// Static client for reliable scanning on Localhost
const scannerClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

export interface Transaction {
  hash: string;
  type: 'Buy' | 'Sell';
  status: 'success' | 'pending' | 'error';
  timestamp: number;
  amount: string;
  symbol: string;
  user: string;
  isGlobal?: boolean;
}

export const ActivityScanner = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'me'>('all');
  const { address } = useAccount();
  const mounted = useMounted();
  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');

  // 1. Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      if (!bondingCurveAddress) return;
      try {
        const currentBlock = await scannerClient.getBlockNumber();
        const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

        const [buyLogs, sellLogs] = await Promise.all([
          scannerClient.getContractEvents({
            address: bondingCurveAddress as `0x${string}`,
            abi: parseAbi(GOLD_BONDING_CURVE_ABI),
            eventName: 'Bought',
            fromBlock,
          }),
          scannerClient.getContractEvents({
            address: bondingCurveAddress as `0x${string}`,
            abi: parseAbi(GOLD_BONDING_CURVE_ABI),
            eventName: 'Sold',
            fromBlock,
          })
        ]);

        const formatted = [
          ...buyLogs.map((log: any) => ({
            hash: log.transactionHash,
            type: 'Buy' as const,
            status: 'success' as const,
            timestamp: Number(log.blockNumber) || Date.now(), // Use block number for order
            amount: formatUnits(log.args.collateralAmount || 0n, 6),
            symbol: 'USDT',
            user: log.args.user?.toLowerCase() || '',
            isGlobal: true
          })),
          ...sellLogs.map((log: any) => ({
            hash: log.transactionHash,
            type: 'Sell' as const,
            status: 'success' as const,
            timestamp: Number(log.blockNumber) || Date.now(),
            amount: formatUnits(log.args.collateralAmount || 0n, 6),
            symbol: 'USDT',
            user: log.args.user?.toLowerCase() || '',
            isGlobal: true
          }))
        ].sort((a, b) => b.timestamp - a.timestamp);

        if (formatted.length > 0) {
            setTransactions(prev => {
                const existingHashes = new Set(prev.map(tx => tx.hash));
                const newOnes = formatted.filter(tx => !existingHashes.has(tx.hash));
                return [...newOnes, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
            });
        }
      } catch (e) {
        console.error("Scanner fetch error", e);
      }
    };
    fetchHistory();
    const inv = setInterval(fetchHistory, 10000);
    return () => clearInterval(inv);
  }, [bondingCurveAddress]);

  // 2. Watch Live
  useWatchContractEvent({
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    eventName: 'Bought',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: 'Buy',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.collateralAmount || 0n, 6),
          symbol: 'USDT',
          user: log.args.user?.toLowerCase() || '',
          isGlobal: true
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 30));
      });
    },
  });

  useWatchContractEvent({
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    eventName: 'Sold',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const newTx: Transaction = {
          hash: log.transactionHash,
          type: 'Sell',
          status: 'success',
          timestamp: Date.now(),
          amount: formatUnits(log.args.collateralAmount || 0n, 6),
          symbol: 'USDT',
          user: log.args.user?.toLowerCase() || '',
          isGlobal: true
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 30));
      });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Transaction | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // ... (Previous useEffects for history and watch)

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 60) {
        setSearchResult(null);
        return;
    }

    setIsSearching(true);
    try {
        // First check in-memory
        const found = transactions.find(t => t.hash.toLowerCase() === val.toLowerCase());
        if (found) {
            setSearchResult(found);
            setIsSearching(false);
            return;
        }

        // If not found, fetch from RPC
        const tx = await scannerClient.getTransaction({ hash: val as `0x${string}` });
        const receipt = await scannerClient.getTransactionReceipt({ hash: val as `0x${string}` });
        
        if (tx && receipt) {
            setSearchResult({
                hash: tx.hash,
                type: 'Buy', // Default to display
                status: receipt.status === 'success' ? 'success' : 'error',
                timestamp: Date.now(),
                amount: formatUnits(tx.value || 0n, 6),
                symbol: 'ETH/USDT',
                user: tx.from.toLowerCase()
            });
        }
    } catch (e) {
        console.error("Search error", e);
    }
    setIsSearching(false);
  };

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (filter === 'me' && address) {
      list = transactions.filter(tx => tx.user === address.toLowerCase());
    }
    if (searchTerm && searchTerm.length > 10) {
        return list.filter(tx => tx.hash.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  }, [transactions, filter, address, searchTerm]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                <Activity className="w-5 h-5 text-gold animate-pulse" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Protocol Activity</h3>
                <p className="text-[10px] text-slate-400 font-medium">Real-time Network Scanner</p>
            </div>
            </div>

            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filter === 'all' ? 'bg-gold text-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Recent
                </button>
                <button
                    onClick={() => setFilter('me')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filter === 'me' ? 'bg-gold text-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    My Activity
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
            <input 
                type="text"
                placeholder="Search Tx Hash (0x...)"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                    <div className="w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : (
                    <Hash className="w-3.5 h-3.5 text-slate-600" />
                )}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[400px]">
        <AnimatePresence initial={false} mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                <Hash className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium italic">No transactions found...</p>
            </motion.div>
          ) : (
            filteredTransactions.map((tx) => (
              <motion.div
                key={`${tx.hash}-${tx.type}-${tx.timestamp}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-300 ${
                    tx.user === address?.toLowerCase() ? 'ring-1 ring-gold/40 bg-gold/[0.03]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shadow-inner ${
                      tx.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {tx.type === 'Buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">{tx.type} Gold</span>
                        {tx.user === address?.toLowerCase() && (
                          <span className="px-2 py-0.5 rounded bg-gold text-black text-[8px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(255,215,0,0.3)]">Me</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono">{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>Recent</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-black tracking-tight ${
                      tx.type === 'Buy' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'Buy' ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tx.symbol}</div>
                  </div>
                </div>

                <a
                  href={`${getExplorerUrl(84532)}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-gold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
