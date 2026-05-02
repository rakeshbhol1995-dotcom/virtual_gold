'use client';

import React, { useEffect, useRef, useState } from 'react';

export const TradingChart = () => {
  const container = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "OANDA:XAUUSD",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(2, 6, 23, 1)",
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "container_id": "tradingview_gold_chart"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [isMounted]);

  if (!isMounted) return <div className="h-[450px] w-full animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className="w-full h-[450px] bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5">
      <div id="tradingview_gold_chart" ref={container} className="w-full h-full" />
    </div>
  );
};
