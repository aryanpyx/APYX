import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun } from "lucide-react";

interface HeaderProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export default function Header({ 
  isSettingsOpen, 
  setIsSettingsOpen, 
  isDarkMode, 
  setIsDarkMode,
  selectedLanguage,
  setSelectedLanguage
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-cyan-500/20 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>
          <h1 className="text-xl font-mono font-semibold">
            <span className="text-cyan-400">A</span>
            <span className="text-blue-400">P</span>
            <span className="text-green-400">Y</span>
            <span className="text-cyan-400">X</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-32 bg-slate-800 border-cyan-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="bho">भोजपुरी</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="hover:bg-slate-800/50 hover:text-cyan-400"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hover:bg-slate-800/50 hover:text-cyan-400"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
