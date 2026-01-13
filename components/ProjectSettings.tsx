
import React, { useState } from 'react';
import { 
  Download, Globe, ChevronLeft, 
  Rocket, Share2, FileCode, Copy, ChevronDown, ChevronUp, CheckCircle2, Laptop, Smartphone
} from 'lucide-react';

interface ProjectSettingsProps {
  onBack: () => void;
  history: any[];
  onImport: (data: any[]) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ onBack, history, onImport }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filesContent: Record<string, string> = {
    "App.tsx": "Code of App component...",
    "index.html": "Full HTML Content...",
    "geminiService.ts": "AI Logic Code..."
  };

  return (
    <div className="fixed inset-0 bg-[#070D1D] z-[60] flex flex-col animate-fade-in-up font-sans" dir="rtl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A162F]/80 backdrop-blur-xl">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-white active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
           <span className="text-white font-black text-sm block">أين تجد ملفات البرنامج؟</span>
           <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">FILE ACCESS GUIDE</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 text-right">
        
        {/* Visual Guide Card */}
        <div className="bg-gradient-to-br from-[#1D428A] to-[#E31E24] rounded-[2rem] p-6 text-white shadow-2xl">
           <div className="flex items-center gap-3 mb-4">
              <Laptop size={24} className="opacity-80" />
              <h2 className="text-lg font-black">ابحث عن هذه الأيقونة ☁️↓</h2>
           </div>
           <p className="text-xs opacity-90 leading-relaxed mb-4">
              زر التحميل ليس كلمة مكتوبة، بل هو **أيقونة سحابة فيها سهم** موجودة في أعلى شريط في الموقع (خارج نافذة البرنامج).
           </p>
           <div className="bg-black/20 p-4 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold flex items-center gap-2">
                 <Smartphone size={14} /> إذا كنت تستخدم الموبايل:
              </p>
              <p className="text-[10px] mt-1 opacity-80 italic leading-relaxed">
                 اضغط على (3 نقط) في المتصفح واختار <b>"Desktop Site"</b> لتظهر لك الأيقونة بوضوح.
              </p>
           </div>
        </div>

        {/* Copy Files Section */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-white font-bold text-sm">نسخ الأكواد يدوياً:</h3>
              {copied && <span className="text-green-400 text-[10px] font-bold animate-pulse">تم النسخ! ✅</span>}
           </div>

           <div className="bg-[#111A2E] border border-white/10 rounded-2xl overflow-hidden">
              {Object.keys(filesContent).map((fileName) => (
                <div key={fileName} className="border-b border-white/5 last:border-0">
                   <button 
                     onClick={() => setActiveFile(activeFile === fileName ? null : fileName)}
                     className="w-full p-4 flex items-center justify-between text-white active:bg-white/5"
                   >
                      <div className="flex items-center gap-3">
                         <FileCode size={16} className="text-blue-400" />
                         <span className="text-xs font-mono">{fileName}</span>
                      </div>
                      {activeFile === fileName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                   </button>
                   
                   {activeFile === fileName && (
                     <div className="p-4 bg-black/40 border-t border-white/5">
                        <button 
                          onClick={() => handleCopy(`محتوى ملف ${fileName} موجود هنا...`)}
                          className="w-full mb-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-2"
                        >
                           <Copy size={12} /> نسخ كود الملف
                        </button>
                        <div className="bg-black p-3 rounded-lg border border-white/5 overflow-x-auto">
                           <pre className="text-[9px] text-blue-300 font-mono">
                              {`// كود ملف ${fileName} جاهز للنسخ...`}
                           </pre>
                        </div>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Deployment Links */}
        <div className="space-y-3">
           <h3 className="text-white font-bold text-sm px-2">روابط مفيدة:</h3>
           <a href="https://vercel.com" target="_blank" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                 <Rocket size={18} className="text-purple-400" />
                 <span className="text-xs text-white">موقع Vercel (للنشر والحصول على رابط)</span>
              </div>
              <Globe size={14} className="text-slate-500" />
           </a>
        </div>

      </div>

      <div className="p-6 text-center border-t border-white/5">
         <button onClick={onBack} className="text-blue-400 text-xs font-bold py-2 px-6 bg-white/5 rounded-full border border-white/10">
            فهمت، العودة للكاميرا
         </button>
      </div>
    </div>
  );
};

export default ProjectSettings;
