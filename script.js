/* PRAUS — interações da landing */
(function () {
  "use strict";

  var reduzMovimento = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Waitlist (captura de e-mail) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var API = document.documentElement.getAttribute("data-api") || "/api";

  /* Repassa as UTMs da URL para a API, para saber de onde veio o lead. */
  function utms() {
    var q = new URLSearchParams(location.search);
    return {
      utm_source: q.get("utm_source") || undefined,
      utm_medium: q.get("utm_medium") || undefined,
      utm_campaign: q.get("utm_campaign") || undefined,
    };
  }

  /* ---------- Vagas esgotadas ----------
     Pinta de cinza e desativa TODOS os CTAs da waitlist: os dois botões de
     envio e os links que apontam para #waitlist (nav, ranking, rodapé). */
  var ROTULO_ESGOTADO = "Acessos Esgotados";
  var esgotado = false;

  function aplicaEsgotado() {
    if (esgotado) return;
    esgotado = true;

    document.querySelectorAll(".waitlist").forEach(function (form) {
      var campo = form.querySelector(".waitlist__field");
      var input = form.querySelector('input[type="email"]');
      var botao = form.querySelector('button[type="submit"]');
      var micro = form.querySelector(".waitlist__micro");
      var erro = form.querySelector(".waitlist__error");

      if (campo) campo.hidden = false;
      if (input) { input.disabled = true; input.value = ""; input.placeholder = "Fila encerrada"; }
      if (botao) {
        botao.disabled = true;
        botao.classList.add("btn--esgotado");
        botao.textContent = ROTULO_ESGOTADO;
      }
      if (erro) erro.hidden = true;
      if (micro) micro.textContent = "As 1.200 vagas do beta foram preenchidas. Fique de olho nas nossas redes para a próxima leva.";
    });

    /* Links viram estado inerte: sem href, para não navegarem nem receberem foco
       como se ainda fossem acionáveis. */
    document.querySelectorAll('a.btn[href="#waitlist"]').forEach(function (a) {
      a.classList.add("btn--esgotado");
      a.setAttribute("aria-disabled", "true");
      a.removeAttribute("href");
      a.textContent = ROTULO_ESGOTADO;
    });
  }

  /* Consulta no carregamento: se já estiver lotado, o visitante nem chega a
     digitar. Falha de rede aqui é ignorada de propósito — na dúvida, deixa
     tentar; o POST é a fonte da verdade. */
  fetch(API + "/waitlist/status", { headers: { Accept: "application/json" } })
    .then(function (r) { return r.json(); })
    .then(function (d) { if (d && d.esgotado) aplicaEsgotado(); })
    .catch(function () {});

  function bindForm(form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var success = form.querySelector(".waitlist__success");
    var error = form.querySelector(".waitlist__error");
    var field = form.querySelector(".waitlist__field");
    var micro = form.querySelector(".waitlist__micro");
    var source = form.getAttribute("data-source") || "desconhecida";
    var rotuloBotao = button ? button.innerHTML : "";
    var enviando = false;

    function mostraErro(msg) {
      if (!error) return;
      error.textContent = msg;
      error.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando || esgotado) return;

      var value = (input.value || "").trim();
      if (!EMAIL_RE.test(value)) {
        input.classList.add("invalid");
        input.focus();
        mostraErro("Confere o e-mail — parece que falta alguma coisa.");
        return;
      }

      input.classList.remove("invalid");
      if (error) error.hidden = true;
      enviando = true;
      if (button) { button.disabled = true; button.textContent = "ENVIANDO..."; }

      var corpo = utms();
      corpo.email = value;
      corpo.source = source;

      fetch(API + "/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (!r.ok || !d.ok) {
              /* marcado para o catch saber que a mensagem veio da API e já
                 está em português — falha de rede cai na mensagem genérica */
              var e = new Error(d.erro || "Não consegui registrar agora. Tente de novo.");
              e.daApi = true;
              /* as vagas acabaram entre o carregamento e este envio */
              e.esgotado = Boolean(d.esgotado);
              throw e;
            }
            return d;
          });
        })
        .then(function () {
          if (field) field.hidden = true;
          if (micro) micro.hidden = true;
          if (success) success.hidden = false;
        })
        .catch(function (err) {
          enviando = false;
          if (err && err.esgotado) { aplicaEsgotado(); return; }
          mostraErro(err && err.daApi
            ? err.message
            : "Sem conexão com o servidor. Confere a internet e tenta de novo.");
          if (button) { button.disabled = false; button.innerHTML = rotuloBotao; }
          /* leitor de tela já ouve o role="alert"; mover o foco devolve o
             teclado ao campo que precisa ser corrigido */
          if (input) input.focus();
        });
    });

    input.addEventListener("input", function () {
      input.classList.remove("invalid");
      if (error) error.hidden = true;
    });
  }
  document.querySelectorAll(".waitlist").forEach(bindForm);

  /* ---------- Herói: vídeo de fundo sob demanda ----------
     O markup entrega os dois <video> vazios (data-src, sem autoplay), porque
     com autoplay o navegador baixa antes de qualquer condição ser avaliada.
     Aqui decidimos o que vale a pena baixar:
       - reduced-motion: nada. O carvão de .hero__bg mais o scrim já são um
         herói legível, e loop de fundo é exatamente o movimento que a
         preferência pede para não existir.
       - abaixo de 900px: só o clipe A. O B tem 17,8 MB e serve apenas ao
         crossfade, que some junto (.hero__bg--solo).
     Fora de tela os dois pausam: decoder de vídeo rodando escondido é
     bateria e frame perdido no resto da página. */
  (function heroVideo() {
    var bg = document.querySelector(".hero__bg");
    var hero = document.querySelector(".hero");
    if (!bg || !hero) return;

    var vids = Array.prototype.slice.call(bg.querySelectorAll(".hero__vid"));
    if (!vids.length || reduzMovimento) return;

    var largo = !window.matchMedia || window.matchMedia("(min-width: 900px)").matches;
    if (!largo) {
      bg.classList.add("hero__bg--solo");
      vids = vids.slice(0, 1);
    }

    function toca(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

    vids.forEach(function (v) {
      v.src = v.getAttribute("data-src");
      v.load();
      toca(v);
    });

    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        vids.forEach(function (v) { if (en.isIntersecting) toca(v); else v.pause(); });
      });
    }, { threshold: 0 }).observe(hero);
  })();

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
  document.querySelectorAll(".games, .partners").forEach(function (group) {
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

    var interval = parseInt(flow.getAttribute("data-autoplay"), 10) || 4800;
    flow.style.setProperty("--fill", interval + "ms");

    /* Abaixo de 920px o controle e a tela que ele troca não cabem juntos na
       viewport: o passo avançaria sozinho fora do campo de visão. Ali o
       stepper nasce manual. */
    var estreito = window.matchMedia && !window.matchMedia("(min-width: 920px)").matches;
    var manual = reduzMovimento || estreito;

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

    function activate(i) {
      current = (i + steps.length) % steps.length;
      steps.forEach(function (s, idx) {
        var on = idx === current;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-selected", on ? "true" : "false");
        /* roving tabindex: só o passo ativo fica no fluxo do Tab, mesmo
           padrão das abas do ranking */
        s.tabIndex = on ? 0 : -1;
        if (on && !manual) restartFill(s);
      });
      screens.forEach(function (sc, idx) { sc.hidden = idx !== current; });
    }

    function next() { activate(current + 1); }

    function agenda() {
      if (timer) { clearInterval(timer); timer = null; }
      if (!manual && inView) timer = setInterval(next, interval);
    }

    /* WCAG 2.2.2: qualquer interação encerra o autoplay de vez, não apenas
       pausa. mouseenter sozinho nunca dispara em toque nem em teclado. */
    function encerraAutoplay() {
      if (manual) return;
      manual = true;
      if (timer) { clearInterval(timer); timer = null; }
      flow.classList.add("is-manual");
    }

    if (manual) flow.classList.add("is-manual");

    steps.forEach(function (s, i) {
      s.addEventListener("click", function () { encerraAutoplay(); activate(i); });
      s.addEventListener("keydown", function (e) {
        var alvo = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") alvo = i + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") alvo = i - 1;
        else if (e.key === "Home") alvo = 0;
        else if (e.key === "End") alvo = steps.length - 1;
        if (alvo === null) return;
        e.preventDefault();
        encerraAutoplay();
        activate(alvo);
        steps[(alvo + steps.length) % steps.length].focus();
      });
    });

    flow.addEventListener("focusin", encerraAutoplay);
    flow.addEventListener("mouseenter", function () { if (timer) { clearInterval(timer); timer = null; } });
    flow.addEventListener("mouseleave", agenda);

    /* só roda o autoplay quando a seção está visível */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          inView = en.isIntersecting;
          if (inView) { if (!manual) restartFill(steps[current]); agenda(); }
          else if (timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.4 }).observe(flow);
    } else { inView = true; agenda(); }

    activate(0);
  })();

  /* ---------- Ranking: abas Jogadores / Times ---------- */
  (function rankTabs() {
    var wrap = document.querySelector(".rank__tabs");
    if (!wrap) return;

    var tabs = Array.prototype.slice.call(wrap.querySelectorAll(".rank__tab"));
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute("aria-controls"));
    });
    if (!tabs.length || panels.indexOf(null) !== -1) return;

    function select(i, moveFocus) {
      i = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, idx) {
        var on = idx === i;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        /* roving tabindex: só a aba ativa fica no fluxo do Tab */
        t.tabIndex = on ? 0 : -1;
        panels[idx].hidden = !on;
      });
      if (moveFocus) tabs[i].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(i + 1, true); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(i - 1, true); }
        else if (e.key === "Home") { e.preventDefault(); select(0, true); }
        else if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });

    select(0, false);
  })();
})();
