"""
Factory for creating symmetric encryption instances.
"""

from .aes_lib import AESLib
from .aes_manual import AESManual
from .des_lib import DESLib
from .des_manual import DESManual
from .base import SymmetricEncryption
from .vigenere_lib import VigenereLib
from .caesar_lib import CaesarLib
from .railfence_lib import RailFenceLib
from .playfair_lib import PlayfairLib

class SymmetricEncryptionFactory:
    """Factory for creating symmetric encryption instances."""
    
    @staticmethod
    def create(algorithm: str, implementation: str = 'lib') -> SymmetricEncryption:
        """
        Create a symmetric encryption instance.
        
        Args:
            algorithm: 'aes' or 'des'
            implementation: 'lib' or 'manual'
            
        Returns:
            SymmetricEncryption instance
        """
        algorithm = algorithm.lower()
        implementation = implementation.lower()
        
        if algorithm == 'vigenere':
            return VigenereLib()
        if algorithm == 'aes':
            if implementation == 'manual':
                return AESManual()
            return AESLib()
        elif algorithm == 'des':
            if implementation == 'manual':
                return DESManual()
            return DESLib()
        elif algorithm == 'caesar':
            return CaesarLib()
        elif algorithm == 'railfence':
            return RailFenceLib()
        elif algorithm == 'playfair':
            return PlayfairLib()
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")




