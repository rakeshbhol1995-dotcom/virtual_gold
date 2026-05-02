'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ArrowRightLeft, Network, ShieldCheck, ChevronDown, Zap, Copy, ExternalLink, Timer, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseUnits, formatUnits, getAddress } from 'viem';

import { EthereumLogo, PolygonLogo, BSCLogo, BaseLogo, GoldLogo } from '@/components/ui/NetworkLogos';
import { WalletModal } from '@/components/ui/WalletModal';
import { ERC20_ABI, GOLD_BRIDGE_ABI, getContractAddress } from '@/constants/contracts';

const BRIDGE_RELAY_WALLET = "0xE00FA5D0C22B9e8e009AC9894D83f11AE904fd0A"; // The backup relayer wallet
const TRON_USDT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // Standard Tron USDT

const CHAINS = [
  { id: 'base-sepolia', name: 'Base Sepolia', color: 'bg-blue-400', Logo: BaseLogo, chainId: 84532, usdt: '0x549E9Ba7946b0ddB5CF26fceAAb415b38f13df90' },
  { id: 'amoy', name: 'Amoy Testnet', color: 'bg-purple-400', Logo: PolygonLogo, chainId: 80002, usdt: '0x80F9850D95786C5091a18296311697203719082d' },
  { id: 'poly', name: 'Polygon', color: 'bg-purple-600', Logo: PolygonLogo, chainId: 137, usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
  { id: 'bsc', name: 'BSC', color: 'bg-yellow-500', Logo: BSCLogo, chainId: 56, usdt: '0x55d398326f99059fF775485246999027B3197955' },
  { id: 'base', name: 'Base', color: 'bg-blue-600', Logo: BaseLogo, chainId: 8453, usdt: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { id: 'gold', name: 'Gold Chain', color: 'bg-gold', Logo: GoldLogo, chainId: 77777 }
];

export const BridgeView = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [fromChain, setFromChain] = useState(CHAINS[0]); // Default: Amoy
  const [toChain, setToChain] = useState(CHAINS[4]); // Default: Gold Chain
  const [amount, setAmount] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [copied, setCopied] = useState(false);

  const { writeContractAsync, data: hash, isPending, error: writeError } = useWriteContract();
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    chainId: fromChain.chainId as any, // Target the selected source chain
    address: fromChain.usdt as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && fromChain.id === 'poly' ? [address, getContractAddress(137, 'bridge' as any)] : undefined,
    query: { enabled: !!address && fromChain.id === 'poly' }
  });

  const { data: usdtBalance } = useReadContract({
    chainId: fromChain.chainId as any,
    address: fromChain.usdt as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!fromChain.usdt }
  });

  const handleBridge = async () => {
    setBridgeError(null);
    if (!isConnected && fromChain.id !== 'tron') {
      setIsWalletModalOpen(true);
      return;
    }

    if (fromChain.id === 'tron' || fromChain.id === 'bsc' || fromChain.id === 'base') {
      setStep('processing');
      return;
    }

    // Switch network if needed
    if (chainId !== fromChain.chainId) {
      if (switchChain) switchChain({ chainId: fromChain.chainId });
      return;
    }

    if (!amount) {
      setBridgeError("Please enter an amount.");
      return;
    }

    try {
      if (fromChain.id === 'poly') {
        const bridgeAddress = getContractAddress(137, 'bridge' as any);
        
        // Force approval check
        if (allowance === undefined) {
          setBridgeError("Loading allowance. Please try again in a second.");
          return;
        }

        if ((allowance as bigint) < parseUnits(amount, 6)) {
          await writeContractAsync({
            address: fromChain.usdt as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [bridgeAddress, parseUnits(amount, 6)],
          });
          return;
        }

        // Decentralized Contract Bridge
        await writeContractAsync({
          address: bridgeAddress,
          abi: GOLD_BRIDGE_ABI,
          functionName: 'deposit',
          args: [parseUnits(amount, 6)],
        });
      } else {
        // Fallback to manual transfer for other chains (Relayer handled)
        await writeContractAsync({
          address: fromChain.usdt as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [BRIDGE_RELAY_WALLET, parseUnits(amount, 6)],
        });
      }
    } catch (err: any) {
      console.error("Bridge Error:", err);
      const errorMsg = err?.shortMessage || err?.message || "Transaction failed.";
      if (errorMsg.includes('User rejected')) {
        setBridgeError("Transaction rejected by user.");
      } else if (errorMsg.includes('insufficient funds')) {
        setBridgeError("Insufficient POL (MATIC) for gas fees.");
      } else if (errorMsg.includes('exceeds balance')) {
        setBridgeError("Insufficient USDT balance on Polygon.");
      } else {
        setBridgeError(errorMsg);
      }
    }
  };

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
      if (step !== 'success' && fromChain.id === 'poly' && allowance !== undefined && (allowance as bigint) >= parseUnits(amount || "0", 6)) {
         // If we just approved, we stay on 'input' so they can click 'Initiate Bridge'
         // or we can auto-trigger it. For simplicity, let's let them click again.
      }
    }
  }, [isSuccess]);


  const copyAddress = () => {
    navigator.clipboard.writeText(BRIDGE_RELAY_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Bridge Controls */}
        <div className="lg:col-span-3">
          <GlassCard className="border-white/10 p-6 md:p-10 relative overflow-hidden" variant="gold">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Zap className="w-32 h-32 text-gold" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-2 h-10 bg-gold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">Universal Bridge</h2>
              </div>

              <AnimatePresence mode="wait">
                {fromChain.id === 'amoy' && chainId !== 80002 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-gold/10 border border-gold/20 rounded-[2rem] text-center"
                  >
                    <h3 className="text-xs font-black text-gold uppercase mb-2">Testnet Setup Required</h3>
                    <p className="text-[10px] text-slate-400 uppercase mb-4">You must be on Amoy Testnet to use test tokens.</p>
                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                      <button 
                        onClick={() => switchChain({ chainId: 80002 })}
                        className="bg-gold text-black text-[10px] font-black px-6 py-2 rounded-full uppercase hover:scale-105 transition-all"
                      >
                        Switch to Amoy
                      </button>
                      <a 
                        href="https://faucet.polygon.technology/" 
                        target="_blank" 
                        className="bg-white/5 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase border border-white/10 hover:bg-white/10 transition-all"
                      >
                        Get Free Gas (MATIC)
                      </a>
                    </div>
                  </motion.div>
                )}
                {step === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Chain Selectors */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="w-full bg-slate-950/60 p-4 rounded-[2rem] border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-2">From Network</span>
                        {fromChain.id === 'amoy' && (
                          <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-[7px] font-black text-gold/60 hover:text-gold uppercase tracking-tighter mb-2 block border border-gold/20 bg-gold/5 px-2 py-1 rounded-lg">
                            Need Gas? Get Amoy MATIC →
                          </a>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <fromChain.Logo className="w-6 h-6" />
                            <span className="font-black text-sm">{fromChain.name}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                      
                      <div className="bg-gold p-3 rounded-full shadow-2xl -my-4 md:my-0 md:-mx-4 z-20">
                        <ArrowRightLeft className="w-4 h-4 text-black" />
                      </div>

                      <div className="w-full bg-slate-950/60 p-4 rounded-[2rem] border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-2">To Network</span>
                        <div className="flex items-center gap-3">
                          <toChain.Logo className="w-6 h-6" />
                          <span className="font-black text-sm">{toChain.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="bg-slate-950/80 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">
                        <span>Amount to bridge</span>
                        <span>Balance: {usdtBalance ? Number(formatUnits(usdtBalance as bigint, 6)).toFixed(2) : '0.00'} USDT</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input 
                          type="text" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent border-none outline-none text-4xl font-black w-full text-white placeholder:text-slate-900" 
                        />
                        <div className="flex items-center gap-2">
                          {fromChain.id === 'amoy' && (
                            <button 
                              onClick={async () => {
                                try {
                                  const tx = await writeContractAsync({
                                    address: getAddress(fromChain.usdt as string),
                                    abi: ERC20_ABI,
                                    functionName: 'mint',
                                    args: [address, parseUnits('10000', 6)],
                                    // Massive gas to force success
                                    gasPrice: BigInt(100000000000), // 100 Gwei
                                  });
                                } catch (err: any) {
                                  console.error("Mint Error:", err);
                                  alert("Mint failed! Make sure you have Amoy MATIC for gas. \nError: " + (err.shortMessage || err.message));
                                }
                              }}
                              className="text-[8px] font-black bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold hover:text-black transition-all"
                            >
                              GET TEST USDT
                            </button>
                          )}
                          <div className="flex items-center gap-2 bg-white/5 p-2 px-4 rounded-2xl border border-white/10">
                            <span className="font-black text-xs">USDT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!isConnected) {
                          connect({ connector: injected() });
                        } else if (fromChain.id === 'poly' && chainId !== 137) {
                          switchChain?.({ chainId: 137 });
                        } else {
                          handleBridge();
                        }
                      }}
                      disabled={isPending || isConfirming}
                      className={`w-full py-6 md:py-8 ${isPending || isConfirming ? 'bg-gold/50 cursor-not-allowed' : 'bg-gold'} text-black font-black text-xl rounded-[2.5rem] shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter`}
                    >
                      {!isConnected ? 'Connect Wallet' :
                       isPending ? 'Processing...' : 
                       isConfirming ? 'Confirming...' : 
                       (fromChain.id === 'poly' && chainId !== 137) ? 'Switch to Polygon' :
                       (fromChain.id === 'poly' && allowance !== undefined && (allowance as bigint) < parseUnits(amount || "0.000001", 6)) ? 'Approve USDT' : 'Initiate Bridge'}
                    </button>



                    {bridgeError && (
                      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase">
                        <AlertCircle className="w-4 h-4" />
                        <span>Error: {bridgeError}</span>
                      </div>
                    )}
                    {writeError && !bridgeError && (
                      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase">
                        <AlertCircle className="w-4 h-4" />
                        <span>Error: {writeError.message.substring(0, 100)}...</span>
                      </div>
                    )}

                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <div className="relative mb-8">
                       <div className="w-24 h-24 rounded-full border-4 border-gold/20 animate-spin border-t-gold" />
                       <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4">Awaiting Deposit</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-sm uppercase">
                      Please send the exact amount of USDT to the bridge address below.
                    </p>
                    
                    <div className="w-full bg-black/40 border border-gold/30 rounded-2xl p-4 mb-6 relative group">
                       <span className="text-[8px] font-black text-gold uppercase block mb-1">Bridge Relay Wallet</span>
                       <div className="flex items-center justify-between gap-4">
                          <code className="text-[10px] md:text-xs text-white break-all">{BRIDGE_RELAY_WALLET}</code>
                          <button onClick={copyAddress} className="p-2 bg-gold/10 hover:bg-gold rounded-lg transition-all">
                             {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-gold group-hover:text-black" />}
                          </button>
                       </div>
                    </div>

                    <button onClick={() => setStep('input')} className="text-xs font-black text-slate-500 uppercase hover:text-white transition-all">Cancel Request</button>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
                       <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4">Transfer Initiated!</h3>
                    <p className="text-slate-400 text-sm mb-10 max-w-sm uppercase">
                      Your bridge transfer has been successfully initiated. Funds will arrive on Gold Chain in 5-10 minutes.
                    </p>
                    <button 
                      onClick={() => setStep('input')}
                      className="px-10 py-4 bg-white text-black font-black text-sm rounded-2xl hover:bg-gold transition-all uppercase"
                    >
                      Bridge More
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Right: Info & Status */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border-white/5 bg-slate-950/40">
             <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-gold" />
                <h4 className="font-black text-xs uppercase tracking-widest text-gold">Bridge Security</h4>
             </div>
             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <ShieldCheck size={16} />
                   </div>
                   <p className="text-[10px] text-slate-500 leading-normal uppercase">
                     Funds are protected by multi-sig validation on the Gold Chain sequencer.
                   </p>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Timer size={16} />
                   </div>
                   <p className="text-[10px] text-slate-500 leading-normal uppercase">
                     Estimated time: 3 confirmations on source chain (~2-5 mins).
                   </p>
                </div>
             </div>
          </GlassCard>

          <GlassCard className="p-6 border-white/5 bg-slate-950/40">
             <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-6">Recent Bridge Transfers</h4>
             <div className="space-y-4">
                {[
                  { from: 'Polygon', to: 'Gold Chain', amt: '500 USDT', status: 'Completed' },
                  { from: 'BSC', to: 'Gold Chain', amt: '1,200 USDT', status: 'Processing' },
                  { from: 'Base', to: 'Gold Chain', amt: '250 USDT', status: 'Completed' }
                ].map((tx, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                     <div>
                        <div className="flex items-center gap-2 text-[9px] font-black">
                           <span>{tx.from}</span>
                           <ArrowRightLeft size={8} />
                           <span className="text-gold">{tx.to}</span>
                        </div>
                        <div className="text-[10px] font-black text-white mt-1">{tx.amt}</div>
                     </div>
                     <div className={`text-[8px] font-black px-2 py-1 rounded-full ${tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold animate-pulse'}`}>
                        {tx.status.toUpperCase()}
                     </div>
                  </div>
                ))}
             </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

