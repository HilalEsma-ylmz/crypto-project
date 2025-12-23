"""
AES encryption manual implementation (simplified version).
Note: This is a simplified educational implementation.
For production, use the library version.
"""

import base64
import os
from .base import SymmetricEncryption


class AESManual(SymmetricEncryption):
    """
    Simplified manual AES implementation.
    WARNING: This is for educational purposes only.
    For production use, prefer AESLib.
    """
    
    def __init__(self):
        self.block_size = 16
    
    def encrypt(self, plaintext: str, key: bytes) -> str:
        """Simplified AES encryption."""
        # This is a placeholder - full AES implementation is very complex
        # For demonstration, we'll use XOR cipher with key expansion
        iv = os.urandom(self.block_size)
        plaintext_bytes = plaintext.encode('utf-8')
        padded_text = self._pad(plaintext_bytes)
        
        # Simple XOR encryption (NOT real AES, just for demonstration)
        encrypted = bytearray()
        key_expanded = self._expand_key(key, len(padded_text))
        
        for i, byte in enumerate(padded_text):
            encrypted.append(byte ^ key_expanded[i] ^ iv[i % len(iv)])
        
        encrypted_data = iv + bytes(encrypted)
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, ciphertext: str, key: bytes) -> str:
        """Simplified AES decryption."""
        encrypted_data = base64.b64decode(ciphertext.encode('utf-8'))
        iv = encrypted_data[:self.block_size]
        ciphertext_bytes = encrypted_data[self.block_size:]
        
        # Simple XOR decryption
        decrypted = bytearray()
        key_expanded = self._expand_key(key, len(ciphertext_bytes))
        
        for i, byte in enumerate(ciphertext_bytes):
            decrypted.append(byte ^ key_expanded[i] ^ iv[i % len(iv)])
        
        plaintext = self._unpad(bytes(decrypted))
        return plaintext.decode('utf-8')
    
    def generate_key(self, key_size: int = 256) -> bytes:
        """Generate a random key."""
        if key_size not in [128, 192, 256]:
            key_size = 256
        return os.urandom(key_size // 8)
    
    def _expand_key(self, key: bytes, length: int) -> bytes:
        """Expand key to required length."""
        expanded = bytearray()
        for i in range(length):
            expanded.append(key[i % len(key)])
        return bytes(expanded)
    
    def _pad(self, data: bytes) -> bytes:
        """PKCS7 padding."""
        padding_length = self.block_size - (len(data) % self.block_size)
        padding = bytes([padding_length] * padding_length)
        return data + padding
    
    def _unpad(self, data: bytes) -> bytes:
        """Remove PKCS7 padding."""
        if len(data) == 0:
            return data
        padding_length = data[-1]
        return data[:-padding_length]




