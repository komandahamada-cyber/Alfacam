
import React, { useState, useRef } from 'react';
import { Check, X, Droplet, Move, MessageCircle, Globe } from 'lucide-react';

interface CropViewProps {
  image: string;
  onCrop: (croppedBase64: string) => void;
  onCancel: () => void;
}

const CropView: React.FC<CropViewProps> = ({ image, onCrop, onCancel }) => {
  const [crop, setCrop] = useState({ x: 15, y: 20, width: 70, height: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = (e: React.PointerEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragStart({ x, y, cropX: crop.x, cropY: crop.y });
    if (type === 'move') setIsDragging(true);
    else setIsResizing(true);
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging && !isResizing) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const dx = currentX - dragStart.x;
    const dy = currentY - dragStart.y;

    if (isDragging) {
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.width, dragStart.cropX + dx)),
        y: Math.max(0, Math.min(100 - prev.height, dragStart.cropY + dy))
      }));
    } else if (isResizing) {
      setCrop(prev => ({
        ...prev,
        width: Math.max(10, Math.min(100 - prev.x, prev.width + dx)),
        height: Math.max(10, Math.min(100 - prev.y, prev.height + dy))
      }));
      setDragStart(prev => ({ ...prev, x: currentX, y: currentY }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / 100;
    const scaleY = img.naturalHeight / 100;

    canvas.width = (crop.width * scaleX);
    canvas.height = (crop.height * scaleY);

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    onCrop(croppedBase64);
  };

  return (
    <div className="fixed inset-0 bg-[#070D1D] z-50 flex flex-col items-center touch-none">
      <div className="w-full p-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10 z-20">
        <button onClick={onCancel} className="p-2 text-slate-300 active:scale-90 transition-transform">
          <X size={22} />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-white text-xs font-bold tracking-tight">حدد اسم التحليل بدقة</span>
           <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">ALFA CAM PRECISION</span>
        </div>
        <button 
          onClick={handleConfirm}
          className="bg-[#E31E24] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-1 shadow-lg active:scale-95 transition-all"
        >
          <Check size={16} />
          بدء الفحص
        </button>
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center p-4">
        <div className="relative inline-block max-w-full max-h-full" ref={containerRef}>
          <img 
            ref={imageRef}
            src={`data:image/jpeg;base64,${image}`} 
            className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl select-none"
            alt="To crop"
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
          <div 
            className="absolute border-2 border-[#E31E24] shadow-[0_0_30px_rgba(227,30,36,0.4)] cursor-move touch-none overflow-hidden rounded-lg"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
              backgroundImage: `url(data:image/jpeg;base64,${image})`,
              backgroundSize: `${crop.width > 0 ? 10000 / crop.width : 100}% ${crop.height > 0 ? 10000 / crop.height : 100}%`,
              backgroundPosition: `${(100 - crop.width) > 0 ? (crop.x / (100 - crop.width)) * 100 : 0}% ${(100 - crop.height) > 0 ? (crop.y / (100 - crop.height)) * 100 : 0}%`,
            }}
            onPointerDown={(e) => handlePointerDown(e, 'move')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
              <div className="border-r border-b border-white/50"></div>
              <div className="border-r border-b border-white/50"></div>
              <div className="border-b border-white/50"></div>
              <div className="border-r border-b border-white/50"></div>
              <div className="border-r border-b border-white/50"></div>
              <div className="border-b border-white/50"></div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 flex items-center justify-center cursor-nwse-resize z-30" onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize'); }}>
               <div className="w-5 h-5 bg-[#E31E24] rounded-full border-2 border-white shadow-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-6 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md">
         <div className="flex flex-col items-center gap-2 opacity-80">
            <div className="flex flex-col items-center gap-0.5">
               <p className="text-[10px] font-bold tracking-[0.2em] text-blue-300">Ahmed Ashraf</p>
               <a 
                 href="https://wa.me/201098811992" 
                 target="_blank" 
                 className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 text-[9px] font-bold text-green-400"
               >
                 <MessageCircle size={10} />
                 تواصل واتساب
               </a>
            </div>
            <a href="https://alfalaboratory.com" target="_blank" className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-lg border border-white/10">
               <Globe size={10} className="text-blue-400" />
               <span className="text-[9px] font-black text-white uppercase tracking-tight">ALFA LABORATORY SITE</span>
            </a>
         </div>
      </div>
    </div>
  );
};

export default CropView;
