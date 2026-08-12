import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw, Sparkles, Volume2, Activity, Zap, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VoiceModel } from '../types';
import { analyzeAudioPitch } from '../services/audioAnalyzer';

interface VoiceRecorderProps {
  onModelCreated: (model: VoiceModel) => void;
  existingModels: VoiceModel[];
}

const RECORDING_PROMPTS = [
  "The quick brown fox jumps over the lazy dog near the quiet riverbank. Voice AI systems require low-latency audio processing and precise spectral analysis.",
  "Hello Vijaypal, I am recording my voice sample to train my personal AI voice clone for Karta. I want this AI model to read written scripts and handle calls on my behalf.",
  "Welcome to Karta Voice Studio. We build real-time conversational agents powered by WebRTC streaming and dynamic function execution."
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onModelCreated, existingModels }) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [modelName, setModelName] = useState('Divyansh Joshi (Target Clone)');
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

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWave = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#818cf8');
          gradient.addColorStop(1, '#c084fc');
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
            particleCount: 100,
            spread: 80,
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
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 px-4">
      {/* Studio Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recording Studio */}
        <div className="lg:col-span-2 space-y-6 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Model Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Model Name Identifier</span>
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-all shadow-inner font-medium"
              placeholder="e.g. Divyansh Joshi (Target Clone)"
            />
          </div>

          {/* Prompt Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Select Teleprompter Script</span>
              </label>
              <div className="flex space-x-1.5">
                {RECORDING_PROMPTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPromptIndex(idx)}
                    className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                      selectedPromptIndex === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Script #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Futuristic Teleprompter Display */}
            <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800/80 text-slate-100 text-sm leading-relaxed relative shadow-inner font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Prompt Reader Protocol</span>
                </span>
                <span>Read naturally into microphone</span>
              </div>
              <p className="font-semibold text-slate-100 leading-relaxed">
                "{RECORDING_PROMPTS[selectedPromptIndex]}"
              </p>
            </div>
          </div>

          {/* Canvas Waveform Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Real-Time Spectrum Visualizer</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{recordingDuration}s recorded</span>
            </div>
            <div className="h-24 bg-slate-950/90 rounded-2xl border border-slate-800/80 overflow-hidden relative flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} width={640} height={96} className="w-full h-full" />
              {!isRecording && !audioUrl && (
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Click "Start Recording" to capture audio stream</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center space-x-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Start Mic Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center space-x-2.5 bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/30 animate-pulse transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording ({recordingDuration}s)</span>
              </button>
            )}

            {audioUrl && (
              <button
                onClick={startRecording}
                className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors border border-slate-700"
                title="Retake Audio"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Acoustic Profile & Model Trainer */}
        <div className="space-y-6 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Voice Profile Radar</span>
            </h3>

            {pitchStats ? (
              <div className="space-y-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pitch Frequency ($F_0$):</span>
                  <span className="font-bold text-cyan-400 font-mono text-sm">{pitchStats.pitchHz} Hz</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Classification:</span>
                  <span className="font-bold text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    {pitchStats.pitchCategory}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Speed:</span>
                  <span className="font-semibold text-slate-200">{pitchStats.speakingRate}x tempo</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Formant Shift Vector:</span>
                  <span className="font-semibold text-slate-200">{pitchStats.formantShift}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/80 text-center text-xs text-slate-500 space-y-2">
                <Volume2 className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p>Record your voice prompt to analyze real-time acoustic pitch metrics.</p>
              </div>
            )}

            {audioUrl && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Audio Preview Playback:</label>
                <audio controls src={audioUrl} className="w-full h-10 rounded-xl border border-slate-800" />
              </div>
            )}
          </div>

          {/* Model Trainer Action */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            {isTraining ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Training Neural Model Weights...</span>
                  <span className="font-bold text-cyan-400 font-mono">{trainingProgress}%</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-200"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                disabled={!audioUrl || !pitchStats}
                onClick={handleTrainModel}
                className={`w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl font-bold text-sm transition-all ${
                  audioUrl && pitchStats
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 scale-[1.01]'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
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
