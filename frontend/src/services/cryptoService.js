// WebSocket bağlantısı için servis

let ws = null;
let reconnectInterval = null;

// WebSocket bağlantısı kur
export function connectWebSocket(onMessage, onError, onOpen) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  // Önce varsa eski bağlantıyı kapat
  if (ws) {
    ws.close();
  }

  ws = new WebSocket('ws://localhost:5000/ws');

  ws.onopen = () => {
    console.log('✅ WebSocket bağlantısı kuruldu!');
    if (onOpen) onOpen();
    // Yeniden bağlanma aralığını temizle
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📥 Sunucudan gelen mesaj:', data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error('❌ Mesaj parse hatası:', error);
      if (onError) onError(error);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket hatası:', error);
    if (onError) onError(error);
  };

  ws.onclose = () => {
    console.log('⚠️ WebSocket bağlantısı kapandı');
    // Yeniden bağlanmayı dene
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        console.log('🔄 Bağlantı yeniden deneniyor...');
        connectWebSocket(onMessage, onError, onOpen);
      }, 3000);
    }
  };

  return ws;
}

// WebSocket bağlantısını kapat
export function disconnectWebSocket() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}

// Mesaj gönder
export function sendMessage(packet) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket bağlantısı yok!');
  }
  const message = JSON.stringify(packet);
  console.log('📤 Gönderilen mesaj:', message);
  ws.send(message);
}

// İstemci tarafında şifreleme algoritmaları

function caesarEncrypt(text, shift) {
  let result = "";
  shift = parseInt(shift);
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char >= 'a' && char <= 'z') {
      char = String.fromCharCode(((char.charCodeAt(0) - 'a'.charCodeAt(0) + shift) % 26) + 'a'.charCodeAt(0));
    } else if (char >= 'A' && char <= 'Z') {
      char = String.fromCharCode(((char.charCodeAt(0) - 'A'.charCodeAt(0) + shift) % 26) + 'A'.charCodeAt(0));
    }
    result += char;
  }
  return result;
}

function caesarDecrypt(text, shift) {
  let result = "";
  shift = parseInt(shift);
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char >= 'a' && char <= 'z') {
      char = String.fromCharCode(((char.charCodeAt(0) - 'a'.charCodeAt(0) - shift + 26) % 26) + 'a'.charCodeAt(0));
    } else if (char >= 'A' && char <= 'Z') {
      char = String.fromCharCode(((char.charCodeAt(0) - 'A'.charCodeAt(0) - shift + 26) % 26) + 'A'.charCodeAt(0));
    }
    result += char;
  }
  return result;
}

function vigenereEncrypt(plaintext, key) {
  key = key.toLowerCase();
  let result = "";
  let keyIndex = 0;
  
  for (let i = 0; i < plaintext.length; i++) {
    let char = plaintext[i];
    if (char.match(/[a-zA-Z]/)) {
      let base = char === char.toUpperCase() ? 'A' : 'a';
      let shift = key.charCodeAt(keyIndex % key.length) - 'a'.charCodeAt(0);
      char = String.fromCharCode(((char.charCodeAt(0) - base.charCodeAt(0) + shift) % 26) + base.charCodeAt(0));
      keyIndex++;
    }
    result += char;
  }
  return result;
}

function vigenereDecrypt(ciphertext, key) {
  key = key.toLowerCase();
  let result = "";
  let keyIndex = 0;
  
  for (let i = 0; i < ciphertext.length; i++) {
    let char = ciphertext[i];
    if (char.match(/[a-zA-Z]/)) {
      let base = char === char.toUpperCase() ? 'A' : 'a';
      let shift = key.charCodeAt(keyIndex % key.length) - 'a'.charCodeAt(0);
      char = String.fromCharCode(((char.charCodeAt(0) - base.charCodeAt(0) - shift + 26) % 26) + base.charCodeAt(0));
      keyIndex++;
    }
    result += char;
  }
  return result;
}

function xorEncrypt(plaintext, key) {
  const textBytes = new TextEncoder().encode(plaintext);
  const keyBytes = new TextEncoder().encode(key);
  const encrypted = new Uint8Array(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

function xorDecrypt(ciphertext, key) {
  try {
    const encrypted = atob(ciphertext);
    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Geçersiz şifreli metin: ' + error.message);
  }
}

// Şifreleme fonksiyonları
export const encrypt = {
  caesar: caesarEncrypt,
  vigenere: vigenereEncrypt,
  xor: xorEncrypt,
};

// Deşifreleme fonksiyonları
export const decrypt = {
  caesar: caesarDecrypt,
  vigenere: vigenereDecrypt,
  xor: xorDecrypt,
};
