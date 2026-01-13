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
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // التعديل الجوهري: استخدام النسخة الأحدث والأكثر استقراراً
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const base64Data = (reader.result as string).split(',')[1];
        const prompt = "Analyze this medical prescription. Return ONLY a JSON object: {identifiedTest, diagnosisAr, diagnosisEn}";
        
        const imagePart = {
          inlineData: { data: base64Data, mimeType: "image/jpeg" },
        };

        const response = await model.generateContent([prompt, imagePart]);
        const resultText = response.response.text().replace(/```json|```/g, "").trim();
        
        setResult(JSON.parse(resultText));
      } catch (err: any) {
        // لو لسه فيه مشكلة في الموديل، هنعرض رسالة واضحة عشان نعرف السبب
        alert("تنبيه من جوجل: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#E31E24', fontSize: '2.5rem', fontWeight: 'bold' }}>ALFACAM PRO</h1>
        <p style={{ color: '#9CA3AF' }}>نظام فك رموز الروشتات الطبية</p>
      </header>
      
      {!result ? (
        <main>
          {loading ? (
            <div style={{ padding: '40px' }}>
               <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #E31E24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
               <p style={{ color: '#E31E24' }}>جاري التحليل... ثواني من فضلك</p>
            </div>
          ) : (
            <div style={{ border: '2px dashed #1F2937', padding: '50px 20px', borderRadius: '25px', background: '#0B1224', maxWidth: '400px', margin: '0 auto' }}>
              <label style={{ background: '#E31E24', color: 'white', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                ارفع صورة الروشتة
                <input type="file" accept="image/*" onChange={analyzeImage} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </main>
      ) : (
        <section style={{ background: '#111827', padding: '30px', borderRadius: '20px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '20px' }}>نتيجة التحليل ✨</h2>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>نوع التحليل/الأشعة:</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{result.identifiedTest}</p>
          </div>
          <div style={{ background: '#1F2937', padding: '15px', borderRadius: '12px', borderRight: '5px solid #E31E24' }}>
             <p style={{ color: '#E31E24', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>التشخيص التقريبي:</p>
             <p style={{ lineHeight: '1.6' }}>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{ width: '100%', marginTop: '30px', padding: '12px', background: '#374151', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>فحص روشتة أخرى</button>
        </section>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default App;
