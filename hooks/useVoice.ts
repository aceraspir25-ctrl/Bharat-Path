import { useCallback } from 'react';

/**
 * useVoice Hook
 * Provides spatial audio feedback for Bharat Path.
 * Uses browser-native SpeechSynthesis for low-latency UI feedback.
 */
export const useVoice = () => {
  const speak = useCallback((text: string, lang: string = 'hi-IN') => {
    if (!('speechSynthesis' in window)) {
      console.warn("Path Audio Protocol: Browser does not support speech synthesis.");
      return;
    }

    // Cancel any ongoing speech to prevent queuing lag
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice properties for Bharat Path persona
    utterance.lang = lang;
    utterance.pitch = 1.0;
    utterance.rate = 0.95; // Slightly slower for better clarity in Indian accents
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};