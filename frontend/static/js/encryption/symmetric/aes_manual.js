/**
 * AES encryption manual implementation (simplified)
 * WARNING: This is for educational purposes only
 */

class AESManual {
    constructor() {
        this.blockSize = 16;
    }

    encrypt(plaintext, key) {
        try {
            // Generate IV
            const iv = this.generateRandomBytes(this.blockSize);
            
            // Convert to bytes
            const plaintextBytes = this.stringToBytes(plaintext);
            const paddedText = this.pad(plaintextBytes);
            
            // Simple XOR encryption (NOT real AES, just for demonstration)
            const encrypted = [];
            const keyExpanded = this.expandKey(key, paddedText.length);
            
            for (let i = 0; i < paddedText.length; i++) {
                // Ensure byte value is in range 0-255
                const byteValue = (paddedText[i] ^ keyExpanded[i] ^ iv[i % iv.length]) & 0xFF;
                encrypted.push(byteValue);
            }
            
            // Combine IV and encrypted data
            const combined = [...iv, ...encrypted];
            
            return this.bytesToBase64(combined);
        } catch (error) {
            throw new Error('AES manual encryption failed: ' + error.message);
        }
    }

    decrypt(ciphertext, key) {
        try {
            // Decode base64
            const combined = this.base64ToBytes(ciphertext);
            const iv = combined.slice(0, this.blockSize);
            const ciphertextBytes = combined.slice(this.blockSize);
            
            // Simple XOR decryption
            const decrypted = [];
            const keyExpanded = this.expandKey(key, ciphertextBytes.length);
            
            for (let i = 0; i < ciphertextBytes.length; i++) {
                // Ensure byte value is in range 0-255
                const byteValue = (ciphertextBytes[i] ^ keyExpanded[i] ^ iv[i % iv.length]) & 0xFF;
                decrypted.push(byteValue);
            }
            
            const unpadded = this.unpad(decrypted);
            return this.bytesToString(unpadded);
        } catch (error) {
            throw new Error('AES manual decryption failed: ' + error.message);
        }
    }

    generateKey(keySize = 256) {
        return this.generateRandomBytes(keySize / 8);
    }

    expandKey(key, length) {
        const expanded = [];
        for (let i = 0; i < length; i++) {
            expanded.push(key[i % key.length]);
        }
        return expanded;
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

