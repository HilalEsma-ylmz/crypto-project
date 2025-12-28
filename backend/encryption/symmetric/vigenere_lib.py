import base64
from .base import SymmetricEncryption

class VigenereLib(SymmetricEncryption):
    def encrypt(self, plaintext: str, key: bytes) -> str:
        # Key'i stringe çeviriyoruz
        key_str = key.decode('utf-8', errors='ignore')
        if not key_str: key_str = "KEY"
        
        res = ""
        for i in range(len(plaintext)):
            p = ord(plaintext[i])
            k = ord(key_str[i % len(key_str)])
            # ASCII karakter aralığında kaydırma işlemi
            res += chr((p + k) % 1114112) 
        
        return base64.b64encode(res.encode('utf-8')).decode('utf-8')

    def decrypt(self, ciphertext: str, key: bytes) -> str:
        data = base64.b64decode(ciphertext).decode('utf-8')
        key_str = key.decode('utf-8', errors='ignore')
        if not key_str: key_str = "KEY"
        
        res = ""
        for i in range(len(data)):
            c = ord(data[i])
            k = ord(key_str[i % len(key_str)])
            res += chr((c - k) % 1114112)
        return res

    def generate_key(self, key_size: int = None) -> bytes:
        return b"CLASSICKEY"