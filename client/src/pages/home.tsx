import { useState, useEffect } from "react";
import Header from "@/components/header";
import VoiceInterface from "@/components/voice-interface";
import ChatInterface from "@/components/chat-interface";
import SettingsPanel from "@/components/settings-panel";
import QuickActions from "@/components/quick-actions";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning, Aryan");
    } else if (hour < 17) {
      setGreeting("Good Afternoon, Aryan");
    } else {
      setGreeting("Good Evening, Aryan");
    }
  }, []);

  const getSubtitleByLanguage = () => {
    switch (selectedLanguage) {
      case "hi":
        return "आज मैं आपकी कैसे सहायता कर सकता हूँ?";
      case "bho":
        return "आज हम रउआ के कइसे सहायता कर सकीं?";
      default:
        return "How may I assist you today?";
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header 
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      
      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <main className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center py-12 mb-8">
            <div className="mb-6">
              <Card className="inline-block p-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 animate-pulse">
                <div className="text-4xl">🤖</div>
              </Card>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-cyan-400">{greeting}</h2>
            <p className="text-slate-400 text-lg">{getSubtitleByLanguage()}</p>
          </div>
          
          <ChatInterface language={selectedLanguage} />
          
          <QuickActions language={selectedLanguage} />
        </div>
      </main>
      
      <VoiceInterface language={selectedLanguage} />
    </div>
  );
}
