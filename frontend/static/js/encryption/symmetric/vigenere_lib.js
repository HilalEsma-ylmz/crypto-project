/**
 * Vigenere şifreleme - Klasik yöntem
 */
class VigenereLib {
    constructor() {
        // Vigenere için blok boyutu kavramı yoktur ancak yapı uyumu için tanımlanabilir
        this.algoName = 'Vigenere';
    }

    /**
     * Mesajı Vigenere yöntemiyle şifreler.
     */
    async encrypt(plaintext, key) {
        try {
            // Key Uint8Array olarak gelir, stringe çeviriyoruz
            const keyStr = new TextDecoder().decode(key) || "KEY";
            let res = "";
            
            for (let i = 0; i < plaintext.length; i++) {
                let p = plaintext.charCodeAt(i);
                let k = keyStr.charCodeAt(i % keyStr.length);
                // Karakter kaydırma işlemi
                res += String.fromCharCode((p + k) % 1114112);
            }
            
            // Diğer lib dosyalarıyla uyumlu olması için Base64 dönüyoruz
            return btoa(unescape(encodeURIComponent(res)));
        } catch (error) {
            throw new Error('Vigenere encryption failed: ' + error.message);
        }
    }

    /**
     * Şifreli mesajı çözer.
     */
    async decrypt(ciphertext, key) {
        try {
            // Base64'ten geri çeviriyoruz
            const decoded = decodeURIComponent(escape(atob(ciphertext)));
            const keyStr = new TextDecoder().decode(key) || "KEY";
            let res = "";
            
            for (let i = 0; i < decoded.length; i++) {
                let c = decoded.charCodeAt(i);
                let k = keyStr.charCodeAt(i % keyStr.length);
                // Ters kaydırma işlemi
                res += String.fromCharCode((c - k + 1114112) % 1114112);
            }
            return res;
        } catch (error) {
            throw new Error('Vigenere decryption failed: ' + error.message);
        }
    }

    /**
     * Sabit bir klasik anahtar üretir.
     */
    async generateKey() {
        // Backend'deki generate_key ile uyumlu sabit anahtar
        return new TextEncoder().encode("CLASSICKEY");
    }
}