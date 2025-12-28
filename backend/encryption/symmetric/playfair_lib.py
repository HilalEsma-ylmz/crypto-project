import base64
from .base import SymmetricEncryption

class PlayfairLib(SymmetricEncryption):
    def __init__(self):
        self.alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ" # J dışarıda

    def _prepare_key(self, key_bytes):
        key_str = key_bytes.decode('utf-8', errors='ignore').upper().replace('J', 'I')
        res = ""
        for char in key_str + self.alphabet:
            if char.isalpha() and char not in res:
                res += char
        return res

    def _get_matrix(self, key_str):
        return [key_str[i:i+5] for i in range(0, 25, 5)]

    def _find_pos(self, matrix, char):
        for r, row in enumerate(matrix):
            if char in row: return r, row.find(char)
        return 0, 0

    def encrypt(self, plaintext, key):
        key_str = self._prepare_key(key)
        matrix = self._get_matrix(key_str)
        text = plaintext.upper().replace('J', 'I').replace(" ", "")
        
        # İkilere ayır ve aynı harf ise araya X koy
        prepared = ""
        i = 0
        while i < len(text):
            a = text[i]
            b = text[i+1] if i+1 < len(text) else 'X'
            if a == b:
                prepared += a + 'X'
                i += 1
            else:
                prepared += a + b
                i += 2
        
        res = ""
        for i in range(0, len(prepared), 2):
            r1, c1 = self._find_pos(matrix, prepared[i])
            r2, c2 = self._find_pos(matrix, prepared[i+1])
            if r1 == r2: # Aynı satır
                res += matrix[r1][(c1+1)%5] + matrix[r2][(c2+1)%5]
            elif c1 == c2: # Aynı sütun
                res += matrix[(r1+1)%5][c1] + matrix[(r2+1)%5][c2]
            else: # Dikdörtgen kuralı
                res += matrix[r1][c2] + matrix[r2][c1]
        
        return base64.b64encode(res.encode('utf-8')).decode('utf-8')

    def decrypt(self, ciphertext, key):
        data = base64.b64decode(ciphertext).decode('utf-8')
        key_str = self._prepare_key(key)
        matrix = self._get_matrix(key_str)
        res = ""
        for i in range(0, len(data), 2):
            r1, c1 = self._find_pos(matrix, data[i])
            r2, c2 = self._find_pos(matrix, data[i+1])
            if r1 == r2:
                res += matrix[r1][(c1-1)%5] + matrix[r2][(c2-1)%5]
            elif c1 == c2:
                res += matrix[(r1-1)%5][c1] + matrix[(r2-1)%5][c2]
            else:
                res += matrix[r1][c2] + matrix[r2][c1]
        return res

    def generate_key(self, key_size=None):
        return b"PLAYFAIRKEY"