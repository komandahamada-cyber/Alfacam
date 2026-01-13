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
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        // طلب مباشر بأبسط تنسيق ممكن لجوجل
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Analyze this medical document. Return only a JSON object with: identifiedTest, diagnosisAr, diagnosisEn. No extra text." },
                { inline_data: { mime_type: "image/jpeg", data: base64 } }
              ]
            }]
          })
        });
        
        const data = await resp.json();
        
        if (data.candidates && data.candidates[0].content) {
          const rawText = data.candidates[0].content.parts[0].text;
          const cleanJson = rawText.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(cleanJson));
          setStatus('SUCCESS');
        } else {
          console.error("API Error:", data);
          throw new Error("Empty response");
        }
      } catch (err) {
        alert("فشل التحليل: تأكد أن المفتاح مفعل وأن الصورة واضحة.");
        setStatus('IDLE');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', fontSize: '2.2rem', fontWeight: 'bold' }}>ALFACAM</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '30px' }}>التحليل الذكي للروشتات</p>
      
      {status === 'IDLE' && (
        <div style={{ border: '2px dashed #1F2937', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <input type="file" accept="image/*" onChange={analyze} id="upload" style={{ display: 'none' }} />
          <label htmlFor="upload" style={{ backgroundColor: '#E31E24', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            اضغط لرفع الروشتة
          </label>
        </div>
      )}

      {status === 'ANALYZING' && <p style={{ color: '#E31E24' }}>جاري التحليل... يرجى الانتظار</p>}

      {status === 'SUCCESS' && result && (
        <div style={{ background: '#111827', padding: '25px', borderRadius: '20px', border: '1px solid #374151', width: '100%', maxWidth: '450px', textAlign: 'right' }}>
          <h3 style={{ color: '#10B981', textAlign: 'center' }}>تم التحليل</h3>
          <p><b>نوع الفحص:</b> {result.identifiedTest}</p>
          <hr style={{ borderColor: '#1F2937' }} />
          <p><b>التشخيص (العربية):</b> {result.diagnosisAr}</p>
          <p style={{ textAlign: 'left' }}><b>Diagnosis (EN):</b> {result.diagnosisEn}</p>
          <button onClick={() => setStatus('IDLE')} style={{ width: '100%', padding: '10px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>إعادة</button>
        </div>
      )}
    </div>
  );
};

export default App;
