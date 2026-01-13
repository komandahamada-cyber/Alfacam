import React, { useState } from 'react';

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
        const base64 = (reader.result as string).split(',')[1];
        const key = import.meta.env.VITE_GEMINI_API_KEY;

        // ✅ التغيير الجوهري: استخدام النسخة v1 المستقرة والموديل الأكثر توافقاً
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Analyze this medical prescription. Provide the test name and a brief diagnosis in Arabic and English as JSON: {identifiedTest, diagnosisAr, diagnosisEn}" },
                { inline_data: { mime_type: "image/jpeg", data: base64 } }
              ]
            }]
          })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          let text = data.candidates[0].content.parts[0].text;
          text = text.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(text));
        }
      } catch (err: any) {
        // إذا فشل الموديل القديم، سنقوم بمحاولة أخيرة باستخدام flash بنسخة مستقرة
        alert("تنبيه: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E31E24', fontSize: '2.5rem', marginBottom: '10px' }}>ALFACAM</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '40px' }}>نظام فحص الروشتات - الإصدار المستقر</p>
      
      {!result ? (
        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <div style={{ padding: '40px' }}>
               <p style={{ color: '#E31E24', fontSize: '1.2rem' }}>جاري التحليل عبر الموديل المستقر...</p>
            </div>
          ) : (
            <div style={{ border: '2px dashed #1F2937', padding: '50px 20px', borderRadius: '30px', background: '#0B1224' }}>
              <label style={{ background: '#E31E24', color: 'white', padding: '18px 35px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
                رفع الصورة الآن
                <input type="file" accept="image/*" onChange={analyzeImage} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#111827', padding: '30px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '25px' }}>تم التحليل ✨</h2>
          <p><b>اسم الفحص:</b> {result.identifiedTest}</p>
          <div style={{ background: '#1F2937', padding: '15px', borderRadius: '15px', marginTop: '15px', borderRight: '4px solid #E31E24' }}>
             <p style={{ color: '#E31E24', fontSize: '0.8rem' }}>التشخيص (Ar)</p>
             <p>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{ width: '100%', marginTop: '30px', padding: '15px', borderRadius: '12px', background: '#374151', color: 'white', border: 'none', cursor: 'pointer' }}>فحص صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
