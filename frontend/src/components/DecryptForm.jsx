// frontend/src/components/DecryptForm.jsx
import React, { useState } from 'react';
import { decryptMessage } from '../services/cryptoService.jsx';
import AlgorithmSelect from './AlgorithmSelect.jsx';
import ResultBox from './ResultBox.jsx';
// import './Form.css';

// Hangi yöntem için hangi etiket ve placeholder'ın kullanılacağını tanımla
const methodDetails = {
  caesar: {
    label: 'Anahtar (Kaydırma Sayısı)',
    placeholder: 'Örn: 3',
  },
  vigenere: {
    label: 'Anahtar (Kelime)',
    placeholder: 'Örn: ANAHTAR',
  },
  xor: {
    label: 'Anahtar (Gizli Sözcük)',
    placeholder: 'Örn: secret',
  },
};

function DecryptForm() {
  const [method, setMethod] = useState('caesar');
  const [key, setKey] = useState('3');
  const [cipherText, setCipherText] = useState(''); 

  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    // Yöntem değiştiğinde, o yönteme uygun varsayılan bir anahtar ayarla
    if (newMethod === 'caesar') {
      setKey('3');
    } else if (newMethod === 'vigenere') {
      setKey('KEY');
    } else if (newMethod === 'xor') {
      setKey('secret');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const data = await decryptMessage(method, cipherText, key);
      setResult(data.result);
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crypto-form">
      <h2><span role="img" aria-label="open-lock">🔓</span> Sunucu - Mesaj Deşifreleme</h2>
      
      {/* Güncellenmiş onChange handler'ını buraya ver */}
      <AlgorithmSelect value={method} onChange={handleMethodChange} />

      {/* --- GÜNCELLENEN BÖLÜM --- */}
      <div className="form-group">
        <label htmlFor="key-decrypt">{methodDetails[method].label}</label>
        <input
          id="key-decrypt"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={methodDetails[method].placeholder}
          required
        />
      </div>
      {/* --- GÜNCELLEME SONU --- */}

      <div className="form-group">
        <label htmlFor="cipher-message">Şifreli Mesaj</label>
        <textarea
          id="cipher-message"
          value={cipherText}
          onChange={(e) => setCipherText(e.target.value)}
          placeholder="Deşifrelenecek mesajı buraya yapıştırın..."
          required
        />
      </div>

      <button type="submit" className="btn-secondary" disabled={isLoading}>
        {isLoading ? 'Deşifreleniyor...' : 'Deşifrele'}
      </button>

      <ResultBox result={result} error={error} />
    </form>
  );
}

export default DecryptForm;