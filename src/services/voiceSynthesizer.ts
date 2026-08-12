import type { VoiceModel } from '../types';

export async function synthesizeTextInClonedVoice(
  text: string,
  model: VoiceModel,
  onWordBoundary?: (charIndex: number, length: number) => void
): Promise<{ stop: () => void; finished: Promise<void> }> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      resolve({ stop: () => {}, finished: Promise.resolve() });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice properties derived from user's voice model
    utterance.rate = model.speakingRate || 1.0;
    
    // Map pitch Hz to 0.5 - 2 range for SpeechSynthesisUtterance
    // Base 150Hz = 1.0
    const pitchRatio = Math.max(0.5, Math.min(2.0, model.pitchHz / 140));
    utterance.pitch = pitchRatio;

    // Pick best matching system voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Find a matching voice if possible
      let matchedVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google'));
      if (!matchedVoice) matchedVoice = voices[0];
      utterance.voice = matchedVoice;
    }

    if (onWordBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onWordBoundary(event.charIndex, event.charLength || 5);
        }
      };
    }

    let finishResolver: () => void;
    const finished = new Promise<void>((res) => {
      finishResolver = res;
    });

    utterance.onend = () => {
      if (finishResolver) finishResolver();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis ended with event:', e);
      if (finishResolver) finishResolver();
    };

    window.speechSynthesis.speak(utterance);

    resolve({
      stop: () => {
        window.speechSynthesis.cancel();
        if (finishResolver) finishResolver();
      },
      finished
    });
  });
}
