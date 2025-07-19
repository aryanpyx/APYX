import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";

interface ChatInterfaceProps {
  language: string;
}

interface Message {
  id: number;
  message: string;
  response?: string;
  sender: "user" | "ai";
  timestamp: Date;
  language: string;
}

export default function ChatInterface({ language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  useEffect(() => {
    if (conversations) {
      const formattedMessages: Message[] = [];
      conversations.forEach((conv: Conversation) => {
        formattedMessages.push({
          id: conv.id * 2 - 1,
          message: conv.message,
          sender: "user",
          timestamp: new Date(conv.timestamp || Date.now()),
          language: conv.language
        });
        formattedMessages.push({
          id: conv.id * 2,
          message: conv.response,
          sender: "ai",
          timestamp: new Date(conv.timestamp || Date.now()),
          language: conv.language
        });
      });
      setMessages(formattedMessages);
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (messages.length === 0) {
    return (
      <div className="space-y-4 min-h-96 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg">Start a conversation with APYX</p>
          <p className="text-sm mt-2">Use voice or text to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-96 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <Card className={`max-w-xs lg:max-w-md px-4 py-3 ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl rounded-br-md'
              : 'bg-slate-800/50 border-cyan-500/20 text-slate-200 rounded-2xl rounded-bl-md'
          } shadow-lg`}>
            <p className="whitespace-pre-wrap">{message.message}</p>
            <span className={`text-xs mt-1 block ${
              message.sender === 'user' ? 'text-white/70' : 'text-slate-400'
            }`}>
              {formatTime(message.timestamp)}
            </span>
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
