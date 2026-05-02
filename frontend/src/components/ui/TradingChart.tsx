'use client';

import React, { useState, useEffect } from 'react';

export const TradingChart = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[400px] w-full animate-pulse bg-white/5 rounded-2xl" />;

  // Using IFrame for 100% reliability in production
  return (
    <div className="w-full h-[450px] bg-[#020617] rounded-xl overflow-hidden border border-white/5 shadow-2xl relative">
      <iframe
        id="tradingview_gold"
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_gold&symbol=OANDA%3AXAUUSD&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=virtualgold.org&utm_medium=widget&utm_campaign=chart&utm_term=OANDA%3AXAUUSD`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
      
      {/* Live Label Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex gap-2">
         <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Live Market</span>
         </div>
      </div>
    </div>
  );
};
