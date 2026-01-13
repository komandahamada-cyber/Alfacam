import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import ProcessingView from './components/ProcessingView';
import ResultView from './components/ResultView';
import CropView from './components/CropView';
import HistoryView from './components/HistoryView';
import { analyzeMedicalImage } from './geminiService'; // ✅ تأكد أن المسار هكذا
import { AnalysisResult, AppState } from './types';
import { AlertCircle } from 'lucide-react';

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
      const analysis = await analyzeMedicalImage(croppedBase64);
      setResult(analysis);
      setHistory(prev => [analysis, ...prev].slice(0, 20));
      changeState(AppState.RESULT);
    } catch (err: any) {
      setError("حدث خطأ في الاتصال. تأكد من وضوح الصورة.");
      changeState(AppState.ERROR);
    }
  };

  return (
    <div className={`h-screen w-screen bg-[#070D1D] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {appState === AppState.CAMERA && <CameraView onCapture={handleCapture} onOpenHistory={() => changeState(AppState.HISTORY)} />}
      {appState === AppState.CROPPING && capturedImage && <CropView image={capturedImage} onCrop={handleCropConfirm} onCancel={() => changeState(AppState.CAMERA)} />}
      {appState === AppState.PROCESSING && <ProcessingView />}
      {appState === AppState.RESULT && result && <ResultView result={result} onReset={() => changeState(AppState.CAMERA)} />}
      {appState === AppState.HISTORY && <HistoryView history={history} onSelect={(i) => {setResult(i); changeState(AppState.RESULT);}} onDelete={() => {}} onBack={() => changeState(AppState.CAMERA)} />}
      {appState === AppState.ERROR && (
        <div className="flex flex-col items-center justify-center h-full text-white p-4">
          <AlertCircle size={48} className="text-red-500 mb-2" />
          <p>{error}</p>
          <button onClick={() => changeState(AppState.CAMERA)} className="mt-4 p-2 bg-red-600 rounded">رجوع</button>
        </div>
      )}
    </div>
  );
};

export default App;
