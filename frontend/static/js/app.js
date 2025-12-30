/**
 * Main application JavaScript for Crypto Chat - Kararlı ve Güncel Versiyon
 */
const socket = io();

// Durum değişkenleri
let symmetricEncryption = null;
let asymmetricEncryption = null;
let symmetricKey = null;
let publicKey = null;
let privateKey = null;
let serverPublicKey = null;

// Latency Measurement
let lastSendTime = 0;

// UI Elemanları
const symmetricAlgorithmSelect = document.getElementById('symmetric-algorithm');
const asymmetricAlgorithmSelect = document.getElementById('asymmetric-algorithm');
const implementationSelect = document.getElementById('implementation');
const generateKeysBtn = document.getElementById('generate-keys-btn');
const applySettingsBtn = document.getElementById('apply-settings-btn');
const keyStatusDiv = document.getElementById('key-status');
const connectionStatusDiv = document.getElementById('connection-status');
const latencyDisplay = document.getElementById('latency-display');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const sendBtn = document.getElementById('send-btn');
const messageDetailsDiv = document.getElementById('message-details');

// --- DURUM YÖNETİMİ (RESET) ---

// Algoritma veya yöntem değiştiğinde eski anahtarları ve nesneleri temizle
const resetEncryptionState = () => {
    serverPublicKey = null;
    symmetricKey = null;
    publicKey = null;
    privateKey = null;
    symmetricEncryption = null;
    asymmetricEncryption = null;

    keyStatusDiv.innerHTML = '<span style="color: #e67e22;">⚠ Ayarlar değişti, tekrar anahtar üretmelisiniz.</span>';
    console.log("Algoritma değiştiği için durum sıfırlandı.");
};

// Seçim kutuları değiştiğinde sıfırlama fonksiyonunu çalıştır
symmetricAlgorithmSelect.addEventListener('change', resetEncryptionState);
asymmetricAlgorithmSelect.addEventListener('change', resetEncryptionState);
implementationSelect.addEventListener('change', resetEncryptionState);

// --- SOCKET OLAYLARI ---

socket.on('connect', () => updateConnectionStatus(true));
socket.on('disconnect', () => updateConnectionStatus(false));

socket.on('error', (data) => {
    showMessage('Hata', data.message, 'error');
    console.error("Sistem Hatası:", data.message);
});

socket.on('server_public_key', async (data) => {
    try {
        console.log('Sunucu genel anahtarı alındı.');
        serverPublicKey = base64ToUint8Array(data.public_key);
        showMessage('Sistem', `Sunucu anahtarı alındı (${data.algorithm.toUpperCase()})`, 'system');

        // Eğer reset sonrası nesne null ise yeniden oluştur
        if (!asymmetricEncryption) {
            asymmetricEncryption = createAsymmetricEncryption(asymmetricAlgorithmSelect.value, 'lib');
        }

        // Anahtar geldikten sonra ayarları gönder
        await processAndSendSettings();
    } catch (error) {
        console.error('Public key işleme hatası:', error);
    }
});

socket.on('settings_confirmed', (data) => {
    showMessage('Sistem', 'Şifreleme ayarları başarıyla doğrulandı!', 'system');
});

socket.on('message_response', async (data) => {
    try {
        const latency = performance.now() - lastSendTime;
        if (latencyDisplay) latencyDisplay.innerText = `Gecikme: ${latency.toFixed(2)} ms`;

        let decryptedPayloadStr;

        // Sunucudan gelen ŞİFRELİ mesajı yerel anahtarımızla çözüyoruz
        if (implementationSelect.value === 'lib') {
            decryptedPayloadStr = await symmetricEncryption.decrypt(data.encrypted_payload, symmetricKey);
        } else {
            decryptedPayloadStr = symmetricEncryption.decrypt(data.encrypted_payload, symmetricKey);
        }

        // "+..." önekini kaldır ve JSON bulmaya çalış
        const jsonStartIndex = decryptedPayloadStr.indexOf('{');
        const jsonEndIndex = decryptedPayloadStr.lastIndexOf('}');

        let payloadString = decryptedPayloadStr;
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            payloadString = decryptedPayloadStr.substring(jsonStartIndex, jsonEndIndex + 1);
        } else if (decryptedPayloadStr.startsWith('+')) {
            payloadString = decryptedPayloadStr.substring(1);
        }

        let payload;
        try {
            payload = JSON.parse(payloadString);
        } catch (e) {
            // Eski format veya düz metin
            payload = { type: 'text', content: decryptedPayloadStr.startsWith('+') ? decryptedPayloadStr.substring(1) : decryptedPayloadStr };
        }

        if (payload.type === 'text') {
            showMessage('Sunucu', payload.content, 'received', payload.fileName);
        } else if (payload.type === 'image') {
            showMessage('Sunucu', `<img src="${payload.content}" style="max-width: 200px; border-radius: 5px;">`, 'received', payload.fileName);
        } else if (payload.type === 'file') {
            showMessage('Sunucu', `<a href="${payload.content}" download="${payload.fileName || 'dosya'}">📄 ${payload.fileName || 'Dosya İndir'}</a>`, 'received');
        }

        messageDetailsDiv.innerHTML = `<strong>Son Gelen:</strong><br><small>Payload: ${data.encrypted_payload.substring(0, 20)}...</small>`;
    } catch (error) {
        console.error("Mesaj çözme hatası:", error);
    }
});

// --- BUTON İŞLEMLERİ ---

generateKeysBtn.addEventListener('click', async () => {
    try {
        const symmetricAlgo = symmetricAlgorithmSelect.value;
        const implementation = implementationSelect.value;

        symmetricEncryption = createSymmetricEncryption(symmetricAlgo, implementation);
        asymmetricEncryption = createAsymmetricEncryption(asymmetricAlgorithmSelect.value, 'lib');

        if (implementation === 'lib') {
            symmetricKey = await symmetricEncryption.generateKey();
        } else {
            const keyArray = symmetricEncryption.generateKey();
            symmetricKey = keyArray instanceof Uint8Array ? keyArray : new Uint8Array(keyArray);
        }

        const keyPair = await asymmetricEncryption.generateKeyPair();
        publicKey = keyPair.publicKey;
        privateKey = keyPair.privateKey;

        keyStatusDiv.innerHTML = `<strong>✓ Anahtarlar Hazır</strong><br>Simetrik: ${symmetricAlgo.toUpperCase()}`;
        showMessage('Sistem', 'Yeni yerel anahtarlar üretildi.', 'system');
    } catch (error) {
        showMessage('Hata', 'Anahtar üretilemedi: ' + error.message, 'error');
    }
});

applySettingsBtn.addEventListener('click', async () => {
    if (!symmetricKey) return alert('Önce "Anahtarları Oluştur" butonuna basmalısınız!');

    if (!serverPublicKey) {
        showMessage('Sistem', 'Sunucudan anahtar isteniyor...', 'system');
        socket.emit('key_exchange_params', {
            asymmetric_algorithm: asymmetricAlgorithmSelect.value,
            asymmetric_implementation: 'lib'
        });
    } else {
        await processAndSendSettings();
    }
});

// --- DOSYA VE MESAJ GÖNDERME ---

fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
        await sendFile(fileInput.files[0]);
        fileInput.value = ''; // Reset
    }
});

async function sendFile(file) {
    if (!symmetricKey) return alert('Önce anahtarları oluşturun!');

    // Manuel modda büyük dosya uyarısı (Limit artırıldı: 1MB)
    if (implementationSelect.value === 'manual' && file.size > 1024 * 1024) {
        if (!confirm("Manuel şifreleme büyük dosyalarda (1MB+) yavaş çalışabilir ve tarayıcıyı dondurabilir. Devam etmek istiyor musunuz?")) return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const content = e.target.result;
        const type = file.type.startsWith('image/') ? 'image' : 'file';

        const payload = JSON.stringify({
            type: type,
            content: content,
            fileName: file.name
        });

        await processAndSendMessage(payload, type === 'image' ? `<img src="${content}" style="max-width: 100px;">` : `📄 ${file.name}`);
    };
    reader.readAsDataURL(file);
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const payload = JSON.stringify({
        type: 'text',
        content: text
    });

    await processAndSendMessage(payload, text);
    messageInput.value = '';
}

async function processAndSendMessage(plainPayload, displayContent) {
    if (!symmetricKey) return;

    try {
        lastSendTime = performance.now();
        let encrypted;

        if (implementationSelect.value === 'lib') {
            encrypted = await symmetricEncryption.encrypt(plainPayload, symmetricKey);
        } else {
            encrypted = symmetricEncryption.encrypt(plainPayload, symmetricKey);
        }

        socket.emit('message', { message: encrypted });
        showMessage('Siz', displayContent, 'sent');

        if (latencyDisplay) latencyDisplay.innerText = 'Gönderiliyor...';
    } catch (error) {
        showMessage('Hata', 'Mesaj şifrelenemedi: ' + error.message, 'error');
        console.error(error);
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// --- ŞİFRELEME VE AYAR GÖNDERME YARDIMCILARI ---

async function processAndSendSettings() {
    try {
        const symAlgo = symmetricAlgorithmSelect.value;
        const asymAlgo = asymmetricAlgorithmSelect.value;

        // Anahtar Boyutu Normalizasyonu
        let keyToEncrypt = new Uint8Array(symmetricKey);
        if (symAlgo === 'aes' && keyToEncrypt.length !== 32) {
            let fixed = new Uint8Array(32);
            fixed.set(keyToEncrypt.slice(0, 32));
            keyToEncrypt = fixed;
        } else if (symAlgo === 'des' && keyToEncrypt.length !== 8) {
            let fixed = new Uint8Array(8);
            fixed.set(keyToEncrypt.slice(0, 8));
            keyToEncrypt = fixed;
        }

        // Simetrik Anahtarı Sunucunun Public Key'i ile Şifrele
        const encryptedKey = await asymmetricEncryption.encryptKey(keyToEncrypt, serverPublicKey);

        socket.emit('set_encryption_settings', {
            symmetric_algorithm: symAlgo,
            symmetric_implementation: implementationSelect.value,
            asymmetric_algorithm: asymAlgo,
            asymmetric_implementation: 'lib',
            encrypted_symmetric_key: encryptedKey,
            public_key: arrayBufferToBase64(publicKey)
        });

        showMessage('Sistem', 'El sıkışma tamamlandı, ayarlar iletildi.', 'system');
    } catch (error) {
        showMessage('Hata', 'Ayarlar uygulanamadı: ' + error.message, 'error');
        console.error(error);
    }
}

// --- YARDIMCI ARAÇLAR ---

function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function createSymmetricEncryption(algo, imp) {
    // Klasik Şifrelemeler (S-Box Gerektirmez)
    if (algo === 'playfair') return new PlayfairLib();
    if (algo === 'railfence') return new RailFenceLib();
    if (algo === 'caesar') return new CaesarLib();
    if (algo === 'vigenere') return new VigenereLib();

    // Modern Algoritmalar (S-Box ve Padding İçerir)
    if (algo === 'aes') {
        return imp === 'lib' ? new AESLib() : new AESManual();
    }

    // Varsayılan: DES
    return imp === 'lib' ? new DESLib() : new DESManual();
}

function createAsymmetricEncryption(algo, imp) {
    return algo === 'rsa' ? new RSALib() : new ECCLib();
}

function updateConnectionStatus(connected) {
    const statusText = document.querySelector('#connection-status span:last-child');
    const dot = document.querySelector('.status-dot');
    if (dot) dot.className = connected ? 'status-dot connected' : 'status-dot disconnected';
    if (statusText) statusText.innerText = connected ? 'Bağlı' : 'Bağlantı Kesildi';
}

function showMessage(sender, content, type, title = '') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const headerTitle = title ? ` - ${title}` : '';
    div.innerHTML = `<div class="message-header">${sender}${headerTitle}</div><div class="message-content">${content}</div>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}