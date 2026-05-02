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
  const chainId = useChainId();
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  // Real Data: Current Price
  const { data: priceData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 5000 }
  });

  const currentPrice = priceData ? Number(formatUnits(priceData as bigint, 6)) : 10;

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
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#FFB800',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#FFB800',
      wickDownColor: '#ef4444',
    });

    // Initial flat data based on real price
    const now = Math.floor(Date.now() / 1000);
    const initialData: CandleData[] = [];
    for (let i = 50; i >= 0; i--) {
        initialData.push({
            time: (now - i * 3600) as Time,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice
        });
    }
    series.setData(initialData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isMounted]);

  // Update chart when real price changes
  useEffect(() => {
    if (seriesRef.current && priceData) {
      const now = Math.floor(Date.now() / 1000) as Time;
      seriesRef.current.update({
        time: now,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice
      });
    }
  }, [currentPrice, priceData]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[9px] font-black text-gold tracking-widest uppercase">Live On-Chain</span>
      </div>
    </div>
  );
};
