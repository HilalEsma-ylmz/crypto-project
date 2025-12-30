class AESManual {
    generateDynamicSBox(key) {
        let sbox = Array.from({length: 256}, (_, i) => i);
        let seed = Array.from(key).reduce((a, b) => a + b, 0) % 256;
        for (let i = 255; i > 0; i--) {
            let j = (seed + i) % (i + 1);
            [sbox[i], sbox[j]] = [sbox[j], sbox[i]];
            seed = (seed + sbox[i]) % 256;
        }
        return sbox;
    }

    async encrypt(plaintext, key) {
        const sbox = this.generateDynamicSBox(key);
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const data = this.pad(new TextEncoder().encode(plaintext));
        const res = new Uint8Array(data.length);
        
        for (let i = 0; i < data.length; i++) {
            let val = sbox[data[i]];
            res[i] = val ^ key[i % key.length] ^ iv[i % 16];
        }

        const combined = new Uint8Array(iv.length + res.length);
        combined.set(iv);
        combined.set(res, iv.length);
        return this.arrayBufferToBase64(combined);
    }

    async decrypt(ciphertext, key) {
        const sbox = this.generateDynamicSBox(key);
        const invSbox = new Array(256);
        for(let i=0; i<256; i++) invSbox[sbox[i]] = i;

        const combined = this.base64ToArrayBuffer(ciphertext);
        const iv = combined.slice(0, 16);
        const data = combined.slice(16);
        const res = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            let val = data[i] ^ key[i % key.length] ^ iv[i % 16];
            res[i] = invSbox[val % 256];
        }
        return new TextDecoder().decode(this.unpad(res));
    }

    pad(d) {
        const p = 16 - (d.length % 16);
        const padded = new Uint8Array(d.length + p);
        padded.set(d);
        for (let i = d.length; i < padded.length; i++) padded[i] = p;
        return padded;
    }

    unpad(d) {
        const p = d[d.length - 1];
        return d.slice(0, d.length - p);
    }

    arrayBufferToBase64(uint8) {
        let binary = '';
        uint8.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        return Uint8Array.from(binary, c => c.charCodeAt(0));
    }

    async generateKey() { return window.crypto.getRandomValues(new Uint8Array(16)); }
}