import React, { useState } from 'react';

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
        const base64 = (reader.result as string).split(',')[1];
        const key = import.meta.env.VITE_GEMINI_API_KEY;

        // ✅ استخدام الموديل المستقر gemini-1.5-flash مع الرابط v1
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "This is a medical prescription. Please identify the requested test and provide a brief diagnosis in both Arabic and English. Return the response as a valid JSON object only with these fields: identifiedTest, diagnosisAr, diagnosisEn." },
                { inline_data: { mime_type: "image/jpeg", data: base64 } }
              ]
            }]
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
          let text = data.candidates[0].content.parts[0].text;
          // تنظيف النص من أي علامات Markdown
          text = text.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(text));
        }
      } catch (err: any) {
        alert("عذراً، واجهنا مشكلة: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#E31E24', fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>ALFACAM</h1>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem' }}>التحليل الذكي للروشتات والتحاليل الطبية</p>
      </header>
      
      {!result ? (
        <main style={{ marginTop: '20px' }}>
          {loading ? (
            <div style={{ padding: '40px' }}>
               <div style={{ width: '50px', height: '50px', border: '5px solid #1F2937', borderTopColor: '#E31E24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
               <p style={{ color: '#E31E24', fontSize: '1.2rem', fontWeight: '500' }}>جاري فحص الروشتة... برجاء الانتظار</p>
            </div>
          ) : (
            <div style={{ border: '2px dashed #374151', padding: '60px 20px', borderRadius: '30px', background: '#0B1224', maxWidth: '450px', margin: '0 auto' }}>
              <p style={{ marginBottom: '30px', color: '#D1D5DB' }}>قم برفع أو التقاط صورة واضحة للروشتة</p>
              <label style={{ background: '#E31E24', color: 'white', padding: '18px 40px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.3s', boxShadow: '0 4px 20px rgba(227, 30, 36, 0.4)' }}>
                إدراج صورة
                <input type="file" accept="image/*" onChange={analyzeImage} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </main>
      ) : (
        <div style={{ background: '#111827', padding: '35px 25px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '550px', margin: '0 auto', textAlign: 'right', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
          <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }}>نتيجة التحليل الذكي ✨</h2>
          
          <div style={{ marginBottom: '25px', borderBottom: '1px solid #1F2937', paddingBottom: '15px' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>نوع الفحص المطلـوب:</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>{result.identifiedTest}</p>
          </div>

          <div style={{ background: '#1F2937', padding: '20px', borderRadius: '15px', marginBottom: '20px', borderRight: '5px solid #E31E24' }}>
             <p style={{ color: '#E31E24', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>التشخيص التقريبي (بالعربية)</p>
             <p style={{ fontSize: '1.15rem', lineHeight: '1.6' }}>{result.diagnosisAr}</p>
          </div>

          <div style={{ background: '#1F2937', padding: '20px', borderRadius: '15px', textAlign: 'left', borderLeft: '5px solid #E31E24' }}>
             <p style={{ color: '#E31E24', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>PRELIMINARY DIAGNOSIS (EN)</p>
             <p style={{ fontSize: '1.15rem', lineHeight: '1.6' }}>{result.diagnosisEn}</p>
          </div>

          <button onClick={() => setResult(null)} style={{ width: '100%', marginTop: '30px', padding: '15px', borderRadius: '12px', background: '#374151', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>فحص روشتة أخرى</button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default App;
