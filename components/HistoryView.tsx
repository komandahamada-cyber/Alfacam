
import React from 'react';
import { ChevronLeft, Trash2, Clock, Droplet, MessageCircle, Globe } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HistoryViewProps {
  history: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete, onBack }) => {
  return (
    <div className="fixed inset-0 bg-[#070D1D] z-50 flex flex-col p-6 overflow-y-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-white active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center gap-1">
           <div className="flex items-center gap-2">
              <Droplet fill="#E31E24" size={16} className="text-[#E31E24]" />
              <span className="text-white font-bold">سجل التحاليل</span>
           </div>
        </div>
        <div className="w-10"></div>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
          <Clock size={64} className="mb-4 text-blue-300" />
          <p className="text-white font-medium text-sm">لا يوجد سجلات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div 
              key={item.id}
              className="bg-[#111A2E] border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex-1 cursor-pointer" onClick={() => onSelect(item)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">
                    {new Date(item.timestamp).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm truncate max-w-[200px]">{item.identifiedTest}</h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="p-3 text-red-500/50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-auto pt-10 flex flex-col items-center gap-4 opacity-70">
         <div className="flex flex-col items-center gap-1.5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-blue-300 uppercase">Ahmed Ashraf</p>
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
         <a href="https://alfalaboratory.com" target="_blank" className="flex items-center gap-2 opacity-60">
            <Globe size={12} className="text-white" />
            <span className="text-[10px] text-white font-bold">ALFALABORATORY.COM</span>
         </a>
      </div>
    </div>
  );
};

export default HistoryView;
