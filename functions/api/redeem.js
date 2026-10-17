import { json, readJson, sha256, cleanString } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Website chưa được kết nối cơ sở dữ liệu. Hãy làm theo README." }, 503);
  const body = await readJson(request);
  const code = cleanString(body.code, 80);
  if (!code) return json({ error: "Bạn hãy nhập mã truy cập nhé." }, 400);
  const codeHash = await sha256(code);
  const row = await env.DB.prepare(
    "SELECT name, greeting FROM recipients WHERE code_hash = ? LIMIT 1"
  ).bind(codeHash).first();
  if (!row) return json({ error: "Mã chưa đúng hoặc chưa được kích hoạt. Bạn hãy kiểm tra lại nhé." }, 404);
  return json({ name: row.name, greeting: row.greeting });
}
