import { GoogleGenAI } from "@google/genai";

// استخدمنا تعريفاً داخلياً للـ Interface لتجنب أخطاء المسارات (Path Errors)
interface AnalysisResult {
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

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI(API_KEY || "");

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Analyze this medical image. Return JSON ONLY with fields: identifiedTest, diagnosisAr, diagnosisEn, icd10Code, icd11Code, descriptionAr, descriptionEn, confidence, isUnclear, disclaimer.`;

  try {
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
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const stopSpeaking = () => { window.speechSynthesis.cancel(); };
export const speakMedicalText = (text: string, onEnded?: () => void) => {
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.onend = onEnded || null;
  window.speechSynthesis.speak(utterance);
};
