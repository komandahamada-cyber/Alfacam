import React, { useState } from 'react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const analyzeImage = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      // التوكن الخاص بك
      const token = "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"; 
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
      setResult(res[0]?.generated_text || "لم يتم التعرف على النص");
    } catch (err) {
      alert("حدث خطأ في الاتصال بالمحرك");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#070D1D', color: 'white', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: '#E31E24' }}>ALFACAM HF</h1>
      {!result ? (
        <div>
          {loading ? <p>جاري التحليل...</p> : <input type="file" accept="image/*" onChange={analyzeImage} />}
        </div>
      ) : (
        <div style={{ background: '#111827', padding: '20px', borderRadius: '15px' }}>
          <h2>النتيجة:</h2>
          <p>{result}</p>
          <button onClick={() => setResult("")} style={{ marginTop: '10px' }}>إعادة</button>
        </div>
      )}
    </div>
  );
};

export default App;
