import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, CheckCircle2, Sparkles, Volume2, Activity, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VoiceModel } from '../types';
import { analyzeAudioPitch } from '../services/audioAnalyzer';

interface VoiceRecorderProps {
  onModelCreated: (model: VoiceModel) => void;
  existingModels: VoiceModel[];
}

const RECORDING_PROMPTS = [
  "The quick brown fox jumps over the lazy dog near the quiet riverbank. Voice AI systems require low-latency audio processing and precise spectral analysis.",
  "Hello, I am recording my voice sample to train my personal AI voice clone. I want this AI model to read written scripts and handle calls on my behalf.",
  "Welcome to Karta Voice Studio. We build real-time conversational agents powered by WebRTC streaming and dynamic function execution."
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onModelCreated, existingModels }) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [modelName, setModelName] = useState('My Cloned Voice (Divyansh)');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [pitchStats, setPitchStats] = useState<{
    pitchHz: number;
    pitchCategory: VoiceModel['pitchCategory'];
    speakingRate: number;
    formantShift: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setAudioUrl(null);
      setAudioBuffer(null);
      setPitchStats(null);
      audioChunksRef.current = [];
      setRecordingDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Draw canvas wave
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWave = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#818cf8');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        animationFrameRef.current = requestAnimationFrame(drawWave);
      };

      drawWave();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Decode audio to calculate pitch stats
        const arrayBuffer = await blob.arrayBuffer();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
        const stats = analyzeAudioPitch(decodedBuffer);
        setPitchStats(stats);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Microphone access denied or not available. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTrainModel = () => {
    if (!audioUrl || !pitchStats) return;

    setIsTraining(true);
    setTrainingProgress(10);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);

          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });

          const newModel: VoiceModel = {
            id: 'model_' + Date.now(),
            name: modelName || 'Custom Voice Model',
            createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            audioBlobUrl: audioUrl,
            durationSec: recordingDuration,
            pitchHz: pitchStats.pitchHz,
            pitchCategory: pitchStats.pitchCategory,
            speakingRate: pitchStats.speakingRate,
            formantShift: pitchStats.formantShift,
            sampleText: RECORDING_PROMPTS[selectedPromptIndex]
          };

          onModelCreated(newModel);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Step 1: Train Your Personal Voice Model</h2>
            <p className="text-sm text-slate-400">
              Read the sample text aloud into your microphone. Our neural audio engine analyzes your voice pitch, speed, and formants to build your digital voice model.
            </p>
          </div>
        </div>
      </div>

      {/* Main Recording Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Sample Text & Controls */}
        <div className="md:col-span-2 space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              1. Give Your Voice Model a Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. Divyansh's Voice Clone"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Read Prompt Aloud
              </label>
              <div className="flex space-x-1">
                {RECORDING_PROMPTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPromptIndex(idx)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      selectedPromptIndex === idx
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sample #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-sm leading-relaxed relative">
              <p className="font-medium text-slate-100 italic">
                "{RECORDING_PROMPTS[selectedPromptIndex]}"
              </p>
            </div>
          </div>

          {/* Canvas Waveform */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audio Spectrum Visualizer</span>
              </span>
              <span>{recordingDuration}s recorded</span>
            </div>
            <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
              <canvas ref={canvasRef} width={600} height={80} className="w-full h-full" />
              {!isRecording && !audioUrl && (
                <span className="text-xs text-slate-600 absolute">Click "Start Recording" to capture mic</span>
              )}
            </div>
          </div>

          {/* Record / Stop Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white py-3 px-6 rounded-xl font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all transform active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording (Mic)</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white py-3 px-6 rounded-xl font-medium text-sm shadow-lg shadow-rose-600/25 animate-pulse transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording ({recordingDuration}s)</span>
              </button>
            )}

            {audioUrl && (
              <button
                onClick={startRecording}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Retake Recording"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Audio Analysis & Train Action */}
        <div className="space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Voice Profile Metrics</span>
            </h3>

            {pitchStats ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Fundamental Pitch ($F_0$):</span>
                  <span className="font-bold text-cyan-400">{pitchStats.pitchHz} Hz</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pitch Category:</span>
                  <span className="font-semibold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {pitchStats.pitchCategory}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Tempo:</span>
                  <span className="font-medium text-slate-200">{pitchStats.speakingRate}x speed</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Formant Shift Proxy:</span>
                  <span className="font-medium text-slate-200">{pitchStats.formantShift}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 text-center text-xs text-slate-500 space-y-2">
                <Volume2 className="w-6 h-6 mx-auto text-slate-600" />
                <p>Record your voice prompt to view real-time pitch and acoustic metrics.</p>
              </div>
            )}

            {audioUrl && (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Playback Recording:</label>
                <audio controls src={audioUrl} className="w-full h-9 rounded-lg border border-slate-800" />
              </div>
            )}
          </div>

          {/* Train Button */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {isTraining ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Training Neural Voice Weights...</span>
                  <span className="font-bold text-cyan-400">{trainingProgress}%</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                disabled={!audioUrl || !pitchStats}
                onClick={handleTrainModel}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  audioUrl && pitchStats
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Build & Save Voice Model</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
