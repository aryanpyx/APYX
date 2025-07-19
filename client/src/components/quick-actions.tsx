import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, Bell, Languages, StickyNote } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  language: string;
}

export default function QuickActions({ language }: QuickActionsProps) {
  const { toast } = useToast();

  const weatherMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/weather");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Weather Update",
        description: `${data.temperature}°C, ${data.condition}. ${data.description}`,
      });
    },
    onError: () => {
      toast({
        title: "Weather Error",
        description: "Could not fetch weather data",
        variant: "destructive"
      });
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message, language });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "APYX",
        description: data.response,
      });
    }
  });

  const actions = [
    {
      icon: Cloud,
      label: getLabel("Weather", language),
      color: "text-cyan-400",
      action: () => weatherMutation.mutate()
    },
    {
      icon: Bell,
      label: getLabel("Reminder", language),
      color: "text-green-400",
      action: () => chatMutation.mutate(getActionMessage("reminder", language))
    },
    {
      icon: Languages,
      label: getLabel("Translate", language),
      color: "text-blue-400",
      action: () => chatMutation.mutate(getActionMessage("translate", language))
    },
    {
      icon: StickyNote,
      label: getLabel("Notes", language),
      color: "text-cyan-400",
      action: () => chatMutation.mutate(getActionMessage("notes", language))
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-slate-400 mb-4">
        {getLabel("Quick Actions", language)}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Card
            key={index}
            className="p-4 bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer group"
            onClick={action.action}
          >
            <action.icon className={`${action.color} text-lg mb-2 group-hover:scale-110 transition-transform`} />
            <p className="text-sm text-slate-300">{action.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getLabel(label: string, language: string): string {
  const translations: Record<string, Record<string, string>> = {
    "Quick Actions": {
      hi: "त्वरित क्रियाएं",
      bho: "तुरंत कार्य",
      en: "Quick Actions"
    },
    "Weather": {
      hi: "मौसम",
      bho: "मौसम",
      en: "Weather"
    },
    "Reminder": {
      hi: "रिमाइंडर",
      bho: "याद दिलावा",
      en: "Reminder"
    },
    "Translate": {
      hi: "अनुवाद",
      bho: "अनुवाद",
      en: "Translate"
    },
    "Notes": {
      hi: "नोट्स",
      bho: "नोट्स",
      en: "Notes"
    }
  };

  return translations[label]?.[language] || translations[label]?.en || label;
}

function getActionMessage(action: string, language: string): string {
  const messages: Record<string, Record<string, string>> = {
    reminder: {
      hi: "मुझे पानी पीने की याद दिलाएं",
      bho: "हमके पानी पिए के याद करा दीं",
      en: "Remind me to drink water"
    },
    translate: {
      hi: "'How are you?' को हिंदी में अनुवाद करें",
      bho: "'How are you?' के भोजपुरी में अनुवाद करीं",
      en: "Translate 'How are you?' to Hindi"
    },
    notes: {
      hi: "एक नया नोट बनाएं",
      bho: "एक नया नोट बनाईं",
      en: "Create a new note"
    }
  };

  return messages[action]?.[language] || messages[action]?.en || action;
}
