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
        // التأكد من قراءة المفتاح الصحيح من Vercel
        const key = import.meta.env.VITE_GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{ parts: [
              {text: "Analyze this medical document. Return ONLY a JSON object with: identifiedTest, diagnosisAr, diagnosisEn. No extra talk."},
              {inline_data: {mime_type: "image/jpeg", data: base64}}
            ]}]
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || "خطأ في صلاحية المفتاح");
        }

        if (data.candidates && data.candidates[0].content) {
          const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(text));
        }
      } catch (err: any) {
        alert("فشل التحليل: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h1 style={{color: '#E31E24', fontSize: '2rem', marginBottom: '10px'}}>ALFACAM</h1>
      <p style={{color: '#9CA3AF', marginBottom: '30px'}}>ماسح الروشتات الذكي</p>
      
      {!result ? (
        <div style={{marginTop: '20px'}}>
          {loading ? (
            <p style={{color: '#E31E24'}}>جاري تحليل الصورة... برجاء الانتظار</p>
          ) : (
            <div style={{border: '2px dashed #1F2937', padding: '40px', borderRadius: '20px'}}>
              <label style={{background: '#E31E24', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'}}>
                ارفع صورة الروشتة
                <input type="file" onChange={analyzeImage} style={{display: 'none'}} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{background: '#111827', padding: '25px', borderRadius: '20px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right'}}>
          <h2 style={{color: '#10B981', textAlign: 'center'}}>تم التحليل ✨</h2>
          <p><b>الفحص:</b> {result.identifiedTest}</p>
          <div style={{background: '#1F2937', padding: '15px', borderRadius: '12px', marginTop: '10px'}}>
             <p style={{color: '#E31E24', fontSize: '0.8rem', marginBottom: '5px'}}>التشخيص (العربية)</p>
             <p>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: '#374151', color: 'white', border: 'none'}}>مسح صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
