export type VoiceModel = {
  id: string;
  name: string;
  createdTime: string;
  audioBlobUrl?: string;
  durationSec: number;
  pitchHz: number;
  pitchCategory: 'Low / Bass' | 'Mid / Baritone' | 'High / Tenor' | 'Alto / Soprano';
  speakingRate: number;
  formantShift: number;
  sampleText: string;
  isDefault?: boolean;
};

export type GeneratedAudioRecord = {
  id: string;
  text: string;
  voiceModelName: string;
  timestamp: string;
  durationSec: number;
  audioBlobUrl?: string;
};

export type SimulatedCall = {
  id: string;
  callerName: string;
  callerRole: string;
  callerAvatar: string;
  scenarioDescription: string;
  initialMessage: string;
  suggestedAnswers: string[];
};
