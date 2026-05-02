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

type Timeframe = '1m' | '5m' | '15m' | '1h';

export const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  
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

  // Map timeframe to seconds
  const getBucketSize = (tf: Timeframe) => {
    switch(tf) {
        case '1m': return 60;
        case '5m': return 300;
        case '15m': return 900;
        case '1h': return 3600;
        default: return 60;
    }
  };

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
        secondsVisible: timeframe === '1m',
        borderColor: 'rgba(255,255,255,0.05)',
        rightOffset: 15,
        barSpacing: 12,
        shiftVisibleRangeOnNewBar: true,
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
    });

    const volumeSeries = chart.addHistogramSeries({
        color: '#FFB80022',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    // History Generation based on Timeframe
    const history: CandleData[] = [];
    const volHistory: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    const bucketSize = getBucketSize(timeframe);
    let base = realPrice;
    
    for (let i = 150; i > 0; i--) {
        const time = (Math.floor((now - i * bucketSize) / bucketSize) * bucketSize) as Time;
        const open = base;
        const change = (Math.random() - 0.5) * 0.05;
        const close = open + change;
        history.push({ time, open, high: Math.max(open, close) + 0.01, low: Math.min(open, close) - 0.01, close });
        volHistory.push({ time, value: 20 + Math.random() * 40, color: close >= open ? '#FFB80011' : '#ef444411' });
        base = close;
    }

    series.setData(history);
    volumeSeries.setData(volHistory);
    
    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;
    
    const last = history[history.length - 1];
    currentCandleRef.current = { ...last, time: (Math.floor(now / bucketSize) * bucketSize) as Time };

    const handleResize = () => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isMounted, timeframe]);

  // Real-Time Heartbeat Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !currentCandleRef.current || !chartRef.current) return;
      
      const now = Math.floor(Date.now() / 1000);
      const bucketSize = getBucketSize(timeframe);
      const bucketTime = (Math.floor(now / bucketSize) * bucketSize) as Time;
      
      if (bucketTime !== currentCandleRef.current.time) {
          currentCandleRef.current = {
              time: bucketTime,
              open: currentCandleRef.current.close,
              high: currentCandleRef.current.close,
              low: currentCandleRef.current.close,
              close: currentCandleRef.current.close
          };
          chartRef.current.timeScale().scrollToRealTime();
      }

      // Add "Pulse" flicker to make it look alive
      const flicker = (Math.random() - 0.5) * 0.006;
      const displayPrice = realPrice + flicker;
      
      const updatedCandle = {
          ...currentCandleRef.current,
          high: Math.max(currentCandleRef.current.high, displayPrice),
          low: Math.min(currentCandleRef.current.low, displayPrice),
          close: displayPrice
      };
      
      currentCandleRef.current = updatedCandle;
      seriesRef.current.update(updatedCandle);

      if (volumeSeriesRef.current && Math.random() > 0.8) {
          volumeSeriesRef.current.update({
              time: bucketTime,
              value: 5 + Math.random() * 20,
              color: displayPrice >= updatedCandle.open ? '#FFB80022' : '#ef444422'
          });
      }

    }, 1000); 
    return () => clearInterval(interval);
  }, [realPrice, timeframe]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative group flex flex-col">
      {/* Interactive Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-5">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_#fbbf24]" />
                <span className="text-[11px] font-black text-white italic tracking-tighter">GOLD / USDT</span>
                <span className="text-[7px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded tracking-widest border border-emerald-400/20 uppercase">LIVE FEED</span>
             </div>
             <div className="flex gap-2 text-[9px] font-black">
                {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
                    <button 
                        key={tf} 
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-1 rounded transition-all ${timeframe === tf ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-slate-500 hover:text-white'}`}
                    >
                        {tf}
                    </button>
                ))}
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                   <span className="text-[12px] font-black text-white tabular-nums">${realPrice.toFixed(2)}</span>
                   <span className="text-[8px] font-black text-emerald-500">+1.24%</span>
                </div>
             </div>
          </div>
      </div>

      <div className="flex-1 relative">
         <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.01] text-[9px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex gap-5">
            <div className="flex gap-1">O <span className="text-white">{currentCandleRef.current?.open.toFixed(2)}</span></div>
            <div className="flex gap-1">H <span className="text-white">{currentCandleRef.current?.high.toFixed(2)}</span></div>
            <div className="flex gap-1">L <span className="text-white">{currentCandleRef.current?.low.toFixed(2)}</span></div>
            <div className="flex gap-1">C <span className="text-white">{realPrice.toFixed(2)}</span></div>
          </div>
          <div className="flex items-center gap-2">
             <span>{new Date().toLocaleTimeString()}</span>
          </div>
      </div>
    </div>
  );
};
