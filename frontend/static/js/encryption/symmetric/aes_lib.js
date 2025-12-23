/**
 * AES encryption using Web Crypto API (library implementation)
 */

class AESLib {
    constructor() {
        this.algorithm = 'AES-CBC';
        this.keyLength = 256;
    }

    async encrypt(plaintext, key) {
        try {
            // Import key
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'AES-CBC' },
                false,
                ['encrypt']
            );

            // Generate IV
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

            // Convert to base64
            return this.arrayBufferToBase64(combined.buffer);
        } catch (error) {
            throw new Error('AES encryption failed: ' + error.message);
        }
    }

    async decrypt(ciphertext, key) {
        try {
            // Import key
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'AES-CBC' },
                false,
                ['decrypt']
            );

            // Decode base64
            const combined = this.base64ToArrayBuffer(ciphertext);
            const iv = combined.slice(0, 16);
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

            // Convert to string
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new Error('AES decryption failed: ' + error.message);
        }
    }

    async generateKey(keySize = 256) {
        try {
            const key = await crypto.subtle.generateKey(
                {
                    name: 'AES-CBC',
                    length: keySize
                },
                true,
                ['encrypt', 'decrypt']
            );

            const exportedKey = await crypto.subtle.exportKey('raw', key);
            return new Uint8Array(exportedKey);
        } catch (error) {
            throw new Error('Key generation failed: ' + error.message);
        }
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




