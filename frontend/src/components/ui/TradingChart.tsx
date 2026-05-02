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
  
  const currentCandleRef = useRef<CandleData | null>(null);
  const chainId = useChainId();
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  const { data: priceData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 1500 }
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
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.01)' },
        horzLines: { color: 'rgba(255,255,255,0.01)' },
      },
      width: el.clientWidth,
      height: el.clientHeight || 360,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255,255,255,0.05)',
        rightOffset: 15,
        barSpacing: 12,
        shiftVisibleRangeOnNewBar: true, // AUTO-SCROLL TO RIGHT
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      crosshair: {
          vertLine: { color: 'rgba(251, 191, 36, 0.2)', width: 1, style: 2, labelBackgroundColor: '#fbbf24' },
          horzLine: { color: 'rgba(251, 191, 36, 0.2)', width: 1, style: 2, labelBackgroundColor: '#fbbf24' },
      }
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
        color: '#FFB80022',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Elite Watermark
    chart.applyOptions({
        watermark: {
            visible: true,
            fontSize: 32,
            horzAlign: 'center',
            vertAlign: 'center',
            color: 'rgba(255, 184, 0, 0.04)',
            text: 'GOLD CHAIN ELITE v2',
        },
    });

    // History Generation
    const history: CandleData[] = [];
    const volHistory: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    const bucketSize = 60; 
    let base = realPrice;
    
    for (let i = 120; i > 0; i--) {
        const time = (Math.floor((now - i * bucketSize) / bucketSize) * bucketSize) as Time;
        const open = base;
        const change = (Math.random() - 0.48) * 0.03;
        const close = open + change;
        history.push({ time, open, high: Math.max(open, close) + 0.01, low: Math.min(open, close) - 0.01, close });
        volHistory.push({ time, value: 30 + Math.random() * 50, color: close >= open ? '#FFB80011' : '#ef444411' });
        base = close;
    }

    series.setData(history);
    volumeSeries.setData(volHistory);
    
    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;
    
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

  // Real-Time Heartbeat Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !currentCandleRef.current || !chartRef.current) return;
      
      const now = Math.floor(Date.now() / 1000);
      const bucketTime = (Math.floor(now / 60) * 60) as Time;
      
      // Handle New Candle Bucket
      if (bucketTime !== currentCandleRef.current.time) {
          // Transition: Previous close becomes current open
          currentCandleRef.current = {
              time: bucketTime,
              open: currentCandleRef.current.close,
              high: currentCandleRef.current.close,
              low: currentCandleRef.current.close,
              close: currentCandleRef.current.close
          };
          // Force scroll to newest candle
          chartRef.current.timeScale().scrollToRealTime();
      }

      // Simulation: Organic Price Flicker
      const volatility = 0.004;
      const noise = (Math.random() - 0.5) * volatility;
      const displayPrice = realPrice + noise;
      
      const updatedCandle = {
          ...currentCandleRef.current,
          high: Math.max(currentCandleRef.current.high, displayPrice),
          low: Math.min(currentCandleRef.current.low, displayPrice),
          close: displayPrice
      };
      
      currentCandleRef.current = updatedCandle;
      seriesRef.current.update(updatedCandle);

      // Volume Flicker
      if (volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
              time: bucketTime,
              value: 10 + Math.random() * 40,
              color: displayPrice >= updatedCandle.open ? '#FFB80033' : '#ef444433'
          });
      }

    }, 1000); 
    return () => clearInterval(interval);
  }, [realPrice]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative group flex flex-col bg-slate-950/20">
      {/* Chart Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-5">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_#fbbf24]" />
                <span className="text-[11px] font-black text-white italic tracking-tighter">GOLD / USDT</span>
                <span className="text-[7px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded tracking-widest border border-emerald-400/20 uppercase">SECURE FEED</span>
             </div>
             <div className="flex gap-2.5 text-[9px] font-black text-slate-500">
                <span className="text-gold border-b border-gold">1m</span>
                <span className="hover:text-white cursor-pointer transition-colors">5m</span>
                <span className="hover:text-white cursor-pointer transition-colors">15m</span>
                <span className="hover:text-white cursor-pointer transition-colors">1h</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                   <span className="text-[12px] font-black text-white tabular-nums">${realPrice.toFixed(2)}</span>
                   <span className="text-[8px] font-black text-emerald-500">+0.84%</span>
                </div>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Real-Time Sync</span>
             </div>
          </div>
      </div>

      <div className="flex-1 relative">
         <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* OHLC Interactive Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.01] text-[9px] font-black uppercase tracking-widest">
          <div className="flex gap-6">
            <div className="flex gap-1.5">O <span className="text-white">{currentCandleRef.current?.open.toFixed(2)}</span></div>
            <div className="flex gap-1.5">H <span className="text-white">{currentCandleRef.current?.high.toFixed(2)}</span></div>
            <div className="flex gap-1.5">L <span className="text-white">{currentCandleRef.current?.low.toFixed(2)}</span></div>
            <div className="flex gap-1.5">C <span className="text-white">{realPrice.toFixed(2)}</span></div>
          </div>
          <div className="text-slate-500 flex items-center gap-2">
             <span>{new Date().toLocaleTimeString()}</span>
             <div className="w-1 h-3 bg-gold/20 rounded-full" />
          </div>
      </div>
    </div>
  );
};
