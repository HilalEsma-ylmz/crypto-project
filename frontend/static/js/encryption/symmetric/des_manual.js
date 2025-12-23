/**
 * DES encryption manual implementation (simplified)
 * WARNING: This is for educational purposes only
 */

class DESManual {
    constructor() {
        this.blockSize = 8;
    }

    encrypt(plaintext, key) {
        try {
            // Ensure 8-byte key
            const keyBytes = this.ensureKeyLength(key, 8);
            
            // Generate IV
            const iv = this.generateRandomBytes(this.blockSize);
            
            // Convert to bytes
            const plaintextBytes = this.stringToBytes(plaintext);
            const paddedText = this.pad(plaintextBytes);
            
            // Simple XOR encryption
            const encrypted = [];
            for (let i = 0; i < paddedText.length; i++) {
                // Ensure byte value is in range 0-255
                const byteValue = (paddedText[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length]) & 0xFF;
                encrypted.push(byteValue);
            }
            
            // Combine IV and encrypted data
            const combined = [...iv, ...encrypted];
            
            return this.bytesToBase64(combined);
        } catch (error) {
            throw new Error('DES manual encryption failed: ' + error.message);
        }
    }

    decrypt(ciphertext, key) {
        try {
            // Ensure 8-byte key
            const keyBytes = this.ensureKeyLength(key, 8);
            
            // Decode base64
            const combined = this.base64ToBytes(ciphertext);
            const iv = combined.slice(0, this.blockSize);
            const ciphertextBytes = combined.slice(this.blockSize);
            
            // Simple XOR decryption
            const decrypted = [];
            for (let i = 0; i < ciphertextBytes.length; i++) {
                // Ensure byte value is in range 0-255
                const byteValue = (ciphertextBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length]) & 0xFF;
                decrypted.push(byteValue);
            }
            
            const unpadded = this.unpad(decrypted);
            return this.bytesToString(unpadded);
        } catch (error) {
            throw new Error('DES manual decryption failed: ' + error.message);
        }
    }

    generateKey(keySize = 64) {
        return this.generateRandomBytes(8);
    }

    ensureKeyLength(key, length) {
        if (key.length === length) return key;
        const keyArray = [];
        for (let i = 0; i < length; i++) {
            keyArray.push(key[i % key.length] || 0);
        }
        return keyArray;
    }

    pad(data) {
        const paddingLength = this.blockSize - (data.length % this.blockSize);
        const padded = [...data];
        for (let i = 0; i < paddingLength; i++) {
            padded.push(paddingLength);
        }
        return padded;
    }

    unpad(data) {
        if (data.length === 0) return data;
        const paddingLength = data[data.length - 1];
        return data.slice(0, data.length - paddingLength);
    }

    generateRandomBytes(length) {
        const bytes = [];
        for (let i = 0; i < length; i++) {
            bytes.push(Math.floor(Math.random() * 256));
        }
        return bytes;
    }

    stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    bytesToString(bytes) {
        return String.fromCharCode(...bytes);
    }

    bytesToBase64(bytes) {
        // Convert array to Uint8Array for safe base64 encoding
        const uint8Array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        
        // Use binary string method that works with all byte values
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
            // Ensure byte value is in valid range (0-255)
            const byte = uint8Array[i] & 0xFF;
            binary += String.fromCharCode(byte);
        }
        return btoa(binary);
    }

    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = [];
        for (let i = 0; i < binary.length; i++) {
            bytes.push(binary.charCodeAt(i));
        }
        return bytes;
    }
}

