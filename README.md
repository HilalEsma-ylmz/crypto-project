# Crypto Chat - Şifreli Mesajlaşma Uygulaması

Güvenli, şifreli mesajlaşma uygulaması. Python Flask backend ve WebSocket ile gerçek zamanlı mesajlaşma sağlar.

## Özellikler

### Şifreleme Algoritmaları

#### Simetrik Şifreleme (Mesaj Şifreleme)
- **AES** (Advanced Encryption Standard)
- **DES** (Data Encryption Standard)
- **Uygulama Yöntemleri**:
  - **Kütüphaneli**: Güvenilir kriptografi kütüphaneleri kullanarak
  - **Manuel**: Eğitim amaçlı basitleştirilmiş implementasyonlar

#### Asimetrik Anahtar Dağıtımı
- **RSA** (Rivest-Shamir-Adleman) - Sadece kütüphaneli
- **ECC** (Elliptic Curve Cryptography) - Sadece kütüphaneli
- **Not**: Asimetrik şifreleme sadece anahtar dağıtımı için kullanılır ve her zaman kütüphaneli implementasyon kullanır

## Proje Yapısı

```
crypto_chat/
├── backend/
│   ├── app.py                 # Flask WebSocket sunucusu
│   ├── requirements.txt       # Python bağımlılıkları
│   └── encryption/
│       ├── symmetric/         # Simetrik şifreleme modülleri
│       │   ├── aes_lib.py
│       │   ├── aes_manual.py
│       │   ├── des_lib.py
│       │   ├── des_manual.py
│       │   └── factory.py
│       └── asymmetric/        # Asimetrik şifreleme modülleri
│           ├── rsa_lib.py
│           ├── rsa_manual.py
│           ├── ecc_lib.py
│           ├── ecc_manual.py
│           └── factory.py
├── frontend/
│   ├── templates/
│   │   └── index.html         # Ana sayfa
│   └── static/
│       ├── css/
│       │   └── style.css      # Stil dosyası
│       └── js/
│           ├── app.js         # Ana uygulama JavaScript
│           └── encryption/    # JavaScript şifreleme modülleri
│               ├── symmetric/
│               └── asymmetric/
└── README.md
```

## Kurulum

### Gereksinimler
- Python 3.8+
- pip (Python paket yöneticisi)

### Adımlar

1. **Backend bağımlılıklarını yükleyin:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Sunucuyu başlatın:**
```bash
python app.py
```

3. **Tarayıcıda açın:**
```
http://localhost:5000
```

## Kullanım

1. **Şifreleme Ayarlarını Seçin:**
   - Simetrik şifreleme: AES veya DES
   - Asimetrik anahtar dağıtımı: RSA veya ECC
   - Uygulama yöntemi: Kütüphaneli veya Manuel

2. **Anahtarları Oluşturun:**
   - "Anahtarları Oluştur" butonuna tıklayın
   - Sistem otomatik olarak gerekli anahtarları oluşturur

3. **Ayarları Uygulayın:**
   - "Ayarları Uygula" butonuna tıklayın
   - Ayarlar sunucuya gönderilir

4. **Mesaj Gönderin:**
   - Mesajınızı yazın
   - "Gönder" butonuna tıklayın veya Enter'a basın
   - Mesaj şifrelenir, sunucuya gönderilir, sunucuda deşifre edilir ve yeniden şifrelenir

## Mimari

### SOLID Prensipleri

- **Single Responsibility**: Her modül tek bir sorumluluğa sahip
- **Open/Closed**: Factory pattern ile yeni algoritmalar kolayca eklenebilir
- **Liskov Substitution**: Base class'lar interface olarak kullanılır
- **Interface Segregation**: Base class'lar minimal interface sağlar
- **Dependency Inversion**: Factory pattern ile bağımlılıklar tersine çevrilir

### Şifreleme Akışı

#### Anahtar Dağıtımı (Asimetrik Şifreleme ile)
1. **Client**: Simetrik anahtar ve asimetrik anahtar çifti oluşturur
2. **Client → Server**: Asimetrik algoritma ve implementation bilgisi gönderilir
3. **Server**: Kendi asimetrik anahtar çiftini oluşturur
4. **Server → Client**: Public key gönderilir
5. **Client**: Simetrik anahtarı sunucunun public key'i ile şifreler
6. **Client → Server**: Şifrelenmiş simetrik anahtar gönderilir
7. **Server**: Private key ile simetrik anahtarı deşifre eder

#### Mesajlaşma (Simetrik Şifreleme ile)
1. **Client**: Mesajı simetrik anahtarla şifreler
2. **Client → Server**: Şifreli mesaj WebSocket ile gönderilir
3. **Server**: Mesajı deşifre eder
4. **Server**: Mesajı yeniden şifreler
5. **Server → Client**: Şifreli mesaj geri gönderilir
6. **Client**: Mesaj detaylarını gösterir

## Güvenlik Notları

⚠️ **ÖNEMLİ**: Bu uygulama eğitim amaçlıdır. Manuel implementasyonlar gerçek kriptografik güvenlik sağlamaz. Üretim ortamında mutlaka kütüphaneli versiyonları kullanın.

## Lisans

Bu proje eğitim amaçlıdır.

