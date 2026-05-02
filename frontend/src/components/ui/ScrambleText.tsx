'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const ScrambleText = ({ text }: { text: string | number }) => {
  const [displayText, setDisplayText] = useState(String(text));
  const textRef = useRef(String(text));

  useEffect(() => {
    if (textRef.current === String(text)) return;
    
    const chars = '!<>-_\\/[]{}—=+*^?#_$%&@';
    let iteration = 0;
    const finalStr = String(text);
    
    // Animate the scrambling
    const interval = setInterval(() => {
      setDisplayText(
        finalStr.split('').map((char, index) => {
          if (index < iteration) {
            return finalStr[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      
      if (iteration >= finalStr.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, 40);
    
    textRef.current = finalStr;
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};
