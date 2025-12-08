import string


def _build_matrix(key: str):
    key = key.upper().replace("J", "I")
    key = "".join(ch for ch in key if ch.isalpha())
    seen = set()
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"  # J hariç
    matrix_str = ""

    for ch in key + alphabet:
        if ch not in seen:
            seen.add(ch)
            matrix_str += ch

    matrix = [list(matrix_str[i:i + 5]) for i in range(0, 25, 5)]
    positions = {}
    for r in range(5):
        for c in range(5):
            positions[matrix[r][c]] = (r, c)
    return matrix, positions


def _prepare_pairs(text: str):
    clean = text.upper().replace("J", "I")
    clean = "".join(ch for ch in clean if ch.isalpha())
    pairs = []
    i = 0
    while i < len(clean):
        a = clean[i]
        b = clean[i + 1] if i + 1 < len(clean) else "X"
        if a == b:
            pairs.append((a, "X"))
            i += 1
        else:
            pairs.append((a, b))
            i += 2
    if len(pairs[-1]) == 1:
        pairs[-1] = (pairs[-1][0], "X")
    return pairs


def encrypt(text: str, params):
    key = params.get("key", "MONARCHY")
    matrix, pos = _build_matrix(key)
    pairs = _prepare_pairs(text)
    result = []
    for a, b in pairs:
        ra, ca = pos[a]
        rb, cb = pos[b]
        if ra == rb:
            result.append(matrix[ra][(ca + 1) % 5])
            result.append(matrix[rb][(cb + 1) % 5])
        elif ca == cb:
            result.append(matrix[(ra + 1) % 5][ca])
            result.append(matrix[(rb + 1) % 5][cb])
        else:
            result.append(matrix[ra][cb])
            result.append(matrix[rb][ca])
    return "".join(result)


def decrypt(text: str, params):
    key = params.get("key", "MONARCHY")
    matrix, pos = _build_matrix(key)
    clean = "".join(ch for ch in text.upper() if ch.isalpha())
    result = []
    for i in range(0, len(clean), 2):
        a, b = clean[i], clean[i + 1]
        ra, ca = pos[a]
        rb, cb = pos[b]
        if ra == rb:
            result.append(matrix[ra][(ca - 1) % 5])
            result.append(matrix[rb][(cb - 1) % 5])
        elif ca == cb:
            result.append(matrix[(ra - 1) % 5][ca])
            result.append(matrix[(rb - 1) % 5][cb])
        else:
            result.append(matrix[ra][cb])
            result.append(matrix[rb][ca])
    return "".join(result)

