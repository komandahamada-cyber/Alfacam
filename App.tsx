import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import ProcessingView from './components/ProcessingView';
import ResultView from './components/ResultView';
import CropView from './components/CropView';
import HistoryView from './components/HistoryView';
import { analyzeMedicalImage } from './geminiService'; // تأكد إن الاسم صح
import { AppState, AnalysisResult } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setAppState(AppState.CROPPING);
  };

  const handleCropConfirm = async (croppedBase64: string) => {
    setAppState(AppState.PROCESSING);
    try {
      const analysis = await analyzeMedicalImage(croppedBase64);
      setResult(analysis);
      setAppState(AppState.RESULT);
    } catch (err) {
      setError("فشل التحليل. حاول مرة أخرى.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070D1D] text-white">
      {appState === AppState.CAMERA && <CameraView onCapture={handleCapture} onOpenHistory={() => setAppState(AppState.HISTORY)} />}
      {appState === AppState.CROPPING && capturedImage && <CropView image={capturedImage} onCrop={handleCropConfirm} onCancel={() => setAppState(AppState.CAMERA)} />}
      {appState === AppState.PROCESSING && <ProcessingView />}
      {appState === AppState.RESULT && result && <ResultView result={result} onReset={() => setAppState(AppState.CAMERA)} />}
      {appState === AppState.ERROR && (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <p>{error}</p>
          <button onClick={() => setAppState(AppState.CAMERA)} className="mt-4 p-2 bg-red-600 rounded">رجوع</button>
        </div>
      )}
    </div>
  );
};

export default App;
