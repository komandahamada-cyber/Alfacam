import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Identify this medical prescription. Return ONLY JSON: {identifiedTest, diagnosisAr, diagnosisEn}";
        
        const imagePart = {
          inlineData: { data: base64Data, mimeType: "image/jpeg" },
        };

        const response = await model.generateContent([prompt, imagePart]);
        const text = response.response.text().replace(/```json|```/g, "").trim();
        
        setResult(JSON.parse(text));
      } catch (err: any) {
        alert("فشل التحليل: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', fontWeight: 'bold', fontSize: '2.5rem' }}>ALFACAM PRO</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '30px' }}>نظام التحليل الذكي الرسمي</p>
      
      {!result ? (
        <div style={{ marginTop: '50px' }}>
          {loading ? (
            <p style={{ color: '#E31E24', fontSize: '1.2rem' }}>جاري التحليل... برجاء الانتظار</p>
          ) : (
            <div style={{ border: '2px dashed #1F2937', padding: '60px 20px', borderRadius: '30px', background: '#0B1224', maxWidth: '400px', margin: '0 auto' }}>
              <label style={{ background: '#E31E24', color: 'white', padding: '15px 30px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
                اختر صورة الروشتة
                <input type="file" accept="image/*" onChange={analyzeImage} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#111827', padding: '30px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '450px', margin: '20px auto', textAlign: 'right' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '20px' }}>تم التحليل بنجاح ✨</h2>
          <p style={{ marginBottom: '15px' }}><b>اسم الفحص:</b> {result.identifiedTest}</p>
          <div style={{ background: '#1F2937', padding: '20px', borderRadius: '15px', borderRight: '5px solid #E31E24' }}>
             <p style={{ color: '#E31E24', fontSize: '0.9rem', fontWeight: 'bold' }}>التشخيص التقريبي:</p>
             <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>تحليل صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
