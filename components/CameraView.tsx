
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Image as ImageIcon, Droplet, Download, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onOpenHistory: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onOpenHistory }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play failed:", e));
        };
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("تعذر تشغيل الكاميرا. تأكد من إعطاء الإذن للمتصفح واستخدام رابط آمن (HTTPS).");
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      triggerSuccess();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        triggerSuccess();
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        onCapture(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) onCapture(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {error ? (
        <div className="text-white text-center p-8 bg-red-900/30 rounded-[2.5rem] border border-red-500/50 mx-6 backdrop-blur-xl">
          <p className="text-lg font-bold mb-6 leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-full font-black flex items-center gap-2 mx-auto active:scale-95 transition-all">
            <RefreshCw size={20} /> تحديث الصفحة
          </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          
          {/* Top Header */}
          <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-center z-30">
            <button 
              onClick={onOpenHistory}
              className="w-12 h-12 bg-[#1D428A]/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-xl active:scale-90 transition-all"
            >
              <Clock size={22} />
            </button>

            <div className="bg-white/5 backdrop-blur-md px-5 py-1.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-2">
               <Droplet fill="#E31E24" size={18} className="text-[#E31E24]" />
               <h1 className="text-xl font-black text-white tracking-tighter">alfa<span className="text-[#E31E24]">cam</span></h1>
            </div>

            <div className="w-12"></div>
          </div>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border border-white/20 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#E31E24] rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#E31E24] rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#E31E24] rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#E31E24] rounded-br-3xl"></div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6 z-20">
            <div className="flex justify-center items-center gap-4 bg-black/40 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-white/10 rounded-full flex flex-col items-center justify-center text-white active:scale-90 transition-all">
                <ImageIcon size={22} />
                <span className="text-[8px] font-bold mt-0.5">ملف</span>
              </button>
              
              <button onClick={captureImage} className="group relative">
                <div className="absolute inset-0 bg-white/10 rounded-full scale-125 animate-pulse"></div>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-[#1D428A] shadow-2xl active:scale-90 transition-transform">
                   <Droplet fill="#E31E24" size={28} className="text-[#E31E24]" />
                </div>
              </button>

              <button 
                onClick={handleInstall} 
                disabled={!deferredPrompt}
                className={`w-14 h-14 bg-white/10 rounded-full flex flex-col items-center justify-center text-white active:scale-90 transition-all ${!deferredPrompt ? 'opacity-30' : ''}`}
              >
                <Download size={22} className={deferredPrompt ? "text-[#E31E24] animate-bounce" : "text-blue-400"} />
                <span className="text-[8px] font-bold mt-0.5">تثبيت</span>
              </button>
            </div>

            {/* Developer Info Tag */}
            <div className="flex flex-col items-center gap-1 opacity-80 scale-90">
                <p className="text-[10px] font-bold tracking-[0.2em] text-blue-300 uppercase">Ahmed Ashraf</p>
                <a 
                  href="https://wa.me/201098811992" 
                  target="_blank" 
                  className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 text-[9px] font-bold text-green-400"
                >
                  <MessageCircle size={10} />
                  واتساب المطور
                </a>
            </div>
          </div>

          {showSuccessToast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-scale-in">
              <CheckCircle2 size={18} />
              <span className="font-bold text-sm">تم التثبيت بنجاح ✅</span>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default CameraView;
