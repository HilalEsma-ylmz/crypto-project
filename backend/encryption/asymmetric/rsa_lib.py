"""
RSA encryption using cryptography library - Web Crypto API Uyumlu
"""

import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
from .base import AsymmetricEncryption


class RSALib(AsymmetricEncryption):
    """RSA encryption implementation using cryptography library."""

    def generate_key_pair(self, key_size: int = 2048) -> tuple:
        """Generate RSA key pair."""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size,
            backend=default_backend()
        )
        public_key = private_key.public_key()

        # Private key: PEM format
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )

        # Public key: DER format (Web Crypto API'nin beklediği standart SPKI formatı)
        public_der = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        return public_der, private_pem

    def encrypt_key(self, symmetric_key: bytes, public_key: bytes) -> str:
        """Encrypt symmetric key using RSA public key."""
        try:
            # Önce DER formatını deniyoruz (JS'den gelen format)
            pub_key = serialization.load_der_public_key(public_key, default_backend())
        except Exception:
            # Hata alırsak PEM formatını deniyoruz
            pub_key = serialization.load_pem_public_key(public_key, default_backend())

        # Şifreleme (OAEP + MGF1 SHA-256)
        encrypted_key = pub_key.encrypt(
            symmetric_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

        return base64.b64encode(encrypted_key).decode('utf-8')

    def decrypt_key(self, encrypted_key: str, private_key: bytes) -> bytes:
        """Decrypt symmetric key using RSA private key."""
        try:
            # Private key yükle
            priv_key = serialization.load_pem_private_key(
                private_key,
                password=None,
                backend=default_backend()
            )

            # Base64 decode
            encrypted_data = base64.b64decode(encrypted_key)

            # Deşifre (JS tarafıyla tam uyumlu parametreler)
            symmetric_key = priv_key.decrypt(
                encrypted_data,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )

            return symmetric_key
        except Exception as e:
            print(f"RSA Decryption Error: {str(e)}")
            raise e