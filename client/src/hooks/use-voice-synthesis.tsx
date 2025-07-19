import { useState } from "react";

interface UseVoiceSynthesisProps {
  language: string;
}

export function useVoiceSynthesis({ language }: UseVoiceSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      const langMap: Record<string, string> = {
        en: 'en-GB', // British English for JARVIS-like accent
        hi: 'hi-IN',
        bho: 'hi-IN' // Fallback to Hindi for Bhojpuri
      };
      utterance.lang = langMap[language] || 'en-GB';
      
      // Configure voice properties
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 0.8;
      
      // Try to find a British voice for English
      if (language === 'en') {
        const voices = window.speechSynthesis.getVoices();
        const britishVoice = voices.find(voice => 
          voice.lang.startsWith('en-GB') || 
          voice.name.toLowerCase().includes('british') ||
          voice.name.toLowerCase().includes('uk')
        );
        if (britishVoice) {
          utterance.voice = britishVoice;
        }
      }

      // Handle speaking state
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isSupported: 'speechSynthesis' in window
  };
}
