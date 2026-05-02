'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect, useAccount } from 'wagmi';
import { GlassCard } from './GlassCard';
import { X, Wallet } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { connect, connectors, error, isPending: connectPending } = useConnect();
  const { isConnected } = useAccount();
  const [isBypassing, setIsBypassing] = React.useState(false);
  const [hasClash, setHasClash] = React.useState(false);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const providers = (window as any).ethereum?.providers || [];
      if (providers.length > 1 || ((window as any).ethereum && (window as any).phantom)) {
        setHasClash(true);
      }
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isConnected && isOpen) {
      onClose();
    }
  }, [isConnected, isOpen, onClose]);

  const handleConnect = async (connector: any) => {
    setIsBypassing(true);
    try {
      connect({ connector });
    } catch (err: any) {
      console.error("Connection error:", err);
      setIsBypassing(false);
    }
  };

  // Filter unique connectors by name to avoid duplicates during clashing
  const uniqueConnectors = connectors.filter((c, index, self) => 
    index === self.findIndex((t) => t.name === c.name)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="border-white/10 overflow-hidden" variant="gold">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Connect Wallet</h2>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isBypassing && !isConnected && !error && (
                  <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                      Bypassing Clashing Extensions...
                    </span>
                  </div>
                )}

                {hasClash && !isConnected && !error && !isBypassing && (
                  <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
                      Warning: Multiple Wallets Detected
                    </span>
                  </div>
                )}


                <div className="space-y-4">
                  {connectors.map((connector) => (
                    <motion.button
                      key={connector.id}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      disabled={connectPending}
                      onClick={() => handleConnect(connector)}
                      className={`w-full p-4 flex items-center justify-between bg-white/5 border border-white/5 hover:border-gold/30 rounded-2xl transition-all group ${connectPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 group-hover:border-gold/20 overflow-hidden p-2">
                          {connector.icon ? (
                            <img src={connector.icon} alt={connector.name} className="w-full h-full object-contain" />
                          ) : connector.name?.toLowerCase().includes('metamask') ? (
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MetaMask" className="w-6 h-6" />
                          ) : connector.name?.toLowerCase().includes('coinbase') ? (
                            <img src="https://raw.githubusercontent.com/dotansimha/crypto-logos/master/logos/coinbase.svg" alt="Coinbase" className="w-6 h-6" />
                          ) : (
                            <Wallet className="w-6 h-6 text-gold" />
                          )}
                        </div>
                        <span className="font-bold text-lg">{connector.name}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-gold/50 group-hover:bg-gold animate-pulse" />
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center"
                  >
                    <p className="mb-2">Error: {error.message || "Connection failed. Please check clashing extensions."}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-white border border-red-500/30 uppercase tracking-tighter"
                    >
                      Hard Refresh Page
                    </button>
                  </motion.div>
                )}

                <p className="mt-8 text-center text-[10px] text-slate-500 font-medium leading-relaxed">
                  By connecting your wallet, you agree to our Terms of Service and Privacy Policy. 
                  Institutional grade security provided by the Gold Chain Network.
                </p>

              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
