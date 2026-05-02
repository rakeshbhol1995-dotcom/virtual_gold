'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { WalletModal } from '@/components/ui/WalletModal';
import { GoldLogo } from '@/components/ui/NetworkLogos';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowDownUp, Settings, ChevronDown, ShieldCheck, Info, TrendingUp, Zap, CreditCard, Apple, Globe, Copy, Share2, Users, Wallet, ShieldAlert } from 'lucide-react';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { 
  getContractAddress,
  GOLD_BONDING_CURVE_ABI,
  GOLD_STAKING_ABI,
  ERC20_ABI 
} from '@/constants/contracts';

import { ActivityScanner } from '@/components/ui/ActivityScanner';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useSearchParams } from 'next/navigation';
import { useMounted } from '@/hooks/useMounted';

export const SwapView = ({ onSwap }: { onSwap?: () => void }) => {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string>('0x0000000000000000000000000000000000000000');
  
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      setReferrer(ref);
    }
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<'swap' | 'send' | 'receive'>('swap');
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  const [amount, setAmount] = useState('');
  const [outAmount, setOutAmount] = useState('0.0');
  const [isSelling, setIsSelling] = useState(false);
  const [slippage, setSlippage] = useState(0.5); 
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'swap' | 'send' | 'faucet' | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const isCorrectNetwork = chainId === 84532; // Base Sepolia
  
  const goldTokenAddress = getContractAddress(chainId || 84532, 'goldToken');
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');
  const collateralTokenAddress = getContractAddress(chainId || 84532, 'collateralToken');

  const { data: totalSupply } = useReadContract({
    chainId: chainId || 84532,
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 1000 }
  });

  const { data: priceData } = useReadContract({
    chainId: chainId || 84532,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 1000 }
  });

  const { data: usdtBalance, refetch: refetchUsdtBalance } = useReadContract({
    chainId: chainId || 84532,
    address: collateralTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: goldBalance, refetch: refetchGoldBalance } = useReadContract({
    chainId: chainId || 84532,
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    chainId: chainId || 84532,
    address: collateralTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, bondingCurveAddress] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: goldAllowance, refetch: refetchGoldAllowance } = useReadContract({
    chainId: chainId || 84532,
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, bondingCurveAddress] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const allowance = isSelling ? goldAllowance : usdtAllowance;

  const { data: totalTVL } = useReadContract({
    chainId: chainId || 84532,
    address: collateralTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [bondingCurveAddress],
    query: { refetchInterval: 1000 }
  });

  const stakingAddress = getContractAddress(chainId || 84532, 'staking');

  const { data: userStaked } = useReadContract({
    chainId: chainId || 84532,
    address: stakingAddress,
    abi: GOLD_STAKING_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: expectedOut, isFetching: isFetchingExpected, error: expectedError } = useReadContract({
    chainId: chainId || 84532,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: isSelling ? 'getSellProceeds' : 'getGoldOut',
    args: amount && !isNaN(Number(amount)) && Number(amount) > 0 ? [parseUnits(amount, isSelling ? 18 : 6)] : undefined,
    query: { 
      enabled: !!amount && !isNaN(Number(amount)) && Number(amount) > 0,
      refetchInterval: 1000,
      retry: 2,
    }
  });

  useEffect(() => {
    if (expectedOut) {
      setOutAmount(formatUnits(expectedOut as bigint, isSelling ? 6 : 18));
    } else {
      setOutAmount('0.0');
    }
  }, [expectedOut, isSelling]);

  const { writeContract: writeContractRaw, data: hash, isPending, error: writeError } = useWriteContract();

  const writeContract = (args: any, action: typeof pendingAction) => {
    setPendingAction(action);
    setTxStatus(null);
    try {
      writeContractRaw({
        ...args,
        gas: BigInt(500000), // Manual gas limit to prevent estimation failures
      });
    } catch (e) {
      setPendingAction(null);
      alert("Error sending transaction: " + (e as any).message);
    }
  };
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchUsdtAllowance();
      refetchGoldAllowance();
      refetchUsdtBalance();
      refetchGoldBalance();
      if (pendingAction === 'approve') {
        setTxStatus('approved');
        setPendingAction(null);
      } else if (pendingAction === 'swap') {
        setTxStatus('swapped');
        setPendingAction(null);
        onSwap && onSwap();
      } else if (pendingAction === 'send') {
        setTxStatus('sent');
        setPendingAction(null);
      } else if (pendingAction === 'faucet') {
        setTxStatus('faucet');
        setPendingAction(null);
      }
    }
  }, [isSuccess]);

  const handleFaucet = async () => {
    if (!address || !collateralTokenAddress) return;
    writeContract({
      address: collateralTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [address, parseUnits('10000', 6)],
    }, 'faucet');
  };

  const handleApprove = () => {
    const tokenToApprove = isSelling ? goldTokenAddress : collateralTokenAddress;
    const decimals = isSelling ? 18 : 6;
    
    if (!tokenToApprove || tokenToApprove === '0x0000000000000000000000000000000000000000') {
        alert("Error: Token Address not found! Please refresh.");
        return;
    }
    if (!amount || isNaN(Number(amount))) {
        alert("Error: Please enter a valid amount first.");
        return;
    }

    try {
      // Approve max to avoid needing re-approval every swap
      const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      writeContract({
        address: tokenToApprove as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [bondingCurveAddress as `0x${string}`, MAX_UINT256],
      }, 'approve');
    } catch (e) {
      console.error("Approval failed", e);
      alert("Transaction failed to start: " + (e as any).message);
    }
  };

  const handleSwap = () => {
    // 10% slippage for safety
    const safeSlippage = 10; 
    const minOut = expectedOut ? (BigInt(expectedOut.toString()) * BigInt(Math.floor(1000 - (safeSlippage * 10)))) / 1000n : 0n;
    const refAddr = referrer || '0x0000000000000000000000000000000000000000';
    
    if (isSelling) {
      writeContract({
        address: bondingCurveAddress as `0x${string}`,
        abi: GOLD_BONDING_CURVE_ABI,
        functionName: 'sell',
        args: [parseUnits(amount, 18), minOut],
      }, 'swap');
    } else {
      writeContract({
        address: bondingCurveAddress as `0x${string}`,
        abi: GOLD_BONDING_CURVE_ABI,
        functionName: 'buy',
        args: [parseUnits(amount, 6), minOut, refAddr as `0x${string}`],
      }, 'swap');
    }
  };

  const handleSwitch = () => {
    setIsSelling(!isSelling);
    setAmount('');
    setOutAmount('0.0');
  };

  const handleSend = () => {
    if (!recipient || !sendAmount || !goldTokenAddress) return;
    writeContract({
      address: goldTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, parseUnits(sendAmount, 18)],
    }, 'send');
  };

  const handleTransak = () => {
    const transakUrl = `https://global.transak.com/?apiKey=7739505c-60e5-4a17-9118-2045c71b65d6&cryptoCurrencyCode=USDT&networks=polygon&walletAddress=${address || ''}&themeColor=fbbf24&defaultCryptoAmount=100`;
    window.open(transakUrl, '_blank', 'width=500,height=700');
  };

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-0"
    >
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2">Gold Swap</h1>
        <p className="text-gold font-black text-[10px] uppercase tracking-[0.3em]">Institutional Grade Bonding Curve Protocol</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="w-full border-white/10 p-1 bg-white/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.5)] mast-card relative overflow-hidden" variant="gold" delay={0.1}>
            
            {chainId !== 84532 && address && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between group animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Wrong Network Detected</h4>
                    <p className="text-[8px] text-slate-500 uppercase">Please switch to Base Sepolia to continue</p>
                  </div>
                </div>
                <button 
                  onClick={() => switchChain({ chainId: 84532 })}
                  className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Switch to Base
                </button>
              </div>
            )}

            <div className="p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
                  <button onClick={() => setActiveTab('swap')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'swap' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>SWAP</button>
                  <button onClick={() => setActiveTab('send')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'send' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>SEND</button>
                  <button onClick={() => setActiveTab('receive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'receive' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>RECEIVE</button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Slippage</span>
                  <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                    {[0.5, 1.0, 3.0].map((s) => (
                      <button key={s} onClick={() => setSlippage(s)} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${slippage === s ? 'bg-white/10 text-gold shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{s}%</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* High Visibility Faucet Bar */}
              {(chainId === 84532) && (
                <div className="mb-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-between group hover:bg-blue-600/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Base Sepolia Test Mode</h4>
                      <p className="text-[8px] text-slate-500 uppercase">Get free assets to test the protocol on Base</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleFaucet}
                      className="px-6 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      Get 10,000 Free USDT
                    </button>
                    <button 
                      onClick={() => window.open('https://www.alchemy.com/faucets/base-sepolia', '_blank')}
                      className="px-6 py-2 bg-gold text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      Get Gas (ETH)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'swap' ? (
                <>
                  <div className="bg-black/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/10 mb-2 relative overflow-hidden group transition-all hover:border-gold/30">
                    <div className="relative z-10 flex justify-between text-[10px] font-black text-slate-400 mb-5 uppercase tracking-[0.2em]">
                      <span className="text-white/60">You Pay</span>
                      <div className="text-right">
                        <span className="block flex items-center gap-2">
                          <span className="text-slate-500">Wallet:</span> 
                          <span className="text-white">{isSelling ? (goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00') : (usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toLocaleString() : '0.00')}</span>
                          <span className="text-slate-400 font-bold">{isSelling ? 'Grams' : 'USDT'}</span>
                          <button 
                            onClick={() => {
                              const bal = isSelling ? (goldBalance ? formatUnits(goldBalance as bigint, 18) : '0') : (usdtBalance ? formatUnits(usdtBalance as bigint, 6) : '0');
                              setAmount(bal);
                            }}
                            className="ml-1 text-gold hover:text-white transition-colors bg-gold/10 px-2 py-0.5 rounded text-[8px]"
                          >
                            MAX
                          </button>
                        </span>
                        {isSelling && userStaked && Number(userStaked) > 0 && (
                           <span className="block text-gold/40 text-[9px]">Staked: {Number(formatUnits(userStaked as bigint, 18)).toLocaleString()} Grams</span>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-center gap-4">
                      <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="bg-transparent border-none outline-none text-4xl md:text-6xl font-display font-light w-full text-white placeholder:text-white/5" />
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                        {isSelling ? <GoldLogo className="w-6 h-6 text-gold" /> : null}
                        <span className="font-black text-xs md:text-sm text-white tracking-widest">{isSelling ? 'GRAMS' : 'USDT'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-6 md:-my-8 relative z-20">
                    <button onClick={handleSwitch} className="bg-gold p-3 md:p-4 rounded-2xl border-[4px] border-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-110 transition-all">
                      <ArrowDownUp className="w-4 h-4 text-black" />
                    </button>
                  </div>                  <div className="bg-black/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/10 relative overflow-hidden group transition-all hover:border-gold/20">
                    <div className="relative z-10 flex justify-between text-[10px] font-black text-slate-400 mb-5 uppercase tracking-[0.2em]">
                      <span className="text-white/60">You Receive</span>
                      <span className="text-white/40">Balance: <span className="text-white">{isSelling ? (usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toLocaleString() : '0.00') : (goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00')}</span> <span className="text-[8px]">{isSelling ? 'USDT' : 'Grams'}</span></span>
                    </div>
                    <div className="relative z-10 flex justify-between items-center gap-4">
                      <div className="text-4xl md:text-6xl font-display font-light text-white">
                        {isFetchingExpected ? (
                          <span className="text-xl animate-pulse text-gold/40">Calculating...</span>
                        ) : expectedError ? (
                          <div className="flex flex-col items-start">
                            <span className="text-[8px] text-red-500 uppercase font-black">Query Error</span>
                          </div>
                        ) : (
                          <span className="neon-text-gold">{outAmount}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 bg-gold/5 px-4 py-2 rounded-2xl border border-gold/20 shadow-2xl">
                        {!isSelling ? <GoldLogo className="w-6 h-6 text-gold" /> : null}
                        <span className="font-black text-xs md:text-sm text-gold tracking-widest">{isSelling ? 'USDT' : 'GRAMS'}</span>
                      </div>
                    </div>
                  </div>
                    
                    {amount && (
                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500">
                          <span>Exchange Rate</span>
                          <span className="text-white">1 Gram = {priceData ? Number(formatUnits(priceData as bigint, 6)).toFixed(4) : '10.00'} USDT</span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500">
                          <span>Slippage Tolerance</span>
                          <span className="text-gold">{slippage}%</span>
                        </div>
                      </div>
                    )}

                  {!isConnected ? (
                    <MagneticButton onClick={() => setIsWalletModalOpen(true)} className="w-full mt-10 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl hover:bg-gold transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]">CONNECT WALLET</MagneticButton>
                  ) : (
                    <div className="flex flex-col gap-4 mt-10">
                      {chainId !== 84532 ? (
                        <MagneticButton onClick={() => switchChain?.({ chainId: 84532 })} className="w-full py-6 bg-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:scale-[1.02] transition-all duration-500">SWITCH TO BASE</MagneticButton>
                      ) : (!isSelling && usdtBalance !== undefined && amount && (usdtBalance as bigint) < parseUnits(amount, 6)) ? (
                        <MagneticButton disabled={true} className="w-full py-6 bg-rose-500/10 text-rose-500 text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl border border-rose-500/30 cursor-not-allowed opacity-60">INSUFFICIENT USDT</MagneticButton>
                      ) : (isSelling && goldBalance !== undefined && amount && (goldBalance as bigint) < parseUnits(amount, 18)) ? (
                        <MagneticButton disabled={true} className="w-full py-6 bg-rose-500/10 text-rose-500 text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl border border-rose-500/30 cursor-not-allowed opacity-60">INSUFFICIENT GOLD</MagneticButton>
                      ) : (allowance !== undefined && amount && (allowance as bigint) < parseUnits(amount, isSelling ? 18 : 6)) ? (
                        <MagneticButton onClick={handleApprove} disabled={isPending || isConfirming} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:bg-gold transition-all duration-500">
                          {isSelling ? 'APPROVE GRAMS' : 'APPROVE USDT'}
                        </MagneticButton>
                      ) : (
                        <MagneticButton onClick={handleSwap} disabled={!amount || isPending || isConfirming} className="w-full py-6 bg-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:scale-[1.02] transition-all duration-500">
                          {isSelling ? 'SELL GRAMS' : 'BUY GRAMS'}
                        </MagneticButton>
                      )}
                    </div>
                  )}
                </>
              ) : activeTab === 'send' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 rounded-[1.5rem] p-5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 mb-2 uppercase tracking-widest">Recipient</div>
                    <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="bg-transparent text-sm md:text-lg font-black text-white focus:outline-none w-full" />
                  </div>
                  <div className="bg-slate-950/80 rounded-[1.5rem] p-5 border border-white/5">
                    <div className="flex justify-between text-[8px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                      <span>Amount</span>
                      <span>Balance: {goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00'} Grams</span>
                    </div>
                    <input type="text" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-2xl font-black text-white focus:outline-none w-full" />
                  </div>
                  <MagneticButton onClick={handleSend} disabled={!recipient || !sendAmount || isPending || isConfirming} className="w-full py-5 bg-gold text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl">SEND Grams</MagneticButton>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col items-center py-6 text-center">
                  <div className="p-6 bg-gold/5 border border-gold/20 rounded-[2rem]">
                    <Globe className="w-12 h-12 text-gold mb-4 mx-auto animate-pulse" />
                    <div className="text-xs font-black text-white break-all">{address || 'Not Connected'}</div>
                  </div>
                  {address && (
                    <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase transition-all">
                      <Copy className="w-4 h-4" /> <span>{copied ? 'COPIED!' : 'COPY ADDRESS'}</span>
                    </button>
                  )}
                </div>
              )}

              {writeError && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[8px] text-red-400 font-mono text-center uppercase tracking-widest mb-2">Transaction Error</p>
                  <p className="text-[10px] text-white font-mono break-all">{String((writeError as any)?.shortMessage || (writeError as any)?.message)}</p>
                  <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-[9px] text-yellow-500">
                    💡 TIP: Ensure you have enough USDT and ETH for gas fees, and wallet is on Base Sepolia.
                  </div>
                </div>
              )}

              {/* Approval Success Banner */}
              {txStatus === 'approved' && (
                <div className="mt-6 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">✅ Approval Confirmed! Now click BUY / SELL to swap.</p>
                  </div>
                </div>
              )}

              {/* Swap/Send Pending Banner */}
              {hash && (isConfirming || pendingAction === 'swap') && (
                <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                      {pendingAction === 'approve' ? 'Approval Sent' : pendingAction === 'swap' ? 'Swap Sent' : 'Transaction Sent'}
                    </p>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] text-gold hover:underline font-black uppercase"
                    >
                      VIEW ON EXPLORER ↗
                    </a>
                  </div>
                  <p className="text-[10px] text-white/60 font-mono break-all mb-4 px-3 py-2 bg-black/40 rounded-xl border border-white/5">{hash}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Validating on Base Sepolia...</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard className="border-white/5 bg-white/[0.01] p-5 h-fit" delay={0.2}>
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-gold uppercase tracking-widest mb-4">Market Stats</h4>
               <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Current Price</span>
                    <span className="text-xs font-black text-white">{priceData ? Number(formatUnits(priceData as bigint, 6)).toFixed(4) : '10.00'} USDT</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Circulating Supply</span>
                    <span className="text-xs font-black text-white">{totalSupply ? Number(formatUnits(totalSupply as bigint, 18)).toLocaleString() : '0'} Grams</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Protocol TVL</span>
                    <span className="text-xs font-black text-white">{totalTVL ? Number(formatUnits(totalTVL as bigint, 6)).toLocaleString() : '0'} USDT</span>
                  </div>
               </div>
            </div>
          </GlassCard>
          <GlassCard className="border-white/5 bg-slate-950/60 p-6" delay={0.3}>
             <div className="flex items-center gap-3 mb-4">
                <Globe className="w-4 h-4 text-gold" />
                <h4 className="font-black uppercase tracking-tighter text-[10px] text-gold">Global Fiat On-Ramp</h4>
             </div>
             <p className="text-[10px] text-slate-400 mb-4 uppercase">Buy USDT instantly using UPI, Card, or Apple Pay.</p>
             <button onClick={handleTransak} className="w-full py-3 bg-white/5 hover:bg-gold/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all">
                <CreditCard className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Buy with Fiat</span>
             </button>
          </GlassCard>
        </div>
      </div>
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </motion.div>
  );
};
