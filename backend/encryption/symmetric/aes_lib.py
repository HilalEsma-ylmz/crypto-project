"""
AES encryption using cryptography library.
"""

import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from .base import SymmetricEncryption


class AESLib(SymmetricEncryption):
    """AES encryption implementation using cryptography library."""
    
    def __init__(self):
        self.block_size = 16  # AES block size is 16 bytes
    
    def _ensure_valid_key(self, key: bytes) -> bytes:
        """AES için anahtar boyutunu 16, 24 veya 32 byte yapar."""
        if len(key) in [16, 24, 32]:
            return key
        # Eğer anahtar 160 bit (20 byte) gelirse, 32 byte'a tamamla
        if len(key) < 32:
            return key.ljust(32, b'\0')
        # Çok uzunsa kes
        return key[:32]

    def encrypt(self, plaintext: str, key: bytes) -> str:
        """Encrypt plaintext using AES."""
        key = self._ensure_valid_key(key)

        # Generate random IV
        iv = os.urandom(self.block_size)

        # Pad plaintext to block size
        padded_text = self._pad(plaintext.encode('utf-8'))

        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
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
        """Decrypt ciphertext using AES."""
        key = self._ensure_valid_key(key)

        # Decode base64
        encrypted_data = base64.b64decode(ciphertext.encode('utf-8'))

        # Extract IV and ciphertext
        iv = encrypted_data[:self.block_size]
        ciphertext = encrypted_data[self.block_size:]

        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()

        # Decrypt
        padded_text = decryptor.update(ciphertext) + decryptor.finalize()

        # Remove padding
        plaintext = self._unpad(padded_text)

        return plaintext.decode('utf-8')

    def generate_key(self, key_size: int = 256) -> bytes:
        """Generate a random AES key."""
        if key_size not in [128, 192, 256]:
            key_size = 256
        return os.urandom(key_size // 8)

    def _pad(self, data: bytes) -> bytes:
        """PKCS7 padding."""
        padding_length = self.block_size - (len(data) % self.block_size)
        padding = bytes([padding_length] * padding_length)
        return data + padding

    def _unpad(self, data: bytes) -> bytes:
        """Remove PKCS7 padding."""
        padding_length = data[-1]
        if padding_length > self.block_size:
            return data # Hatalı padding durumunda veriyi bozmamak için
        return data[:-padding_length]