import requests

# Önce HTTP endpoint'i test et
try:
    response = requests.get('http://localhost:5000/')
    print(f"✅ HTTP Test: {response.status_code} - {response.text}")
except Exception as e:
    print(f"❌ HTTP Test Hatası: {e}")

print("\n🔗 WebSocket testi için:")
print("1. Tarayıcınızda F12'ye basın")
print("2. Console sekmesine gidin")
print("3. Şu kodu yapıştırın:\n")

websocket_code = """
// WebSocket test kodu
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = function() {
    console.log('✅ WebSocket bağlantısı kuruldu!');
    
    // Test mesajı gönder
    const testData = {
        message: "Hello World",
        method: "caesar",
        key: 3
    };
    ws.send(JSON.stringify(testData));
    console.log('📤 Gönderilen:', testData);
};

ws.onmessage = function(event) {
    console.log('📥 Alınan:', JSON.parse(event.data));
};

ws.onerror = function(error) {
    console.error('❌ Hata:', error);
};
"""

print(websocket_code)