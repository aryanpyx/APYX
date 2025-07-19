import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChatResponse(message: string, language: string): Promise<string> {
  try {
    const systemPrompt = getSystemPromptByLanguage(language);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser message: ${message}` }]
        }
      ],
    });

    return response.text || "I apologize, but I couldn't process your request at the moment.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const prompt = `Translate the following text to ${getLanguageName(targetLanguage)}. Only return the translation, no explanations:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw error;
  }
}

export async function processReminder(message: string): Promise<{ title: string; description: string; scheduledFor: Date }> {
  try {
    const prompt = `Extract reminder information from this message and respond with JSON in this exact format:
{
  "title": "Brief title for the reminder",
  "description": "Detailed description",
  "scheduledFor": "ISO date string for when to remind"
}

Message: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            scheduledFor: { type: "string" },
          },
          required: ["title", "description", "scheduledFor"],
        },
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const result = JSON.parse(response.text || "{}");
    return {
      title: result.title || "Reminder",
      description: result.description || message,
      scheduledFor: new Date(result.scheduledFor || Date.now() + 3600000) // Default to 1 hour from now
    };
  } catch (error) {
    console.error("Gemini reminder processing error:", error);
    // Fallback parsing
    return {
      title: "Reminder",
      description: message,
      scheduledFor: new Date(Date.now() + 3600000)
    };
  }
}

export async function processNote(message: string): Promise<{ title: string; content: string }> {
  try {
    const prompt = `Extract note information from this message and respond with JSON in this exact format:
{
  "title": "Brief title for the note",
  "content": "Full content of the note"
}

Message: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "content"],
        },
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const result = JSON.parse(response.text || "{}");
    return {
      title: result.title || "Note",
      content: result.content || message
    };
  } catch (error) {
    console.error("Gemini note processing error:", error);
    // Fallback parsing
    return {
      title: "Note",
      content: message
    };
  }
}

function getSystemPromptByLanguage(language: string): string {
  switch (language) {
    case "hi":
      return `आप APYX हैं, एक बुद्धिमान AI सहायक जो JARVIS की तरह है। आप हिंदी में उत्तर दें। आप मददगार, विनम्र और कुशल हैं। उपयोगकर्ता का नाम आर्यन है।`;
    case "bho":
      return `रउआ APYX हईं, एगो बुद्धिमान AI सहायक जे JARVIS नियन बा। रउआ भोजपुरी में जवाब दीं। रउआ सहायक, विनम्र आ कुशल बानी। उपयोगकर्ता के नाम आर्यन बा।`;
    default:
      return `You are APYX, an intelligent AI assistant inspired by JARVIS. You respond in English. You are helpful, polite, and efficient. The user's name is Aryan.`;
  }
}

function getLanguageName(code: string): string {
  switch (code) {
    case "hi": return "Hindi";
    case "bho": return "Bhojpuri";
    case "en": return "English";
    default: return "English";
  }
}