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

// UI Elemanları
const symmetricAlgorithmSelect = document.getElementById('symmetric-algorithm');
const asymmetricAlgorithmSelect = document.getElementById('asymmetric-algorithm');
const implementationSelect = document.getElementById('implementation');
const generateKeysBtn = document.getElementById('generate-keys-btn');
const applySettingsBtn = document.getElementById('apply-settings-btn');
const keyStatusDiv = document.getElementById('key-status');
const connectionStatusDiv = document.getElementById('connection-status');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
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
        let decrypted;
        // Sunucudan gelen ŞİFRELİ mesajı yerel anahtarımızla çözüyoruz
        if (implementationSelect.value === 'lib') {
            decrypted = await symmetricEncryption.decrypt(data.encrypted_payload, symmetricKey);
        } else {
            decrypted = symmetricEncryption.decrypt(data.encrypted_payload, symmetricKey);
        }
        showMessage('Sunucu', decrypted, 'received');

        messageDetailsDiv.innerHTML = `<strong>Son Gelen:</strong><br><small>Payload: ${data.encrypted_payload.substring(0,20)}...</small>`;
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

// --- ŞİFRELEME VE AYAR GÖNDERME ---

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

// --- MESAJ GÖNDERME ---

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !symmetricKey) return;

    try {
        let encrypted;
        if (implementationSelect.value === 'lib') {
            encrypted = await symmetricEncryption.encrypt(message, symmetricKey);
        } else {
            encrypted = symmetricEncryption.encrypt(message, symmetricKey);
        }

        socket.emit('message', { message: encrypted });
        showMessage('Siz', message, 'sent');
        messageInput.value = '';
    } catch (error) {
        showMessage('Hata', 'Mesaj şifrelenemedi: ' + error.message, 'error');
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

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

function showMessage(sender, content, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<div class="message-header">${sender}</div><div class="message-content">${content}</div>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}