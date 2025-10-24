// frontend/src/components/AlgorithmSelect.jsx
import React from 'react';

function AlgorithmSelect({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="method">Şifreleme Yöntemi</label>
      <select id="method" value={value} onChange={onChange}>
        <option value="caesar">Caesar Cipher (Kaydırma)</option>
        <option value="vigenere">Vigenere Cipher</option>
        <option value="xor">XOR Cipher</option> 
      </select>
    </div>
  );
}

export default AlgorithmSelect;