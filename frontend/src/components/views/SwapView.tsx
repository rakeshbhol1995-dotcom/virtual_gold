// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\SwapView.tsx
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
  
  const goldTokenAddress = getContractAddress(chainId || 84532, 'goldToken');
  const bondingCurveAddress = getContractAddress(chainId || 84532, 'bondingCurve');
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
        gas: BigInt(500000), 
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
    if (!tokenToApprove || tokenToApprove === '0x0000000000000000000000000000000000000000') return;
    
    const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    writeContract({
      address: tokenToApprove as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [bondingCurveAddress as `0x${string}`, MAX_UINT256],
    }, 'approve');
  };

  const handleSwap = () => {
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

  if (!mounted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2">Gold Swap</h1>
        <p className="text-gold font-black text-[10px] uppercase tracking-[0.3em]">Institutional Grade Bonding Curve Protocol</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="w-full border-white/10 p-1 bg-white/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.5)] mast-card relative overflow-hidden" variant="gold" delay={0.1}>
            <div className="p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
                  <button onClick={() => setActiveTab('swap')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'swap' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>SWAP</button>
                  <button onClick={() => setActiveTab('send')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'send' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>SEND</button>
                  <button onClick={() => setActiveTab('receive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'receive' ? 'bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-500 hover:text-white'}`}>RECEIVE</button>
                </div>
                <div className="flex items-center gap-3 bg-black/40 p-1 rounded-xl border border-white/5">
                   <span className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Slippage: {slippage}%</span>
                </div>
              </div>

              {(chainId === 84532) && (
                <div className="mb-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-between group hover:bg-blue-600/20 transition-all">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <div>
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Base Sepolia Test Mode</h4>
                      <p className="text-[8px] text-slate-500 uppercase">Get free assets to test the protocol</p>
                    </div>
                  </div>
                  <button onClick={handleFaucet} className="px-6 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all">Get 10k USDT</button>
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
                          <button onClick={() => setAmount(isSelling ? formatUnits(goldBalance as bigint || 0n, 18) : formatUnits(usdtBalance as bigint || 0n, 6))} className="ml-1 text-gold hover:text-white transition-colors bg-gold/10 px-2 py-0.5 rounded text-[8px]">MAX</button>
                        </span>
                      </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-center gap-4">
                      <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="bg-transparent border-none outline-none text-4xl md:text-6xl font-display font-light w-full text-white placeholder:text-white/5" />
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                        {isSelling ? <GoldLogo className="w-6 h-6 text-gold" /> : null}
                        <span className="font-black text-xs md:text-sm text-white tracking-widest">{isSelling ? 'GRAMS' : 'USDT'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-6 md:-my-8 relative z-20">
                    <button onClick={handleSwitch} className="bg-gold p-3 md:p-4 rounded-2xl border-[4px] border-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-110 transition-all">
                      <ArrowDownUp className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  <div className="bg-black/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/10 relative overflow-hidden group transition-all hover:border-gold/20">
                    <div className="relative z-10 flex justify-between text-[10px] font-black text-slate-400 mb-5 uppercase tracking-[0.2em]">
                      <span className="text-white/60">You Receive</span>
                      <span className="text-white/40">Balance: <span className="text-white">{isSelling ? (usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toLocaleString() : '0.00') : (goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00')}</span></span>
                    </div>
                    <div className="relative z-10 flex justify-between items-center gap-4">
                      <div className="text-4xl md:text-6xl font-display font-light text-white">
                        {isFetchingExpected ? <span className="text-xl animate-pulse text-gold/40">Calculating...</span> : <span className="neon-text-gold">{outAmount}</span>}
                      </div>
                      <div className="flex items-center gap-3 bg-gold/5 px-4 py-2 rounded-2xl border border-gold/20">
                        {!isSelling ? <GoldLogo className="w-6 h-6 text-gold" /> : null}
                        <span className="font-black text-xs md:text-sm text-gold tracking-widest">{isSelling ? 'USDT' : 'GRAMS'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    {!isConnected ? (
                      <MagneticButton onClick={() => setIsWalletModalOpen(true)} className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">CONNECT WALLET</MagneticButton>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {(allowance !== undefined && amount && (allowance as bigint) < parseUnits(amount, isSelling ? 18 : 6)) ? (
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
                  </div>
                </>
              ) : activeTab === 'send' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 rounded-[1.5rem] p-5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 mb-2 uppercase tracking-widest">Recipient Address</div>
                    <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="bg-transparent text-lg font-black text-white focus:outline-none w-full" />
                  </div>
                  <div className="bg-slate-950/80 rounded-[1.5rem] p-5 border border-white/5">
                    <div className="flex justify-between text-[8px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                      <span>Amount to Send</span>
                      <span>Balance: {goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00'} Grams</span>
                    </div>
                    <input type="text" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-2xl font-black text-white focus:outline-none w-full" />
                  </div>
                  <MagneticButton onClick={handleSend} disabled={!recipient || !sendAmount || isPending || isConfirming} className="w-full py-5 bg-gold text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl">SEND GRAMS</MagneticButton>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="p-6 bg-gold/5 border border-gold/20 rounded-[2rem] mb-6">
                    <Globe className="w-12 h-12 text-gold mb-4 mx-auto" />
                    <div className="text-xs font-black text-white break-all">{address || 'Not Connected'}</div>
                  </div>
                  {address && (
                    <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase transition-all">
                      <Copy className="w-4 h-4" /> <span>{copied ? 'COPIED!' : 'COPY ADDRESS'}</span>
                    </button>
                  )}
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
          <ActivityScanner />
        </div>
      </div>
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </motion.div>
  );
};
