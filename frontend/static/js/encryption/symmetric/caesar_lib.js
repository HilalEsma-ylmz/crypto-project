class CaesarLib {
    async encrypt(plaintext, key) {
        const shift = key[0] || 3;
        let res = "";
        for (let i = 0; i < plaintext.length; i++) {
            res += String.fromCharCode((plaintext.charCodeAt(i) + shift) % 1114112);
        }
        return btoa(unescape(encodeURIComponent(res)));
    }

    async decrypt(ciphertext, key) {
        const decoded = decodeURIComponent(escape(atob(ciphertext)));
        const shift = key[0] || 3;
        let res = "";
        for (let i = 0; i < decoded.length; i++) {
            res += String.fromCharCode((decoded.charCodeAt(i) - shift + 1114112) % 1114112);
        }
        return res;
    }

    async generateKey() {
        return new Uint8Array([3]); // Varsayılan kaydırma: 3
    }
}