def encrypt(plaintext, params):
    key = params.get("key", "")
    if not key:
        return "Anahtar gerekli"
    key = key.lower()
    result = ""
    key_index = 0

    for ch in plaintext:
        if ch.isalpha():
            base = 'A' if ch.isupper() else 'a'
            shift = ord(key[key_index % len(key)]) - ord('a')
            result += chr((ord(ch) - ord(base) + shift) % 26 + ord(base))
            key_index += 1
        else:
            result += ch
    return result


def decrypt(ciphertext, params):
    key = params.get("key", "")
    if not key:
        return "Anahtar gerekli"
    key = key.lower()
    result = ""
    key_index = 0

    for ch in ciphertext:
        if ch.isalpha():
            base = 'A' if ch.isupper() else 'a'
            shift = ord(key[key_index % len(key)]) - ord('a')
            result += chr((ord(ch) - ord(base) - shift) % 26 + ord(base))
            key_index += 1
        else:
            result += ch
    return result
