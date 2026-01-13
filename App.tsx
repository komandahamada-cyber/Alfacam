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

        // ✅ التعديل الجذري: استخدام الإصدار v1 والموديل المستقر
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{ parts: [
              {text: "Analyze this medical prescription. Return ONLY a JSON object with: identifiedTest, diagnosisAr, diagnosisEn."},
              {inline_data: {mime_type: "image/jpeg", data: base64}}
            ]}]
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
          let text = data.candidates[0].content.parts[0].text;
          // تنظيف الرد لتحويله لـ JSON
          text = text.replace(/```json|```/g, "").trim();
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
      <h1 style={{color: '#E31E24', fontSize: '2.5rem', fontWeight: 'bold'}}>ALFACAM</h1>
      <p style={{color: '#9CA3AF', marginBottom: '40px'}}>ماسح الروشتات الطبي الذكي</p>
      
      {!result ? (
        <div style={{marginTop: '20px'}}>
          {loading ? (
            <div style={{padding: '40px'}}>
               <p style={{color: '#E31E24', fontSize: '1.2rem'}}>جاري قراءة الروشتة...</p>
            </div>
          ) : (
            <div style={{border: '2px dashed #1F2937', padding: '50px 20px', borderRadius: '30px', background: '#0B1224'}}>
              <label style={{background: '#E31E24', color: 'white', padding: '18px 35px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(227, 30, 36, 0.3)'}}>
                التقط صورة الروشتة
                <input type="file" accept="image/*" onChange={analyzeImage} style={{display: 'none'}} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{background: '#111827', padding: '30px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
          <h2 style={{color: '#10B981', textAlign: 'center', marginBottom: '25px'}}>تم التحليل بنجاح ✨</h2>
          
          <div style={{marginBottom: '20px'}}>
            <span style={{color: '#9CA3AF', fontSize: '0.9rem'}}>اسم الفحص:</span>
            <p style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#fff', marginTop: '5px'}}>{result.identifiedTest}</p>
          </div>

          <div style={{background: '#1F2937', padding: '15px', borderRadius: '15px', marginBottom: '15px', borderRight: '4px solid #E31E24'}}>
             <p style={{color: '#E31E24', fontSize: '0.8rem', marginBottom: '5px'}}>التشخيص (العربية)</p>
             <p style={{fontSize: '1.1rem'}}>{result.diagnosisAr}</p>
          </div>

          <div style={{background: '#1F2937', padding: '15px', borderRadius: '15px', textAlign: 'left', borderLeft: '4px solid #E31E24'}}>
             <p style={{color: '#E31E24', fontSize: '0.8rem', marginBottom: '5px'}}>DIAGNOSIS (EN)</p>
             <p style={{fontSize: '1.1rem'}}>{result.diagnosisEn}</p>
          </div>

          <button onClick={() => setResult(null)} style={{width: '100%', marginTop: '30px', padding: '15px', borderRadius: '12px', background: '#374151', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}>تحليل صورة أخرى</button>
        </div>
      )}
    </div>
  );
};

export default App;
