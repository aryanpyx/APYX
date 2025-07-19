import { useEffect, useRef, useState } from "react";

interface UseSpeechProps {
  language: string;
  onResult: (result: string) => void;
  onError: (error: any) => void;
}

export function useSpeech({ language, onResult, onError }: UseSpeechProps) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // Set language based on selection
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        bho: 'hi-IN' // Bhojpuri not directly supported, fallback to Hindi
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        onResult(result);
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        onError(event.error);
      };
    }
  }, [language, onResult, onError]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        onError(error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    isSupported,
    startListening,
    stopListening
  };
}
