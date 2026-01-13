import React, { useState } from 'react';
// 1. استدعاء المحرك الرسمي الجديد
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeImage = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        
        // 2. استخدام المفتاح اللي إنت مسجله في Vercel
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        
        // 3. تحديد الموديل (Flash هو الأسرع والأفضل حالياً)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Identify this medical prescription or test. Return ONLY a JSON object: {identifiedTest, diagnosisAr, diagnosisEn}";

        // 4. إرسال الطلب بالطريقة الرسمية
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        let text = response.text().replace(/```json|```/g, "").trim();
        
        setResult(JSON.parse(text));
      } catch (err: any) {
        // لو حصل مشكلة، هيدينا رسالة واضحة
        alert("تنبيه: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', fontSize: '2.5rem', fontWeight: 'bold' }}>ALFACAM PRO</h1>
      <p style={{ color: '#9CA3AF' }}>التحليل الذكي المدعوم بمحرك جوجل الرسمي</p>
      
      {!result ? (
        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <div style={{ padding: '40px' }}>
               <p style={{ color: '#E31E24', fontSize: '1.2rem' }}>جاري فحص الروشتة بالمحرك الجديد...</p>
            </div>
          ) : (
            <div style={{ border: '2px dashed #1F2937', padding: '50px 20px', borderRadius: '30px', background: '#0B1224' }}>
              <label style={{ background: '#E31E24', color: 'white', padding: '18px 35px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
                رفع الصورة للتحليل
                <input type="file" accept="image/*" onChange={analyzeImage} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#111827', padding: '30px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '25px' }}>تم التحليل بنجاح ✨</h2>
          <p><b>اسم الفحص:</b> {result.identifiedTest}</p>
