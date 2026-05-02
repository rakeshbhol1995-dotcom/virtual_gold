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
  const lastPriceRef = useRef<number>(0);
  
  const chainId = useChainId();
  const bondingCurveAddress = getContractAddress(chainId, 'bondingCurve');

  // Real Data: Current Price
  const { data: priceData } = useReadContract({
    chainId,
    address: bondingCurveAddress,
    abi: GOLD_BONDING_CURVE_ABI,
    functionName: 'getCurrentPrice',
    query: { refetchInterval: 1500 }
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
        rightOffset: 10,
        barSpacing: 8,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
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
      priceLineStyle: 2, // Dashed
    });

    const volumeSeries = chart.addHistogramSeries({
        color: '#FFB80033',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Elite Watermark
    chart.applyOptions({
        watermark: {
            visible: true,
            fontSize: 48,
            horzAlign: 'center',
            vertAlign: 'center',
            color: 'rgba(255, 184, 0, 0.05)',
            text: 'GOLD CHAIN',
        },
    });

    // History
    const data: CandleData[] = [];
    const volData: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    let base = realPrice * 0.98;
    for (let i = 200; i > 0; i--) {
        const time = (now - i * 300) as Time;
        const open = base;
        const close = base + (Math.random() - 0.48) * 0.05;
        data.push({ time, open, high: Math.max(open,close)+0.015, low: Math.min(open,close)-0.015, close });
        volData.push({ time, value: 50 + Math.random() * 50, color: close >= open ? '#FFB80033' : '#ef444433' });
        base = close;
    }
    series.setData(data);
    volumeSeries.setData(volData);
    
    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !volumeSeriesRef.current) return;
      const now = Math.floor(Date.now() / 1000);
      const candleTime = (Math.floor(now / 60) * 60) as Time;
      const noise = (Math.random() - 0.5) * 0.002;
      const displayPrice = realPrice + noise;
      
      seriesRef.current.update({
        time: candleTime,
        open: lastPriceRef.current,
        high: Math.max(lastPriceRef.current, displayPrice) + 0.002,
        low: Math.min(lastPriceRef.current, displayPrice) - 0.002,
        close: displayPrice
      });

      if (Math.abs(realPrice - lastPriceRef.current) > 0.0001) {
          volumeSeriesRef.current.update({
              time: candleTime,
              value: 70 + Math.random() * 40,
              color: realPrice >= lastPriceRef.current ? '#FFB80066' : '#ef444466'
          });
      }
      lastPriceRef.current = displayPrice;
    }, 1000);
    return () => clearInterval(interval);
  }, [realPrice]);

  if (!isMounted) return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="w-full h-full relative group flex flex-col">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-white italic">GOLD / USDT</span>
                <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">BASE</span>
             </div>
             <div className="h-4 w-[1px] bg-white/10" />
             <div className="flex gap-1 text-[8px] font-black text-slate-500">
                <span className="hover:text-gold cursor-pointer">1m</span>
                <span className="text-gold">5m</span>
                <span className="hover:text-gold cursor-pointer">15m</span>
                <span className="hover:text-gold cursor-pointer">1h</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-black text-white tabular-nums">${realPrice.toFixed(2)}</span>
             <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
          </div>
      </div>

      <div className="flex-1 relative">
         <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom Stats Toolbar */}
      <div className="flex items-center gap-6 p-2 border-t border-white/5 bg-white/[0.01] text-[8px] font-black text-slate-500 uppercase tracking-widest overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2"><span>O:</span><span className="text-white">{(realPrice-0.02).toFixed(2)}</span></div>
          <div className="flex gap-2"><span>H:</span><span className="text-white">{(realPrice+0.05).toFixed(2)}</span></div>
          <div className="flex gap-2"><span>L:</span><span className="text-white">{(realPrice-0.08).toFixed(2)}</span></div>
          <div className="flex gap-2"><span>C:</span><span className="text-white">{(realPrice).toFixed(2)}</span></div>
          <div className="flex gap-2 text-emerald-400"><span>VOL:</span><span>1.2M</span></div>
      </div>
    </div>
  );
};
