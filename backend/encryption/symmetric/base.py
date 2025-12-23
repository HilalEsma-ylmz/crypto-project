"""
Base class for symmetric encryption implementations.
"""

from abc import ABC, abstractmethod


class SymmetricEncryption(ABC):
    """Abstract base class for symmetric encryption algorithms."""
    
    @abstractmethod
    def encrypt(self, plaintext: str, key: bytes) -> str:
        """
        Encrypt plaintext using the symmetric key.
        
        Args:
            plaintext: Text to encrypt
            key: Encryption key
            
        Returns:
            Base64 encoded encrypted string
        """
        pass
    
    @abstractmethod
    def decrypt(self, ciphertext: str, key: bytes) -> str:
        """
        Decrypt ciphertext using the symmetric key.
        
        Args:
            ciphertext: Base64 encoded encrypted string
            key: Decryption key
            
        Returns:
            Decrypted plaintext
        """
        pass
    
    @abstractmethod
    def generate_key(self, key_size: int = None) -> bytes:
        """
        Generate a random key.
        
        Args:
            key_size: Size of the key in bits
            
        Returns:
            Generated key as bytes
        """
        pass




