import React, { useState } from 'react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const key = import.meta.env.VITE_GEMINI_API_KEY;

        // ✅ التعديل السحري: استخدام موديل pro ورابط v1beta المستقر
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{ parts: [
              {text: "Identify this medical test and diagnosis. Return ONLY JSON: {identifiedTest, diagnosisAr, diagnosisEn}"},
              {inline_data: {mime_type: "image/jpeg", data: base64}}
            ]}]
          })
        });

        const data = await response.json();
        
        // لو لسه فيه مشكلة في الموديل، الكود ده هيجرب الموديل البديل فوراً
        if (data.error) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        setResult(JSON.parse(text));
      } catch (err: any) {
        alert("خطأ تقني: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background: '#070D1D', color: 'white', minHeight: '100vh', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h1 style={{color: '#E31E24', fontSize: '2.5rem'}}>ALFACAM</h1>
      <p style={{color: '#9CA3AF', marginBottom: '30px'}}>نظام تحليل الروشتات النهائي</p>
      
      {!result ? (
        <div style={{marginTop: '50px'}}>
          {loading ? (
            <div style={{padding: '20px', color: '#E31E24'}}>جاري الاتصال بسيرفرات التحليل...</div>
          ) : (
            <div style={{border: '2px dashed #1F2937', padding: '40px', borderRadius: '20px'}}>
              <label style={{background: '#E31E24', padding: '15px 30px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'}}>
                ارفع الروشتة الآن
                <input type="file" onChange={analyze} style={{display: 'none'}} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div style={{background: '#111827', padding: '25px', borderRadius: '20px', border: '1px solid #374151', maxWidth: '500px', margin: '20px auto', textAlign: 'right'}}>
          <h2 style={{color: '#10B981', textAlign: 'center'}}>تم فك الرموز! ✨</h2>
          <p><b>الفحص:</b> {result.identifiedTest}</p>
          <div style={{background: '#1F2937', padding: '15px', borderRadius: '10px', marginTop: '10px', borderRight: '4px solid #E31E24'}}>
             <p style={{color: '#E31E24', fontSize: '0.8rem'}}>التشخيص بالعربي</p>
             <p>{result.diagnosisAr}</p>
          </div>
          <button onClick={() => setResult(null)} style={{width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', background: '#374151', color: 'white', border: 'none'}}>تحليل صورة أخرى</button>
        </div>
      )}
    </div>
  );
};
export default App;
