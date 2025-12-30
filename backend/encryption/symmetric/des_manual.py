import base64
import os
from .base import SymmetricEncryption

class DESManual(SymmetricEncryption):
    def __init__(self):
        self.block_size = 8

    def _generate_dynamic_sbox(self, key: bytes):
        sbox = list(range(256))
        seed = sum(key) % 256
        for i in range(255, 0, -1):
            j = (seed + i) % (i + 1)
            sbox[i], sbox[j] = sbox[j], sbox[i]
            seed = (seed + sbox[i]) % 256
        return sbox

    def encrypt(self, plaintext: str, key: bytes) -> str:
        sbox = self._generate_dynamic_sbox(key)
        key_bytes = key[:8].ljust(8, b'\0')
        iv = os.urandom(8)
        data = self._pad(plaintext.encode('utf-8'))
        res = bytearray()
        for i in range(len(data)):
            # Sbox -> XOR -> Swap (JS sırasıyla eşlendi)
            sub = sbox[data[i] % 256]
            val = sub ^ key_bytes[i % 8] ^ iv[i % 8]
            swapped = ((val << 4) | (val >> 4)) & 0xFF
            res.append(swapped)
        return base64.b64encode(iv + res).decode('utf-8')

    def decrypt(self, ciphertext: str, key: bytes) -> str:
        sbox = self._generate_dynamic_sbox(key)
        inv_sbox = [0] * 256
        for i, v in enumerate(sbox): inv_sbox[v] = i
        
        key_bytes = key[:8].ljust(8, b'\0')
        combined = base64.b64decode(str(ciphertext).encode('utf-8'))
        iv, data = combined[:8], combined[8:]
        res = bytearray()
        for i in range(len(data)):
            # Unswap -> XOR -> Inverse Sbox
            val = ((data[i] >> 4) | (data[i] << 4)) & 0xFF
            orig_val = val ^ key_bytes[i % 8] ^ iv[i % 8]
            res.append(inv_sbox[orig_val % 256])
        return self._unpad(bytes(res)).decode('utf-8', errors='ignore')

    def _pad(self, data: bytes) -> bytes:
        p = 8 - (len(data) % 8)
        return data + bytes([p] * p)

    def _unpad(self, data: bytes) -> bytes:
        if not data: return b""
        p = data[-1]
        return data[:-p] if 0 < p <= 8 else data

    def generate_key(self, key_size: int = 64) -> bytes:
        return os.urandom(8)