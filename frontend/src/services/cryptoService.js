const API_URL = "http://127.0.0.1:5000";

export async function encryptMessage(method, key, text) {
  const res = await fetch(`${API_URL}/encrypt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, key, text }),
  });
  return await res.json();
}

export async function decryptMessage(method, key, text) {
  const res = await fetch(`${API_URL}/decrypt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, key, text }),
  });
  return await res.json();
}
