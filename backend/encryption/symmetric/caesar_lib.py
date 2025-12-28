import base64
from .base import SymmetricEncryption

class CaesarLib(SymmetricEncryption):
    def encrypt(self, plaintext: str, key: bytes) -> str:
        # Anahtarın ilk byte'ını kaydırma miktarı olarak kullanıyoruz (0-255)
        shift = key[0] if key else 3
        res = ""
        for char in plaintext:
            # Karakterin unicode değerini shift kadar ileri kaydır
            res += chr((ord(char) + shift) % 1114112)
        return base64.b64encode(res.encode('utf-8')).decode('utf-8')

    def decrypt(self, ciphertext: str, key: bytes) -> str:
        data = base64.b64decode(ciphertext).decode('utf-8')
        shift = key[0] if key else 3
        res = ""
        for char in data:
            # Kaydırma miktarını geri al
            res += chr((ord(char) - shift) % 1114112)
        return res

    def generate_key(self, key_size: int = None) -> bytes:
        # Sezar için 3 birimlik sabit bir anahtar/kaydırma miktarı
        return b'\x03'