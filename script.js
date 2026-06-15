/* PRAUS — interações da landing */
(function () {
  "use strict";

  /* ---------- Waitlist (captura de e-mail) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function bindForm(form) {
    var input = form.querySelector('input[type="email"]');
    var success = form.querySelector(".waitlist__success");
    var field = form.querySelector(".waitlist__field");
    var micro = form.querySelector(".waitlist__micro");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (input.value || "").trim();
      if (!EMAIL_RE.test(value)) {
        input.classList.add("invalid");
        input.focus();
        return;
      }
      input.classList.remove("invalid");
      try {
        var list = JSON.parse(localStorage.getItem("praus_waitlist") || "[]");
        if (list.indexOf(value) === -1) list.push(value);
        localStorage.setItem("praus_waitlist", JSON.stringify(list));
      } catch (err) {}
      if (field) field.hidden = true;
      if (micro) micro.hidden = true;
      if (success) success.hidden = false;
    });

    input.addEventListener("input", function () { input.classList.remove("invalid"); });
  }
  document.querySelectorAll(".waitlist").forEach(bindForm);

  /* ---------- Nav fundo ao rolar ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Stagger leve dentro de grupos de cards */
  document.querySelectorAll(".feats, .games, .partners, .stats").forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
    });
  });

  /* ---------- Como funciona: stepper interativo ---------- */
  (function flowStepper() {
    var flow = document.querySelector(".flow");
    if (!flow) return;

    var steps = Array.prototype.slice.call(flow.querySelectorAll(".flow__step"));
    var screens = Array.prototype.slice.call(flow.querySelectorAll(".screen"));
    if (!steps.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var interval = parseInt(flow.getAttribute("data-autoplay"), 10) || 4800;
    flow.style.setProperty("--fill", interval + "ms");

    var current = 0;
    var timer = null;
    var inView = false;

    function restartFill(step) {
      var bar = step.querySelector(".flow__step-bar i");
      if (!bar) return;
      bar.style.animation = "none";
      void bar.offsetWidth; // reflow
      bar.style.animation = "";
    }

    function activate(i, fromUser) {
      current = (i + steps.length) % steps.length;
      steps.forEach(function (s, idx) {
        var on = idx === current;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-selected", on ? "true" : "false");
        if (on && !reduce) restartFill(s);
      });
      screens.forEach(function (sc, idx) { sc.hidden = idx !== current; });
      if (fromUser) resetTimer();
    }

    function next() { activate(current + 1, false); }

    function resetTimer() {
      if (timer) { clearInterval(timer); timer = null; }
      if (!reduce && inView) timer = setInterval(next, interval);
    }

    steps.forEach(function (s, i) {
      s.addEventListener("click", function () { activate(i, true); });
      s.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); steps[(i + 1) % steps.length].focus(); activate(i + 1, true); }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); steps[(i - 1 + steps.length) % steps.length].focus(); activate(i - 1, true); }
      });
    });

    flow.addEventListener("mouseenter", function () { if (timer) { clearInterval(timer); timer = null; } });
    flow.addEventListener("mouseleave", resetTimer);

    /* só roda o autoplay quando a seção está visível */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          inView = en.isIntersecting;
          if (inView) { if (!reduce) restartFill(steps[current]); resetTimer(); }
          else if (timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.4 }).observe(flow);
    } else { inView = true; resetTimer(); }

    activate(0, false);
  })();
})();
