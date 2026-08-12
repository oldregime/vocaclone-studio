import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LenisSmoothScroll } from './components/LenisSmoothScroll';
import { WebGLCanvasBackground } from './components/WebGLCanvasBackground';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
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

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [activeTab]);

  const handleModelCreated = (newModel: VoiceModel) => {
    setModels((prev) => [newModel, ...prev]);
    setActiveModel(newModel);
    setActiveTab('generate');
  };

  return (
    <LenisSmoothScroll>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden font-sans relative">
        <WebGLCanvasBackground />
        <CustomCursor />

        <div className="relative z-10">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} activeModel={activeModel} />

          <main ref={mainRef} className="pb-12">
            {activeTab === 'train' && (
              <VoiceRecorder onModelCreated={handleModelCreated} existingModels={models} />
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
        <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500 backdrop-blur-md z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-500/50" />
              <span className="font-bold text-slate-300">VocaClone Studio — Awwwards Phase 1 Complete</span>
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
    </LenisSmoothScroll>
  );
};

export default App;
