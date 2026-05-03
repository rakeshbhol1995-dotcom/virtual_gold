// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\views\MinerView.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Zap, Database, TrendingUp, Clock, AlertCircle, Sparkles, Cpu, Shovel, HardHat, Shield, Activity } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';
import { formatUnits, parseAbi } from 'viem';
import { useMounted } from '@/hooks/useMounted';

// 💎 3D GOLD CRYSTAL COMPONENT 💎
const GoldCrystal = ({ isMining }: { isMining: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.4;
      meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
      meshRef.current.position.y = Math.sin(t) * 0.1;
      
      if (isMining) {
        meshRef.current.scale.setScalar(1 + Math.sin(t * 20) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2, 0]} />
        <MeshDistortMaterial
          color="#FFD700"
          speed={isMining ? 10 : 2}
          distort={isMining ? 0.6 : 0.2}
          radius={1}
          metalness={1}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={isMining ? 2 : 0.5}
        />
      </mesh>
    </Float>
  );
};

export const MinerView = () => {
  const { address, isConnected } = useAccount();
  const mounted = useMounted();
  const bondingCurveAddress = getContractAddress(84532, 'bondingCurve');
  const [isMining, setIsMining] = useState(false);

  const { data: miningPool } = useReadContract({
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'miningPool',
    query: { refetchInterval: 5000 }
  });

  const { data: lastClaimedTime } = useReadContract({
    address: bondingCurveAddress as `0x${string}`,
    abi: parseAbi(GOLD_BONDING_CURVE_ABI),
    functionName: 'lastClaimed',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [canMine, setCanMine] = useState(true);

  useEffect(() => {
    if (!lastClaimedTime) {
        setCanMine(true);
        return;
    }
    const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const nextClaim = Number(lastClaimedTime) + (1 * 60 * 60);
        const diff = nextClaim - now;
        if (diff <= 0) {
            setCanMine(true);
            setTimeLeft('');
            clearInterval(interval);
        } else {
            setCanMine(false);
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            setTimeLeft(`${m}m ${s}s`);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastClaimedTime]);

  const handleMine = () => {
    if (!isConnected || !canMine) return;
    setIsMining(true);
    writeContract({
      address: bondingCurveAddress as `0x${string}`,
      abi: parseAbi(GOLD_BONDING_CURVE_ABI),
      functionName: 'claimMiningReward',
    });
  };

  useEffect(() => {
    if (isSuccess) {
        setIsMining(false);
        setCanMine(false);
    }
  }, [isSuccess]);

  if (!mounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4 min-h-screen relative overflow-hidden">
      
      {/* 🌌 CINEMATIC STARFIELD 🌌 */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
          {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity }}
                className="absolute w-0.5 h-0.5 bg-gold rounded-full"
                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              />
          ))}
      </div>

      {/* 📟 HUD TOP OVERLAY 📟 */}
      <div className="relative z-10 flex flex-col items-center mb-10 md:mb-20">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 mb-4 md:mb-6"
          >
              <div className="h-[1px] w-8 md:w-12 bg-gold/30" />
              <Shield size={14} className="text-gold opacity-50" />
              <span className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-[0.4em]">Extraction Node Alpha-1</span>
              <Shield size={14} className="text-gold opacity-50" />
              <div className="h-[1px] w-8 md:w-12 bg-gold/30" />
          </motion.div>
          
          <h2 className="text-5xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-[0_0_80px_rgba(255,215,0,0.2)]">
            GOLD <span className="text-gold">RIG</span>
          </h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 relative z-10 items-start">
        
        {/* 📊 SENSOR DATA 📊 */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <GlassCard className="p-6 md:p-8 border-gold/20 bg-black/40 backdrop-blur-3xl group">
                <div className="flex items-center justify-between mb-4">
                    <Database className="w-5 h-5 text-gold animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">Live Pool</span>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tighter">${miningPool ? formatUnits(miningPool as bigint, 6) : '0.00'}</div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <motion.div 
                        animate={{ width: ['20%', '60%', '40%'] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="h-full bg-gold shadow-[0_0_10px_gold]" 
                    />
                </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { icon: <Activity size={14} />, label: 'Temp', val: '42°C' },
                    { icon: <Cpu size={14} />, label: 'Load', val: '88%' },
                    { icon: <TrendingUp size={14} />, label: 'Hash', val: '2.4T' },
                    { icon: <Shield size={14} />, label: 'Sync', val: '100%' },
                ].map((item, i) => (
                    <GlassCard key={i} className="p-4 border-white/5 bg-white/[0.02] flex flex-col gap-2">
                        <div className="text-gold opacity-40">{item.icon}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase">{item.label}</div>
                        <div className="text-[10px] md:text-xs font-black text-white tracking-widest">{item.val}</div>
                    </GlassCard>
                ))}
            </div>
        </div>

        {/* 🔮 THE CORE CRYSTAL 🔮 */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[400px] md:min-h-[600px] order-1 lg:order-2">
            {/* Containment Field Rings */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                    className="absolute border border-gold/10 rounded-full"
                    style={{ 
                        width: (mounted && typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : 400) + i * 80, 
                        height: (mounted && typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : 400) + i * 80,
                        opacity: 0.3 - i * 0.1
                    }}
                />
            ))}

            <div className="w-full h-[350px] md:h-[500px] cursor-grab active:cursor-grabbing relative group">
                {/* Scanner Beams */}
                <motion.div 
                    animate={{ x: (mounted && typeof window !== 'undefined' && window.innerWidth < 768 ? [-120, 120] : [-200, 200]) }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gold/20 shadow-[0_0_20px_gold] z-20 pointer-events-none"
                />

                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, (mounted && typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 6)]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="#FFD700" />
                    <spotLight position={[-10, -10, -10]} intensity={1} color="#FFF" />
                    
                    <GoldCrystal isMining={isMining || isConfirming} />
                </Canvas>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8">
                <motion.button
                    whileHover={canMine ? { scale: 1.05, boxShadow: '0 0 60px rgba(255,215,0,0.5)' } : {}}
                    whileTap={canMine ? { scale: 0.95 } : {}}
                    disabled={isMining || isConfirming || !canMine}
                    onClick={handleMine}
                    className={`relative px-12 md:px-20 py-5 md:py-6 rounded-2xl font-black uppercase text-[10px] md:text-sm tracking-[0.4em] transition-all duration-500 overflow-hidden ${
                        canMine 
                        ? 'bg-gold text-black shadow-[0_20px_50px_rgba(255,215,0,0.3)]' 
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={canMine ? 'mine' : 'wait'}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                        >
                            {isConfirming ? 'EXTRACTING...' : !canMine ? 'COOLING DOWN' : 'INITIATE EXTRACTION'}
                        </motion.span>
                    </AnimatePresence>
                    {/* Progress Bar inside button */}
                    {!canMine && (
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            transition={{ duration: 3600, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-gold shadow-[0_0_10px_gold]"
                        />
                    )}
                </motion.button>
                
                {!canMine && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                            <Clock className="text-gold animate-pulse" size={16} />
                            <span className="text-3xl font-black text-white font-mono tracking-tighter">{timeLeft}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Next Extraction Available</span>
                    </div>
                )}
            </div>
        </div>

        {/* 📟 LOG INTERFACE 📟 */}
        <div className="lg:col-span-3">
            <GlassCard className="p-8 border-white/10 bg-black/60 h-[500px] flex flex-col">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                    <Activity size={14} /> System Logs
                </h3>
                <div className="flex-1 overflow-y-auto space-y-6 font-mono text-[9px] custom-scrollbar opacity-60">
                    <div className="text-emerald-400">&gt; Kernel initialized...</div>
                    <div className="text-emerald-400">&gt; Connected to Base Node...</div>
                    <div className="text-white">&gt; Protocol: GoldChain v4.0.2</div>
                    <div className="text-white">&gt; Scanner: ACTIVE</div>
                    <div className="text-gold animate-pulse">&gt; Ready for input...</div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="text-slate-500">&gt; Block #{8453200 + i} verified...</div>
                    ))}
                    {isMining && <div className="text-gold font-bold">&gt; WARNING: Extraction ongoing...</div>}
                    {!canMine && <div className="text-rose-400">&gt; COOLDOWN: Reactor stabilizing...</div>}
                </div>
            </GlassCard>
        </div>
      </div>

      <div className="mt-20 flex justify-center">
          <div className="px-12 py-8 bg-gold/5 border border-gold/10 rounded-[3rem] backdrop-blur-xl flex flex-col items-center gap-4">
              <Sparkles className="text-gold" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] text-center leading-relaxed">
                  Deep Space Extraction Protocol <br/> No Hardware Required • Verified on Base L2
              </p>
          </div>
      </div>
    </div>
  );
};
