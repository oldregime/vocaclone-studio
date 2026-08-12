import React, { useState, useRef } from 'react';
import { Play, Square, Download, Sparkles, Volume2, Settings2, FileText, Cpu, CheckCircle } from 'lucide-react';
import type { VoiceModel } from '../types';
import { synthesizeTextInClonedVoice } from '../services/voiceSynthesizer';

interface TextToVoiceStudioProps {
  models: VoiceModel[];
  activeModel: VoiceModel | null;
  onSelectModel: (model: VoiceModel) => void;
}

const PRESET_SCRIPTS = [
  {
    title: 'Product Pitch',
    text: "Hello Vijaypal, I built this custom voice AI studio to demonstrate real-time audio synthesis, dynamic tool calling, and low-latency voice interaction for Karta."
  },
  {
    title: 'Technical Summary',
    text: "Our neural voice pipeline decodes user acoustic features—specifically pitch frequency, zero-crossing rates, and formant shift vectors—to synthesize high-fidelity spoken audio in real time."
  },
  {
    title: 'Clinical AI Note',
    text: "Patient profile matched to Clinical Trial #402 with sub-5-second analysis. Stage II Non-Small Cell Lung Carcinoma intake parameters validated."
  }
];

export const TextToVoiceStudio: React.FC<TextToVoiceStudioProps> = ({ models, activeModel, onSelectModel }) => {
  const [text, setText] = useState(PRESET_SCRIPTS[0].text);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [highlightRange, setHighlightRange] = useState<{ start: number; length: number } | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const synthesisHandleRef = useRef<{ stop: () => void; finished: Promise<void> } | null>(null);

  const handleGenerateAudio = async () => {
    if (!activeModel || !text.trim()) return;

    if (isPlaying && synthesisHandleRef.current) {
      synthesisHandleRef.current.stop();
      setIsPlaying(false);
      setHighlightRange(null);
      return;
    }

    setIsPlaying(true);

    const adjustedModel: VoiceModel = {
      ...activeModel,
      speakingRate: (activeModel.speakingRate || 1.0) * speedMultiplier
    };

    const handle = await synthesizeTextInClonedVoice(text, adjustedModel, (charIndex, length) => {
      setHighlightRange({ start: charIndex, length });
    });

    synthesisHandleRef.current = handle;

    handle.finished.then(() => {
      setIsPlaying(false);
      setHighlightRange(null);
    });
  };

  const stopPlayback = () => {
    if (synthesisHandleRef.current) {
      synthesisHandleRef.current.stop();
    }
    setIsPlaying(false);
    setHighlightRange(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Step 2: Read Written Text in Your Voice</h2>
            <p className="text-sm text-slate-400">
              Type or paste any written text, script, or email. The system synthesizes natural audio using your custom trained voice model.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Script Input & Highlights */}
        <div className="md:col-span-2 space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enter Written Text to Synthesize
            </label>
            <div className="flex space-x-1">
              {PRESET_SCRIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(preset.text)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed font-mono transition-colors"
            placeholder="Type or paste your text script here..."
          />

          {/* Real-time Teleprompter / Highlighting Preview */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm leading-relaxed min-h-[80px]">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Live Teleprompter Output:</span>
            <p className="text-slate-200">
              {highlightRange ? (
                <>
                  <span>{text.slice(0, highlightRange.start)}</span>
                  <span className="bg-indigo-500 text-white font-bold px-1 rounded shadow-sm">
                    {text.slice(highlightRange.start, highlightRange.start + highlightRange.length)}
                  </span>
                  <span>{text.slice(highlightRange.start + highlightRange.length)}</span>
                </>
              ) : (
                text || <span className="text-slate-600 italic">No text entered yet.</span>
              )}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {!isPlaying ? (
                <button
                  disabled={!activeModel || !text.trim()}
                  onClick={handleGenerateAudio}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    activeModel && text.trim()
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate & Speak Script</span>
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-lg shadow-rose-600/25 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Playback</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Speed:</span>
              {[0.8, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeedMultiplier(speed)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    speedMultiplier === speed
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Selection & Audio Telemetry */}
        <div className="space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Select Voice Model</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {models.map((model) => {
                const isSelected = activeModel?.id === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => onSelectModel(model)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{model.name}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{model.pitchCategory}</span>
                      <span className="text-indigo-300 font-mono">{model.pitchHz} Hz</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block">Model Characteristics:</span>
            <div className="flex justify-between text-slate-300">
              <span>Target Pitch:</span>
              <span className="font-mono text-cyan-400">{activeModel?.pitchHz || 140} Hz</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Speech Pace:</span>
              <span className="font-mono text-indigo-300">{((activeModel?.speakingRate || 1.0) * speedMultiplier).toFixed(2)}x</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Synthesis Method:</span>
              <span className="text-emerald-400 font-medium">Neural Web Audio Synthesis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
