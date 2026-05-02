'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold';
  delay?: number;
}

export const GlassCard = ({ children, className, variant = 'default', delay = 0 }: GlassCardProps) => {
  const variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        delay: delay,
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      whileHover={{ 
        y: -10, 
        scale: 1.01,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] backdrop-blur-2xl border transition-all duration-500",
        variant === 'gold' 
          ? "bg-black/60 border-white/10 shadow-[0_0_50px_rgba(251,191,36,0.05)] hover:shadow-[0_0_60px_rgba(251,191,36,0.15)] hover:border-gold/40" 
          : "bg-black/40 border-white/5 shadow-2xl hover:border-white/20",
        className
      )}
    >
      {/* Dynamic Glow Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
