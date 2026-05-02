'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendingUp, Lock, Coins, Info, XCircle } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { 
  getContractAddress,
  GOLD_STAKING_ABI,
  ERC20_ABI
} from '@/constants/contracts';
import { ActivityScanner, useTransactionScanner } from '@/components/ui/ActivityScanner';

export const StakingView = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const { addTransaction, updateTransactionStatus } = useTransactionScanner();

  const stakingAddress = getContractAddress(chainId, 'staking');

  // 1. Fetch Protocol Stats
  const { data: totalStaked } = useReadContract({
    address: stakingAddress,
    abi: GOLD_STAKING_ABI,
    functionName: 'totalSupply',
  });

  // 2. Fetch User Stats
  const { data: userStaked } = useReadContract({
    address: stakingAddress,
    abi: GOLD_STAKING_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: userEarned, refetch: refetchEarned } = useReadContract({
    address: stakingAddress,
    abi: GOLD_STAKING_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const goldTokenAddress = getContractAddress(chainId, 'goldToken');
  
  const { data: goldBalance } = useReadContract({
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: allowance } = useReadContract({
    address: goldTokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, stakingAddress] : undefined,
    query: { enabled: !!address, refetchInterval: 1000 }
  });

  const { data: userLastStakeTime } = useReadContract({
    address: stakingAddress,
    abi: GOLD_STAKING_ABI,
    functionName: 'userLastStakeTime',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  // 3. Transactions
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash) {
      addTransaction({
        hash,
        type: 'Stake',
        status: 'pending',
        amount: stakeAmount,
        symbol: 'GOLD'
      });
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash) {
      updateTransactionStatus(hash, 'success');
    }
    if (isTxError && hash) {
      updateTransactionStatus(hash, 'error');
    }
  }, [isSuccess, isTxError]);

  const handleApprove = () => {
    if (!stakeAmount || !isConnected) return;
    writeContract({
      address: goldTokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [stakingAddress, parseUnits(stakeAmount, 18)],
    });
  };

  const handleStake = () => {
    if (!stakeAmount || !isConnected) return;
    writeContract({
      address: stakingAddress,
      abi: GOLD_STAKING_ABI,
      functionName: 'stake',
      args: [parseUnits(stakeAmount, 18)],
    });
  };

  const handleUnstake = () => {
    if (!unstakeAmount || !isConnected) return;
    writeContract({
      address: stakingAddress,
      abi: GOLD_STAKING_ABI,
      functionName: 'withdraw',
      args: [parseUnits(unstakeAmount, 18)],
    });
  };

  const handleClaim = () => {
    if (!isConnected) return;
    writeContract({
      address: stakingAddress,
      abi: GOLD_STAKING_ABI,
      functionName: 'getReward',
    });
  };

  const needsApproval = allowance !== undefined && stakeAmount && parseUnits(stakeAmount, 18) > (allowance as bigint);
  const hasSufficientBalance = goldBalance !== undefined && stakeAmount && parseUnits(stakeAmount, 18) <= (goldBalance as bigint);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message.includes('User rejected') 
        ? 'Transaction cancelled by user.' 
        : `Transaction Error: ${writeError.message.slice(0, 150)}...`);
    }
    if (isTxError) {
      setErrorMessage('On-chain execution failed. Please check if you have enough GOLD and Gas.');
    }
    if (isSuccess) {
      setErrorMessage(null);
    }
  }, [writeError, isTxError, isSuccess]);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0"
    >
      <GlassCard className="md:col-span-2 border-white/10 mast-card" variant="gold">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 md:p-4 bg-gold/10 rounded-xl md:rounded-2xl">
              <Lock className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">GOLD STAKING</h2>
              <p className="text-slate-500 text-[10px] md:text-sm font-bold">Lock GOLD to earn protocol rewards</p>
            </div>
          </div>
          <div className="flex gap-8 md:gap-10">
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current APR</p>
              <p className="text-2xl md:text-3xl font-black text-green-400">12.5%</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Staked</p>
              <p className="text-2xl md:text-3xl font-black">{totalStaked ? Number(formatUnits(totalStaked as bigint, 18)).toLocaleString() : '0'}</p>
            </div>
            <div className="text-center hidden md:block border-l border-white/5 pl-8">
              <p className="text-[8px] md:text-[10px] text-gold font-black uppercase tracking-widest mb-1">Yield Power</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl md:text-3xl font-black text-white">2.5x</p>
                <div className="bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20 text-gold text-[8px] font-black uppercase">Boosted</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-4"
        >
          <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Execution Failed</p>
            <p className="text-xs text-red-200/70 font-medium leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-[8px] font-black text-red-500 uppercase hover:underline"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      <GlassCard className="border-white/5 bg-white/[0.01] p-5 md:p-8">
        <h3 className="text-lg md:text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
          <Coins className="w-5 h-5 text-gold" /> Stake GOLD
        </h3>
        <div className="bg-slate-950/80 rounded-xl md:rounded-2xl p-5 md:p-6 border border-white/5 mb-6">
          <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-500 mb-4 uppercase">
            <span>Stake amount</span>
            <span>Unstaked: {goldBalance ? Number(formatUnits(goldBalance as bigint, 18)).toLocaleString() : '0.00'}</span>
          </div>
          <input 
            type="text" 
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.0" 
            disabled={isPending || isConfirming}
            className="bg-transparent border-none outline-none text-2xl md:text-3xl font-black w-full text-white placeholder:text-slate-900" 
          />
        </div>
        
        {needsApproval ? (
          <button 
            onClick={handleApprove}
            disabled={!isConnected || !stakeAmount || isPending || isConfirming || !hasSufficientBalance}
            className={`w-full py-4 text-black font-black rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all text-sm md:text-base ${(!isConnected || !stakeAmount || isPending || isConfirming || !hasSufficientBalance) ? 'opacity-50 grayscale cursor-not-allowed' : 'bg-gold hover:scale-[1.02]'}`}
          >
            {!hasSufficientBalance && stakeAmount ? 'INSUFFICIENT GOLD' : isPending ? 'WAITING...' : isConfirming ? 'APPROVING...' : isTxError ? 'APPROVE FAILED ❌' : 'APPROVE GOLD'}
          </button>
        ) : (
          <button 
            onClick={handleStake}
            disabled={!isConnected || !stakeAmount || isPending || isConfirming || !hasSufficientBalance}
            className={`w-full py-4 text-black font-black rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all text-sm md:text-base ${(!isConnected || !stakeAmount || isPending || isConfirming || !hasSufficientBalance) ? 'opacity-50 grayscale cursor-not-allowed' : 'bg-gold hover:scale-[1.02]'}`}
          >
            {!isConnected ? 'Connect Wallet' : !hasSufficientBalance && stakeAmount ? 'INSUFFICIENT GOLD' : isPending ? 'WAITING...' : isConfirming ? 'STAKING...' : isTxError ? 'STAKE FAILED ❌' : 'STAKE ASSETS'}
          </button>
        )}
      </GlassCard>

      <GlassCard className="border-white/5 bg-white/[0.01] p-5 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" /> Active Position
          </h3>
          {userStaked && Number(userStaked) > 0 && userLastStakeTime && (
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
               Date.now() / 1000 < Number(userLastStakeTime) + (15 * 24 * 60 * 60) 
                 ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                 : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}>
              {Date.now() / 1000 < Number(userLastStakeTime) + (15 * 24 * 60 * 60) 
                ? `Locked until ${new Date((Number(userLastStakeTime) + (15 * 24 * 60 * 60)) * 1000).toLocaleDateString()}` 
                : 'Unlocked - No Penalty'}
            </div>
          )}
        </div>
        
        <div className="bg-slate-950/80 rounded-xl md:rounded-2xl p-5 md:p-6 border border-white/5 mb-6">
          <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-500 mb-4 uppercase">
            <span>Your Staked Gold</span>
            <span>Total: {userStaked ? Number(formatUnits(userStaked as bigint, 18)).toLocaleString() : '0.00'}</span>
          </div>
          <input 
            type="text" 
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            placeholder="0.0" 
            disabled={isPending || isConfirming}
            className="bg-transparent border-none outline-none text-2xl md:text-3xl font-black w-full text-white placeholder:text-slate-900" 
          />
        </div>

        {userStaked && Number(userStaked) > 0 && userLastStakeTime && Date.now() / 1000 < Number(userLastStakeTime) + (15 * 24 * 60 * 60) && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
             <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Early Unstake Warning</p>
             <p className="text-[10px] text-orange-200/80 leading-relaxed font-medium">
               Unstaking before the 15-day lockup period ends will incur a <b>10% penalty fee</b> on your withdrawn amount. 
             </p>
          </div>
        )}

        <button 
          onClick={handleUnstake}
          disabled={!isConnected || !unstakeAmount || isPending || isConfirming || (userStaked && parseUnits(unstakeAmount, 18) > (userStaked as bigint))}
          className={`w-full py-4 glass border-white/20 font-black rounded-xl md:rounded-2xl text-sm md:text-base transition-all ${(!isConnected || !unstakeAmount || isPending || isConfirming || (userStaked && parseUnits(unstakeAmount, 18) > (userStaked as bigint))) ? 'opacity-50 grayscale cursor-not-allowed text-slate-400' : 'text-slate-100 hover:bg-white/5 cursor-pointer'}`}
        >
          {(userStaked && unstakeAmount && parseUnits(unstakeAmount, 18) > (userStaked as bigint)) ? 'INSUFFICIENT STAKE' : isConfirming ? 'UNSTAKING...' : 'UNSTAKE ASSETS'}
        </button>
      </GlassCard>

      <GlassCard className="border-white/5 bg-white/[0.01] p-5 md:p-8">
        <h3 className="text-lg md:text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" /> Rewards
        </h3>
        <div className="bg-slate-950/80 rounded-xl md:rounded-2xl p-5 md:p-6 border border-white/5 mb-6">
          <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-500 mb-4 uppercase">
            <span>Earned Rewards</span>
            <span className="text-gold font-bold">{userEarned && Number(formatUnits(userEarned as bigint, 18)) > 0 ? 'Claimable' : 'Accumulating...'}</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">
            {userEarned ? Number(formatUnits(userEarned as bigint, 18)).toFixed(4) : '0.000'} 
            <span className="text-gold text-xs md:text-sm ml-1">GOLD</span>
          </p>
        </div>
        <button 
          onClick={handleClaim}
          disabled={!isConnected || !userEarned || Number(userEarned) === 0 || isPending || isConfirming}
          className={`w-full py-4 glass border-white/20 font-black rounded-xl md:rounded-2xl text-sm md:text-base transition-all ${(!isConnected || !userEarned || Number(userEarned) === 0 || isPending || isConfirming) ? 'opacity-50 grayscale cursor-not-allowed text-slate-400' : 'text-slate-100 hover:bg-white/5 cursor-pointer'}`}
        >
          CLAIM REWARDS
        </button>

        {hash && (
           <div className="mt-4 p-3 bg-gold/5 border border-gold/10 rounded-xl">
             <p className="text-[8px] text-gold/40 font-black uppercase tracking-widest mb-2">Recent Broadcast</p>
             <button 
               onClick={() => window.dispatchEvent(new CustomEvent('view-tx', { detail: { hash } }))}
               className="text-[9px] text-white font-mono break-all hover:text-gold transition-colors block w-full text-left"
             >
               {hash}
             </button>
           </div>
        )}
        
        <div className="mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-start gap-4">
          <Info className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
          <p className="text-[9px] text-green-500/80 font-bold uppercase leading-relaxed">
            Staking rewards are distributed in real-time. The longer you stake, the higher your yield power grows.
          </p>
        </div>
      </GlassCard>


      {/* Activity Scanner */}
      <GlassCard className="md:col-span-2 border-white/5 bg-white/[0.01] p-5 md:p-8">
        <ActivityScanner />
      </GlassCard>
    </motion.div>
  );
};
