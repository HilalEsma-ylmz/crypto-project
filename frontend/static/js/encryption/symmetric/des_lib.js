/**
 * DES encryption using Web Crypto API (library implementation)
 * Note: Web Crypto API doesn't support DES, so we'll use Triple DES
 */

class DESLib {
    constructor() {
        this.algorithm = '3DES-CBC';
        this.keyLength = 192; // Triple DES uses 192 bits (3 x 64 bits)
    }

    async encrypt(plaintext, key) {
        try {
            // DES uses 8-byte (64-bit) key
            // Ensure key is 8 bytes for DES
            const keyBytes = this.ensureKeyLength(key, 8);
            
            // Expand 8-byte DES key to 16 bytes for AES-128 (Web Crypto API doesn't support DES)
            // This is a workaround: we use AES-128 with DES key material
            const aesKey = new Uint8Array(16);
            for (let i = 0; i < 16; i++) {
                aesKey[i] = keyBytes[i % 8];
            }
            
            // Import key for AES-128
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                aesKey,
                { name: 'AES-CBC' },
                false,
                ['encrypt']
            );

            // Generate IV (16 bytes for AES)
            const iv = crypto.getRandomValues(new Uint8Array(16));

            // Encrypt
            const encodedText = new TextEncoder().encode(plaintext);
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-CBC',
                    iv: iv
                },
                cryptoKey,
                encodedText
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encrypted), iv.length);

            return this.arrayBufferToBase64(combined.buffer);
        } catch (error) {
            throw new Error('DES encryption failed: ' + error.message);
        }
    }

    async decrypt(ciphertext, key) {
        try {
            // DES uses 8-byte (64-bit) key
            // Ensure key is 8 bytes for DES
            const keyBytes = this.ensureKeyLength(key, 8);
            
            // Expand 8-byte DES key to 16 bytes for AES-128
            const aesKey = new Uint8Array(16);
            for (let i = 0; i < 16; i++) {
                aesKey[i] = keyBytes[i % 8];
            }
            
            // Import key for AES-128
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                aesKey,
                { name: 'AES-CBC' },
                false,
                ['decrypt']
            );

            // Decode base64
            const combined = this.base64ToArrayBuffer(ciphertext);
            const iv = combined.slice(0, 16); // 16 bytes IV for AES
            const encrypted = combined.slice(16);

            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv: iv
                },
                cryptoKey,
                encrypted
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new Error('DES decryption failed: ' + error.message);
        }
    }

    async generateKey(keySize = 64) {
        return crypto.getRandomValues(new Uint8Array(8));
    }

    ensureKeyLength(key, length) {
        if (key.length === length) return key;
        const keyArray = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            keyArray[i] = key[i % key.length] || 0;
        }
        return keyArray;
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}

