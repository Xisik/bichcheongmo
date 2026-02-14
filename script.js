

function renderAuthNav() {
  const containers = document.querySelectorAll(".nav-auth");
  containers.forEach(c => {
    c.innerHTML = `
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="라이트모드">☀️</button>
    `;
  });
}


function init() {
  renderAuthNav();
  applyThemeFromStorage();
  attachThemeToggle();
}

init();

function applyThemeFromStorage() {
  const saved = localStorage.getItem("theme");
  const theme = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) setThemeButtonIcon(btn, theme);
}

function attachThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setThemeButtonIcon(btn, next);
  });
}

function setThemeButtonIcon(btn, theme) {
  btn.textContent = theme === "light" ? "🌙" : "☀️";
  btn.setAttribute("aria-label", theme === "light" ? "다크모드" : "라이트모드");
}
