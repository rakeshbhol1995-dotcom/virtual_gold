// c:\Users\BUNTY\Desktop\dexxxx\frontend\src\components\ui\TradingChart.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time, PriceLineSource } from 'lightweight-charts';
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
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Refs to track current candle state
  const currentCandleRef = useRef<CandleData | null>(null);
  const lastRealPriceRef = useRef<number>(10.10);
  
  const chainId = useChainId();
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  const { data: priceData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 2000 }
  });

  const realPrice = priceData ? Number(formatUnits(priceData as bigint, 6)) : 10.10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !chartContainerRef.current) return;

    const el = chartContainerRef.current;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.02)' },
        horzLines: { color: 'rgba(255,255,255,0.02)' },
      },
      width: el.clientWidth,
      height: el.clientHeight || 360,
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(255,255,255,0.05)',
        rightOffset: 12,
        barSpacing: 10,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#FFB800',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#FFB800',
      wickDownColor: '#ef4444',
      priceLineVisible: true,
      priceLineSource: PriceLineSource.LastVisible,
      priceLineWidth: 1,
      priceLineStyle: 2,
    });

    const volumeSeries = chart.addHistogramSeries({
        color: '#FFB80033',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.applyOptions({
        watermark: {
            visible: true,
            fontSize: 40,
            horzAlign: 'center',
            vertAlign: 'center',
            color: 'rgba(255, 184, 0, 0.03)',
            text: 'GOLD CHAIN ELITE',
        },
    });

    // Generate historical candles
    const history: CandleData[] = [];
    const volHistory: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    const bucketSize = 60; // 1 min
    let base = realPrice;
    
    for (let i = 100; i > 0; i--) {
        const time = (Math.floor((now - i * bucketSize) / bucketSize) * bucketSize) as Time;
        const open = base;
        const change = (Math.random() - 0.45) * 0.04;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.02;
        const low = Math.min(open, close) - Math.random() * 0.02;
        
        history.push({ time, open, high, low, close });
        volHistory.push({ time, value: 50 + Math.random() * 100, color: close >= open ? '#FFB80022' : '#ef444422' });
        base = close;
    }

    series.setData(history);
    volumeSeries.setData(volHistory);
    
    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;
    
    // Initialize current candle with the last history point
    const last = history[history.length - 1];
    currentCandleRef.current = { ...last, time: (Math.floor(now / 60) * 60) as Time };

    const handleResize = () => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isMounted]);

  // High Frequency Price Flicker & Candle Formation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !currentCandleRef.current) return;
      
      const now = Math.floor(Date.now() / 1000);
      const bucketTime = (Math.floor(now / 60) * 60) as Time;
      
      // If a new minute starts, create a new candle bucket
      if (bucketTime !== currentCandleRef.current.time) {
          currentCandleRef.current = {
              time: bucketTime,
              open: currentCandleRef.current.close,
              high: currentCandleRef.current.close,
              low: currentCandleRef.current.close,
              close: currentCandleRef.current.close
          };
      }

      // Add visual flicker (noise) to make it look alive
      const flicker = (Math.random() - 0.5) * 0.005;
      const displayPrice = realPrice + flicker;
      
      const updatedCandle = {
          ...currentCandleRef.current,
          high: Math.max(currentCandleRef.current.high, displayPrice),
          low: Math.min(currentCandleRef.current.low, displayPrice),
          close: displayPrice
      };
      
      currentCandleRef.current = updatedCandle;
      seriesRef.current.update(updatedCandle);

      // Random volume spikes
      if (volumeSeriesRef.current && Math.random() > 0.7) {
          volumeSeriesRef.current.update({
              time: bucketTime,
              value: 20 + Math.random() * 80,
              color: displayPrice >= updatedCandle.open ? '#FFB80044' : '#ef444444'
          });
      }

    }, 800); // Fast updates for flicker effect
    return () => clearInterval(interval);
  }, [realPrice]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative group flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[13px] font-black text-white italic tracking-tighter">GOLD / USDT</span>
                <span className="text-[7px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded tracking-widest uppercase">LIVE</span>
             </div>
             <div className="flex gap-2 text-[9px] font-black text-slate-500">
                <span className="text-gold">1m</span>
                <span className="hover:text-white cursor-pointer">5m</span>
                <span className="hover:text-white cursor-pointer">15m</span>
                <span className="hover:text-white cursor-pointer">1h</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-white tabular-nums">${realPrice.toFixed(2)}</span>
                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">+0.42%</span>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
      </div>

      <div className="flex-1 relative min-h-[300px]">
         <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center gap-6 p-3 border-t border-white/5 bg-white/[0.01] text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <div className="flex gap-1.5"><span>O:</span><span className="text-white">{currentCandleRef.current?.open.toFixed(2)}</span></div>
          <div className="flex gap-1.5"><span>H:</span><span className="text-white">{currentCandleRef.current?.high.toFixed(2)}</span></div>
          <div className="flex gap-1.5"><span>L:</span><span className="text-white">{currentCandleRef.current?.low.toFixed(2)}</span></div>
          <div className="flex gap-1.5"><span>C:</span><span className="text-white">{realPrice.toFixed(2)}</span></div>
          <div className="flex gap-1.5 text-emerald-400"><span>VOL:</span><span>2.8M</span></div>
      </div>
    </div>
  );
};
