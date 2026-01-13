
import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import ProcessingView from './components/ProcessingView';
import ResultView from './components/ResultView';
import CropView from './components/CropView';
import HistoryView from './components/HistoryView';
import { analyzeMedicalImage } from './services/geminiService';
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

  const saveToHistory = (newResult: AnalysisResult) => {
    const updated = [newResult, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem('alfacam_history', JSON.stringify(updated));
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
      saveToHistory(analysis);
      changeState(AppState.RESULT);
    } catch (err: any) {
      setError("حدث خطأ في التحليل. يرجى التأكد من وضوح الصورة.");
      changeState(AppState.ERROR);
    }
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('alfacam_history', JSON.stringify(updated));
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-[#070D1D] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {appState === AppState.CAMERA && (
        <CameraView 
          onCapture={handleCapture} 
          onOpenHistory={() => changeState(AppState.HISTORY)} 
        />
      )}

      {appState === AppState.CROPPING && capturedImage && (
        <CropView image={capturedImage} onCrop={handleCropConfirm} onCancel={() => changeState(AppState.CAMERA)} />
      )}

      {appState === AppState.HISTORY && (
        <HistoryView 
          history={history} 
          onSelect={(item) => { setResult(item); changeState(AppState.RESULT); }}
          onDelete={deleteHistoryItem}
          onBack={() => changeState(AppState.CAMERA)}
        />
      )}

      {appState === AppState.PROCESSING && <ProcessingView />}

      {appState === AppState.RESULT && result && (
        <ResultView result={result} onReset={() => changeState(AppState.CAMERA)} />
      )}

      {appState === AppState.ERROR && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-[#070D1D] animate-fade-in-up">
          <AlertCircle size={64} className="text-[#E31E24] mb-4" />
          <p className="text-white mb-8 text-center">{error}</p>
          <button onClick={() => changeState(AppState.CAMERA)} className="px-8 py-3 bg-[#E31E24] text-white rounded-xl font-bold active:scale-95 transition-transform shadow-lg">رجوع للكاميرا</button>
        </div>
      )}
    </div>
  );
};

export default App;
