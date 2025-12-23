"""
Base class for asymmetric encryption implementations.
"""

from abc import ABC, abstractmethod
from typing import Tuple


class AsymmetricEncryption(ABC):
    """Abstract base class for asymmetric encryption algorithms."""
    
    @abstractmethod
    def generate_key_pair(self, key_size: int = None) -> Tuple[bytes, bytes]:
        """
        Generate a public/private key pair.
        
        Args:
            key_size: Size of the key in bits
            
        Returns:
            Tuple of (public_key, private_key) as bytes
        """
        pass
    
    @abstractmethod
    def encrypt_key(self, symmetric_key: bytes, public_key: bytes) -> str:
        """
        Encrypt a symmetric key using the public key.
        
        Args:
            symmetric_key: The symmetric key to encrypt
            public_key: Public key for encryption
            
        Returns:
            Base64 encoded encrypted key
        """
        pass
    
    @abstractmethod
    def decrypt_key(self, encrypted_key: str, private_key: bytes) -> bytes:
        """
        Decrypt an encrypted symmetric key using the private key.
        
        Args:
            encrypted_key: Base64 encoded encrypted key
            private_key: Private key for decryption
            
        Returns:
            Decrypted symmetric key as bytes
        """
        pass




