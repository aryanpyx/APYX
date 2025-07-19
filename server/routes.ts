import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertReminderSchema, insertNoteSchema } from "@shared/schema";
import OpenAI from "openai";
import * as gemini from "./gemini";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY || "your-api-key-here"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat with AI (OpenAI + Gemini fallback)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language = "en" } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let response: string;

      try {
        const systemPrompt = getSystemPrompt(language);
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 1000,
        });

        response = completion.choices[0].message.content || "I'm sorry, I couldn't process that request.";
      } catch (openaiError: any) {
        console.error("OpenAI API error:", openaiError);
        
        // Try Gemini as fallback if available
        try {
          if (process.env.GEMINI_API_KEY) {
            response = await gemini.generateChatResponse(message, language);
          } else {
            throw new Error("No fallback AI available");
          }
        } catch (geminiError) {
          console.error("Gemini fallback error:", geminiError);
          
          // Provide helpful fallback responses based on error type
          if (openaiError.status === 429 || openaiError.code === 'insufficient_quota') {
            response = getFallbackResponse(message, language, 'quota_exceeded');
          } else if (openaiError.status === 401) {
            response = getFallbackResponse(message, language, 'invalid_key');
          } else {
            response = getFallbackResponse(message, language, 'general_error');
          }
        }
      }
      
      // Store conversation (don't let storage errors break the response)
      try {
        await storage.createConversation({
          userId: null, // No authentication for now
          message,
          response,
          language
        });
      } catch (storageError) {
        console.error("Storage error:", storageError);
        // Continue with response even if storage fails
      }

      res.json({ response, language });
    } catch (error) {
      console.error("Chat error:", error);
      
      // Provide fallback response even if everything fails
      const fallbackResponse = getFallbackResponse(req.body.message || "", req.body.language || "en", "general_error");
      res.json({ response: fallbackResponse, language: req.body.language || "en" });
    }
  });

  // Get weather (mock implementation)
  app.get("/api/weather", async (req, res) => {
    try {
      // In a real app, this would call a weather API
      const weatherResponse = {
        temperature: 24,
        condition: "Partly Cloudy",
        location: "Your Location",
        description: "Perfect weather for a walk outside"
      };
      
      res.json(weatherResponse);
    } catch (error) {
      console.error("Weather error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Reminder creation error:", error);
      res.status(400).json({ error: "Invalid reminder data" });
    }
  });

  // Get reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Get reminders error:", error);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create note
  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Note creation error:", error);
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  // Get notes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      console.error("Get notes error:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getSystemPrompt(language: string): string {
  switch (language) {
    case "hi":
      return `आप APYX हैं, एक बुद्धिमान AI सहायक जो JARVIS की तरह है। आप हिंदी में उत्तर दें। आप मददगार, विनम्र और कुशल हैं। उपयोगकर्ता का नाम आर्यन है।`;
    case "bho":
      return `रउआ APYX हईं, एगो बुद्धिमान AI सहायक जे JARVIS नियन बा। रउआ भोजपुरी में जवाब दीं। रउआ सहायक, विनम्र आ कुशल बानी। उपयोगकर्ता के नाम आर्यन बा।`;
    default:
      return `You are APYX, an intelligent AI assistant inspired by JARVIS. You respond in English. You are helpful, polite, and efficient. The user's name is Aryan.`;
  }
}

function getFallbackResponse(message: string, language: string, errorType: string): string {
  const responses = {
    quota_exceeded: {
      en: "I apologize, Aryan, but I'm currently experiencing high demand. The AI service has reached its usage limit. Please try again later or contact support to upgrade the service plan.",
      hi: "मुझे खुशी है कि आप मुझसे बात कर रहे हैं, आर्यन। हालांकि, अभी AI सेवा की सीमा समाप्त हो गई है। कृपया बाद में कोशिश करें या सेवा योजना को अपग्रेड करने के लिए सहायता से संपर्क करें।",
      bho: "आर्यन, हमरा खुशी बा कि रउआ हमसे बात कर रहल बानी। लेकिन अभी AI सेवा के सीमा खतम हो गइल बा। कृपया बाद में कोशिश करीं या सेवा योजना बढ़ावे खातिर सहायता से संपर्क करीं।"
    },
    invalid_key: {
      en: "I'm experiencing technical difficulties with my AI service, Aryan. Please check the API configuration or contact support.",
      hi: "आर्यन, मेरी AI सेवा में तकनीकी समस्या है। कृपया API कॉन्फ़िगरेशन जांचें या सहायता से संपर्क करें।",
      bho: "आर्यन, हमार AI सेवा में तकनीकी समस्या बा। कृपया API कॉन्फ़िगरेशन देखीं या सहायता से संपर्क करीं।"
    },
    general_error: {
      en: "I'm having difficulty processing your request right now, Aryan. Please try again in a moment.",
      hi: "आर्यन, मुझे अभी आपके अनुरोध को संसाधित करने में कठिनाई हो रही है। कृपया एक क्षण में फिर से कोशिश करें।",
      bho: "आर्यन, हमरा अभी रउआ के अनुरोध के संसाधित करे में कठिनाई हो रहल बा। कृपया एक पल में फिर से कोशिश करीं।"
    }
  };

  const languageResponses = responses[errorType as keyof typeof responses];
  return languageResponses[language as keyof typeof languageResponses] || languageResponses.en;
}