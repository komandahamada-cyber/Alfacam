import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import CameraView from './components/CameraView';
import ProcessingView from './components/ProcessingView';
import ResultView from './components/ResultView';
import CropView from './components/CropView';
import HistoryView from './components/HistoryView';
import { AnalysisResult, AppState } from './types';
import { AlertCircle } from 'lucide-react';

// --- كود Gemini مدمج هنا لضمان العمل ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI(API_KEY || "");

const analyzeImageInternal = async (base64Image: string): Promise<AnalysisResult> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Analyze this medical document image. Return JSON ONLY with: identifiedTest, diagnosisAr, diagnosisEn, icd10Code, icd11Code, descriptionAr, descriptionEn, confidence, isUnclear, disclaimer.`;

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
// ---------------------------------------

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('alfacam_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const changeState = (newState: AppState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(newState);
      setIsTransitioning(false);
    }, 150);
  };

  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    changeState(AppState.CROPPING);
  };

  const handleCropConfirm = async (croppedBase64: string) => {
    changeState(AppState.PROCESSING);
    try {
      // نستخدم الدالة المدمجة مباشرة
      const analysis = await analyzeImageInternal(croppedBase64);
      setResult(analysis);
      const updated = [analysis, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('alfacam_history', JSON.stringify(updated));
      changeState(AppState.RESULT);
    } catch (err: any) {
      setError("حدث خطأ في الاتصال بالذكاء الاصطناعي. تأكد من إعدادات Vercel.");
      changeState(AppState.ERROR);
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-[#070D1D] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {appState === AppState.CAMERA && (
        <CameraView onCapture={handleCapture} onOpenHistory={() => changeState(AppState.HISTORY)} />
      )}
      {appState === AppState.CROPPING && capturedImage && (
        <CropView image={capturedImage} onCrop={handleCropConfirm} onCancel={() => changeState(AppState.CAMERA)} />
      )}
      {appState === AppState.HISTORY && (
        <HistoryView 
          history={history} 
          onSelect={(item) => { setResult(item); changeState(AppState.RESULT); }}
          onDelete={(id) => setHistory(h => h.filter(i => i.id !== id))}
          onBack={() => changeState(AppState.CAMERA)}
        />
      )}
      {appState === AppState.PROCESSING && <ProcessingView />}
      {appState === AppState.RESULT && result && (
        <ResultView result={result} onReset={() => changeState(AppState.CAMERA)} />
      )}
      {appState === AppState.ERROR && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#070D1D]">
          <AlertCircle size={64} className="text-[#E31E24] mb-4" />
          <p className="text-white mb-8 text-center">{error}</p>
          <button onClick={() => changeState(AppState.CAMERA)} className="px-8 py-3 bg-[#E31E24] text-white rounded-xl font-bold">رجوع للكاميرا</button>
        </div>
      )}
    </div>
  );
};

export default App;
