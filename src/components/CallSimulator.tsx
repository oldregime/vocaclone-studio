import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, PhoneOff, PhoneIncoming, Mic, Volume2, Sparkles, CheckCircle2, ShieldCheck, UserCheck, Bot, Radio } from 'lucide-react';
import type { VoiceModel, SimulatedCall } from '../types';
import { synthesizeTextInClonedVoice } from '../services/voiceSynthesizer';

interface CallSimulatorProps {
  activeModel: VoiceModel | null;
}

const CALL_SCENARIOS: SimulatedCall[] = [
  {
    id: 'karta-recruiter',
    callerName: 'Vijaypal Singh (Karta AI)',
    callerRole: 'Co-Founder & Engineering Lead',
    callerAvatar: '🎙️',
    scenarioDescription: 'Inquiring about your B.Tech CS background, voice agent experience, and availability.',
    initialMessage: 'Hey Divyansh, thanks for reaching out! I saw your email regarding the PM Intern position. Have you built anything in voice AI recently?',
    suggestedAnswers: [
      'Yes Vijaypal! I engineered VocaClone Studio to demonstrate real-time audio synthesis, voice activity detection, and tool calling.',
      'I built a Medical AI suite with sub-5s matching using LangGraph, and integrated real-time WebRTC audio processing.'
    ]
  },
  {
    id: 'food-delivery',
    callerName: 'Zomato Delivery Driver',
    callerRole: 'Logistics Partner',
    callerAvatar: '🛵',
    scenarioDescription: 'Confirming delivery instructions for your order.',
    initialMessage: 'Hello sir, I am near your gate. Should I leave the parcel with security?',
    suggestedAnswers: [
      'Yes, please leave it at the main security desk and ring the bell. Thank you!',
      'I am coming down to the main gate in 2 minutes. Please wait.'
    ]
  },
  {
    id: 'client-inquiry',
    callerName: 'Sarah Jenkins',
    callerRole: 'Product Director at TechCorp',
    callerAvatar: '👩‍💼',
    scenarioDescription: 'Asking for a demo meeting schedule.',
    initialMessage: 'Hi Divyansh! We reviewed your portfolio and would love to schedule a technical demo meeting this Thursday.',
    suggestedAnswers: [
      'Thursday at 3 PM works perfectly for me. I will send over a calendar invite shortly.',
      'Could we schedule for Friday morning instead? I am finalizing our latest Voice AI deployment.'
    ]
  }
];

export const CallSimulator: React.FC<CallSimulatorProps> = ({ activeModel }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<{ sender: 'caller' | 'ai_clone'; text: string; time: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<any>(null);

  const scenario = CALL_SCENARIOS[selectedScenarioIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerIncomingCall = () => {
    setCallState('ringing');
    setTranscript([]);
    setCallDuration(0);
  };

  const acceptCall = async () => {
    setCallState('connected');

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    setTranscript([
      {
        sender: 'caller',
        text: scenario.initialMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const declineCall = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const respondWithVoiceClone = async (answerText: string) => {
    if (!activeModel) return;

    setTranscript((prev) => [
      ...prev,
      {
        sender: 'ai_clone',
        text: answerText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsSpeaking(true);
    const handle = await synthesizeTextInClonedVoice(answerText, activeModel);
    handle.finished.then(() => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 3D Smartphone UI Frame */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden">
          {/* Phone Status Bar */}
          <div className="w-full flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-1.5 font-semibold text-purple-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Voice AI Phone Node</span>
            </div>
            {callState === 'connected' && (
              <span className="text-emerald-400 font-mono font-bold animate-pulse">
                00:{callDuration < 10 ? `0${callDuration}` : callDuration}
              </span>
            )}
          </div>

          {/* Caller Details */}
          <div className="text-center space-y-4 my-auto">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-1 shadow-xl shadow-purple-500/25 flex items-center justify-center text-4xl">
              {scenario.callerAvatar}
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-100">{scenario.callerName}</h3>
              <p className="text-xs text-purple-300 font-semibold">{scenario.callerRole}</p>
            </div>

            {callState === 'ringing' && (
              <p className="text-xs text-amber-400 font-bold animate-bounce tracking-wide">
                Incoming Phone Call...
              </p>
            )}

            {callState === 'connected' && (
              <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AI Voice Clone Active</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {callState === 'idle' || callState === 'ended' ? (
              <button
                onClick={triggerIncomingCall}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 transition-all scale-[1.01]"
              >
                <PhoneIncoming className="w-4 h-4 animate-bounce" />
                <span>Simulate Incoming Call</span>
              </button>
            ) : callState === 'ringing' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={declineCall}
                  className="flex items-center justify-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Answer Call</span>
                </button>
              </div>
            ) : (
              <button
                onClick={declineCall}
                className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/30 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Call Scenario Selector & Live Transcript */}
        <div className="lg:col-span-2 space-y-6 glass-card p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>Select Telephony Scenario</span>
              </label>
              <div className="flex space-x-1.5">
                {CALL_SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenarioIndex(idx);
                      setCallState('idle');
                      setTranscript([]);
                    }}
                    className={`text-xs px-3 py-1 rounded-xl transition-all font-medium ${
                      selectedScenarioIndex === idx
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Scenario #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/90 p-4 rounded-2xl border border-slate-800/80 shadow-inner font-medium">
              <span className="font-bold text-purple-400">Context: </span>
              {scenario.scenarioDescription}
            </p>

            {/* Live Transcript Dialogue Stream */}
            <div className="space-y-3 min-h-[220px] max-h-[280px] overflow-y-auto p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 shadow-inner">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Live Speech Dialogue Stream
              </span>
              {transcript.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-600 font-medium">
                  Click "Simulate Incoming Call" and "Answer Call" to start the live speech dialogue stream.
                </div>
              ) : (
                transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl text-xs space-y-1 ${
                      item.sender === 'caller'
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-8 shadow-sm'
                        : 'bg-purple-950/50 border border-purple-500/40 text-purple-100 ml-8 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold flex items-center space-x-1">
                        {item.sender === 'caller' ? (
                          <span>{scenario.callerName}</span>
                        ) : (
                          <span className="text-purple-300 flex items-center space-x-1 font-bold">
                            <Bot className="w-3.5 h-3.5 text-purple-400" />
                            <span>My AI Voice Clone ({activeModel?.name || 'Cloned Voice'})</span>
                          </span>
                        )}
                      </span>
                      <span>{item.time}</span>
                    </div>
                    <p className="leading-relaxed font-medium">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Response Actions */}
          {callState === 'connected' && (
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Trigger AI Voice Clone Response:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {scenario.suggestedAnswers.map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => respondWithVoiceClone(ans)}
                    className="text-left text-xs bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 p-3 rounded-2xl transition-all hover:border-purple-400 flex items-center justify-between font-medium shadow-sm"
                  >
                    <span>"{ans}"</span>
                    <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
