import { json } from "../../_utils.js";
import { requireAdmin, sessionCookie } from "../../_utils.js";
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}
