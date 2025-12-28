class PlayfairLib {
    constructor() {
        this.alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    }

    prepareKey(key) {
        let keyStr = (new TextDecoder().decode(key)).toUpperCase().replace(/J/g, "I");
        let res = "";
        for (let char of (keyStr + this.alphabet)) {
            if (/[A-Z]/.test(char) && !res.includes(char)) res += char;
        }
        return res;
    }

    findPos(matrix, char) {
        for (let r = 0; r < 5; r++) {
            let c = matrix[r].indexOf(char);
            if (c !== -1) return [r, c];
        }
        return [0, 0];
    }

    async encrypt(plaintext, key) {
        const keyStr = this.prepareKey(key);
        const matrix = Array.from({length: 5}, (_, i) => keyStr.slice(i*5, i*5+5));
        let text = plaintext.toUpperCase().replace(/J/g, "I").replace(/\s/g, "");
        let prepared = "";
        for (let i = 0; i < text.length; i += 2) {
            let a = text[i];
            let b = (i + 1 < text.length) ? text[i+1] : 'X';
            if (a === b) { prepared += a + 'X'; i--; }
            else { prepared += a + b; }
        }
        if (prepared.length % 2 !== 0) prepared += 'X';

        let res = "";
        for (let i = 0; i < prepared.length; i += 2) {
            let [r1, c1] = this.findPos(matrix, prepared[i]);
            let [r2, c2] = this.findPos(matrix, prepared[i+1]);
            if (r1 === r2) res += matrix[r1][(c1+1)%5] + matrix[r2][(c2+1)%5];
            else if (c1 === c2) res += matrix[(r1+1)%5][c1] + matrix[(r2+1)%5][c2];
            else res += matrix[r1][c2] + matrix[r2][c1];
        }
        return btoa(res);
    }

    async decrypt(ciphertext, key) {
        const keyStr = this.prepareKey(key);
        const matrix = Array.from({length: 5}, (_, i) => keyStr.slice(i*5, i*5+5));
        const data = atob(ciphertext);
        let res = "";
        for (let i = 0; i < data.length; i += 2) {
            let [r1, c1] = this.findPos(matrix, data[i]);
            let [r2, c2] = this.findPos(matrix, data[i+1]);
            if (r1 === r2) res += matrix[r1][(c1+4)%5] + matrix[r2][(c2+4)%5];
            else if (c1 === c2) res += matrix[(r1+4)%5][c1] + matrix[(r2+4)%5][c2];
            else res += matrix[r1][c2] + matrix[r2][c1];
        }
        return res;
    }

    async generateKey() { return new TextEncoder().encode("PLAYFAIRKEY"); }
}