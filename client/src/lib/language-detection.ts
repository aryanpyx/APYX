export function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const hindiPattern = /[\u0900-\u097F]/;
  const bhojpuriKeywords = ['बा', 'रउआ', 'हम', 'का', 'के', 'बाटे', 'बानी', 'होखे'];
  
  if (hindiPattern.test(text)) {
    // Check for Bhojpuri-specific words
    const hasBhojpuriWords = bhojpuriKeywords.some(keyword => text.includes(keyword));
    return hasBhojpuriWords ? 'bho' : 'hi';
  }
  
  return 'en';
}

export function getGreeting(language: string, timeOfDay: 'morning' | 'afternoon' | 'evening'): string {
  const greetings = {
    en: {
      morning: 'Good Morning, Aryan',
      afternoon: 'Good Afternoon, Aryan',
      evening: 'Good Evening, Aryan'
    },
    hi: {
      morning: 'सुप्रभात, आर्यन',
      afternoon: 'नमस्कार, आर्यन',
      evening: 'शुभ संध्या, आर्यन'
    },
    bho: {
      morning: 'प्रणाम आर्यन',
      afternoon: 'नमस्कार आर्यन',
      evening: 'प्रणाम आर्यन'
    }
  };

  return greetings[language as keyof typeof greetings]?.[timeOfDay] || greetings.en[timeOfDay];
}
