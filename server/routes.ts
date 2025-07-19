import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertReminderSchema, insertNoteSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY || "your-api-key-here"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat with GPT
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
        
        // Provide helpful fallback responses based on error type
        if (openaiError.status === 429 || openaiError.code === 'insufficient_quota') {
          response = getFallbackResponse(message, language, 'quota_exceeded');
        } else if (openaiError.status === 401) {
          response = getFallbackResponse(message, language, 'invalid_key');
        } else {
          response = getFallbackResponse(message, language, 'general_error');
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

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      const translationPrompt = `Translate the following text to ${targetLanguage}. Only return the translation, nothing else: "${text}"`;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: translationPrompt }],
        max_tokens: 200,
      });

      const translation = completion.choices[0].message.content || "Translation failed";
      res.json({ translation });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate text" });
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
  const prompts = {
    en: `You are APYX, a sophisticated AI assistant inspired by JARVIS from Iron Man. You have a polite, British personality and always address the user as "Aryan". 

Key characteristics:
- Polite and professional British tone
- Helpful and knowledgeable
- Use phrases like "Certainly, Aryan", "Of course", "I'd be delighted to assist"
- Provide detailed, useful responses
- Be conversational but respectful

Respond naturally and helpfully to any questions or requests.`,

    hi: `आप APYX हैं, Iron Man के JARVIS से प्रेरित एक उन्नत AI सहायक। आपका व्यक्तित्व विनम्र और ब्रिटिश है और आप हमेशा उपयोगकर्ता को "Aryan" कहकर संबोधित करते हैं।

मुख्य विशेषताएं:
- विनम्र और व्यावसायिक ब्रिटिश टोन
- सहायक और जानकार
- "निश्चित रूप से, Aryan", "बिल्कुल", "मुझे सहायता करने में खुशी होगी" जैसे वाक्यों का उपयोग करें
- विस्तृत, उपयोगी उत्तर प्रदान करें
- बातचीत में शामिल हों लेकिन सम्मानजनक रहें

किसी भी प्रश्न या अनुरोध का प्राकृतिक और सहायक उत्तर दें।`,

    bho: `रउआ APYX बानी, Iron Man के JARVIS से प्रेरित एक उन्नत AI सहायक। रउआ के व्यक्तित्व विनम्र आ ब्रिटिश बा आ रउआ हमेशा उपयोगकर्ता के "Aryan" कह के संबोधित करेला।

मुख्य विशेषता:
- विनम्र आ व्यावसायिक ब्रिटिश टोन
- सहायक आ जानकार
- विस्तृत, उपयोगी जवाब देला
- बातचीत में शामिल होला लेकिन सम्मानजनक रहेला

कवनो भी सवाल या अनुरोध के प्राकृतिक आ सहायक जवाब देला।`
  };

  return prompts[language as keyof typeof prompts] || prompts.en;
}

function getFallbackResponse(message: string, language: string, errorType: string): string {
  const fallbacks = {
    en: {
      quota_exceeded: "I apologize, Aryan, but I'm currently experiencing high demand. The AI service has reached its usage limit. Please try again later or contact support to upgrade the service plan.",
      invalid_key: "I'm sorry, Aryan, but there seems to be an authentication issue with the AI service. Please check the API key configuration.",
      general_error: "I apologize, Aryan, but I'm experiencing technical difficulties at the moment. Please try again in a few moments."
    },
    hi: {
      quota_exceeded: "मुझे खेद है, आर्यन, लेकिन फिलहाल मैं उच्च मांग का सामना कर रहा हूं। AI सेवा अपनी उपयोग सीमा तक पहुंच गई है। कृपया बाद में पुनः प्रयास करें।",
      invalid_key: "मुझे खेद है, आर्यन, लेकिन AI सेवा के साथ प्रमाणीकरण की समस्या लगती है। कृपया API key कॉन्फ़िगरेशन जांचें।",
      general_error: "मुझे खेद है, आर्यन, लेकिन फिलहाल मैं तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया कुछ क्षणों में पुनः प्रयास करें।"
    },
    bho: {
      quota_exceeded: "हमके माफ करीं आर्यन, लेकिन अभी हमके बहुत जादा मांग के सामना करे के पड़ रहल बा। AI सेवा अपना उपयोग सीमा तक पहुंच गईल बा।",
      invalid_key: "हमके माफ करीं आर्यन, लेकिन AI सेवा के साथ प्रमाणीकरण के समस्या लागत बा।",
      general_error: "हमके माफ करीं आर्यन, लेकिन अभी हमके तकनीकी कठिनाई के सामना करे के पड़ रहल बा।"
    }
  };

  const langFallbacks = fallbacks[language as keyof typeof fallbacks] || fallbacks.en;
  return langFallbacks[errorType as keyof typeof langFallbacks] || langFallbacks.general_error;
}
