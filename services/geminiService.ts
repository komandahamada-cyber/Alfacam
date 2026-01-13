import { GoogleGenAI } from "@google/genai";

// تعريف داخلي عشان نضمن إن مفيش ملف ناقص
export interface AnalysisResult {
  id: string;
  identifiedTest: string;
  diagnosisAr: string;
  diagnosisEn: string;
  icd10Code: string;
  icd11Code: string;
  descriptionAr: string;
  descriptionEn: string;
  confidence: number;
  isUnclear: boolean;
  disclaimer: string;
  timestamp: number;
}

const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = "Analyze this medical document and return JSON ONLY with medical findings.";

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
  ]);

  const response = await result.response;
  const data = JSON.parse(response.text().trim());

  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
};

export const stopSpeaking = () => { window.speechSynthesis.cancel(); };
export const speakMedicalText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  window.speechSynthesis.speak(utterance);
};
