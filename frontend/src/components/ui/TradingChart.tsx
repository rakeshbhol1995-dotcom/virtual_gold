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

    // Remove existing script if any
    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = 'tradingview-widget-script';
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
      "hide_top_toolbar": false,
      "save_image": false,
      "container_id": "tradingview_gold_chart"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [isMounted]);

  if (!isMounted) return <div className="h-[500px] w-full animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className="w-full h-[500px] bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5 relative group">
      <div id="tradingview_gold_chart" ref={container} className="w-full h-full" />
      
      {/* Premium Overlay Branding */}
      <div className="absolute bottom-12 right-4 z-10 pointer-events-none">
         <div className="bg-gold/10 backdrop-blur-md border border-gold/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-black text-gold tracking-widest uppercase">Live Gold Market</span>
         </div>
      </div>
    </div>
  );
};
