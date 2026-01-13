import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// جلب المفتاح من إعدادات Vercel التي قمت بضبطها
const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const App = () => {
  const [appState, setAppState] = useState('IDLE');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAppState('ANALYZING');
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Analyze this medical document. Return JSON ONLY with: identifiedTest, diagnosisAr, diagnosisEn, descriptionAr, descriptionEn.";
        
        const res = await model.generateContent([
          prompt,
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]);

        const text = res.response.text().replace(/```json|```/g, "").trim();
        setResult(JSON.parse(text));
        setAppState('SUCCESS');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("حدث خطأ أثناء التحليل. تأكد من جودة الصورة والمفتاح.");
      setAppState('ERROR');
    }
  };

  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#E31E24', fontSize: '2rem', marginBottom: '10px' }}>ALFACAM</h1>
        <p style={{ color: '#9CA3AF' }}>الماسح الطبي الذكي من معامل ألفا</p>
      </header>

      <main style={{ maxWidth: '500px', margin: '0 auto' }}>
        {appState === 'IDLE' && (
          <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #1F2937', borderRadius: '24px' }}>
            <Camera size={48} color="#E31E24" style={{ marginBottom: '20px' }} />
            <label style={{ display: 'block', backgroundColor: '#E31E24', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              إدراج صورة الروشتة
              <input type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {appState === 'ANALYZING' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={48} className="animate-spin" color="#E31E24" style={{ margin: '0 auto 20px' }} />
            <p>جاري تحليل الروشتة بذكاء Gemini...</p>
          </div>
        )}

        {appState === 'SUCCESS' && result && (
          <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '24px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', marginBottom: '20px' }}>
              <CheckCircle2 size={24} />
              <h2 style={{ margin: 0 }}>تم التحليل بنجاح</h2>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <small style={{ color: '#9CA3AF' }}>نوع الفحص:</small>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '5px 0' }}>{result.identifiedTest}</p>
            </div>
            <div style={{ backgroundColor: '#1F2937', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ color: '#E31E24', fontSize: '0.8rem', margin: '0 0 5px 0' }}>DIAGNOSIS (EN)</p>
              <p style={{ margin: 0 }}>{result.diagnosisEn}</p>
            </div>
            <div style={{ backgroundColor: '#1F2937', padding: '15px', borderRadius: '12px', textAlign: 'right' }}>
              <p style={{ color: '#E31E24', fontSize: '0.8rem', margin: '0 0 5px 0' }}>التشخيص (بالعربية)</p>
              <p style={{ margin: 0 }}>{result.diagnosisAr}</p>
            </div>
            <button onClick={() => setAppState('IDLE')} style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#374151', color: 'white', fontWeight: 'bold' }}>تحليل صورة أخرى</button>
          </div>
        )}

        {appState === 'ERROR' && (
          <div style={{ textAlign: 'center', color: '#EF4444' }}>
            <AlertCircle size={48} style={{ marginBottom: '20px' }} />
            <p>{error}</p>
            <button onClick={() => setAppState('IDLE')} style={{ marginTop: '20px', color: 'white', textDecoration: 'underline', background: 'none', border: 'none' }}>حاول مرة أخرى</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
