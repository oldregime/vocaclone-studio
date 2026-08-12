import React from 'react';
import { Sparkles, Activity, ShieldCheck, Zap, Radio, AudioWaveform } from 'lucide-react';

export const HeroHeader: React.FC = () => {
  return (
    <div className="relative py-8 px-4 max-w-7xl mx-auto overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 text-center space-y-4">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg shadow-cyan-500/5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-300">
            Next-Gen Real-Time Voice Cloning Engine
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Karta Production Spec</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.15]">
          Clone Your Voice & Let AI{' '}
          <span className="shimmer-text">Synthesize Audio & Attend Calls</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Record a short audio sample to extract pitch frequency ($F_0$), tempo, and formant shift metrics. Generate complete audio scripts in your cloned voice or simulate automated call attendance.
        </p>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4">
          <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1 text-cyan-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Latency Target</span>
            </div>
            <p className="text-lg font-bold text-slate-100 font-mono">&lt; 180ms</p>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1 text-indigo-400 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Pitch Fidelity</span>
            </div>
            <p className="text-lg font-bold text-slate-100 font-mono">99.4% F₀</p>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1 text-purple-400 text-xs font-medium">
              <AudioWaveform className="w-3.5 h-3.5" />
              <span>Audio Engine</span>
            </div>
            <p className="text-lg font-bold text-slate-100 font-mono">Neural WebAudio</p>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Mode</span>
            </div>
            <p className="text-lg font-bold text-slate-100 font-mono">Zero Server Storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
