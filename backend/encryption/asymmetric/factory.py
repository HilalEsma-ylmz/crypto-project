"""
Factory for creating asymmetric encryption instances.
Only library implementations are supported for key exchange.
"""

from .rsa_lib import RSALib
from .ecc_lib import ECCLib
from .base import AsymmetricEncryption


class AsymmetricEncryptionFactory:
    """Factory for creating asymmetric encryption instances."""
    
    @staticmethod
    def create(algorithm: str, implementation: str = 'lib') -> AsymmetricEncryption:
        """
        Create an asymmetric encryption instance.
        Only library implementation is supported for key exchange.
        
        Args:
            algorithm: 'rsa' or 'ecc'
            implementation: 'lib' (only library is supported)
            
        Returns:
            AsymmetricEncryption instance
        """
        algorithm = algorithm.lower()
        
        if algorithm == 'rsa':
            return RSALib()
        elif algorithm == 'ecc':
            return ECCLib()
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")

