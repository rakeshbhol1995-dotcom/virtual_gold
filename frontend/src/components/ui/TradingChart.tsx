'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';

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
  const dataRef = useRef<CandleData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !chartContainerRef.current) return;

    const el = chartContainerRef.current;

    // Generate 60 days of realistic gold price data starting around $2300
    const generateData = (): CandleData[] => {
      const data: CandleData[] = [];
      const now = Math.floor(Date.now() / 1000);
      let price = 2300;
      for (let i = 59; i >= 0; i--) {
        const time = (now - i * 86400) as Time;
        const open = price;
        const change = (Math.random() - 0.46) * 18;
        const close = Math.max(2100, open + change);
        const high = Math.max(open, close) + Math.random() * 8;
        const low = Math.min(open, close) - Math.random() * 8;
        data.push({ time, open, high, low, close });
        price = close;
      }
      return data;
    };

    const data = generateData();
    dataRef.current = data;

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
        secondsVisible: false,
        borderColor: 'rgba(255,255,255,0.05)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
      },
      crosshair: {
        vertLine: { color: 'rgba(255,184,0,0.3)', labelBackgroundColor: '#FFB800' },
        horzLine: { color: 'rgba(255,184,0,0.3)', labelBackgroundColor: '#FFB800' },
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#FFB800',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#FFB800',
      wickDownColor: '#ef4444',
    });

    series.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize handler
    const handleResize = () => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    };
    window.addEventListener('resize', handleResize);

    // Live price simulation every 3 seconds
    const interval = setInterval(() => {
      if (!seriesRef.current) return;
      const last = dataRef.current[dataRef.current.length - 1];
      const now = Math.floor(Date.now() / 1000) as Time;
      const change = (Math.random() - 0.45) * 6;
      const newClose = Math.max(2100, last.close + change);
      const newCandle: CandleData = {
        time: now,
        open: last.close,
        high: Math.max(last.close, newClose) + Math.random() * 3,
        low: Math.min(last.close, newClose) - Math.random() * 3,
        close: newClose,
      };
      seriesRef.current.update(newCandle);
      dataRef.current[dataRef.current.length - 1] = newCandle;
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isMounted]);

  if (!isMounted) {
    return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;
  }

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[9px] font-black text-gold tracking-widest uppercase">Live Pulse</span>
      </div>
    </div>
  );
};
