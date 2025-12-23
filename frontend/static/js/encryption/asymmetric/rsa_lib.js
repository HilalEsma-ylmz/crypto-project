class RSALib {
    constructor() {
        this.algoName = 'RSA-OAEP';
    }

    async generateKeyPair() {
        try {
            const keyPair = await crypto.subtle.generateKey(
                { name: this.algoName, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
                true, ['encrypt', 'decrypt']
            );
            const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
            const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
            return {
                publicKey: new Uint8Array(publicKey),
                privateKey: new Uint8Array(privateKey)
            };
        } catch (error) {
            throw new Error('RSA key generation failed: ' + error.message);
        }
    }

    async encryptKey(symmetricKey, publicKey) {
        try {
            // VERİ TİPİ NORMALİZASYONU (En Kritik Kısım)
            const publicKeyBuffer = (publicKey instanceof Uint8Array) ? publicKey.buffer : publicKey;
            const dataToEncrypt = (symmetricKey instanceof Uint8Array) ? symmetricKey : new Uint8Array(symmetricKey);

            // 1. Sunucu anahtarını içe aktar
            const cryptoKey = await crypto.subtle.importKey(
                'spki',
                publicKeyBuffer,
                { name: this.algoName, hash: 'SHA-256' },
                false,
                ['encrypt']
            );

            // 2. Şifrele
            const encrypted = await crypto.subtle.encrypt(
                { name: this.algoName },
                cryptoKey,
                dataToEncrypt
            );

            return this.arrayBufferToBase64(encrypted);
        } catch (error) {
            console.error("RSA Şifreleme Hatası:", error);
            throw new Error('RSA encryption failed: ' + error.message);
        }
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }
}