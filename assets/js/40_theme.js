(function () {
  const KEY = "theme"; // "light" | "dark"
  const root = document.documentElement;
  const ui = window.__ui || {};

  function t(text) {
    return ui.i18n && ui.i18n.t ? ui.i18n.t(text) : text;
  }

  function getPreferredTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStoredTheme() {
    const v = localStorage.getItem(KEY);
    return (v === "light" || v === "dark") ? v : null;
  }

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? t("라이트 모드로 전환") : t("다크 모드로 전환"));
      btn.setAttribute("title", isDark ? t("라이트 모드로 전환") : t("다크 모드로 전환"));
      // 현재 상태를 토글의 "다음 동작"으로 표기
      btn.textContent = isDark ? "\udb80\udce0" : "\udb80\udcdb";
    }

    if (persist) localStorage.setItem(KEY, theme);
  }

  function init() {
    const stored = getStoredTheme();
    const initial = stored || getPreferredTheme();
    setTheme(initial, false);

    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next, true);

      // ease-in-out 스핀 애니메이션
      btn.classList.remove("is-spinning");
      // 강제 reflow로 애니메이션 재시작
      void btn.offsetWidth;
      btn.classList.add("is-spinning");
      btn.addEventListener("animationend", () => btn.classList.remove("is-spinning"), { once: true });
    });

    window.addEventListener("languagechange", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current, false);
    });
  }

  init();
})();
