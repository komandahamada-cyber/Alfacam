import React, { useState } from 'react';

const App = () => {
  return (
    <div style={{ backgroundColor: '#070D1D', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#E31E24' }}>Alfacam Scanner</h1>
      <p>الموقع يعمل بنجاح الآن!</p>
      <input type="file" accept="image/*" capture="environment" style={{ marginTop: '20px' }} />
    </div>
  );
};

export default App;
