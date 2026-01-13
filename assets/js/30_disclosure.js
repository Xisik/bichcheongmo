(function () {
  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function toggle(linkEl, targetId) {
    const box = $("#" + targetId);
    if (!box) return;

    const willOpen = !box.classList.contains("is-open");

    if (willOpen) {
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      linkEl.setAttribute("aria-expanded", "true");
    } else {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      linkEl.setAttribute("aria-expanded", "false");
    }
  }

  // Story 3.1: 키보드 접근성 - Enter/Space 키로 토글 가능
  $all("[data-toggle]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = a.getAttribute("data-toggle");
      if (!targetId) return;
      toggle(a, targetId);
    });

    // 키보드 이벤트 추가
    a.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const targetId = a.getAttribute("data-toggle");
        if (!targetId) return;
        toggle(a, targetId);
      }
    });
  });
})();
