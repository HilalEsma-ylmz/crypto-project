class RailFenceLib {
    async encrypt(plaintext, key) {
        const rails = Math.max(2, key[0] % 10 || 3);
        let fence = Array.from({ length: rails }, () => []);
        let rail = 0, direction = 1;

        for (let char of plaintext) {
            fence[rail].push(char);
            rail += direction;
            if (rail === rails - 1 || rail === 0) direction *= -1;
        }

        const res = fence.flat().join("");
        return btoa(unescape(encodeURIComponent(res)));
    }

    async decrypt(ciphertext, key) {
        const data = decodeURIComponent(escape(atob(ciphertext)));
        const rails = Math.max(2, key[0] % 10 || 3);
        const len = data.length;
        let positions = Array.from({ length: rails }, () => []);
        let rail = 0, direction = 1;

        for (let i = 0; i < len; i++) {
            positions[rail].push(i);
            rail += direction;
            if (rail === rails - 1 || rail === 0) direction *= -1;
        }

        let result = new Array(len);
        let charIdx = 0;
        for (let r = 0; r < rails; r++) {
            for (let pos of positions[r]) {
                result[pos] = data[charIdx++];
            }
        }
        return result.join("");
    }

    async generateKey() {
        return new Uint8Array([3]);
    }
}