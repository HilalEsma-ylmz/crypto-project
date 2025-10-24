# backend/algorithms/xor_cipher.py
import base64

def xor_encrypt(plaintext: str, key: str) -> str:
    """
    Verilen metni (plaintext) verilen anahtar (key) ile XOR şifrelemesinden geçirir.
    Sonuç, metin olarak iletilebilmesi için Base64 formatında kodlanır.
    """
    
    # Metni ve anahtarı byte dizisine çevir (UTF-8 kullanarak)
    plaintext_bytes = plaintext.encode('utf-8')
    key_bytes = key.encode('utf-8')
    key_len = len(key_bytes)
    
    encrypted_bytes = bytearray()
    
    for i in range(len(plaintext_bytes)):
        # (plaintext byte) XOR (key byte)
        # Anahtarı tekrar ettirmek için (i % key_len) kullan
        xor_val = plaintext_bytes[i] ^ key_bytes[i % key_len]
        encrypted_bytes.append(xor_val)
        
    # Şifrelenmiş byte dizisini Base64 string'e çevir
    return base64.b64encode(encrypted_bytes).decode('utf-8')

def xor_decrypt(ciphertext_b64: str, key: str) -> str:
    """
    Base64 formatındaki şifreli metni (ciphertext_b64) çözer.
    """
    try:
        # Base64 string'i geri byte dizisine çevir
        ciphertext_bytes = base64.b64decode(ciphertext_b64)
        key_bytes = key.encode('utf-8')
        key_len = len(key_bytes)
        
        decrypted_bytes = bytearray()
        
        for i in range(len(ciphertext_bytes)):
            # (ciphertext byte) XOR (key byte)
            xor_val = ciphertext_bytes[i] ^ key_bytes[i % key_len]
            decrypted_bytes.append(xor_val)
            
        # Çözülen byte dizisini UTF-8 metne çevir
        return decrypted_bytes.decode('utf-8')
    
    except (base64.binascii.Error, UnicodeDecodeError):
        # Hata yönetimi:
        # - base64.binascii.Error: Gelen metin geçerli bir Base64 değilse.
        # - UnicodeDecodeError: Byte'lar geçerli UTF-8'e dönüşmezse (genelde yanlış anahtar).
        raise ValueError("Geçersiz şifreli metin veya yanlış anahtar.")
    except Exception as e:
        raise e