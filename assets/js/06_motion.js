(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 1. 페이지 진입 Fade In ─────────────────────────────────────────
  // DOMContentLoaded 이후 <main>에 .is-page-ready 클래스 추가
  // CSS: .js main { opacity:0 } → .js main.is-page-ready { opacity:1 }
  if (!reducedMotion) {
    function initPageEntry() {
      var main = document.querySelector("main");
      if (main) main.classList.add("is-page-ready");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initPageEntry);
    } else {
      initPageEntry();
    }
  } else {
    // 모션 감소 설정 시 즉시 표시 (CSS fallback 보조)
    var main = document.querySelector("main");
    if (main) main.classList.add("is-page-ready");
  }


  // ── 2. 버튼 Ripple 효과 ────────────────────────────────────────────
  // .btn 클릭/터치 시 클릭 지점에서 원형 파문 생성 후 제거

  function createRipple(e) {
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var x, y;

    if (e.type === "touchstart" && e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e.clientX || 0) - rect.left;
      y = (e.clientY || 0) - rect.top;
    }

    var span = document.createElement("span");
    span.className = "ripple-effect";
    span.style.left = x + "px";
    span.style.top  = y + "px";
    btn.appendChild(span);

    span.addEventListener("animationend", function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    });
  }

  function attachRipple(el) {
    if (el.dataset.ripple) return;  // 중복 방지
    el.dataset.ripple = "1";
    el.addEventListener("click", createRipple);
    el.addEventListener("touchstart", createRipple, { passive: true });
  }

  // 기존 버튼 등록
  document.querySelectorAll(".btn").forEach(attachRipple);

  // 동적으로 추가되는 버튼 감지 (활동/성명 카드 내 버튼 등)
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(".btn")) {
          attachRipple(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll(".btn").forEach(attachRipple);
        }
      });
    });
  });

  mo.observe(document.body, { childList: true, subtree: true });
})();
