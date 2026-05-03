// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\SwapView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { WalletModal } from '@/components/ui/WalletModal';
import { GoldLogo } from '@/components/ui/NetworkLogos';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { 
  ArrowDownUp, Settings, ChevronDown, ShieldCheck, Info, TrendingUp, 
  Zap, CreditCard, Apple, Globe, Copy, Share2, Users, Wallet, 
  ShieldAlert, BarChart3, Layers, Radio, Orbit, RotateCw
} from 'lucide-react';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits, parseAbi } from 'viem';
import { 
  getContractAddress,
  GOLD_BONDING_CURVE_ABI,
  ERC20_ABI 
} from '@/constants/contracts';

import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useMounted } from '@/hooks/useMounted';

const HUDLine = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: [0, 0.5, 0] }}
    transition={{ duration: 2, delay, repeat: Infinity }}
    className="h-[1px] w-full bg-gold/20 origin-left"
  />
);

export const SwapView = ({ onSwap }: { onSwap?: () => void }) => {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [activeTab, setActiveTab] = useState<'swap' | 'send' | 'receive'>('swap');
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  const [amount, setAmount] = useState('');
  const [outAmount, setOutAmount] = useState('0.0');
  const [isSelling, setIsSelling] = useState(false);
  const [slippage, setSlippage] = useState(1.0); 
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'swap' | 'send' | 'faucet' | null>(null);
  
  const goldTokenAddress = '0x2DE2FAacA36a2BD434276126966F32453B7d1849';
  const bondingCurveAddress = '0x15C3EC22A9DB635B3B5FbE49B9dd2b567Cd31e85';
  const collateralTokenAddress = '0x526d075C81cb3451B436943BF999667Ba659ffC8';

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: goldTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'totalSupply',
    query: { refetchInterval: 1000 }
  });

  const { data: priceData, refetch: refetchPrice } = useReadContract({
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 1000 }
  });

  const { data: usdtBalance, refetch: refetchUsdtBalance } = useReadContract({
    address: collateralTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: goldBalance, refetch: refetchGoldBalance } = useReadContract({
    address: goldTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { refetchInterval: 1000, staleTime: 0 }
  });

  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    address: collateralTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'allowance',
    args: address ? [address as `0x${string}`, bondingCurveAddress as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 1000, staleTime: 0 }
  });

  const { data: goldAllowance, refetch: refetchGoldAllowance } = useReadContract({
    address: goldTokenAddress as `0x${string}`,
    abi: parseAbi(ERC20_ABI),
    functionName: 'allowance',
    args: address ? [address as `0x${string}`, bondingCurveAddress as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 1000, staleTime: 0 }
  });

  const allowance = isSelling ? goldAllowance : usdtAllowance;

  const { data: expectedOut, isFetching: isFetchingExpected } = useReadContract({
    address: bondingCurveAddress,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: isSelling ? 'getSellProceeds' : 'getGoldOut',
    args: amount && !isNaN(Number(amount)) && Number(amount) > 0 ? [parseUnits(amount, isSelling ? 18 : 6)] : undefined,
    query: { enabled: !!amount && !isNaN(Number(amount)) && Number(amount) > 0 }
  });

  useEffect(() => {
    if (expectedOut && !isFetchingExpected) {
      setOutAmount(formatUnits(expectedOut as bigint, isSelling ? 6 : 18));
    } else if (!amount || Number(amount) === 0) {
      setOutAmount('0.0');
    }
  }, [expectedOut, isFetchingExpected, isSelling, amount]);

  const { writeContract: writeContractRaw, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash });

  const errorMessage = (writeError as any)?.shortMessage || writeError?.message || (confirmError as any)?.shortMessage || confirmError?.message;

  const writeContract = (args: any, action: typeof pendingAction) => {
    setPendingAction(action);
    writeContractRaw({ ...args, gas: BigInt(1000000) });
  };

  useEffect(() => {
    if (isSuccess) {
      // Extended Multi-Pulse Refetch (10s window)
      const triggerRefetch = () => {
        refetchUsdtAllowance(); 
        refetchGoldAllowance();
        refetchUsdtBalance(); 
        refetchGoldBalance();
        refetchTotalSupply();
        refetchPrice();
      };

      triggerRefetch(); // 0s
      setTimeout(triggerRefetch, 1000); // 1s
      setTimeout(triggerRefetch, 3000); // 3s
      setTimeout(triggerRefetch, 5000); // 5s
      setTimeout(triggerRefetch, 8000); // 8s

      if (pendingAction === 'swap') onSwap?.();
      setPendingAction(null);
      setAmount(''); // Hard reset amount
    }
  }, [isSuccess]);

  const handleFaucet = () => {
    writeContract({
      address: collateralTokenAddress as `0x${string}`,
      abi: parseAbi(ERC20_ABI),
      functionName: 'mint',
      args: [address, parseUnits('100000', 6)],
    }, 'faucet');
  };

  const handleApprove = () => {
    const token = isSelling ? goldTokenAddress : collateralTokenAddress;
    writeContract({
      address: token as `0x${string}`,
      abi: parseAbi(ERC20_ABI),
      functionName: 'approve',
      args: [bondingCurveAddress as `0x${string}`, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
    }, 'approve');
  };

  
  const handleSwap = () => {
    if (!amount || isNaN(Number(amount)) || !expectedOut || BigInt(expectedOut.toString()) === 0n) return;
    
    const slippageBP = Math.floor(slippage * 10);
    const minOut = expectedOut ? (BigInt(expectedOut.toString()) * BigInt(1000 - slippageBP)) / 1000n : 0n;
    const maxIn = (BigInt(parseUnits(amount, 6)) * BigInt(1000 + slippageBP)) / 1000n;
    
    setPendingAction('swap');

    if (isSelling) {
      writeContract({
        address: bondingCurveAddress as `0x${string}`,
        abi: parseAbi(GOLD_BONDING_CURVE_ABI),
        functionName: 'sell',
        args: [parseUnits(amount, 18), minOut],
      }, 'swap');
    } else {
      writeContract({
        address: bondingCurveAddress as `0x${string}`,
        abi: parseAbi(GOLD_BONDING_CURVE_ABI),
        functionName: 'buy',
        args: [BigInt(expectedOut.toString()), maxIn],
      }, 'swap');
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4 min-h-screen relative">
      
      {/* 🔮 CINEMATIC TRADING DECK BACKGROUND 🔮 */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
          <div className="absolute inset-0 grid grid-cols-6 gap-0 opacity-10">
              {[...Array(6)].map((_, i) => <div key={i} className="border-r border-gold/20 h-full" />)}
          </div>
          <div className="absolute inset-0 flex flex-col justify-around">
              {[...Array(10)].map((_, i) => <HUDLine key={i} delay={i * 0.2} />)}
          </div>
      </div>

      <div className="relative z-10 space-y-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                <Radio className="text-gold animate-pulse" size={14} />
                <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">Live Market Access</span>
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                SWAP <span className="text-gold">ENGINE</span>
            </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* 📟 LEFT STATS PANEL 📟 */}
            <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                <GlassCard className="p-6 md:p-8 border-gold/20 bg-black/40 backdrop-blur-3xl">
                    <div className="space-y-6">
                        <div className="space-y-1 text-center lg:text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GOLD Price</span>
                            <div className="text-3xl md:text-4xl font-black text-gold tracking-tighter">
                                ${priceData ? Number(formatUnits(priceData as bigint, 6)).toFixed(2) : '10.00'}
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-white/5" />
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Status</span>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full border border-emerald-500/20">OPERATIONAL</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Network</span>
                                <span className="text-[8px] font-black text-white">BASE SEPOLIA</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                    <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Slippage Tolerance</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[0.5, 1.0, 3.0].map(s => (
                            <button 
                                key={s} 
                                onClick={() => setSlippage(s)}
                                className={`py-2 rounded-xl text-[9px] font-black transition-all ${slippage === s ? 'bg-gold text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                            >
                                {s}%
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* 🔮 MAIN SWAP RIG 🔮 */}
            <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="relative group">
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-white/5 to-gold/20 rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                    
                    <GlassCard className="relative p-6 md:p-14 border-white/10 bg-slate-950/80 rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-3xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Orbit className="w-24 h-24 md:w-40 md:h-40 text-gold animate-[spin_20s_linear_infinite]" />
                        </div>

                        <div className="relative z-10 space-y-8 md:space-y-12">
                            {/* Input Layer */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">You Pay</span>
                                    <div className="flex items-center gap-2 group/bal">
                                        <span className="text-[9px] font-bold text-white/40 uppercase">
                                            BAL: {isSelling ? (goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0') : (usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toLocaleString() : '0')}
                                        </span>
                                        <button 
                                            onClick={() => { refetchGoldBalance(); refetchUsdtBalance(); }}
                                            className="p-1 hover:bg-white/10 rounded-md transition-all opacity-0 group-hover/bal:opacity-100"
                                        >
                                            <RotateCw size={10} className="text-gold" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-[2rem] p-6 md:p-8 border border-white/5 focus-within:border-gold/30 transition-all">
                                    <div className="flex items-center justify-between gap-4 md:gap-6">
                                        <input 
                                            type="text" 
                                            value={amount} 
                                            onChange={(e) => setAmount(e.target.value)} 
                                            placeholder="0.0" 
                                            className="bg-transparent border-none outline-none text-4xl md:text-7xl font-display font-light text-white w-full"
                                        />
                                        <div className="flex items-center gap-2 md:gap-3 bg-black/40 px-3 md:px-5 py-2 md:py-3 rounded-2xl border border-white/10 shrink-0">
                                            {isSelling ? <GoldLogo className="w-4 h-4 md:w-6 md:h-6" /> : <div className="w-4 h-4 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-black">$</div>}
                                            <span className="font-black text-[10px] md:text-xs text-white tracking-widest">{isSelling ? 'GRAMS' : 'USDT'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Switch Trigger */}
                            <div className="flex justify-center -my-6 md:-my-8 relative z-20">
                                <motion.button 
                                    whileHover={{ rotate: 180, scale: 1.1 }}
                                    onClick={() => { setIsSelling(!isSelling); setAmount(''); }}
                                    className="p-4 md:p-5 bg-gold rounded-full shadow-[0_0_40px_rgba(255,215,0,0.4)] border-4 border-slate-950"
                                >
                                    <ArrowDownUp className="text-black" size={18} />
                                </motion.button>
                            </div>

                            {/* Output Layer */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">You Receive</span>
                                </div>
                                <div className="bg-gold/5 rounded-[2rem] p-6 md:p-8 border border-gold/10">
                                    <div className="flex items-center justify-between gap-4 md:gap-6">
                                        <div className="text-4xl md:text-7xl font-display font-light text-gold overflow-hidden text-ellipsis">
                                            {isFetchingExpected ? <span className="animate-pulse opacity-40">...</span> : outAmount}
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3 bg-gold/10 px-3 md:px-5 py-2 md:py-3 rounded-2xl border border-gold/20 shrink-0">
                                            {!isSelling ? <GoldLogo className="w-4 h-4 md:w-6 md:h-6" /> : <div className="w-4 h-4 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-black">$</div>}
                                            <span className="font-black text-[10px] md:text-xs text-gold tracking-widest">{isSelling ? 'USDT' : 'GRAMS'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Core */}
                            <div className="pt-6 space-y-4">
                                {isSuccess && hash && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                        {pendingAction === 'approve' ? 'Authorization Successful!' : 'Trade Executed Successfully!'}
                                      </span>
                                      <a 
                                        href={`https://sepolia.basescan.org/tx/${hash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-emerald-400 underline hover:text-white transition-colors"
                                      >
                                        View on Explorer
                                      </a>
                                    </div>
                                    <p className="text-[9px] text-emerald-200/60 leading-relaxed">
                                      {pendingAction === 'approve' 
                                        ? 'Permission granted to trade. You can now click "Execute Buy" to finalize your swap.' 
                                        : 'Gold has been added to your wallet. Your portfolio will refresh in a few seconds.'}
                                    </p>
                                  </motion.div>
                                )}
                                
                                {isConfirming && (
                                    <div className="p-4 bg-gold/10 border border-gold/20 rounded-2xl animate-pulse">
                                        <div className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">Indexing</div>
                                        <div className="text-[10px] text-gold/60 leading-relaxed">
                                            Finalizing on Base Sepolia...
                                        </div>
                                    </div>
                                )}
                                
                                {errorMessage && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                        <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Transaction Failed</div>
                                        <div className="text-[10px] text-red-200/60 leading-relaxed truncate">
                                            {errorMessage.includes('User rejected') ? 'User Cancelled Transaction' : errorMessage}
                                        </div>
                                    </div>
                                )}
                                
                                {!isConnected ? (
                                    <MagneticButton onClick={() => setIsWalletModalOpen(true)} className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xs rounded-3xl shadow-[0_20px_60px_rgba(255,255,255,0.1)]">CONNECT NODE</MagneticButton>
                                ) : (
                                    <div className="space-y-4">
                                        {(allowance !== undefined && amount && (allowance as bigint) < parseUnits(amount, isSelling ? 18 : 6)) ? (
                                            <MagneticButton onClick={handleApprove} disabled={isPending || isConfirming} className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xs rounded-3xl">
                                                {isConfirming ? 'APPROVING...' : 'AUTHORIZE PROTOCOL'}
                                            </MagneticButton>
                                        ) : (
                                            <MagneticButton onClick={handleSwap} disabled={!amount || isPending || isConfirming} className="w-full py-8 bg-gold text-black font-black uppercase tracking-[0.4em] text-xs rounded-3xl shadow-[0_20px_60px_rgba(255,215,0,0.2)]">
                                                {isConfirming ? 'PROCESSING...' : isSelling ? 'EXECUTE SELL' : 'EXECUTE BUY'}
                                            </MagneticButton>
                                        )}
                                    </div>
                                )}
                                
                                {/* 🪙 QUICK FAUCET ACCESS 🪙 */}
                                <button 
                                    onClick={handleFaucet} 
                                    className="w-full mt-6 py-4 bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-500/10 transition-all"
                                >
                                    Need Test USDT? Request Faucet
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* 📟 RIGHT ACTIVITY PANEL 📟 */}
            <div className="lg:col-span-3 space-y-6">
                <GlassCard className="p-6 border-white/5 bg-black/40 h-[400px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="text-gold" size={14} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Metrics</span>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-500 uppercase">Circulating</span>
                            <div className="text-xl font-black text-white">{totalSupply ? Number(formatUnits(totalSupply as bigint, 18)).toLocaleString() : '0'} G</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-500 uppercase">Market Cap</span>
                            <div className="text-xl font-black text-white">${totalSupply && priceData ? (Number(formatUnits(totalSupply as bigint, 18)) * Number(formatUnits(priceData as bigint, 6))).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'}</div>
                        </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="text-[8px] font-black text-gold uppercase tracking-widest mb-3">Protocol Insights</div>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                                <p className="text-[9px] text-slate-400 leading-relaxed"><span className="text-gold">Dynamic Pricing:</span> Price increases automatically with supply via Bonding Curve.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                                <p className="text-[9px] text-slate-400 leading-relaxed"><span className="text-gold">Instant Exit:</span> Sell anytime back to the protocol with guaranteed liquidity.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                                <p className="text-[9px] text-slate-400 leading-relaxed"><span className="text-gold">Verified Floor:</span> Every trade permanently boosts the virtual base price.</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <ActivityScanner />
            </div>
        </div>
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
};
