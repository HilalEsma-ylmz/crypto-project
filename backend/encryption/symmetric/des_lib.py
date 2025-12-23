"""
DES encryption using cryptography library.
"""

import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from .base import SymmetricEncryption


class DESLib(SymmetricEncryption):
    """DES encryption implementation using cryptography library."""
    
    def __init__(self):
        self.block_size = 8  # DES block size is 8 bytes
    
    def encrypt(self, plaintext: str, key: bytes) -> str:
        """Encrypt plaintext using DES (using AES-128 for Web Crypto API compatibility)."""
        # DES uses 8-byte key, but we expand it to 16 bytes for AES-128
        # This is because Web Crypto API doesn't support DES
        if len(key) != 8:
            key = key[:8] if len(key) >= 8 else key.ljust(8, b'\0')
        
        # Expand 8-byte DES key to 16 bytes for AES-128
        aes_key = bytearray(16)
        for i in range(16):
            aes_key[i] = key[i % 8]
        aes_key = bytes(aes_key)
        
        # Generate random IV (16 bytes for AES)
        iv = os.urandom(16)
        
        # Pad plaintext to AES block size (16 bytes)
        padded_text = self._pad_aes(plaintext.encode('utf-8'))
        
        # Create cipher using AES-128 (for Web Crypto API compatibility)
        cipher = Cipher(
            algorithms.AES(aes_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # Encrypt
        ciphertext = encryptor.update(padded_text) + encryptor.finalize()
        
        # Combine IV and ciphertext
        encrypted_data = iv + ciphertext
        
        # Return base64 encoded
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, ciphertext: str, key: bytes) -> str:
        """Decrypt ciphertext using DES (using AES-128 for Web Crypto API compatibility)."""
        # DES uses 8-byte key, but we expand it to 16 bytes for AES-128
        if len(key) != 8:
            key = key[:8] if len(key) >= 8 else key.ljust(8, b'\0')
        
        # Expand 8-byte DES key to 16 bytes for AES-128
        aes_key = bytearray(16)
        for i in range(16):
            aes_key[i] = key[i % 8]
        aes_key = bytes(aes_key)
        
        # Decode base64
        encrypted_data = base64.b64decode(ciphertext.encode('utf-8'))
        
        # Extract IV and ciphertext (16 bytes IV for AES)
        iv = encrypted_data[:16]
        ciphertext = encrypted_data[16:]
        
        # Create cipher using AES-128
        cipher = Cipher(
            algorithms.AES(aes_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        # Decrypt
        padded_text = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Remove padding
        plaintext = self._unpad_aes(padded_text)
        
        return plaintext.decode('utf-8')
    
    def generate_key(self, key_size: int = 64) -> bytes:
        """Generate a random DES key (8 bytes)."""
        return os.urandom(8)
    
    def _pad(self, data: bytes) -> bytes:
        """PKCS7 padding for DES (8 bytes)."""
        padding_length = self.block_size - (len(data) % self.block_size)
        padding = bytes([padding_length] * padding_length)
        return data + padding
    
    def _pad_aes(self, data: bytes) -> bytes:
        """PKCS7 padding for AES (16 bytes)."""
        block_size = 16
        padding_length = block_size - (len(data) % block_size)
        padding = bytes([padding_length] * padding_length)
        return data + padding
    
    def _unpad(self, data: bytes) -> bytes:
        """Remove PKCS7 padding for DES."""
        padding_length = data[-1]
        return data[:-padding_length]
    
    def _unpad_aes(self, data: bytes) -> bytes:
        """Remove PKCS7 padding for AES."""
        padding_length = data[-1]
        return data[:-padding_length]

