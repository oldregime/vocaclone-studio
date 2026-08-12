import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/CustomCursor';
import { WebGLCanvas } from './components/WebGLCanvas';
import { VoiceRecorder } from './components/VoiceRecorder';
import { TextToVoiceStudio } from './components/TextToVoiceStudio';
import { CallSimulator } from './components/CallSimulator';
import type { VoiceModel } from './types';

const INITIAL_MODELS: VoiceModel[] = [
  {
    id: 'default-divyansh',
    name: 'Divyansh Joshi (Target Clone)',
    createdTime: 'Just now',
    durationSec: 12,
    pitchHz: 145,
    pitchCategory: 'Mid / Baritone',
    speakingRate: 1.05,
    formantShift: 0.98,
    sampleText: 'Hello, I am recording my voice sample to train my personal AI voice clone.',
    isDefault: true
  },
  {
    id: 'default-tech-host',
    name: 'Karta Studio Agent',
    createdTime: '1 hour ago',
    durationSec: 15,
    pitchHz: 160,
    pitchCategory: 'Mid / Baritone',
    speakingRate: 1.1,
    formantShift: 1.05,
    sampleText: 'Welcome to Karta Voice Studio. We build real-time conversational agents.',
    isDefault: true
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'train' | 'generate' | 'calls'>('train');
  const [models, setModels] = useState<VoiceModel[]>(INITIAL_MODELS);
  const [activeModel, setActiveModel] = useState<VoiceModel | null>(INITIAL_MODELS[0]);
  const [webglMode, setWebglMode] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis Inertia Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Hero GSAP Kinetic Reveal
    if (heroTitleRef.current) {
      gsap.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out' }
      );
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleModelCreated = (newModel: VoiceModel) => {
    setModels((prev) => [newModel, ...prev]);
    setActiveModel(newModel);
    setActiveTab('generate');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden font-sans relative">
      <CustomCursor />
      <WebGLCanvas mode={webglMode} />

      <div className="relative z-10">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} activeModel={activeModel} />

        {/* Hero Section */}
        <section className="pt-8 pb-4 text-center px-4 max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Awwwards Voice Studio — Divyansh Joshi</span>
          </div>

          <h1
            ref={heroTitleRef}
            className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-indigo-300 bg-clip-text text-transparent"
          >
            Neural Voice Cloning & AI Telephony Engine
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Record a short audio sample to train your voice profile, synthesize written scripts into your cloned voice, and test your voice clone answering live incoming call scenarios.
          </p>
        </section>

        {/* Main Interactive Stage */}
        <main ref={mainRef} className="pb-16">
          {activeTab === 'train' && (
            <VoiceRecorder
              onModelCreated={handleModelCreated}
              existingModels={models}
            />
          )}

          {activeTab === 'generate' && (
            <TextToVoiceStudio
              models={models}
              activeModel={activeModel}
              onSelectModel={(model) => setActiveModel(model)}
            />
          )}

          {activeTab === 'calls' && (
            <CallSimulator activeModel={activeModel} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500 backdrop-blur-md z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-300">VocaClone Studio — Divyansh Joshi</span>
          </div>
          <div className="flex space-x-4 text-slate-400 font-medium">
            <a href="mailto:divyanshjoshidev@gmail.com" className="hover:text-cyan-400 transition-colors">divyanshjoshidev@gmail.com</a>
            <span>•</span>
            <a href="tel:+918962430535" className="hover:text-cyan-400 transition-colors">+91-89624-30535</a>
            <span>•</span>
            <span className="hover:text-cyan-400 transition-colors">VIT Bhopal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
