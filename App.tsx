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
        
        // جلب المفتاح المسمى VITE_GEMINI_API_KEY من إعدادات Vercel
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Analyze this medical document. Return JSON ONLY with fields: identifiedTest, diagnosisAr, diagnosisEn, descriptionAr, descriptionEn. Respond in JSON format only." },
              { inline_data: { mime_type: "image/jpeg", data: base64 } }
            ]}]
          })
        });
        
        const data = await resp.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const rawText = data.candidates[0].content.parts[0].text;
          const cleanJson = rawText.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(cleanJson));
          setStatus('SUCCESS');
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        console.error(err);
        alert("حدث خطأ في الاتصال. تأكد من جودة الصورة.");
        setStatus('IDLE');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', fontSize: '2.5rem', marginBottom: '10px' }}>ALFACAM</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '40px' }}>التحليل الذكي للروشتات الطبية</p>
      
      {status === 'IDLE' && (
        <div style={{ border: '2px dashed #1F2937', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <p style={{ marginBottom: '20px' }}>ارفع صورة الروشتة الآن</p>
          <label style={{ backgroundColor: '#E31E24', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
            اختر صورة
            <input type="file" accept="image/*" onChange={analyze} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {status === 'ANALYZING' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #E31E24', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p>جاري فك رموز الروشتة...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {status === 'SUCCESS' && result && (
        <div style={{ background: '#111827', padding: '30px', borderRadius: '24px', border: '1px solid #374151', width: '100%', maxWidth: '500px', textAlign: 'right' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '20px' }}>تم التحليل بنجاح ✨</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>نوع الفحص / الروشتة:</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>{result.identifiedTest}</p>
          </div>

          <div style={{ background: '#1F2937', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <p style={{ color: '#E31E24', fontSize: '0.8rem', marginBottom: '5px', textAlign: 'left' }}>DIAGNOSIS (EN)</p>
            <p style={{ textAlign: 'left', fontWeight: '500' }}>{result.diagnosisEn}</p>
          </div>

          <div style={{ background: '#1F2937', padding: '15px', borderRadius: '12px' }}>
            <p style={{ color: '#E31E24', fontSize: '0.8rem', marginBottom: '5px' }}>التشخيص (العربية)</p>
            <p style={{ fontWeight: '500' }}>{result.diagnosisAr}</p>
          </div>

          <button onClick={() => setStatus('IDLE')} style={{ marginTop: '30px', width: '100%', padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>تحليل صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
