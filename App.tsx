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
        // نداء مباشر للـ API بدون مكتبات معقدة
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Analyze this medical image. Return JSON with fields: identifiedTest, diagnosisAr, diagnosisEn." },
              { inline_data: { mime_type: "image/jpeg", data: base64 } }
            ]}]
          })
        });
        
        const data = await resp.json();
        const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        setResult(JSON.parse(text));
        setStatus('SUCCESS');
      } catch (err) {
        alert("خطأ في التحليل، تأكد من مفتاح API");
        setStatus('IDLE');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', marginBottom: '10px' }}>ALFACAM</h1>
      
      {status === 'IDLE' && (
        <div style={{ textAlign: 'center' }}>
          <p>ارفع صورة الروشتة للتحليل</p>
          <input type="file" accept="image/*" onChange={analyze} style={{ marginTop: '20px' }} />
        </div>
      )}

      {status === 'ANALYZING' && <p>جاري التحليل... انتظر لحظة</p>}

      {status === 'SUCCESS' && result && (
        <div style={{ background: '#111827', padding: '20px', borderRadius: '15px', marginTop: '20px', width: '100%', maxWidth: '400px' }}>
          <h3 style={{ color: '#E31E24' }}>النتيجة:</h3>
          <p><b>الفحص:</b> {result.identifiedTest}</p>
          <p><b>التشخيص:</b> {result.diagnosisAr}</p>
          <p><b>Diagnosis:</b> {result.diagnosisEn}</p>
          <button onClick={() => setStatus('IDLE')} style={{ marginTop: '10px', width: '100%' }}>إعادة</button>
        </div>
      )}
    </div>
  );
};

export default App;
