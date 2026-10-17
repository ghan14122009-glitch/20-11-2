const form = document.querySelector("#code-form");
const codeInput = document.querySelector("#access-code");
const message = document.querySelector("#form-message");
const unlockCard = document.querySelector("#unlock-card");
const greetingPanel = document.querySelector("#greeting-panel");
const greetingTitle = document.querySelector("#greeting-title");
const greetingText = document.querySelector("#greeting-text");

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}
function showUnlock() {
  greetingPanel.classList.add("hidden");
  unlockCard.classList.remove("hidden");
  codeInput.value = "";
  setMessage("");
  codeInput.focus();
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = codeInput.value.trim();
  if (!code) return;
  const button = form.querySelector("button");
  button.disabled = true;
  button.style.opacity = ".7";
  setMessage("Đang tìm món quà của bạn…", "success");
  try {
    const response = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Mã chưa đúng. Bạn hãy kiểm tra lại nhé.");
    greetingTitle.textContent = `Gửi ${data.name} thân mến,`;
    greetingText.textContent = data.greeting;
    unlockCard.classList.add("hidden");
    greetingPanel.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setMessage(error.message || "Có lỗi xảy ra. Hãy thử lại sau.");
  } finally {
    button.disabled = false;
    button.style.opacity = "1";
  }
});
document.querySelector("#back-button").addEventListener("click", showUnlock);
document.querySelector("#again-button").addEventListener("click", showUnlock);
