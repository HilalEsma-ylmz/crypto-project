import base64
from .base import SymmetricEncryption

class RailFenceLib(SymmetricEncryption):
    def encrypt(self, plaintext: str, key: bytes) -> str:
        # Anahtarın ilk byte'ını 'ray' sayısı olarak kullanıyoruz (min 2)
        rails = max(2, key[0] % 10) 
        fence = [[] for _ in range(rails)]
        rail = 0
        direction = 1

        for char in plaintext:
            fence[rail].append(char)
            rail += direction
            if rail == rails - 1 or rail == 0:
                direction *= -1
        
        res = "".join(["".join(r) for r in fence])
        return base64.b64encode(res.encode('utf-8')).decode('utf-8')

    def decrypt(self, ciphertext: str, key: bytes) -> str:
        data = base64.b64decode(ciphertext).decode('utf-8')
        rails = max(2, key[0] % 10)
        
        # Zigzag desenini oluştur
        pattern = [None] * len(data)
        fence = [[] for _ in range(rails)]
        rail = 0
        direction = 1
        for i in range(len(data)):
            fence[rail].append(i)
            rail += direction
            if rail == rails - 1 or rail == 0:
                direction *= -1
        
        # Karakterleri desene yerleştir
        idx = 0
        for r in range(rails):
            for pos in fence[r]:
                pattern[pos] = data[idx]
                idx += 1
        
        return "".join(pattern)

    def generate_key(self, key_size: int = None) -> bytes:
        return b'\x03' # 3 raylı bir çit varsayılanı