MAP = {
    "A": "A1", "B": "A2", "C": "A3", "D": "A4", "E": "A5", "F": "A6",
    "G": "B1", "H": "B2", "I": "B3", "J": "B3", "K": "B4", "L": "B5", "M": "B6",
    "N": "C1", "O": "C2", "P": "C3", "Q": "C4", "R": "C5", "S": "C6",
    "T": "D1", "U": "D2", "V": "D3", "W": "D4", "X": "D5", "Y": "D6", "Z": "E1"
}
REV = {v: ("I" if k == "J" else k) for k, v in MAP.items()}


def encrypt(text, params):
    res = []
    for ch in text.upper():
        if ch in MAP:
            res.append(MAP[ch])
    return " ".join(res)


def decrypt(cipher, params):
    tokens = cipher.strip().split()
    return "".join(REV.get(t, "") for t in tokens)

