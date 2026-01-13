import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

// ✅ الطريقة الصحيحة لجلب المفتاح في مشروعك
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
You are Alfacam, an elite medical handwriting decoder. 
Your task is to decode medical handwriting from lab tests and prescriptions.

OUTPUT REQUIREMENTS:
1. Identified Test Name.
2. Diagnosis in BOTH Arabic and English.
3. Detailed medical explanation in BOTH Arabic and English.
4. Standard ICD-10 and ICD-11 codes.

IMPORTANT: 
- DO NOT include any insurance provider names or codes.
- Focus strictly on standard international ICD coding.
- If the image is blurry, set "isUnclear": true.
- Provide a professional medical disclaimer in Arabic.
`;

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  // ✅ استخدام الطريقة الحديثة لتعريف الذكاء الاصطناعي
  const genAI = new GoogleGenAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent([
    { text: SYSTEM_INSTRUCTION },
    { text: "Analyze this medical document. Provide findings in Arabic and English with ICD codes only." },
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
  ]);

  const response = await result.response;
  const data = JSON.parse(response.text().trim());

  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
};

// تم تبسيط وظيفة الصوت لتعمل بشكل مباشر
export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

export const speakMedicalText = (text: string, onEnded?: () => void) => {
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.onend = onEnded || null;
  window.speechSynthesis.speak(utterance);
};
