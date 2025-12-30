class DESManual {
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
        const iv = crypto.getRandomValues(new Uint8Array(8));
        const data = this.pad(new TextEncoder().encode(plaintext));
        const res = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            let sub = sbox[data[i]];
            let val = sub ^ key[i % 8] ^ iv[i % 8];
            res[i] = ((val << 4) | (val >> 4)) & 0xFF;
        }
        const combined = new Uint8Array([...iv, ...res]);
        return btoa(String.fromCharCode(...combined));
    }

    async decrypt(ciphertext, key) {
        const sbox = this.generateDynamicSBox(key);
        const invSbox = new Array(256);
        for(let i=0; i<256; i++) invSbox[sbox[i]] = i;

        const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        const iv = combined.slice(0, 8);
        const data = combined.slice(8);
        const res = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            let val = ((data[i] >> 4) | (data[i] << 4)) & 0xFF;
            let orig_val = val ^ key[i % 8] ^ iv[i % 8];
            res[i] = invSbox[orig_val % 256];
        }
        return new TextDecoder().decode(this.unpad(res));
    }

    pad(d) { const p = 8 - (d.length % 8); return new Uint8Array([...d, ...Array(p).fill(p)]); }
    unpad(d) { const p = d[d.length - 1]; return d.slice(0, d.length - p); }
    async generateKey() { return crypto.getRandomValues(new Uint8Array(8)); }
}