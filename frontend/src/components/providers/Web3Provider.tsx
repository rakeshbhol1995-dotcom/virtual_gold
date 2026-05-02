'use client';

import React, { ReactNode } from 'react';
import { createConfig, WagmiProvider, http, fallback } from 'wagmi';

import { metaMask, coinbaseWallet } from 'wagmi/connectors';
import { mainnet, bsc, polygon, base, baseSepolia, polygonAmoy } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';

// Define the Custom Gold Chain Network
export const goldChain = defineChain({
  id: 77777, 
  name: 'Gold Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Gold',
    symbol: 'GOLD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.virtualgold.org'],
    },
    public: {
      http: ['https://rpc.virtualgold.org'],
    },
  },
  blockExplorers: {
    default: { name: 'GoldScan', url: 'https://rpc.virtualgold.org' },
  },
} as const);

const config = createConfig({
  chains: [baseSepolia, base, mainnet, polygon, bsc, polygonAmoy, goldChain],
  connectors: [
    metaMask({
      dappMetadata: { name: 'Gold Chain' },
    }),
  ],
  transports: {
    [baseSepolia.id]: fallback([
      http('https://base-sepolia-rpc.publicnode.com'),
      http('https://sepolia.base.org'),
      http('https://base-sepolia.blockpi.network/v1/rpc/public')
    ]),
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [polygonAmoy.id]: http('https://polygon-amoy-bor-rpc.publicnode.com'),
    [goldChain.id]: http('https://rpc.virtualgold.org'),
  },
});



const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
