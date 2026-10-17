import { json, readJson, sha256, cleanString, requireAdmin } from "../../../_utils.js";

export async function onRequestPut({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const id = cleanString(params.id, 80);
  const body = await readJson(request);
  const name = cleanString(body.name, 100);
  const greeting = cleanString(body.greeting, 5000);
  const code = cleanString(body.code, 80);
  if (!id || !name || !greeting) return json({ error: "Tên và lời chúc không được để trống." }, 400);
  if (code && code.length < 3) return json({ error: "Mã truy cập cần có ít nhất 3 ký tự." }, 400);
  const existing = await env.DB.prepare("SELECT id, code_hash FROM recipients WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Không tìm thấy người nhận." }, 404);
  let codeHash = existing.code_hash;
  if (code) {
    codeHash = await sha256(code);
    const duplicate = await env.DB.prepare("SELECT id FROM recipients WHERE code_hash = ? AND id != ? LIMIT 1").bind(codeHash, id).first();
    if (duplicate) return json({ error: "Mã này đã được người khác sử dụng. Hãy chọn mã khác." }, 409);
  }
  try {
    await env.DB.prepare("UPDATE recipients SET name = ?, greeting = ?, code_hash = ? WHERE id = ?")
      .bind(name, greeting, codeHash, id).run();
  } catch {
    return json({ error: "Không thể lưu thay đổi. Hãy thử lại." }, 500);
  }
  return json({ ok: true });
}
export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const id = cleanString(params.id, 80);
  const result = await env.DB.prepare("DELETE FROM recipients WHERE id = ?").bind(id).run();
  if (!result.meta?.changes) return json({ error: "Không tìm thấy người nhận." }, 404);
  return json({ ok: true });
}
