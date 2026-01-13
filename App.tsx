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
      const base64 = (reader.result as string).split(',')[1];
      const key = import.meta.env.VITE_GEMINI_API_KEY;

      // مصفوفة بالموديلات المحتملة لتجربتها بالترتيب
      const models = [
        "gemini-1.5-flash",
        "gemini-pro-vision",
        "gemini-1.5-pro"
      ];

      for (const modelName of models) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              contents: [{ parts: [
                {text: "This is a medical report. Return ONLY JSON: {identifiedTest, diagnosisAr, diagnosisEn}"},
                {inline_data: {mime_type: "image/jpeg", data: base64}}
              ]}]
            })
          });

          const data = await response.json();
          if (data.error) continue; // لو الموديل ده مش متاح جرب اللي بعده

          const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
          setResult(JSON.parse(text));
          setLoading(false);
          return; // نجحنا! اخرج من الحلقة
        } catch (err) {
          continue;
        }
      }
      alert("عذراً، جميع الموديلات غير متاحة حالياً في حسابك.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h1 style={{color: '#E31E24', fontSize: '2.5rem', fontWeight: 'bold'}}>ALFACAM</h1>
      <p style={{color: '#9CA3AF'}}>نظام التحليل الشامل</p>
      
      {!result ? (
        <div style={{marginTop: '30px'}}>
          {loading ? (
            <p style={{color: '#E31E24'}}>جاري محاولة الاتصال بأكثر من موديل...</p>
          ) : (
            <div style={{border: '2px dashed #1F2937', padding: '50px', borderRadius: '30px'}}>
              <label style={{background: '#E31E24', padding: '15px 30px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'}}>
                ارفع الروشتة الآن
                <input type="file" onChange={analyzeImage} style={{display: 'none'}} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{background: '#111827', padding: '25px', borderRadius: '25px', border: '1px solid #374151', maxWidth: '500px', margin: '0 auto', textAlign: 'right'}}>
          <h2 style={{color: '#10B981', textAlign: 'center'}}>تم التحليل بنجاح ✨</h2>
          <p><b>الفحص:</b> {result.identifiedTest}</p>
          <div style={{background: '#1F2937', padding: '15px', borderRadius: '15px', marginTop: '10px', borderRight: '4px solid #E31E24'}}>
             <p style={{color: '#E31E24', fontSize: '0.8rem'}}>التشخيص بالعربي</p>
             <p>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: '#374151', color: 'white', border: 'none'}}>إعادة المحاولة</button>
        </div>
      )}
    </div>
  );
};
export default App;
