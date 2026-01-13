
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

let currentAudioContext: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

const SYSTEM_INSTRUCTION = `
You are Alfacam, an elite medical handwriting decoder. 
Your task is to decode medical handwriting from lab tests and prescriptions.

OUTPUT REQUIREMENTS:
1. Identified Test Name.
2. Diagnosis in BOTH Arabic and English.
3. Detailed medical explanation in BOTH Arabic and English.
4. Standard ICD-10 and ICD-11 codes.

IMPORTANT: 
- DO NOT include any insurance provider names or codes (No Nice Deer, Unicare, Nextcare, Globemed, or Mednet).
- Focus strictly on standard international ICD coding.
- If the image is blurry, set "isUnclear": true.
- Provide a professional medical disclaimer in Arabic.

Response MUST be in JSON format.
`;

export const analyzeMedicalImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this medical document. Provide findings in Arabic and English with ICD codes only." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalText: { type: Type.STRING },
          identifiedTest: { type: Type.STRING },
          diagnosisAr: { type: Type.STRING },
          diagnosisEn: { type: Type.STRING },
          icd10Code: { type: Type.STRING },
          icd11Code: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          descriptionAr: { type: Type.STRING },
          descriptionEn: { type: Type.STRING },
          isUnclear: { type: Type.BOOLEAN },
          disclaimer: { type: Type.STRING }
        },
        required: ["isUnclear", "descriptionAr", "descriptionEn", "disclaimer"]
      }
    }
  });

  const data = JSON.parse(response.text.trim());
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
};

export const stopSpeaking = () => {
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch (e) {}
    currentAudioSource = null;
  }
  if (currentAudioContext) {
    try { currentAudioContext.close(); } catch (e) {}
    currentAudioContext = null;
  }
};

export const speakMedicalText = async (text: string, onEnded?: () => void) => {
  stopSpeaking();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `بصوت واضح وهادئ: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
    const dataInt16 = new Int16Array(arrayBuffer);
    const audioBuffer = currentAudioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    currentAudioSource = currentAudioContext.createBufferSource();
    currentAudioSource.buffer = audioBuffer;
    currentAudioSource.connect(currentAudioContext.destination);
    currentAudioSource.onended = () => {
      currentAudioSource = null;
      if (onEnded) onEnded();
    };
    currentAudioSource.start();
  }
};
