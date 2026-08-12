import React, { useState, useRef } from 'react';
import { Play, Square, Download, Sparkles, Volume2, FileText, Cpu, CheckCircle, Gauge, Zap } from 'lucide-react';
import type { VoiceModel } from '../types';
import { synthesizeTextInClonedVoice } from '../services/voiceSynthesizer';

interface TextToVoiceStudioProps {
  models: VoiceModel[];
  activeModel: VoiceModel | null;
  onSelectModel: (model: VoiceModel) => void;
}

const PRESET_SCRIPTS = [
  {
    title: 'Karta Product Pitch',
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
    <div className="max-w-6xl mx-auto space-y-6 py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Script Input & Karaoke Teleprompter */}
        <div className="lg:col-span-2 space-y-6 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Written Script Input</span>
            </label>

            <div className="flex space-x-1.5">
              {PRESET_SCRIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(preset.text)}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors font-medium border border-slate-800"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed font-mono transition-colors shadow-inner"
            placeholder="Type or paste your text script here..."
          />

          {/* Karaoke Teleprompter Box */}
          <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800/80 text-sm leading-relaxed min-h-[90px] relative shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 border-b border-slate-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Audio Teleprompter Output</span>
              </span>
              <span>{text.split(' ').length} words</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {highlightRange ? (
                <>
                  <span>{text.slice(0, highlightRange.start)}</span>
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-1.5 py-0.5 rounded-md shadow-md mx-0.5 animate-pulse">
                    {text.slice(highlightRange.start, highlightRange.start + highlightRange.length)}
                  </span>
                  <span>{text.slice(highlightRange.start + highlightRange.length)}</span>
                </>
              ) : (
                text || <span className="text-slate-600 italic">No text entered yet.</span>
              )}
            </p>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {!isPlaying ? (
                <button
                  disabled={!activeModel || !text.trim()}
                  onClick={handleGenerateAudio}
                  className={`flex items-center space-x-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all ${
                    activeModel && text.trim()
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-indigo-600/30 scale-[1.01]'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Synthesize & Speak Script</span>
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/30 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Playback</span>
                </button>
              )}
            </div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span>Speed:</span>
              {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeedMultiplier(speed)}
                  className={`px-3 py-1.5 rounded-xl transition-all font-mono font-bold ${
                    speedMultiplier === speed
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Selection Card */}
        <div className="space-y-6 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Voice Model Registry</span>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {models.map((model) => {
                const isSelected = activeModel?.id === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => onSelectModel(model)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500/60 shadow-lg shadow-indigo-500/15 scale-[1.01]'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-100">{model.name}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-medium text-indigo-300">
                        {model.pitchCategory}
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">{model.pitchHz} Hz</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 space-y-2 text-xs font-medium">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
              Active Synthesis Metrics
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Target Pitch:</span>
              <span className="font-mono text-cyan-400 font-bold">{activeModel?.pitchHz || 145} Hz</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Speech Rate:</span>
              <span className="font-mono text-indigo-300 font-bold">{((activeModel?.speakingRate || 1.0) * speedMultiplier).toFixed(2)}x</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Engine:</span>
              <span className="text-emerald-400 font-semibold">Web Audio Neural Synthesis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
