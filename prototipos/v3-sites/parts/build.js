/* Construtor de site (hero): monta 1 → 4 uma vez quando aparece na tela e para no 4. */
(function () {
  var root = document.getElementById('bd');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.bd-tab'));
  var fills = tabs.map(function (t) { return t.querySelector('.bd-prog i'); });
  var num = root.querySelector('.bd-num');
  var replay = root.querySelector('.bd-replay');
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var DUR = 1800;          // ms por nível
  var level = 4;
  var playing = false;
  var started = false;
  var hover = false, focus = false, inView = true;
  var elapsed = 0, last = 0, raf = 0;

  function setLevel(l) {
    if (l === level && root.getAttribute('data-level') === String(l)) return;
    level = l;
    root.setAttribute('data-level', String(l));
    if (num) num.textContent = String(l);
    tabs.forEach(function (t, i) {
      t.setAttribute('aria-pressed', i + 1 === l ? 'true' : 'false');
    });
  }

  function setFills(l, p) {
    fills.forEach(function (f, i) {
      var v = i + 1 < l ? 1 : (i + 1 === l ? p : 0);
      f.style.transform = 'scaleX(' + v.toFixed(4) + ')';
    });
  }

  function tick(now) {
    if (!playing) return;
    var dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    if (!hover && !focus && inView && !document.hidden) elapsed += dt;

    var total = DUR * 4;
    if (elapsed >= total) {
      stop();
      setLevel(4);
      setFills(4, 1);
      return;
    }
    var l = 1 + Math.floor(elapsed / DUR);
    var p = (elapsed - (l - 1) * DUR) / DUR;
    setLevel(l);
    setFills(l, p);
    raf = requestAnimationFrame(tick);
  }

  function play() {
    if (mq.matches) { show(4); return; }
    cancelAnimationFrame(raf);
    started = true;
    playing = true;
    root.classList.add('is-playing');
    elapsed = 0;
    last = 0;
    setLevel(1);
    setFills(1, 0);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    playing = false;
    root.classList.remove('is-playing');
    cancelAnimationFrame(raf);
  }

  function show(l) {
    stop();
    started = true;
    setLevel(l);
    setFills(l, 1);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(parseInt(t.getAttribute('data-l'), 10)); });
  });
  if (replay) replay.addEventListener('click', function () { play(); });

  // pausa com mouse em cima ou foco dentro (enquanto monta)
  root.addEventListener('mouseenter', function () { hover = true; });
  root.addEventListener('mouseleave', function () { hover = false; });
  root.addEventListener('focusin', function () { focus = true; });
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) focus = false; });

  // estado inicial: nível 4 completo (igual ao HTML)
  setFills(4, 1);

  if (mq.matches) return;

  function visibleNow() {
    var r = root.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > vh * 0.15;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        inView = en.intersectionRatio > 0;
        if (!started && (en.intersectionRatio >= 0.35 || (inView && visibleNow()))) play();
      });
    }, { threshold: [0, 0.35] });
    // já visível na carga: começa na hora, sem piscar o nível 4
    if (visibleNow()) play();
    io.observe(root);
  } else {
    play();
  }
})();
