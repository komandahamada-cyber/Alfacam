
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, FileText, Clipboard, 
  Droplet, ShieldCheck, Activity, Volume2, VolumeX, MessageCircle, Hash, Globe
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { speakMedicalText, stopSpeaking } from '../services/geminiService';

interface ResultViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isReliable = !result.isUnclear && result.confidence > 0.85;

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const toggleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        await speakMedicalText(result.descriptionAr, () => setIsSpeaking(false));
      } catch (e) {
        setIsSpeaking(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070D1D] flex flex-col items-center justify-start p-6 overflow-y-auto">
      {/* Print Only Layout */}
      <div className="print-only w-full bg-white text-black medical-report mb-8 p-10 border-2 border-slate-200" dir="rtl">
        <div className="flex justify-between items-center border-b-2 border-[#E31E24] pb-4 mb-6">
           <h1 className="text-3xl font-black text-[#1D428A]">ALFACAM REPORT</h1>
           <p className="text-sm font-bold">{new Date(result.timestamp).toLocaleString('ar-EG')}</p>
        </div>
        <div className="space-y-6 text-right">
           <div className="pb-4 border-b">
              <h2 className="text-xl font-bold mb-2">نوع الفحص:</h2>
              <p className="text-2xl font-black text-[#E31E24]">{result.identifiedTest}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <h3 className="text-sm font-bold">كود ICD-10:</h3>
                <p className="font-mono text-lg">{result.icd10Code || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold">كود ICD-11:</h3>
                <p className="font-mono text-lg">{result.icd11Code || 'N/A'}</p>
              </div>
           </div>

           <div className="space-y-6">
             <div>
                <h2 className="text-sm font-bold text-slate-500 mb-1">التشخيص (Diagnosis):</h2>
                <p className="font-bold text-xl text-[#1D428A]">{result.diagnosisAr}</p>
                <p className="text-slate-600 italic text-lg" dir="ltr">{result.diagnosisEn}</p>
             </div>
             <div>
                <h2 className="text-sm font-bold text-slate-500 mb-1">الوصف الطبي (Medical Description):</h2>
                <p className="leading-relaxed whitespace-pre-wrap text-lg">{result.descriptionAr}</p>
                <p className="leading-relaxed text-slate-600 mt-2 italic border-r-2 pr-4 border-slate-200" dir="ltr">{result.descriptionEn}</p>
             </div>
           </div>
           
           <div className="mt-10 pt-6 border-t border-slate-200 text-[10px] text-slate-500 italic">
              {result.disclaimer} | Powered by Alfa Laboratory
           </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4 pt-4 pb-40 no-print" dir="rtl">
        
        {/* Header Logo */}
        <div className="flex justify-center mb-1 animate-scale-in">
           <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-xl">
                <Droplet fill="#E31E24" size={14} className="text-[#E31E24]" />
                <h1 className="text-base font-bold text-white tracking-tight">
                    alfa<span className="text-[#E31E24]">cam</span>
                </h1>
              </div>
              <a href="https://alfalaboratory.com" target="_blank" className="text-[10px] text-blue-400 font-bold uppercase tracking-widest opacity-60">alfalaboratory.com</a>
           </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 animate-fade-in-up stagger-1 ${isReliable ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
               <div className={`p-1.5 rounded-lg ${isReliable ? 'bg-green-500/20' : 'bg-red-500/30'}`}>
                  {isReliable ? <ShieldCheck className="text-green-400" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
               </div>
               <div className="text-right">
                  <h4 className="text-white font-bold text-[11px]">
                    {isReliable ? 'تحليل عالي الدقة (100%)' : 'تنبيه: دقة منخفضة / غير واضح'}
                  </h4>
                  <p className="text-slate-400 text-[9px]">Alfa Cam Medical AI System</p>
               </div>
            </div>
            <button 
              onClick={toggleSpeak}
              className={`p-2 rounded-lg transition-all active:scale-90 ${isSpeaking ? 'bg-[#E31E24]' : 'bg-white/5'}`}
            >
               {isSpeaking ? <VolumeX size={16} className="text-white animate-pulse" /> : <Volume2 size={16} className="text-white" />}
            </button>
        </div>

        {/* Main Result Card */}
        <div className="relative animate-fade-in-up stagger-2">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1D428A] to-[#E31E24] rounded-2xl blur opacity-10"></div>
          <div className="relative bg-[#111A2E] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="space-y-5">
              <div>
                <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mb-1 block">البيانات المستخرجة</span>
                <h3 className="text-xl font-black text-white leading-tight">{result.identifiedTest}</h3>
              </div>

              {/* Diagnosis Section */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={12} className="text-[#E31E24]" />
                   <span className="text-[9px] text-slate-400 font-bold">التشخيص (Diagnosis)</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{result.diagnosisAr}</p>
                  <p className="text-xs font-medium text-slate-400 italic" dir="ltr">{result.diagnosisEn}</p>
                </div>
                
                {/* ICD Codes Row */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                   {result.icd10Code && (
                     <div className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                        <Hash size={10} className="text-blue-400" />
                        <span className="text-[10px] font-mono text-blue-300">ICD-10: {result.icd10Code}</span>
                     </div>
                   )}
                   {result.icd11Code && (
                     <div className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                        <Hash size={10} className="text-purple-400" />
                        <span className="text-[10px] font-mono text-purple-300">ICD-11: {result.icd11Code}</span>
                     </div>
                   )}
                </div>
              </div>

              <div className="h-px bg-white/5"></div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <FileText size={14} />
                  <span className="text-[9px] font-bold">التوضيح الطبي</span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-200 leading-relaxed text-right font-medium">{result.descriptionAr}</p>
                  <div className="bg-white/[0.02] p-3 rounded-lg border-r-2 border-white/10">
                    <p className="text-[10px] text-slate-400 leading-relaxed text-left italic font-sans" dir="ltr">{result.descriptionEn}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-[10px] text-red-200/70 font-bold leading-snug">
                {result.disclaimer}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
           <button 
             onClick={() => {
               const text = `الفحص: ${result.identifiedTest}\nالتشخيص: ${result.diagnosisAr} (${result.diagnosisEn})\nICD-10: ${result.icd10Code || 'N/A'}\nICD-11: ${result.icd11Code || 'N/A'}\n\nالوصف:\n${result.descriptionAr}`;
               navigator.clipboard.writeText(text);
             }}
             className="w-full flex items-center justify-center gap-2 bg-white/5 text-white py-4 rounded-xl border border-white/10 text-xs font-bold active:scale-95 transition-all shadow-lg"
           >
             <Clipboard size={18} className="text-[#E31E24]" />
             نسخ التقرير الطبي
           </button>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-3 pt-6 opacity-60">
           <div className="flex flex-col items-center gap-1">
              <p className="text-[9px] font-bold tracking-[0.2em] text-blue-300 uppercase">Ahmed Ashraf</p>
              <a 
                href="https://wa.me/201098811992" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 text-[9px] font-bold text-green-400"
              >
                <MessageCircle size={10} />
                واتساب المطور
              </a>
           </div>
           <a href="https://alfalaboratory.com" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <Globe size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-tight">ALFA LABORATORY WEBSITE</span>
           </a>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#070D1D] via-[#070D1D] to-transparent z-30">
          <button 
            onClick={onReset}
            className="w-full bg-gradient-to-r from-[#1D428A] to-[#E31E24] text-white font-black py-4 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 text-base active:scale-95"
          >
            <Activity size={20} className="animate-pulse" />
            فحص روشتة أخرى
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultView;
