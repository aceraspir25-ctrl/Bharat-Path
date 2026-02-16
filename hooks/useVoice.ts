// @ts-nocheck
import { useCallback } from 'react';

/**
 * useVoice Hook
 * Provides high-fidelity vocal synthesis for Bharat Path navigation.
 * Optimized for Hindi-English linguistic synchronization.
 */
export const useVoice = () => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Immediate cancellation of ongoing speech to prevent buffering lag
      window.speechSynthesis.cancel();
      
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = 'hi-IN'; // Specific Hindi-IN locale for authentic resonance
      ut.pitch = 1.0;
      ut.rate = 1.0;
      
      window.speechSynthesis.speak(ut);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};