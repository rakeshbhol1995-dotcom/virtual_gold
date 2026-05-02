'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const LaserBackground = () => {
  const [lines, setLines] = useState<{ id: number; x: number; y: number; length: number; vertical: boolean }[]>([]);

  useEffect(() => {
    // Generate random laser lines periodically
    const generateLines = () => {
      const isVertical = Math.random() > 0.5;
      const newLine = {
        id: Date.now(),
        x: Math.random() * 100, // percentage across screen
        y: Math.random() * 100, // percentage across screen
        length: Math.random() * 40 + 20, // line length percentage
        vertical: isVertical
      };
      
      setLines(prev => [...prev.slice(-10), newLine]); // Keep last 10
    };

    const interval = setInterval(generateLines, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
      {/* Static Grid Map */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#fbbf2405_1px,transparent_1px),linear-gradient(to_bottom,#fbbf2405_1px,transparent_1px)] bg-[size:50px_50px]" />
       
       {/* Animated Laser Etching */}
       {lines.map((line) => (
         <motion.div
           key={line.id}
           initial={{ 
             opacity: 0, 
             left: `${line.x}%`, 
             top: `${line.y}%`,
             width: line.vertical ? '2px' : '0%',
             height: line.vertical ? '0%' : '2px'
           }}
           animate={{ 
             opacity: [0, 0.8, 0],
             width: line.vertical ? '2px' : `${line.length}%`,
             height: line.vertical ? `${line.length}%` : '2px'
           }}
           transition={{ duration: 2, ease: "circInOut" }}
           className="absolute bg-gold shadow-[0_0_15px_rgba(251,191,36,0.8)]"
         />
       ))}
    </div>
  );
};
