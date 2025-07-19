import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Replaced with native input
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { useVoiceSynthesis } from "@/hooks/use-voice-synthesis";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoiceInterfaceProps {
  language: string;
}

export default function VoiceInterface({ language }: VoiceInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { startListening, stopListening, isSupported: speechSupported } = useSpeech({
    language,
    onResult: (result) => {
      setMessage(result);
      setIsListening(false);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: "Could not recognize speech. Please try again.",
        variant: "destructive"
      });
    }
  });

  const { speak, isSpeaking } = useVoiceSynthesis({ language });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; language: string }) => {
      const res = await apiRequest("POST", "/api/chat", data);
      return res.json();
    },
    onSuccess: (data) => {
      // Speak the response
      speak(data.response);
      setMessage(""); // Clear input after successful send
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI service. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    chatMutation.mutate({ message: message.trim(), language });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    switch (language) {
      case "hi":
        return "अपना संदेश टाइप करें या माइक दबाएं...";
      case "bho":
        return "अपना संदेश टाइप करीं या माइक दबाईं...";
      default:
        return "Type your message or tap the mic to speak...";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
      <div className="max-w-4xl mx-auto">
        
        {/* Voice Waveform Animation */}
        {isListening && (
          <div className="mb-4 flex justify-center items-center space-x-1 h-12">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="w-1 h-4 bg-gradient-to-t from-cyan-500 to-green-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${Math.random() * 40 + 10}px`
                }}
              />
            ))}
          </div>
        )}
        
        <Card className="backdrop-blur-lg bg-slate-900/80 border-cyan-500/20 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-lg text-slate-200 placeholder-slate-500 caret-cyan-400 h-10 px-0"
                disabled={chatMutation.isPending}
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
            </div>
            
            <Button
              onClick={handleVoiceToggle}
              disabled={!speechSupported}
              className={`w-14 h-14 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
              } transition-all transform hover:scale-105`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!message.trim() || chatMutation.isPending}
              className="w-12 h-12 rounded-full bg-slate-700 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500 transition-all"
            >
              <Send className="w-4 h-4 text-cyan-400" />
            </Button>
          </div>
          
          {/* Status Text */}
          {(isListening || chatMutation.isPending || isSpeaking) && (
            <div className="mt-2 text-center text-sm text-slate-400">
              {isListening && "🎤 Listening..."}
              {chatMutation.isPending && "🤔 APYX is thinking..."}
              {isSpeaking && <><Volume2 className="inline w-4 h-4 mr-1" />Speaking...</>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
