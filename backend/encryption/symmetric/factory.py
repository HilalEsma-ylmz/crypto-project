"""
Factory for creating symmetric encryption instances.
"""

from .aes_lib import AESLib
from .aes_manual import AESManual
from .des_lib import DESLib
from .des_manual import DESManual
from .base import SymmetricEncryption


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
        
        if algorithm == 'aes':
            if implementation == 'manual':
                return AESManual()
            return AESLib()
        elif algorithm == 'des':
            if implementation == 'manual':
                return DESManual()
            return DESLib()
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")




