# backend/algorithms/caesar.py

def caesar_encrypt(text, shift):
    """
    Verilen metni, verilen kaydırma sayısına göre şifreler.
    """
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

def caesar_decrypt(text, shift):
    """
    Sezar şifreli metni çözer.
    Bu, esasen negatif yönde bir kaydırmadır.
    """
    return caesar_encrypt(text, -shift)