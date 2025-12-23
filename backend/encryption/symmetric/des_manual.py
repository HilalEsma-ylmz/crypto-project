"""
DES encryption manual implementation (simplified version).
Note: This is a simplified educational implementation.
For production, use the library version.
"""

import base64
import os
from .base import SymmetricEncryption


class DESManual(SymmetricEncryption):
    """
    Simplified manual DES implementation.
    WARNING: This is for educational purposes only.
    For production use, prefer DESLib.
    """
    
    def __init__(self):
        self.block_size = 8
    
    def encrypt(self, plaintext: str, key: bytes) -> str:
        """Simplified DES encryption."""
        # Ensure 8-byte key
        if len(key) != 8:
            key = key[:8] if len(key) >= 8 else key.ljust(8, b'\0')
        
        iv = os.urandom(self.block_size)
        plaintext_bytes = plaintext.encode('utf-8')
        padded_text = self._pad(plaintext_bytes)
        
        # Simple XOR encryption (NOT real DES, just for demonstration)
        encrypted = bytearray()
        for i, byte in enumerate(padded_text):
            encrypted.append(byte ^ key[i % len(key)] ^ iv[i % len(iv)])
        
        encrypted_data = iv + bytes(encrypted)
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, ciphertext: str, key: bytes) -> str:
        """Simplified DES decryption."""
        # Ensure 8-byte key
        if len(key) != 8:
            key = key[:8] if len(key) >= 8 else key.ljust(8, b'\0')
        
        encrypted_data = base64.b64decode(ciphertext.encode('utf-8'))
        iv = encrypted_data[:self.block_size]
        ciphertext_bytes = encrypted_data[self.block_size:]
        
        # Simple XOR decryption
        decrypted = bytearray()
        for i, byte in enumerate(ciphertext_bytes):
            decrypted.append(byte ^ key[i % len(key)] ^ iv[i % len(iv)])
        
        plaintext = self._unpad(bytes(decrypted))
        return plaintext.decode('utf-8')
    
    def generate_key(self, key_size: int = 64) -> bytes:
        """Generate a random DES key (8 bytes)."""
        return os.urandom(8)
    
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




