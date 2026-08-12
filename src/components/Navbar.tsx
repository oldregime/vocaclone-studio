import React, { useEffect, useRef } from 'react';
import { Mic, Sparkles, PhoneCall, FileText, Cpu } from 'lucide-react';
import gsap from 'gsap';
import type { VoiceModel } from '../types';

interface NavbarProps {
  activeTab: 'train' | 'generate' | 'calls';
  setActiveTab: (tab: 'train' | 'generate' | 'calls') => void;
  activeModel: VoiceModel | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, activeModel }) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <header
      ref={navRef}
      className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                VocaClone Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                Awwwards Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Neural Voice Cloning & AI Telephony</p>
          </div>
        </div>

        <nav className="flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('train')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTab === 'train'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>1. Train Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Text to Speech</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTab === 'calls'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>3. Attend Calls</span>
          </button>
        </nav>

        {activeModel && (
          <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-md">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="text-slate-400">Active Model:</span>
            <span className="font-bold text-cyan-300 tracking-wide">{activeModel.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};
