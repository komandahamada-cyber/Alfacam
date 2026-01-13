import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AlertCircle, Camera, History, Languages, Zap, CheckCircle2, Info } from 'lucide-react';

// --- إعدادات الذكاء الاصطناعي مدمجة مباشرة ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI(API_KEY || "");

// --- الواجهة والتطبيق ---
const App: React.FC = () => {
  const [appState, setAppState] = useState('CAMERA');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setCapturedImage(reader.result as string);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    setAppState('PROCESSING');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "Analyze this medical prescription. Return JSON with: identifiedTest, diagnosisAr, diagnosisEn, descriptionAr, descriptionEn.";
      
      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: "image/jpeg", data: base64 } }
      ]);
      
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(cleanJson));
      setAppState('RESULT');
    } catch (err) {
      setError("تعذر تحليل الصورة. يرجى التأكد من الإضاءة والمفتاح.");
      setAppState('ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1D] text-white p-4 font-sans">
      {appState === 'CAMERA' && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/20">
            <Camera size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center">Alfacam Medical Scanner</h1>
          <p className="text-gray-400 mb-8 text-center">ارفع صورة الروشتة أو التحليل الآن</p>
          <label className="bg-red-600 px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-red-700 transition-all">
            التقاط صورة
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          </label>
        </div>
      )}

      {appState === 'PROCESSING' && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-xl font-medium">جاري التحليل الذكي...</p>
        </div>
      )}

      {appState === 'RESULT' && result && (
        <div className="max-w-2xl mx-auto space-y-4 pb-10">
          <div className="bg-[#111827] p-6 rounded-3xl border border-gray-800">
            <h2 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} /> نتيجة الفحص
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-gray-500 text-sm">الاختبار / الروشتة</label>
                <p className="text-xl font-bold text-white">{result.identifiedTest}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1F2937] p-4 rounded-2xl">
                  <p className="text-red-400 text-xs mb-1">Diagnosis (EN)</p>
                  <p className="font-medium">{result.diagnosisEn}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-2xl text-right">
                  <p className="text-red-400 text-xs mb-1">التشخيص (العربية)</p>
                  <p className="font-medium">{result.diagnosisAr}</p>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setAppState('CAMERA')} className="w-full py-4 bg-gray-800 rounded-2xl font-bold">مسح صورة أخرى</button>
        </div>
      )}

      {appState === 'ERROR' && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
          <AlertCircle size={64} className="text-red-600 mb-4" />
          <p className="text-lg mb-6">{error}</p>
          <button onClick={() => setAppState('CAMERA')} className="bg-red-600 px-8 py-3 rounded-xl font-bold">حاول مجدداً</button>
        </div>
      )}
    </div>
  );
};

export default App;
