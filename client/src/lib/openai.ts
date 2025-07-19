import { apiRequest } from "./queryClient";

export interface ChatMessage {
  message: string;
  language: string;
}

export interface ChatResponse {
  response: string;
  language: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translation: string;
}

export const chatWithAI = async (data: ChatMessage): Promise<ChatResponse> => {
  const res = await apiRequest("POST", "/api/chat", data);
  return res.json();
};

export const translateText = async (data: TranslationRequest): Promise<TranslationResponse> => {
  const res = await apiRequest("POST", "/api/translate", data);
  return res.json();
};

export const getWeather = async () => {
  const res = await apiRequest("GET", "/api/weather");
  return res.json();
};
