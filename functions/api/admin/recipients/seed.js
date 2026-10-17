import { json, requireAdmin } from "../../../_utils.js";

function defaultGreeting(name) {
  return `Chúc ${name} có một ngày 20/10 thật vui vẻ và ngập tràn yêu thương! Mong bạn luôn tự tin, rạng rỡ, gặp nhiều điều may mắn và giữ được nụ cười của mình. Chúc những điều tốt đẹp sẽ đến với bạn không chỉ hôm nay mà trong cả những ngày sắp tới. ♡`;
}
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const now = Date.now();
  const defaults = [];
  for (let i = 1; i <= 26; i++) {
    const name = `Bạn nữ ${String(i).padStart(2, "0")}`;
    defaults.push({ name, greeting: defaultGreeting(name), order: i });
  }
  defaults.push({ name: "Cô giáo", greeting: "Nhân ngày Phụ nữ Việt Nam 20/10, chúng em kính chúc cô luôn mạnh khỏe, hạnh phúc và giữ mãi nhiệt huyết với nghề. Cảm ơn cô vì sự tận tâm, những bài học và sự quan tâm cô dành cho chúng em. Chúc cô có một ngày thật vui vẻ và ấm áp ạ! ♡", order: 27 });
  let added = 0;
  for (const item of defaults) {
    const exists = await env.DB.prepare("SELECT id FROM recipients WHERE name = ? LIMIT 1").bind(item.name).first();
    if (exists) continue;
    await env.DB.prepare("INSERT INTO recipients (id, name, greeting, code_hash, sort_order, created_at) VALUES (?, ?, ?, NULL, ?, ?)")
      .bind(crypto.randomUUID(), item.name, item.greeting, now + item.order, now + item.order).run();
    added++;
  }
  return json({ ok: true, message: added ? `Đã thêm ${added} mục mẫu. Hãy sửa tên và đặt mã cho từng người.` : "Danh sách mẫu đã tồn tại; không thêm mục trùng." });
}
