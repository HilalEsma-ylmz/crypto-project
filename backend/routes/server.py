from flask import Flask
from flask_sock import Sock
from flask_cors import CORS
import json
import logging
import sys
import os

# Proje yolunu ekle
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Algoritmaları import et
from algorithms.caesar import encrypt as caesar_encrypt, decrypt as caesar_decrypt
from algorithms.vigenere import encrypt as vigenere_encrypt, decrypt as vigenere_decrypt
from algorithms.xor_cipher import encrypt as xor_encrypt, decrypt as xor_decrypt

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
sock = Sock(app)

DEFAULT_METHOD = 'caesar'
DEFAULT_SHIFT = 3
DEFAULT_VIGENERE_KEY = 'SECRET'
DEFAULT_XOR_KEY = 'KEY'

def encrypt_message(message, method, key):
    """Mesajı şifrele"""
    if method == 'caesar':
        params = {"shift": key}
        return caesar_encrypt(message, params)
    elif method == 'vigenere':
        params = {"key": key}
        return vigenere_encrypt(message, params)
    elif method == 'xor':
        params = {"key": key}
        return xor_encrypt(message, params)
    else:
        raise ValueError(f"Bilinmeyen şifreleme yöntemi: {method}")

def decrypt_message(message, method, key):
    """Mesajın şifresini çöz"""
    if method == 'caesar':
        params = {"shift": key}
        return caesar_decrypt(message, params)
    elif method == 'vigenere':
        params = {"key": key}
        return vigenere_decrypt(message, params)
    elif method == 'xor':
        params = {"key": key}
        return xor_decrypt(message, params)
    else:
        raise ValueError(f"Bilinmeyen şifreleme yöntemi: {method}")

@app.route('/')
def index():
    return "Crypto Project Sunucusu Çalışıyor"

@sock.route('/ws')
def websocket(ws):
    client_addr = ws.environ.get('REMOTE_ADDR', 'Unknown')
    logger.info(f"✅ İstemci bağlandı: {client_addr}")
    print(f"\n{'=' * 60}")
    print(f"✅ YENİ BAĞLANTI: {client_addr}")
    print(f"{'=' * 60}\n")

    try:
        while True:
            data = ws.receive()
            if data is None:
                logger.info(f"❌ İstemci bağlantısını kapattı: {client_addr}")
                print(f"\n❌ Bağlantı kapandı: {client_addr}\n")
                break

            print("-" * 60)
            print(f"📥 RAW DATA: {data}")

            # JSON parse et
            try:
                packet = json.loads(data)
                message = packet.get('message', '')
                method = packet.get('method', DEFAULT_METHOD)
                key = packet.get('key', None)

                logger.debug(f"📨 Paket alındı - Method: {method}, Message: {message}")

                # Anahtarları belirle ve dönüştür
                if method == 'caesar':
                    if key is None:
                        key = DEFAULT_SHIFT
                    else:
                        key = int(key) if isinstance(key, str) and key.isdigit() else key
                elif method == 'vigenere':
                    if key is None:
                        key = DEFAULT_VIGENERE_KEY
                    else:
                        key = str(key)
                elif method == 'xor':
                    if key is None:
                        key = DEFAULT_XOR_KEY
                    else:
                        key = str(key)

                print(f"🔐 Şifreleme Yöntemi: {method}")
                print(f"🔑 Anahtar: {key}")
                print(f"📨 Alınan Mesaj: {message}")

                # Deşifre et
                try:
                    decrypted = decrypt_message(message, method, key)
                    print(f"🔓 Çözülen Mesaj: {decrypted}")
                except Exception as e:
                    print(f"❌ Deşifreleme Hatası: {e}")
                    logger.error(f"Deşifreleme hatası: {e}", exc_info=True)
                    decrypted = f"[HATA] {str(e)}"

                # İşle
                processed = decrypted + " (sunucuda işlendi)"
                print(f"🔄 İşlenen Mesaj: {processed}")

                # Aynı yönteme göre şifrele
                try:
                    encrypted_response = encrypt_message(processed, method, key)
                    print(f"🔐 Şifreli Cevap: {encrypted_response}")
                except Exception as e:
                    print(f"❌ Şifreleme Hatası: {e}")
                    logger.error(f"Şifreleme hatası: {e}", exc_info=True)
                    encrypted_response = processed

                # Cevap paketini oluştur
                response_packet = {
                    "message": encrypted_response,
                    "method": method,
                    "key": str(key) if method != 'caesar' else key
                }
                response = json.dumps(response_packet)

                print(f"📤 Gönderiliyor: {response}")
                ws.send(response)
                print(f"✅ Cevap Gönderildi")

            except json.JSONDecodeError as e:
                print(f"⚠  JSON Parse Hatası: {e}")
                logger.warning(f"JSON parse başarısız: {data}")
                error_response = {
                    "message": "JSON Parse Hatası",
                    "error": True
                }
                ws.send(json.dumps(error_response))
            except Exception as e:
                logger.error(f"❌ İşlem Hatası: {e}", exc_info=True)
                print(f"❌ İşlem Hatası: {e}")
                error_response = {
                    "message": f"Sunucu Hatası: {str(e)}",
                    "error": True
                }
                ws.send(json.dumps(error_response))

    except Exception as e:
        logger.error(f"❌ Bağlantı Hatası: {e}", exc_info=True)
        print(f"❌ HATA: {e}\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000, use_reloader=False)