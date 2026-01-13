
import React, { useState, useEffect } from 'react';
import { Loader2, Droplet, Search, Globe } from 'lucide-react';

const ProcessingView: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "جاري قراءة خط الطبيب بالذكاء الاصطناعي...",
    "جاري استخراج البيانات من Alfa Laboratory...",
    "نتحقق من صحة التحليل بدقة 100%...",
    "تحليل الروشتة وتطابقها مع الأكواد الطبية...",
    "لحظات وتظهر النتيجة النهائية..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 bg-[#070D1D] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      {/* Background Decorative Drops & Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E31E24]/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1D428A]/10 blur-[120px] rounded-full animate-pulse"></div>

      <div className="relative mb-12">
        <div className="absolute inset-0 bg-[#E31E24]/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative flex items-center justify-center">
            <div className="absolute animate-ping">
               <Droplet size={100} className="text-[#E31E24] opacity-20" />
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 flex items-center justify-center">
               <Droplet fill="#E31E24" size={72} className="text-[#E31E24] animate-bounce" />
            </div>
        </div>
      </div>
      
      <div className="space-y-6 max-w-sm">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            alfa<span className="text-[#E31E24]">cam</span>
          </h2>
          <div className="flex items-center justify-center gap-2 opacity-60">
             <div className="h-px w-8 bg-blue-400"></div>
             <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Alfa Laboratory</span>
             <div className="h-px w-8 bg-blue-400"></div>
          </div>
        </div>
        
        <p className="text-slate-200 text-lg font-medium transition-opacity duration-500 min-h-[4rem] px-4 leading-relaxed">
          {messages[messageIndex]}
        </p>
      </div>

      <div className="mt-12 flex gap-3">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-[#E31E24] animate-bounce shadow-[0_0_15px_rgba(227,30,36,0.5)]" 
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
      
      <div className="absolute bottom-10 opacity-30">
        <p className="text-[10px] font-bold tracking-[0.4em] text-white">ALFA CAM PREMIUM SERVICE</p>
      </div>
    </div>
  );
};

export default ProcessingView;
