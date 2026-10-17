import { json, readJson, createSessionToken, sessionCookie } from "../../_utils.js";
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "Thiếu ADMIN_PASSWORD hoặc SESSION_SECRET trong cài đặt Cloudflare." }, 503);
  }
  const body = await readJson(request);
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length > 500 || password !== env.ADMIN_PASSWORD) {
    return json({ error: "Mật khẩu chưa chính xác." }, 401);
  }
  const token = await createSessionToken(env.SESSION_SECRET);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
}
