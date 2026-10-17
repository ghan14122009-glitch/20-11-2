import { json, readJson, sha256, cleanString, requireAdmin } from "../../_utils.js";

function defaultGreeting(name) {
  return `Chúc ${name} có một ngày 20/10 thật vui vẻ và ngập tràn yêu thương! Mong bạn luôn tự tin, rạng rỡ, gặp nhiều điều may mắn và giữ được nụ cười của mình. Chúc những điều tốt đẹp sẽ đến với bạn không chỉ hôm nay mà trong cả những ngày sắp tới. ♡`;
}
function validFields(body, creating) {
  const name = cleanString(body.name, 100);
  const greeting = cleanString(body.greeting, 5000);
  const code = cleanString(body.code, 80);
  if (!name) return { error: "Tên người nhận không được để trống." };
  if (!greeting) return { error: "Lời chúc không được để trống." };
  if (creating && !code) return { error: "Hãy đặt mã truy cập cho người này." };
  if (code.length > 0 && code.length < 3) return { error: "Mã truy cập cần có ít nhất 3 ký tự." };
  return { name, greeting, code };
}
async function uniqueCode(env, code, excludeId = null) {
  const hash = await sha256(code);
  const found = await env.DB.prepare("SELECT id FROM recipients WHERE code_hash = ? LIMIT 1").bind(hash).first();
  return !found || found.id === excludeId ? hash : null;
}
export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const result = await env.DB.prepare(
    "SELECT id, name, greeting, code_hash FROM recipients ORDER BY sort_order ASC, created_at ASC"
  ).all();
  return json({ recipients: (result.results || []).map(r => ({
    id: r.id, name: r.name, greeting: r.greeting, hasCode: !!r.code_hash,
    greetingLength: r.greeting.length
  })) });
}
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const body = await readJson(request);
  if (body.action === "seed") return seedRecipients(env);
  const fields = validFields(body, true);
  if (fields.error) return json({ error: fields.error }, 400);
  const codeHash = await uniqueCode(env, fields.code);
  if (!codeHash) return json({ error: "Mã này đã được người khác sử dụng. Hãy chọn mã khác." }, 409);
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      "INSERT INTO recipients (id, name, greeting, code_hash, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, fields.name, fields.greeting, codeHash, Date.now(), Date.now()).run();
  } catch {
    return json({ error: "Không thể lưu. Có thể mã bị trùng; hãy thử mã khác." }, 409);
  }
  return json({ ok: true, id }, 201);
}
async function seedRecipients(env) {
  const existing = await env.DB.prepare("SELECT COUNT(*) AS count FROM recipients").first();
  const count = Number(existing?.count || 0);
  const now = Date.now();
  const defaults = [];
  for (let i = 1; i <= 26; i++) {
    defaults.push({ name: `Bạn nữ ${String(i).padStart(2, "0")}`, greeting: defaultGreeting(`bạn nữ ${String(i).padStart(2, "0")}`), order: i });
  }
  defaults.push({ name: "Cô giáo", greeting: "Nhân ngày Phụ nữ Việt Nam 20/10, chúng em kính chúc cô luôn mạnh khỏe, hạnh phúc và giữ mãi nhiệt huyết với nghề. Cảm ơn cô vì sự tận tâm, những bài học và sự quan tâm cô dành cho chúng em. Chúc cô có một ngày thật vui vẻ và ấm áp ạ! ♡", order: 27 });
  let added = 0;
  for (const item of defaults) {
    const nameExists = await env.DB.prepare("SELECT id FROM recipients WHERE name = ? LIMIT 1").bind(item.name).first();
    if (nameExists) continue;
    await env.DB.prepare(
      "INSERT INTO recipients (id, name, greeting, code_hash, sort_order, created_at) VALUES (?, ?, ?, NULL, ?, ?)"
    ).bind(crypto.randomUUID(), item.name, item.greeting, now + item.order, now + item.order).run();
    added++;
  }
  return json({ ok: true, message: added ? `Đã thêm ${added} mục mẫu. Hãy sửa tên và đặt mã cho từng người.` : "Danh sách mẫu đã tồn tại; không thêm mục trùng." });
}
