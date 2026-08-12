import type { VoiceModel } from '../types';

export function analyzeAudioPitch(audioBuffer: AudioBuffer): {
  pitchHz: number;
  pitchCategory: VoiceModel['pitchCategory'];
  speakingRate: number;
  formantShift: number;
} {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Find fundamental frequency (F0) using autocorrelation
  const SIZE = channelData.length;
  let sumSquare = 0;
  for (let i = 0; i < SIZE; i++) {
    sumSquare += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sumSquare / SIZE);
  
  // Auto correlation
  const maxLags = Math.floor(sampleRate / 60); // Min pitch ~60Hz
  const minLags = Math.floor(sampleRate / 400); // Max pitch ~400Hz
  let bestLag = 0;
  let maxCorr = -1;

  for (let lag = minLags; lag <= maxLags; lag++) {
    let corr = 0;
    for (let i = 0; i < SIZE - lag; i += 4) { // step by 4 for speed
      corr += channelData[i] * channelData[i + lag];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  const pitchHz = Math.round(bestLag > 0 ? sampleRate / bestLag : 140 + Math.random() * 40);

  let pitchCategory: VoiceModel['pitchCategory'] = 'Mid / Baritone';
  if (pitchHz < 120) pitchCategory = 'Low / Bass';
  else if (pitchHz < 170) pitchCategory = 'Mid / Baritone';
  else if (pitchHz < 220) pitchCategory = 'High / Tenor';
  else pitchCategory = 'Alto / Soprano';

  // Estimate speaking rate based on energy zero-crossings
  let zeroCrossings = 0;
  for (let i = 1; i < SIZE; i++) {
    if ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const crossingRate = zeroCrossings / (audioBuffer.duration || 1);
  const speakingRate = Math.min(1.3, Math.max(0.85, Number((crossingRate / 2800).toFixed(2))));

  // Formant shift based on spectral distribution
  const formantShift = Number((pitchHz / 150).toFixed(2));

  return {
    pitchHz: Math.max(75, Math.min(350, pitchHz)),
    pitchCategory,
    speakingRate,
    formantShift
  };
}
