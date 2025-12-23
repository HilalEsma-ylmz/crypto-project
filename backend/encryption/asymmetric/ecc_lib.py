"""
ECC encryption using cryptography library - Web Crypto API Uyumlu Versiyon
"""

import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend
from .base import AsymmetricEncryption

class ECCLib(AsymmetricEncryption):
    """ECC encryption implementation using cryptography library."""

    def generate_key_pair(self, key_size: int = None) -> tuple:
        """Generate ECC key pair (NIST P-256)."""
        private_key = ec.generate_private_key(
            ec.SECP256R1(),
            default_backend()
        )
        public_key = private_key.public_key()

        # Private key: PEM format (Backend kullanımı için standart)
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )

        # Public key: DER (SPKI) format - Web Crypto API ile en uyumlu format
        public_der = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        return public_der, private_pem

    def encrypt_key(self, symmetric_key: bytes, public_key: bytes) -> str:
        """Simetrik anahtarı ECC (ECDH + HKDF) kullanarak şifreler."""
        # 1. Gelen public key'i yükle
        try:
            peer_public_key = serialization.load_der_public_key(public_key, default_backend())
        except Exception:
            try:
                peer_public_key = serialization.load_pem_public_key(public_key, default_backend())
            except Exception:
                # Eğer ikisi de olmazsa ham (raw) formatı dene
                peer_public_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), public_key)

        # 2. Geçici (Ephemeral) anahtar oluştur
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        public_key_obj = private_key.public_key()

        # 3. ECDH Shared Secret
        shared_secret = private_key.exchange(ec.ECDH(), peer_public_key)

        # 4. HKDF (Web Crypto ile tam uyumlu boş salt/info kullanımı)
        derived_key = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"",  # None yerine b"" (boş byte)
            info=b"",  # None yerine b""
            backend=default_backend()
        ).derive(shared_secret)

        # 5. XOR Şifreleme
        encrypted = bytes(a ^ b for a, b in zip(symmetric_key, derived_key[:len(symmetric_key)]))

        # 6. Ephemeral Public Key'i DER formatında paketle
        ephemeral_pub = public_key_obj.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        # Format: [Public Key] ||| [Encrypted Data]
        combined = ephemeral_pub + b'|||' + encrypted
        return base64.b64encode(combined).decode('utf-8')

    def decrypt_key(self, encrypted_key: str, private_key: bytes) -> bytes:
        """Sunucuya gelen şifreli simetrik anahtarı çözer."""
        try:
            # Private key'i yükle
            priv_key = serialization.load_pem_private_key(private_key, password=None, backend=default_backend())

            # Base64 çöz
            combined = base64.b64decode(encrypted_key)

            # Ayırıcıyı bul
            parts = combined.split(b'|||')
            if len(parts) != 2:
                raise ValueError("Şifreli anahtar formatı hatalı (ayırıcı bulunamadı)")

            ephemeral_pub_bytes, encrypted = parts

            # Ephemeral Public Key'i yükle (DER formatı)
            try:
                ephemeral_pub = serialization.load_der_public_key(ephemeral_pub_bytes, default_backend())
            except:
                # Raw format denemesi
                ephemeral_pub = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), ephemeral_pub_bytes)

            # Shared Secret
            shared_secret = priv_key.exchange(ec.ECDH(), ephemeral_pub)

            # HKDF ile anahtar türet (Web Crypto uyumlu)
            derived_key = HKDF(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b"",
                info=b"",
                backend=default_backend()
            ).derive(shared_secret)

            # XOR Deşifre
            symmetric_key = bytes(a ^ b for a, b in zip(encrypted, derived_key[:len(encrypted)]))
            return symmetric_key
        except Exception as e:
            print(f"ECC Decryption Error: {str(e)}")
            raise e