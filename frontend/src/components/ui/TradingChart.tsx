import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface TradingChartProps {
    currentPrice: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ currentPrice }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // Initial dummy data to make the chart look alive right away.
    // In a real app, this would be fetched from an indexer.
    const [historicalData, setHistoricalData] = useState<any[]>([
        { time: (Math.floor(Date.now() / 1000) - 86400 * 5) as any, open: 10.0, high: 10.1, low: 9.9, close: 10.05 },
        { time: (Math.floor(Date.now() / 1000) - 86400 * 4) as any, open: 10.05, high: 10.2, low: 10.0, close: 10.15 },
        { time: (Math.floor(Date.now() / 1000) - 86400 * 3) as any, open: 10.15, high: 10.15, low: 10.05, close: 10.1 },
        { time: (Math.floor(Date.now() / 1000) - 86400 * 2) as any, open: 10.1, high: 10.3, low: 10.1, close: 10.25 },
        { time: (Math.floor(Date.now() / 1000) - 86400 * 1) as any, open: 10.25, high: 10.4, low: 10.2, close: 10.35 },
    ]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#64748b', // slate-500
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            }
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e', // green-500
            downColor: '#ef4444', // red-500
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        candlestickSeries.setData(historicalData);

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update real-time price
    useEffect(() => {
        if (!seriesRef.current || currentPrice === 0) return;

        const latestTime = Math.floor(Date.now() / 1000);
        const lastCandle = historicalData[historicalData.length - 1];

        // Ensure currentPrice isn't totally disconnected if we restart
        let open = lastCandle ? lastCandle.close : currentPrice;
        
        seriesRef.current.update({
            time: latestTime as any,
            open: open,
            high: Math.max(open, currentPrice),
            low: Math.min(open, currentPrice),
            close: currentPrice,
        });

    }, [currentPrice]);

    return (
        <div className="w-full relative">
            <div 
                ref={chartContainerRef} 
                className="w-full rounded-xl overflow-hidden"
            />
            <div className="absolute top-2 left-2 z-10 flex gap-2">
                <span className="bg-slate-900/80 px-2 py-1 rounded text-[10px] font-black text-slate-300 uppercase border border-white/10">1D</span>
                <span className="bg-gold/10 px-2 py-1 rounded text-[10px] font-black text-gold uppercase border border-gold/20">LIVE</span>
            </div>
        </div>
    );
};
