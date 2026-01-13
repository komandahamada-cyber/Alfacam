import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "./types"; // ✅ تم تعديل المسار ليناسب مشروعك

// ✅ جلب المفتاح باستخدام صيغة Vite الصحيحة
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenAI(API_KEY || "");

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  // ✅ استخدام موديل مستقر وسريع
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `You are Alfacam by Alfa Labs. Task: Decode medical handwriting from the image. 
  Rules:
  1. Return JSON ONLY.
  2. No insurance names.
  3. Include diagnosis and description in BOTH Arabic and English.
  4. Use standard ICD-10/11 codes.
  
  Expected JSON structure:
  {
    "identifiedTest": "Name of test",
    "diagnosisAr": "التشخيص بالعربي",
    "diagnosisEn": "Diagnosis in English",
    "icd10Code": "Code",
    "icd11Code": "Code",
    "descriptionAr": "شرح مفصل بالعربي",
    "descriptionEn": "Detailed explanation in English",
    "confidence": 0.95,
    "isUnclear": false,
    "disclaimer": "نص إخلاء المسؤولية الطبي"
  }`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const data = JSON.parse(response.text().trim());

    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// وظائف الصوت مبسطة لتعمل مباشرة عبر المتصفح لضمان الاستقرار
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
