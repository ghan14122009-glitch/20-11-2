const encoder = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers }
  });
}
export async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}
export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}
export async function createSessionToken(secret) {
  const payload = base64url(encoder.encode(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, n: crypto.randomUUID() })));
  const signature = base64url(await hmac(secret, payload));
  return `${payload}.${signature}`;
}
export async function validSession(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("lb_admin="))?.slice("lb_admin=".length);
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  try {
    const expected = await hmac(env.SESSION_SECRET, payload);
    const supplied = fromBase64url(signature);
    if (expected.length !== supplied.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) mismatch |= expected[i] ^ supplied[i];
    if (mismatch !== 0) return false;
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    return Number.isFinite(data.exp) && data.exp > Date.now();
  } catch { return false; }
}
export function sessionCookie(token, maxAge = 28800) {
  return `lb_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
export function requireAdmin(request, env) {
  return validSession(request, env).then(ok => ok ? null : json({ error: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại." }, 401));
}
export function cleanString(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
