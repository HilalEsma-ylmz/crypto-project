"""
Flask WebSocket server for crypto chat application - Kararlı Versiyon
"""

import json
import base64
import sys
import os
import traceback
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

# Backend dizinini içe aktarmalar için yola ekle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from encryption import SymmetricEncryptionFactory, AsymmetricEncryptionFactory

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.config['SECRET_KEY'] = 'your-secret-key-here'

# CORS ve Async Mode ayarları (eventlet yüklü olması önerilir)
socketio = SocketIO(app, cors_allowed_origins="*")

# İstemci şifreleme ayarlarını saklamak için (Bellek üzerinde)
client_settings = {}
# İstemciye özel sunucu asimetrik anahtar çiftleri
server_key_pairs = {}

@socketio.on('connect')
def handle_connect():
    """İstemci bağlandığında tetiklenir."""
    print(f"Client connected: {request.sid}")
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """İstemci ayrıldığında verileri temizle."""
    print(f"Client disconnected: {request.sid}")
    client_settings.pop(request.sid, None)
    server_key_pairs.pop(request.sid, None)

@socketio.on('key_exchange_params')
def handle_key_exchange_params(data):
    """
    İstemci algoritma değiştirdiğinde veya ilk bağlantıda yeni
    sunucu anahtar çiftini üretir.
    """
    try:
        asymmetric_algo = data.get('asymmetric_algorithm', 'rsa')
        asymmetric_impl = 'lib' # Anahtar değişimi her zaman kütüphane ile yapılır

        print(f"Generating new {asymmetric_algo} keys for sid: {request.sid}")

        asymmetric_enc = AsymmetricEncryptionFactory.create(asymmetric_algo, asymmetric_impl)

        # Sunucu için yeni anahtar çifti üret
        public_key, private_key = asymmetric_enc.generate_key_pair()

        # Eski anahtar varsa üzerine yazar (Sıfırlama mantığı için kritik)
        server_key_pairs[request.sid] = {
            'private_key': private_key,
            'algorithm': asymmetric_algo
        }

        # Genel anahtarı istemciye gönder
        emit('server_public_key', {
            'public_key': base64.b64encode(public_key).decode('utf-8'),
            'algorithm': asymmetric_algo
        })

    except Exception as e:
        print(f"Key generation error: {e}")
        emit('error', {'message': f'Anahtar değişimi başarısız: {str(e)}'})

@socketio.on('set_encryption_settings')
def handle_set_encryption_settings(data):
    """İstemciden gelen şifreli simetrik anahtarı çözer ve ayarları kaydeder."""
    try:
        asymmetric_algo = data.get('asymmetric_algorithm', 'rsa')

        if request.sid not in server_key_pairs:
            emit('error', {'message': 'Sunucu anahtarı bulunamadı, lütfen önce anahtar isteyin.'})
            return

        server_private_key = server_key_pairs[request.sid]['private_key']
        asymmetric_enc = AsymmetricEncryptionFactory.create(asymmetric_algo, 'lib')

        encrypted_symmetric_key = data.get('encrypted_symmetric_key', '')

        # Simetrik anahtarı sunucu özel anahtarı ile deşifre et
        symmetric_key = asymmetric_enc.decrypt_key(encrypted_symmetric_key, server_private_key)

        # Ayarları istemciye özel sakla
        client_settings[request.sid] = {
            'symmetric_algorithm': data.get('symmetric_algorithm', 'aes'),
            'symmetric_implementation': data.get('symmetric_implementation', 'lib'),
            'symmetric_key': symmetric_key
        }

        print(f"Encryption settings verified for {request.sid}")
        emit('settings_confirmed', {'status': 'ok'})

    except Exception as e:
        traceback.print_exc()
        emit('error', {'message': f'Ayarlar kaydedilemedi: {str(e)}'})

@socketio.on('message')
def handle_message(data):
    """Şifreli mesajı alır, çözer, işler ve tekrar şifreleyerek geri gönderir."""
    try:
        if request.sid not in client_settings:
            emit('error', {'message': 'Şifreleme ayarları bulunamadı!'})
            return

        settings = client_settings[request.sid]
        symmetric_enc = SymmetricEncryptionFactory.create(
            settings['symmetric_algorithm'],
            settings['symmetric_implementation']
        )

        encrypted_incoming = data.get('message', '')
        symmetric_key = settings['symmetric_key']

        # 1. Mesajı Deşifre Et (Sunucu içeriği görür)
        decrypted_text = symmetric_enc.decrypt(encrypted_incoming, symmetric_key)
        print(f"Message from {request.sid}: {decrypted_text}")

        # 2. Cevabı Hazırla
        server_response_text = f"+{decrypted_text}"

        # 3. Cevabı TEKRAR ŞİFRELE (Ağ güvenliği için en kritik adım)
        # Artık 'decrypted' veya 'original_encrypted' gibi açık alanlar göndermiyoruz.
        re_encrypted_response = symmetric_enc.encrypt(server_response_text, symmetric_key)

        # 4. Sadece şifreli yükü (payload) gönder
        emit('message_response', {
            'encrypted_payload': re_encrypted_response
        })

    except Exception as e:
        print(f"Message handling error: {e}")
        emit('error', {'message': 'Mesaj işlenirken şifreleme hatası oluştu.'})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)