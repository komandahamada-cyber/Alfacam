import React, { useState } from 'react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);

  const startAnalysis = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        
        // طلب مبسط جداً لا يمكن رفضه
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [{ parts: [
              {text: "What is this medical document? answer in 10 words only."},
              {inline_data: {mime_type: "image/jpeg", data: base64}}
            ]}]
          })
        });

        const data = await response.json();
        setRes(data.candidates[0].content.parts[0].text);
      } catch (err) {
        alert("فشل نهائي - تأكد من صلاحية المفتاح");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background: '#070D1D', color: 'white', minHeight: '100vh', padding: '20px', textAlign: 'center'}}>
      <h1 style={{color: '#E31E24'}}>ALFACAM BETA</h1>
      <input type="file" onChange={startAnalysis} />
      {loading && <p>جاري التحقق...</p>}
      {res && <div style={{marginTop: '20px', padding: '20px', background: '#111827'}}>{res}</div>}
    </div>
  );
};
export default App;
