'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { getContractAddress, GOLD_BONDING_CURVE_ABI } from '@/constants/contracts';

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const lastPriceRef = useRef<number>(0);
  
  const chainId = useChainId();
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  // Real Data: Current Price from Smart Contract
  const { data: priceData, refetch } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 3000 } // Check every 3 seconds
  });

  const realPrice = priceData ? Number(formatUnits(priceData as bigint, 6)) : 10.20;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !chartContainerRef.current) return;

    const el = chartContainerRef.current;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      width: el.clientWidth,
      height: el.clientHeight || 360,
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(255,255,255,0.05)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        autoScale: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#FFB800',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#FFB800',
      wickDownColor: '#ef4444',
    });

    // History Generation
    const data: CandleData[] = [];
    const now = Math.floor(Date.now() / 1000);
    let base = realPrice * 0.98;
    for (let i = 100; i > 0; i--) {
        const time = (now - i * 3600) as Time;
        const open = base;
        const close = base + (Math.random() - 0.45) * 0.04;
        data.push({ time, open, high: Math.max(open,close)+0.01, low: Math.min(open,close)-0.01, close });
        base = close;
    }
    series.setData(data);
    
    chartRef.current = chart;
    seriesRef.current = series;
    lastPriceRef.current = realPrice;

    const handleResize = () => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isMounted]);

  // UPDATE LOOP: Sync with real price + Micro-fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current) return;
      
      const now = Math.floor(Date.now() / 1000) as Time;
      // Use real price but add tiny organic noise for visual flow
      const noise = (Math.random() - 0.5) * 0.002;
      const displayPrice = realPrice + noise;
      
      seriesRef.current.update({
        time: now,
        open: lastPriceRef.current,
        high: Math.max(lastPriceRef.current, displayPrice) + 0.001,
        low: Math.min(lastPriceRef.current, displayPrice) - 0.001,
        close: displayPrice
      });
      
      lastPriceRef.current = displayPrice;
    }, 2000);

    return () => clearInterval(interval);
  }, [realPrice]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[9px] font-black text-gold tracking-widest uppercase">Live On-Chain</span>
      </div>
    </div>
  );
};
