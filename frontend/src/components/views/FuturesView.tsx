'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TrendingUp, TrendingDown, Zap, Shield, Info, ArrowRight, Wallet, Activity, BarChart3, ChevronDown, History } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { getContractAddress, GOLD_FUTURES_ABI, GOLD_BONDING_CURVE_ABI, ERC20_ABI } from '@/constants/contracts';
import { TradingChart } from '@/components/ui/TradingChart';
import { ActivityScanner } from '@/components/ui/ActivityScanner';

export const FuturesView = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isCorrectNetwork = chainId === 84532;
  const [leverage, setLeverage] = useState(50);
  const [amount, setAmount] = useState('');
  const [isLong, setIsLong] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  
  // Contracts
  const futuresAddress = getContractAddress(chainId || 84532, 'goldFutures');
  const bondingCurveAddress = getContractAddress(chainId || 84532, 'bondingCurve');
  const collateralAddress = getContractAddress(chainId || 84532, 'collateralToken');

  // 1. Fetch Oracle Price (Global Gold Index)
  const { data: oraclePriceData, refetch: refetchPrice } = useReadContract({
    chainId: 84532,
    address: futuresAddress as `0x${string}`,
    abi: GOLD_FUTURES_ABI,
    functionName: 'getGoldPrice',
    query: { refetchInterval: 3000 }
  });

  const currentPrice = oraclePriceData ? Number(formatUnits(oraclePriceData as bigint, 6)) : 2300.00;

  // 2. Fetch USDT Balance
  const { data: usdtBalance } = useReadContract({
    chainId: 84532,
    address: collateralAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  // Fetch All User Positions
  const { data: allPositionsData, refetch: refetchPositions, isFetching: isFetchingPositions } = useReadContract({
    chainId: 84532,
    address: futuresAddress as `0x${string}`,
    abi: GOLD_FUTURES_ABI,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && !!futuresAddress, 
      refetchInterval: 3000 
    }
  });

  const activePositions = Array.isArray(allPositionsData) 
    ? (allPositionsData as any[]).map((pos: any, index: number) => ({
        collateral: pos.collateral ?? pos[0],
        size: pos.size ?? pos[1],
        entryPrice: pos.entryPrice ?? pos[2],
        isLong: pos.isLong ?? pos[3],
        active: pos.active ?? pos[4],
        index
      })).filter(pos => pos.active)
    : [];

  // Fetch USDT Allowance for Futures
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    chainId: 84532,
    address: collateralAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, futuresAddress] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchPositions();
      refetchAllowance();
      refetchPrice();
      setStatusMsg("Transaction Successful! Updating data...");
      const timer = setTimeout(() => setStatusMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleApprove = () => {
    if (!isCorrectNetwork) {
        alert("Please switch to Base Sepolia network first!");
        switchChain({ chainId: 84532 });
        return;
    }
    
    try {
      writeContract({
        address: collateralAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [futuresAddress as `0x${string}`, maxUint256]
      });
    } catch (e) {
      alert("Approval failed: " + (e as any).message);
    }
  };

  const handleOpenPosition = () => {
    if (!amount) {
        setStatusMsg("Please enter an amount!");
        return;
    }
    
    if (!isCorrectNetwork) {
        alert("Please switch to Base Sepolia network first!");
        switchChain({ chainId: 84532 });
        return;
    }

    setStatusMsg("Opening position in wallet...");
    try {
      writeContract({
        address: futuresAddress as `0x${string}`,
        abi: GOLD_FUTURES_ABI,
        functionName: 'openPosition',
        args: [parseUnits(amount, 6), BigInt(leverage), isLong]
      });
    } catch (e) {
      alert("Trade failed to start: " + (e as any).message);
    }
  };

  const handleClosePosition = (index: number) => {
    setStatusMsg("Closing position...");
    writeContract({
      address: futuresAddress,
      abi: GOLD_FUTURES_ABI,
      functionName: 'closePosition',
      args: [BigInt(index)]
    });
  };


  const [priceColor, setPriceColor] = useState('text-gold');
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (currentPrice > prevPriceRef.current) {
      setPriceColor('text-emerald-400');
      const timer = setTimeout(() => setPriceColor('text-gold'), 1000);
      return () => clearTimeout(timer);
    } else if (currentPrice < prevPriceRef.current) {
      setPriceColor('text-rose-400');
      const timer = setTimeout(() => setPriceColor('text-gold'), 1000);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto pb-20">
      <div className="lg:col-span-3 space-y-6">
        <GlassCard className="h-[400px] border-white/5 relative overflow-hidden bg-slate-950/40 shadow-[0_0_50px_rgba(251,191,36,0.05)]" delay={0.1}>
           <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <BarChart3 className="w-96 h-96 text-gold animate-pulse" />
           </div>
           <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                       <Zap className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">GOLD / USDT</h3>
                       <p className="text-[10px] text-slate-500 uppercase font-black">Bonding Curve Index</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Index Price</p>
                    <p className={`text-3xl font-black transition-colors duration-300 ${priceColor}`}>${currentPrice.toFixed(4)}</p>
                 </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                 <TradingChart currentPrice={currentPrice} />
              </div>
           </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 bg-white/[0.01]" delay={0.2}>
           {isConfirming && (
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Validating On-Chain...</span>
              </div>
              {hash && (
                <a 
                  href={`https://sepolia.basescan.org/tx/${hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] text-slate-500 hover:text-gold transition-colors text-center font-mono"
                >
                  View on Basescan ↗
                </a>
              )}
            </div>
          )}
           <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Activity className="w-4 h-4 text-gold" />
                     Active Positions
                  </h3>
                  <button onClick={() => { refetchPositions(); refetchPrice(); }} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                    <History className="w-3 h-3 text-gold" />
                  </button>
               </div>
           </div>
           
           {!isCorrectNetwork ? (
                <div className="py-10 text-center border-2 border-dashed border-gold/20 rounded-3xl bg-gold/5">
                   <p className="text-[10px] text-gold uppercase font-black tracking-widest mb-4">Wrong Network Detected</p>
                   <button onClick={() => switchChain({ chainId: 84532 })} className="px-6 py-2 bg-gold text-black text-[10px] font-black uppercase rounded-xl">Switch to Base Sepolia</button>
                </div>
            ) : activePositions.length === 0 ? (
               <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No Active Positions</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                         <tr>
                            <th className="pb-5 text-left">Market</th>
                            <th className="pb-5 text-left">Side</th>
                            <th className="pb-5 text-left">Size</th>
                            <th className="pb-5 text-left text-gold">PnL</th>
                            <th className="pb-5 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="text-[10px] font-black text-white">
                         {activePositions.map((pos) => {
                            const ePriceNum = Number(formatUnits(pos.entryPrice, 6));
                            const szNum = Number(formatUnits(pos.size, 18));
                            const collatNum = Number(formatUnits(pos.collateral, 6));
                            const currentPnl = pos.isLong ? (currentPrice - ePriceNum) * szNum : (ePriceNum - currentPrice) * szNum;
                            const currentPnlPercent = collatNum > 0 ? (currentPnl / collatNum) * 100 : 0;

                            return (
                               <tr key={pos.index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all group">
                                  <td className="py-5">
                                     <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gold/10 rounded-lg"><Zap className="w-3.5 h-3.5 text-gold" /></div>
                                        <span className="font-display font-light text-white tracking-wide">GOLD/USDT</span>
                                     </div>
                                  </td>
                                  <td className="py-5">
                                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-wider ${pos.isLong ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                        {pos.isLong ? 'LONG' : 'SHORT'}
                                     </span>
                                  </td>
                                  <td className="py-5">
                                    <span className="font-mono text-white/80">{szNum.toFixed(2)}</span>
                                    <span className="text-[8px] text-slate-600 ml-1 uppercase">Grams</span>
                                  </td>
                                  <td className="py-5">
                                     <motion.div key={currentPnl} className={`flex flex-col font-mono ${currentPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <span className="text-[11px] font-bold">{currentPnl >= 0 ? '+' : ''}${currentPnl.toFixed(2)}</span>
                                        <span className="text-[9px] opacity-60">{currentPnlPercent.toFixed(2)}%</span>
                                     </motion.div>
                                  </td>
                                  <td className="py-5 text-right">
                                     <button onClick={() => handleClosePosition(pos.index)} disabled={isPending} className="px-5 py-2.5 bg-white/5 hover:bg-rose-500 hover:text-white border border-white/10 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest">
                                        {isPending ? '...' : 'CLOSE'}
                                     </button>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                  </table>
               </div>
            )}
        </GlassCard>

        <GlassCard className="p-6 border-white/5 bg-slate-950/40" delay={0.3}>
           <ActivityScanner />
        </GlassCard>
      </div>

      <div className="lg:col-span-1">
         <GlassCard className="p-6 border-white/10 bg-black/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] sticky top-24" variant="gold" delay={0.2}>
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8 border border-white/5 shadow-inner">
               <button onClick={() => setIsLong(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isLong ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>LONG</button>
               <button onClick={() => setIsLong(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isLong ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>SHORT</button>
            </div>

            <div className="space-y-8">
               <div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">
                     <span>Collateral (USDT)</span>
                     <span className="text-white">Balance: {usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 transition-all focus-within:border-gold/50 group">
                     <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-display font-light text-white w-full focus:outline-none placeholder:text-white/20" />
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider mb-5">
                     <span className="text-white">Leverage: <span className="text-gold">{leverage}x</span></span>
                  </div>
                  <input type="range" min="1" max="50" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold" />
               </div>

               <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner text-[10px] font-black uppercase tracking-wider">
                  <div className="flex justify-between"><span className="text-slate-400">Position Size</span><span className="text-white">{(Number(amount || 0) * leverage).toFixed(2)} USDT</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-4 mt-2"><span className="text-slate-400">Est. Liq Price</span><span className="text-rose-400">${(isLong ? currentPrice * (1 - 0.9 / leverage) : currentPrice * (1 + 0.9 / leverage)).toFixed(4)}</span></div>
               </div>

               {(allowance !== undefined && amount && (allowance as bigint) < parseUnits(amount, 6)) ? (
                  <MagneticButton onClick={handleApprove} disabled={isPending || isConfirming} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">APPROVE USDT</MagneticButton>
               ) : (
                  <MagneticButton onClick={handleOpenPosition} disabled={!amount || isPending || isConfirming} className={`w-full py-6 text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl transition-all duration-500 shadow-2xl ${isPending || isConfirming ? 'bg-slate-800 opacity-50' : isLong ? 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]'}`}>
                     {isPending || isConfirming ? 'PROCESSING...' : `OPEN ${isLong ? 'LONG' : 'SHORT'}`}
                  </MagneticButton>
               )}
            </div>
         </GlassCard>
      </div>
    </div>
  );
};
