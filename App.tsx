import React, { useState } from 'react';

const App = () => {
  const [status, setStatus] = useState('IDLE');
  const [result, setResult] = useState<any>(null);

  const analyze = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setStatus('ANALYZING');
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        // ✅ استخدام المفتاح من إعدادات Vite/Vercel بشكل صحيح
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Analyze this medical document. Return JSON only with: identifiedTest, diagnosisAr, diagnosisEn." },
              { inline_data: { mime_type: "image/jpeg", data: base64 } }
            ]}]
          })
        });
        
        const data = await resp.json();
        
        // التحقق من وجود رد سليم من جوجل
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(text));
          setStatus('SUCCESS');
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        alert("حدثت مشكلة في الاتصال. تأكد من إعدادات المفتاح في Vercel وإعادة بناء الموقع.");
        setStatus('IDLE');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#E31E24' }}>ALFACAM</h1>
      
      {status === 'IDLE' && (
        <>
          <p>ارفع صورة الروشتة للتحليل</p>
          <input type="file" accept="image/*" onChange={analyze} style={{ marginTop: '20px' }} />
        </>
      )}

      {status === 'ANALYZING' && <p>جاري التحليل... انتظر لحظة</p>}

      {status === 'SUCCESS' && result && (
        <div style={{ background: '#111827', padding: '20px', borderRadius: '15px', marginTop: '20px', maxWidth: '400px', textAlign: 'right' }}>
          <h3 style={{ color: '#E31E24', textAlign: 'center' }}>النتيجة</h3>
          <p><b>الفحص:</b> {result.identifiedTest}</p>
          <p><b>التشخيص (Ar):</b> {result.diagnosisAr}</p>
          <p dir="ltr" style={{ textAlign: 'left' }}><b>Diagnosis (En):</b> {result.diagnosisEn}</p>
          <button onClick={() => setStatus('IDLE')} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#E31E24', color: 'white', border: 'none', borderRadius: '8px' }}>تحليل صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
