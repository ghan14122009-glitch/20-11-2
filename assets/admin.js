const $ = (selector) => document.querySelector(selector);
const loginSection = $("#login-section");
const dashboard = $("#dashboard");
const loginForm = $("#login-form");
const loginMessage = $("#login-message");
const recipientList = $("#recipient-list");
const emptyState = $("#empty-state");
const editorBackdrop = $("#editor-backdrop");
const recipientForm = $("#recipient-form");
const toast = $("#toast");
let recipients = [];
let toastTimer;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function showToast(text, error = false) {
  toast.textContent = text;
  toast.className = `toast${error ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3200);
}
function setFormMessage(el, text, success = false) {
  el.textContent = text;
  el.className = `form-message${success ? " success" : ""}`;
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && url !== "/api/admin/login") showLogin();
    throw new Error(data.error || "Yêu cầu chưa thực hiện được.");
  }
  return data;
}
function showLogin() {
  loginSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
}
async function showDashboard() {
  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  await loadRecipients();
}
async function checkSession() {
  try {
    const result = await api("/api/admin/session");
    if (result.authenticated) await showDashboard();
    else showLogin();
  } catch { showLogin(); }
}
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  setFormMessage(loginMessage, "Đang đăng nhập…");
  try {
    await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: $("#admin-password").value }) });
    $("#admin-password").value = "";
    setFormMessage(loginMessage, "");
    await showDashboard();
  } catch (error) {
    setFormMessage(loginMessage, error.message);
  } finally { button.disabled = false; }
});
$("#logout-button").addEventListener("click", async () => {
  try { await api("/api/admin/logout", { method: "POST", body: "{}" }); }
  catch {}
  showLogin();
  showToast("Bạn đã đăng xuất.");
});
async function loadRecipients() {
  const data = await api("/api/admin/recipients");
  recipients = data.recipients || [];
  $("#stat-total").textContent = recipients.length;
  $("#stat-coded").textContent = recipients.filter(r => r.hasCode).length;
  $("#stat-empty").textContent = recipients.filter(r => !r.hasCode).length;
  renderRecipients();
}
function renderRecipients() {
  const query = $("#search-input").value.trim().toLocaleLowerCase("vi");
  const filtered = recipients.filter(r => r.name.toLocaleLowerCase("vi").includes(query));
  recipientList.innerHTML = "";
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  if (!filtered.length) return;
  recipientList.innerHTML = filtered.map((r) => `
    <article class="recipient-item">
      <div class="recipient-avatar">${escapeHTML((r.name || "?").trim().charAt(0).toUpperCase())}</div>
      <div class="recipient-main">
        <div class="recipient-name">${escapeHTML(r.name)}</div>
        <div class="recipient-meta"><span class="status-pill ${r.hasCode ? "ready" : ""}"><span class="status-dot"></span>${r.hasCode ? "Đã đặt mã riêng" : "Chưa đặt mã"}</span>· ${r.greetingLength || 0} ký tự lời chúc</div>
      </div>
      <div class="recipient-actions">
        <button class="small-action" data-edit="${r.id}" type="button">Sửa</button>
        <button class="small-action danger" data-delete="${r.id}" type="button">Xóa</button>
      </div>
    </article>`).join("");
  recipientList.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openEditor(button.dataset.edit)));
  recipientList.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => deleteRecipient(button.dataset.delete)));
}
$("#search-input").addEventListener("input", renderRecipients);
function openEditor(id = "") {
  const item = recipients.find(r => r.id === id);
  $("#recipient-id").value = item?.id || "";
  $("#editor-title").textContent = item ? "Chỉnh sửa người nhận" : "Thêm người nhận";
  $("#recipient-name").value = item?.name || "";
  $("#recipient-code").value = "";
  $("#recipient-code").required = !item;
  $("#code-help").textContent = item
    ? "Để trống để giữ mã hiện tại. Nhập mã mới nếu muốn thay đổi. Mã cũ không thể xem lại."
    : "Bắt buộc khi tạo mới. Mỗi người phải có mã riêng, không trùng nhau.";
  $("#recipient-greeting").value = item?.greeting || defaultGreeting(item?.name || "bạn");
  setFormMessage($("#editor-message"), "");
  editorBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  $("#recipient-name").focus();
}
function closeEditor() {
  editorBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
}
$("#add-button").addEventListener("click", () => openEditor());
$("#close-editor").addEventListener("click", closeEditor);
$("#cancel-editor").addEventListener("click", closeEditor);
editorBackdrop.addEventListener("click", (event) => { if (event.target === editorBackdrop) closeEditor(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeEditor(); });
function defaultGreeting(name) {
  return `Chúc ${name} có một ngày 20/10 thật vui vẻ và ngập tràn yêu thương! Mong bạn luôn tự tin, rạng rỡ, gặp nhiều điều may mắn và giữ được nụ cười của mình. Chúc những điều tốt đẹp sẽ đến với bạn không chỉ hôm nay mà trong cả những ngày sắp tới. ♡`;
}
recipientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("#recipient-id").value;
  const payload = {
    name: $("#recipient-name").value.trim(),
    code: $("#recipient-code").value.trim(),
    greeting: $("#recipient-greeting").value.trim()
  };
  const button = recipientForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setFormMessage($("#editor-message"), "Đang lưu…");
  try {
    await api(id ? `/api/admin/recipients/${encodeURIComponent(id)}` : "/api/admin/recipients", {
      method: id ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    closeEditor();
    await loadRecipients();
    showToast("Đã lưu lời chúc thành công.");
  } catch (error) {
    setFormMessage($("#editor-message"), error.message);
  } finally { button.disabled = false; }
});
async function deleteRecipient(id) {
  const item = recipients.find(r => r.id === id);
  if (!item || !confirm(`Xóa lời chúc của “${item.name}”? Thao tác này không thể hoàn tác.`)) return;
  try {
    await api(`/api/admin/recipients/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadRecipients();
    showToast("Đã xóa người nhận.");
  } catch (error) { showToast(error.message, true); }
}
$("#seed-button").addEventListener("click", async () => {
  if (recipients.length && !confirm("Thêm các mục mẫu còn thiếu? Danh sách hiện có sẽ được giữ nguyên.")) return;
  try {
    const result = await api("/api/admin/recipients/seed", { method: "POST", body: "{}" });
    await loadRecipients();
    showToast(result.message || "Đã tạo danh sách mẫu.");
  } catch (error) { showToast(error.message, true); }
});
checkSession();
