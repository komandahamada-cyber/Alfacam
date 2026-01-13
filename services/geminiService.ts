import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "./types";

const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "Analyze this medical image and return JSON with: identifiedTest, diagnosisAr, diagnosisEn, icd10Code, icd11Code, descriptionAr, descriptionEn, confidence, isUnclear, disclaimer.",
    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
  ]);
  return JSON.parse(result.response.text());
};
export const stopSpeaking = () => {};
export const speakMedicalText = () => {};
