# 🔐 Şifreleme ve Deşifreleme Sistemi

Flask backend ve React frontend ile WebSocket destekli şifreleme/deşifreleme uygulaması.

## 🚀 Özellikler

- **3 Farklı Şifreleme Algoritması**: Caesar, Vigenere ve XOR
- **WebSocket ile Gerçek Zamanlı İletişim**: İstemci ve sunucu arasında anlık mesajlaşma
- **Hem İstemcide Hem Sunucuda Şifreleme**: 
  - İstemci mesajı şifreler
  - Sunucuya gönderir
  - Sunucu mesajı deşifre eder
  - Sunucu yeni mesajı şifreler ve geri gönderir
  - İstemci gelen mesajı deşifre eder
- **Modern ve Responsive Arayüz**: Güzel bir UI ile kullanım

## 📋 Gereksinimler

- Python 3.8+
- Node.js 18+
- pip
- npm veya yarn

## 🔧 Kurulum

### Backend

1. Backend dizinine gidin:
```bash
cd backend
```

2. Virtual environment oluşturun ve etkinleştirin:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

### Frontend

1. Frontend dizinine gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

## ▶️ Çalıştırma

### Backend Sunucusu

Backend'i çalıştırmak için:

```bash
cd backend
python routes/server.py
```

Sunucu `http://localhost:5000` adresinde çalışacak.

### Frontend Uygulaması

Frontend'i çalıştırmak için:

```bash
cd frontend
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacak.

## 🎯 Kullanım

1. Tarayıcınızda `http://localhost:3000` adresine gidin
2. Şifreleme yöntemini seçin (Caesar, Vigenere veya XOR)
3. Anahtarı girin (yönteme göre değişir)
4. Mesajınızı yazın
5. "Gönder" butonuna tıklayın

### Şifreleme Yöntemleri

#### Caesar Cipher
- **Anahtar**: Bir sayı (örn: 3)
- Alfabedeki her harfi belirtilen sayı kadar kaydırır

#### Vigenere Cipher
- **Anahtar**: Bir kelime (örn: "KEY")
- Anahtar kelimesini tekrarlayarak her harfi farklı miktarda kaydırır

#### XOR Cipher
- **Anahtar**: Bir metin (örn: "secret")
- Mesajı XOR işlemi ile şifreler
- Base64 formatında çıktı üretir

## 📁 Proje Yapısı

```
crypto-projectkopya/
├── backend/
│   ├── algorithms/          # Şifreleme algoritmaları
│   │   ├── caesar.py
│   │   ├── vigenere.py
│   │   └── xor_cipher.py
│   ├── routes/
│   │   └── server.py       # Flask WebSocket sunucusu
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React componentleri
│   │   ├── pages/          # Sayfa componentleri
│   │   ├── services/       # WebSocket servisi
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔄 Nasıl Çalışır?

1. **İstemcide**: Kullanıcı mesaj yazar ve istemcide şifrelenir
2. **Sunucuya Gönderim**: Şifreli mesaj WebSocket ile sunucuya gönderilir
3. **Sunucuda**: Mesaj deşifrelenir, işlenir ve tekrar şifrelenir
4. **İstemciye Dönüş**: Şifreli yanıt istemciye gönderilir
5. **İstemcide**: Gelen mesaj deşifrelenir ve kullanıcıya gösterilir

## 🛠️ Teknolojiler

### Backend
- Flask 3.1.2
- Flask-Sock 0.5.3 (WebSocket desteği)
- Flask-CORS 6.0.1

### Frontend
- React 18.2.0
- Vite 5.0.8
- Native WebSocket API

## 📝 Lisans

Bu proje öğrenme amaçlı hazırlanmıştır.




