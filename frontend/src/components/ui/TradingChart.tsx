'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface TradingChartProps {
    currentPrice?: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ currentPrice = 2342.10 }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 350,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(255, 255, 255, 0.05)',
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                scaleMargins: {
                    top: 0.3,
                    bottom: 0.25,
                },
            }
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#FFB800',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#FFB800',
            wickDownColor: '#ef4444',
        });

        // Generate base historical data
        let baseTime = Math.floor(Date.now() / 1000) - (86400 * 30);
        let data = [];
        let prevPrice = currentPrice - 50;

        for (let i = 0; i < 60; i++) {
            let open = prevPrice;
            let close = open + (Math.random() - 0.5) * 20;
            data.push({
                time: (baseTime + (i * 3600)) as any,
                open: open,
                high: Math.max(open, close) + Math.random() * 5,
                low: Math.min(open, close) - Math.random() * 5,
                close: close
            });
            prevPrice = close;
        }

        candlestickSeries.setData(data);
        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        window.addEventListener('resize', handleResize);

        // Real-time Simulation Interval
        const interval = setInterval(() => {
           if (seriesRef.current) {
              const lastTime = Math.floor(Date.now() / 1000);
              const lastClose = data[data.length - 1].close;
              const newPrice = lastClose + (Math.random() - 0.45) * 5; // Slight upward bias
              
              seriesRef.current.update({
                 time: lastTime as any,
                 open: lastClose,
                 high: Math.max(lastClose, newPrice) + 2,
                 low: Math.min(lastClose, newPrice) - 2,
                 close: newPrice
              });
           }
        }, 3000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
            chart.remove();
        };
    }, [isMounted]);

    if (!isMounted) return <div className="h-[350px] w-full animate-pulse bg-white/5 rounded-2xl" />;

    return (
        <div className="w-full relative group">
            <div 
                ref={chartContainerRef} 
                className="w-full rounded-2xl overflow-hidden"
            />
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black text-gold tracking-widest uppercase">Live Pulse</span>
            </div>
        </div>
    );
};
