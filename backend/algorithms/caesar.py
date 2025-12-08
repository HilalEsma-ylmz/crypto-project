# backend/algorithms/caesar.py

def encrypt(text, params):
    """
    Verilen metni, verilen kaydırma sayısına göre şifreler.
    params: {"shift": int}
    """
    shift = params.get("shift", 3)
    result = ""
    for char in text:
        if 'a' <= char <= 'z':
            # Küçük harf (ASCII 97-122)
            new_ord = (ord(char) - ord('a') + shift) % 26 + ord('a')
            result += chr(new_ord)
        elif 'A' <= char <= 'Z':
            # Büyük harf (ASCII 65-90)
            new_ord = (ord(char) - ord('A') + shift) % 26 + ord('A')
            result += chr(new_ord)
        else:
            # Harf değilse (rakam, noktalama vb.) olduğu gibi bırak
            result += char
    return result

def decrypt(text, params):
    """
    Sezar şifreli metni çözer.
    Bu, esasen negatif yönde bir kaydırmadır.
    params: {"shift": int}
    """
    shift = params.get("shift", 3)
    result = ""
    for char in text:
        if 'a' <= char <= 'z':
            # Küçük harf
            new_ord = (ord(char) - ord('a') - shift) % 26 + ord('a')
            result += chr(new_ord)
        elif 'A' <= char <= 'Z':
            # Büyük harf
            new_ord = (ord(char) - ord('A') - shift) % 26 + ord('A')
            result += chr(new_ord)
        else:
            result += char
    return result