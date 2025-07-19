import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [britishAccent, setBritishAccent] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  return (
    <div className={`fixed top-0 right-0 h-full w-80 backdrop-blur-lg bg-slate-950/90 border-l border-cyan-500/20 transform transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="p-6 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-cyan-400">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Voice Settings */}
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Voice Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Voice Output</span>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={setVoiceEnabled}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">British Accent</span>
                <Switch 
                  checked={britishAccent} 
                  onCheckedChange={setBritishAccent}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>
          </Card>
          
          {/* Notifications */}
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Notifications</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Reminders</span>
              <Switch 
                checked={remindersEnabled} 
                onCheckedChange={setRemindersEnabled}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </Card>
          
          {/* AI Configuration */}
          <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
            <h3 className="text-sm font-medium mb-3 text-slate-300">AI Configuration</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-slate-700 border-cyan-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
