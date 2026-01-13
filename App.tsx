import React, { useState } from 'react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const analyzeImage = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult("");

    try {
      // سحب التوكن من إعدادات Vercel اللي لسه ضايفينها
      const token = import.meta.env.VITE_HF_TOKEN; 
      const data = await file.arrayBuffer();
      
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
          headers: { Authorization: `Bearer ${token}` },
          method: "POST",
          body: data,
        }
      );

      const res = await response.json();

      if (res.error) {
         // لو المحرك لسه بيحمل (Warm-up)
         alert("المحرك بيفتح، جرب كمان 10 ثواني");
         return;
      }

      setResult(res[0]?.generated_text || "لم أستطع تحليل الصورة");
    } catch (err) {
      alert("حدث خطأ في الاتصال بالمحرك"); //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: '#E31E24' }}>ALFACAM HF</h1>
      {!result ? (
        <div>
          {loading ? <p>جاري التحليل...</p> : (
             <div style={{ border: '2px dashed #1F2937', padding: '40px', borderRadius: '20px' }}>
                <input type="file" accept="image/*" onChange={analyzeImage} />
             </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#111827', padding: '30px', borderRadius: '20px', border: '1px solid #374151' }}>
          <h2>تم التحليل:</h2>
          <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>{result}</p>
          <button onClick={() => setResult("")} style={{ background: '#E31E24', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px' }}>إعادة</button>
        </div>
      )}
    </div>
  );
};

export default App;
