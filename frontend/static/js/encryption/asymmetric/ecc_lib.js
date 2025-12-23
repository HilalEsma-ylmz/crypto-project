class ECCLib {
    constructor() {
        this.namedCurve = 'P-256';
    }

    async generateKeyPair() {
        try {
            const keyPair = await crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: this.namedCurve },
                true, ['deriveKey', 'deriveBits']
            );
            const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
            const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
            return {
                publicKey: new Uint8Array(publicKey),
                privateKey: new Uint8Array(privateKey)
            };
        } catch (error) {
            throw new Error('ECC key generation failed: ' + error.message);
        }
    }

    async encryptKey(symmetricKey, publicKey) {
        try {
            const ephemeralKeyPair = await crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: this.namedCurve },
                true, ['deriveBits']
            );

            // --- GÜVENLİ VE ESNEK IMPORT (Hata Çözücü) ---
            const publicKeyBuffer = publicKey instanceof Uint8Array ? publicKey.buffer : publicKey;
            let peerPublicKey = null;
            let errors = [];

            // 1. Deneme: SPKI (Standart DER)
            try {
                peerPublicKey = await crypto.subtle.importKey(
                    'spki', publicKeyBuffer,
                    { name: 'ECDH', namedCurve: this.namedCurve },
                    false, []
                );
            } catch (e) { errors.push("SPKI failed"); }

            // 2. Deneme: RAW (Ham veri)
            if (!peerPublicKey) {
                try {
                    peerPublicKey = await crypto.subtle.importKey(
                        'raw', publicKeyBuffer,
                        { name: 'ECDH', namedCurve: this.namedCurve },
                        false, []
                    );
                } catch (e) { errors.push("RAW failed"); }
            }

            // 3. Deneme: Eğer sunucu 0x04 (uncompressed) baytını unutmuşsa manuel ekle
            if (!peerPublicKey) {
                try {
                    const rawKey = new Uint8Array(publicKeyBuffer);
                    const prefixedKey = new Uint8Array(rawKey.length + 1);
                    prefixedKey[0] = 0x04;
                    prefixedKey.set(rawKey, 1);
                    peerPublicKey = await crypto.subtle.importKey(
                        'raw', prefixedKey,
                        { name: 'ECDH', namedCurve: this.namedCurve },
                        false, []
                    );
                } catch (e) { errors.push("Prefixed RAW failed"); }
            }

            if (!peerPublicKey) {
                throw new Error("Sunucu anahtarı hiçbir formatta kabul edilmedi: " + errors.join(", "));
            }
            // --- IMPORT SONU ---

            const sharedSecret = await crypto.subtle.deriveBits(
                { name: 'ECDH', public: peerPublicKey },
                ephemeralKeyPair.privateKey, 256
            );

            const hkdfKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveBits']);
            const derivedKey = await crypto.subtle.deriveBits(
                { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new Uint8Array(0) },
                hkdfKey, 256
            );

            const symmetricKeyArray = (symmetricKey instanceof Uint8Array) ? symmetricKey : new Uint8Array(symmetricKey);
            const derivedKeyArray = new Uint8Array(derivedKey);
            const encrypted = new Uint8Array(symmetricKeyArray.length);
            for (let i = 0; i < symmetricKeyArray.length; i++) {
                encrypted[i] = symmetricKeyArray[i] ^ derivedKeyArray[i % derivedKeyArray.length];
            }

            const ephemeralPublic = await crypto.subtle.exportKey('spki', ephemeralKeyPair.publicKey);
            const combined = new Uint8Array(ephemeralPublic.byteLength + 3 + encrypted.length);
            combined.set(new Uint8Array(ephemeralPublic), 0);
            combined.set([124, 124, 124], ephemeralPublic.byteLength); // '|||'
            combined.set(encrypted, ephemeralPublic.byteLength + 3);

            return this.arrayBufferToBase64(combined.buffer);
        } catch (error) {
            console.error("Detaylı Hata:", error);
            throw new Error('ECC encryption failed: ' + error.message);
        }
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }
}