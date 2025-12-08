import React, { useState, useEffect } from 'react';
import AlgorithmSelect from '../components/AlgorithmSelect';
import ResultBox from '../components/ResultBox';
import { connectWebSocket, disconnectWebSocket, sendMessage, encrypt, decrypt } from '../services/cryptoService';

function HomePage() {
  const [method, setMethod] = useState('caesar');
  const [key, setKey] = useState('3');
  const [message, setMessage] = useState('');
  const [clientEncrypted, setClientEncrypted] = useState('');
  const [serverResponse, setServerResponse] = useState('');
  const [serverDecrypted, setServerDecrypted] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Bağlanıyor...');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const methodDetails = {
    caesar: {
      label: 'Anahtar (Kaydırma Sayısı)',
      placeholder: 'Örn: 3',
      defaultKey: '3',
    },
    vigenere: {
      label: 'Anahtar (Kelime)',
      placeholder: 'Örn: ANAHTAR',
      defaultKey: 'KEY',
    },
    xor: {
      label: 'Anahtar (Gizli Sözcük)',
      placeholder: 'Örn: secret',
      defaultKey: 'secret',
    },
  };

  useEffect(() => {
    // WebSocket bağlantısını kur
    connectWebSocket(
      (data) => {
        console.log('📥 Sunucudan mesaj alındı:', data);
        setServerResponse(data.message);
        
        // Sunucudan gelen şifreli mesajı deşifre et
        try {
          const decrypted = decrypt[method](data.message, key);
          setServerDecrypted(decrypted);
        } catch (err) {
          setError('Deşifreleme hatası: ' + err.message);
        }
        
        setIsProcessing(false);
      },
      (err) => {
        console.error('❌ WebSocket hatası:', err);
        setError('Bağlantı hatası: ' + err.message);
        setIsProcessing(false);
      },
      () => {
        setConnectionStatus('Bağlandı ✅');
      }
    );

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    setKey(methodDetails[newMethod].defaultKey);
    setClientEncrypted('');
    setServerResponse('');
    setServerDecrypted('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!message.trim()) {
      setError('Mesaj boş olamaz!');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. İstemcide mesajı şifrele
      const encrypted = encrypt[method](message, key);
      setClientEncrypted(encrypted);
      console.log('🔐 İstemcide şifrelendi:', encrypted);

      // 2. Sunucuya gönder
      const packet = {
        message: encrypted,
        method: method,
        key: method === 'caesar' ? parseInt(key) : key,
      };

      sendMessage(packet);
      console.log('📤 Sunucuya gönderildi:', packet);

    } catch (err) {
      console.error('❌ Hata:', err);
      setError('Şifreleme hatası: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>🔐 Şifreleme ve Deşifreleme Sistemi</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus.includes('✅') ? 'connected' : 'connecting'}`}></span>
          {connectionStatus}
        </div>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="crypto-form">
          <h2>📝 Mesaj Gönder</h2>

          <AlgorithmSelect value={method} onChange={handleMethodChange} />

          <div className="form-group">
            <label htmlFor="key">{methodDetails[method].label}</label>
            <input
              id="key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={methodDetails[method].placeholder}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Mesaj</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              required
              disabled={isProcessing}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isProcessing}>
            {isProcessing ? '⏳ İşleniyor...' : '🚀 Gönder'}
          </button>

          {error && (
            <div className="error-box">
              <span className="error-icon">⚠️</span>
              <p className="error-text">{error}</p>
            </div>
          )}
        </form>

        {/* Sonuçlar */}
        {clientEncrypted && (
          <div className="results-section">
            <div className="result-item">
              <h3>🔒 İstemcide Şifrelendi:</h3>
              <textarea readOnly value={clientEncrypted} className="result-text" />
            </div>

            {serverResponse && (
              <>
                <div className="result-item">
                  <h3>📥 Sunucudan Şifreli Cevap:</h3>
                  <textarea readOnly value={serverResponse} className="result-text" />
                </div>

                {serverDecrypted && (
                  <div className="result-item">
                    <h3>✅ İstemcide Deşifrelendi:</h3>
                    <textarea readOnly value={serverDecrypted} className="result-text" />
                  </div>
                )}
              </>
            )}

            {!serverResponse && isProcessing && (
              <div className="processing-indicator">
                <div className="spinner"></div>
                <p>Sunucu işleniyor...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;




