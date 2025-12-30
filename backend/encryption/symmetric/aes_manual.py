import base64
import os
from .base import SymmetricEncryption

class AESManual(SymmetricEncryption):
    def __init__(self):
        self.block_size = 16

    def _generate_dynamic_sbox(self, key: bytes):
        sbox = list(range(256))
        # JS tarafıyla birebir aynı toplam sonucunu almak için % 256 eklenmiştir
        seed = sum(list(key)) % 256 
        for i in range(255, 0, -1):
            j = (seed + i) % (i + 1)
            sbox[i], sbox[j] = sbox[j], sbox[i]
            seed = (seed + sbox[i]) % 256
        return sbox

    def encrypt(self, plaintext, key: bytes) -> str:
        sbox = self._generate_dynamic_sbox(key)
        iv = os.urandom(16)
        if isinstance(plaintext, str):
            data = self._pad(plaintext.encode('utf-8'))
        else:
            data = self._pad(plaintext)
            
        res = bytearray()
        for i in range(len(data)):
            # S-Box -> Key XOR -> IV XOR sırası
            val = sbox[data[i]] ^ key[i % len(key)] ^ iv[i % 16]
            res.append(val)
        # IV ve şifreli veriyi birleştirip base64 yapıyoruz
        return base64.b64encode(iv + res).decode('utf-8')

    def decrypt(self, ciphertext: str, key: bytes):
        sbox = self._generate_dynamic_sbox(key)
        inv_sbox = [0] * 256
        for i, v in enumerate(sbox): inv_sbox[v] = i
        
        combined = base64.b64decode(ciphertext.encode('utf-8'))
        iv, data = combined[:16], combined[16:]
        res = bytearray()
        for i in range(len(data)):
            # XOR işlemlerini tersine alıyoruz
            val = data[i] ^ key[i % len(key)] ^ iv[i % 16]
            res.append(inv_sbox[val])
        
        decrypted_bytes = self._unpad(bytes(res))
        try:
            return decrypted_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return decrypted_bytes

    def _pad(self, data: bytes) -> bytes:
        p = self.block_size - (len(data) % self.block_size)
        return data + bytes([p] * p)

    def _unpad(self, data: bytes) -> bytes:
        if not data: return b""
        p = data[-1]
        if 0 < p <= self.block_size: return data[:-p]
        return data

    def generate_key(self, key_size: int = 128) -> bytes:
        return os.urandom(key_size // 8)