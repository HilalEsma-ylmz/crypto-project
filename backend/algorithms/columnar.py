def _order(key: str):
    return [i for _, i in sorted([(ch, i) for i, ch in enumerate(key)])]


def encrypt(text, params):
    key = str(params.get("key", "KEY"))
    clean = "".join(text.split())
    cols = len(key)
    rows = (len(clean) + cols - 1) // cols
    grid = [["X"] * cols for _ in range(rows)]
    idx = 0
    for r in range(rows):
        for c in range(cols):
            if idx < len(clean):
                grid[r][c] = clean[idx]
                idx += 1
    res = []
    for c in _order(key):
        for r in range(rows):
            res.append(grid[r][c])
    return "".join(res)


def decrypt(cipher, params):
    key = str(params.get("key", "KEY"))
    cols = len(key)
    rows = (len(cipher) + cols - 1) // cols
    order = _order(key)
    grid = [[""] * cols for _ in range(rows)]
    idx = 0
    for c in order:
        for r in range(rows):
            grid[r][c] = cipher[idx]
            idx += 1
    res = []
    for r in range(rows):
        for c in range(cols):
            res.append(grid[r][c])
    return "".join(res).rstrip("X")

