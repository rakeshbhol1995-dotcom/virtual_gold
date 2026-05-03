'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Zap, Crown, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';
import { GlassCard } from './GlassCard';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isMe?: boolean;
  role?: 'admin' | 'whale' | 'user';
}

const MOCK_BOT_MESSAGES = [
  "Gold is pumping! 🚀",
  "Just bought 500G, let's gooo!",
  "Who else is holding for $100?",
  "This curve is insane. 📈",
  "Base network is so smooth.",
  "Diamond hands only! 💎",
  "Is the mining pool live yet?",
  "Golden opportunity right here."
];

export const TradingChat = () => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: '0x71...f3a2', text: 'This protocol looks solid. Audit ready!', timestamp: Date.now() - 500000, role: 'admin' },
    { id: '2', user: '0x12...b9c4', text: 'Just grabbed 1000G! 🥇', timestamp: Date.now() - 400000, role: 'whale' },
    { id: '3', user: '0x45...e1d2', text: 'Moon soon? 🚀', timestamp: Date.now() - 300000 }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate Bot Activity
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = MOCK_BOT_MESSAGES[Math.floor(Math.random() * MOCK_BOT_MESSAGES.length)];
      const botMsg: Message = {
        id: Math.random().toString(),
        user: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        text: randomMsg,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev.slice(-49), botMsg]);
    }, 15000); // New message every 15s

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || !isConnected) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      user: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anon',
      text: inputText,
      timestamp: Date.now(),
      isMe: true
    };

    setMessages(prev => [...prev.slice(-49), newMessage]);
    setInputText('');
  };

  return (
    <GlassCard className="h-[500px] md:h-[600px] flex flex-col border-gold/20 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gold/5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Trollbox</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.role === 'admin' && <Shield className="w-2.5 h-2.5 text-red-500" />}
                {msg.role === 'whale' && <Crown className="w-2.5 h-2.5 text-gold" />}
                <span className={`text-[8px] font-black uppercase tracking-tighter ${msg.role === 'admin' ? 'text-red-500' : msg.role === 'whale' ? 'text-gold' : 'text-slate-500'}`}>
                  {msg.user}
                </span>
                <span className="text-[7px] text-slate-700">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] ${msg.isMe ? 'bg-gold text-black font-bold' : 'bg-white/5 text-slate-200 border border-white/10'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isConnected ? "Type a message..." : "Connect wallet to chat"}
            disabled={!isConnected}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-gold/50 transition-all pr-12"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !isConnected}
            className="absolute right-2 p-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!isConnected && (
            <p className="text-[7px] text-center mt-2 text-slate-600 uppercase tracking-widest font-black">Authentication Required via Wallet</p>
        )}
      </div>
    </GlassCard>
  );
};
