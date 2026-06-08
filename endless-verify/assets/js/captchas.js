(function (global) {
  'use strict';

    function h(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function rf(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[ri(0, arr.length - 1)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = ri(0, i); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function setInstr(html) { var el = document.getElementById('ev-instruction'); if (el) el.innerHTML = html; }
  function brokenSVG() {
    return "<svg viewBox='0 0 48 48' width='34' height='34'>" +
      "<rect x='5' y='9' width='38' height='30' rx='3' fill='#dfe5ee' stroke='#9aa7b8' stroke-width='2'/>" +
      "<path d='M9 33l8-9 6 6 4-5 7 8' fill='none' stroke='#9aa7b8' stroke-width='2'/>" +
      "<circle cx='17' cy='18' r='3' fill='#9aa7b8'/>" +
      "<path d='M5 9 L43 39' stroke='#9aa7b8' stroke-width='2' stroke-dasharray='4 3'/>" +
      "</svg>";
  }

  var DOGS = ['assets/img/dogs/dog1.jpg', 'assets/img/dogs/dog2.jpg', 'assets/img/dogs/dog3.jpg', 'assets/img/dogs/dog4.jpg', 'assets/img/dogs/dog5.jpg', 'assets/img/dogs/dog6.jpg', 'assets/img/dogs/dog7.jpg', 'assets/img/dogs/dog8.jpg', 'assets/img/dogs/dog9.jpg'];
  var DOG_FALLBACK = "data:image/svg+xml;charset=utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='170'><rect width='240' height='170' fill='%23f1d9b5'/><text x='120' y='115' font-size='80' text-anchor='middle'>🐶</text></svg>";

    var CAPTCHAS = [];
  function add(c) { CAPTCHAS.push(c); }

    add({
    id: 'bee',
    instruction: 'Нарисуйте <b>пчелу</b> в профиль: тело, 6 лап, 4 крыла, усики и жало.',
    build: function (stage) {
      var cv = h('canvas', 'cap-canvas'); cv.width = 360; cv.height = 150;
      var ctx = cv.getContext('2d');
      ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1f2937';
      var drawing = false;
      function pos(e) {
        var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
        return { x: (t.clientX - r.left) * cv.width / r.width, y: (t.clientY - r.top) * cv.height / r.height };
      }
      function down(e) { drawing = true; var p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }
      function move(e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }
      function up() { drawing = false; }
      cv.addEventListener('mousedown', down); cv.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      cv.addEventListener('touchstart', down); cv.addEventListener('touchmove', move);
      cv.addEventListener('touchend', up);
      stage.appendChild(cv);
      stage.appendChild(h('div', 'cap-hint', 'Рисунок проверяется ИИ на анатомическую достоверность.'));
    }
  });

    add({
    id: 'lights',
    instruction: 'Выберите все изображения со <b>светофором</b> 🚦.',
    build: function (stage) {
      renderingGrid(stage, ['🚦', '🚗', '🚦', '🌳', '🚙', '🚦', '🏠', '🚲', '🚦', '🛑', '🚌', '🚦'], 3);
    }
  });

    add({
    id: 'happycat',
    instruction: 'Двигайте ползунок, пока <b>кот не станет полностью довольным (100%)</b>.',
    build: function (stage) {
      var faces = ['😿', '🙀', '😾', '😼', '😺', '😼', '😾'];
      var wrap = h('div', 'cap-center');
      var face = h('div', 'cap-face', '😿');
      var slb = h('div', 'cap-slider');
      var sl = document.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 100; sl.value = 0;
      var ro = h('div', 'cap-readout', 'Настроение: 0%');
      sl.addEventListener('input', function () {
        var v = +sl.value;
        face.textContent = faces[Math.min(faces.length - 1, Math.floor(v / 100 * faces.length))];
        ro.textContent = 'Настроение: ' + Math.max(0, Math.min(94, v - ri(0, 9))) + '%';
        face.style.transform = 'rotate(' + (v / 12 - 4) + 'deg)';
      });

      sl.addEventListener('change', function () {
        face.textContent = pick(['😿', '🙀', '😾', '😼']);
        face.style.transform = 'rotate(0deg)';
      });
      slb.appendChild(sl);
      wrap.appendChild(face); wrap.appendChild(slb); wrap.appendChild(ro);
      stage.appendChild(wrap);
    }
  });

    add({
    id: 'burger',
    instruction: 'Соберите бургер строго в порядке: 🍞 → 🥬 → 🥩 → 🧀 → 🍞.',
    build: function (stage) { orderList(stage, ['🧀 сыр', '🍞 булка (низ)', '🥩 котлета', '🍞 булка (верх)', '🥬 салат']); }
  });

    add({
    id: 'stoptimer',
    instruction: 'Остановите секундомер.',
    build: function (stage) {
      var target = rf(5, 40);
      setInstr('Остановите секундомер ровно на <b>' + target.toFixed(3) + '</b> секундах.');
      var wrap = h('div', 'cap-center');
      var disp = h('div', 'cap-stop', '0.000');
      var btn = h('button', 'cap-btn-lg', 'Стоп');
      var t0 = performance.now(), raf, stopped = false;
      function loop(t) { if (stopped) return; disp.textContent = ((t - t0) / 1000 * 1.7).toFixed(3); raf = requestAnimationFrame(loop); }
      raf = requestAnimationFrame(loop);
      btn.addEventListener('click', function () {
        stopped = true; cancelAnimationFrame(raf);
        var v = parseFloat(disp.textContent);
        if (Math.abs(v - target) < 0.6) v += (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
        disp.textContent = Math.max(0, v).toFixed(3);
        btn.textContent = 'Старт';
      });
      wrap.appendChild(disp); wrap.appendChild(btn);
      stage.appendChild(wrap);
      stage._cleanup = function () { stopped = true; cancelAnimationFrame(raf); };
    }
  });

    add({
    id: 'bignum',
    instruction: 'Введите число, показанное ниже, без пробелов.',
    build: function (stage) {
      var arr = []; for (var i = 0; i < ri(28, 36); i++) arr.push(ri(0, 9));
      var box = h('div', 'cap-bignum');
      function paint() { box.textContent = arr.join('').replace(/(\d{3})(?=\d)/g, '$1 '); }
      paint();
      stage.appendChild(box);
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Введите число';
      inp.inputMode = 'numeric'; inp.style.marginTop = '10px';
      stage.appendChild(inp);
      var iv = setInterval(function () { arr[ri(0, arr.length - 1)] = ri(0, 9); paint(); }, 2200);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'triangles',
    instruction: 'Сколько <b>треугольников</b> в этой вращающейся фигуре?',
    build: function (stage) {
      var box = h('div', 'cap-center');
      var cv = document.createElement('canvas'); cv.width = 230; cv.height = 150;
      cv.className = 'cap-canvas'; cv.style.cursor = 'default';
      box.appendChild(cv);
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Количество'; inp.inputMode = 'numeric';
      box.appendChild(inp);
      stage.appendChild(box);

      var ctx = cv.getContext('2d');
      var V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [0, 1.6, 0]];
      var F = [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [0, 5, 2], [2, 5, 1], [1, 5, 3], [3, 5, 0], [0, 6, 4], [4, 6, 1]];
      var a = 0, raf;
      function rY(p, t) { return [p[0] * Math.cos(t) + p[2] * Math.sin(t), p[1], -p[0] * Math.sin(t) + p[2] * Math.cos(t)]; }
      function rX(p, t) { return [p[0], p[1] * Math.cos(t) - p[2] * Math.sin(t), p[1] * Math.sin(t) + p[2] * Math.cos(t)]; }
      function draw() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        var s = 42, cx = cv.width / 2, cy = cv.height / 2 + 6;
        var pts = V.map(function (p) { var q = rX(rY(p, a), a * 0.55); return [cx + q[0] * s, cy + q[1] * s]; });
        ctx.lineWidth = 1.6; ctx.strokeStyle = '#334155'; ctx.fillStyle = 'rgba(47,109,246,.05)';
        F.forEach(function (f) {
          ctx.beginPath();
          ctx.moveTo(pts[f[0]][0], pts[f[0]][1]);
          ctx.lineTo(pts[f[1]][0], pts[f[1]][1]);
          ctx.lineTo(pts[f[2]][0], pts[f[2]][1]);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        });
        a += 0.02; raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      stage._cleanup = function () { cancelAnimationFrame(raf); };
    }
  });

    add({
    id: 'simon',
    instruction: 'Запомните и повторите последовательность цветов.',
    build: function (stage) {
      var cols = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
      var seq = []; for (var i = 0; i < 8; i++) seq.push(pick(cols));
      var show = h('div', 'cap-center');
      var seqEl = h('div', 'cap-distort'); seqEl.style.fontSize = '26px'; seqEl.style.letterSpacing = '3px';
      seqEl.textContent = seq.join(' ');
      var note = h('div', 'cap-hint', 'Последовательность исчезнет через 2 секунды…');
      show.appendChild(seqEl); show.appendChild(note);
      stage.appendChild(show);
      var pad = h('div', 'cap-row'); pad.style.justifyContent = 'center'; pad.style.marginTop = '6px'; pad.style.flexWrap = 'wrap';
      var picked = [];
      var ans = h('div', 'cap-readout'); ans.style.minHeight = '18px'; ans.style.marginTop = '6px';
      cols.forEach(function (c) {
        var b = h('button', 'cap-btn-lg', c); b.style.padding = '8px 12px';
        b.addEventListener('click', function () { picked.push(c); ans.textContent = picked.join(' '); });
        pad.appendChild(b);
      });
      var to = setTimeout(function () { seqEl.textContent = '• • • • • • • •'; note.textContent = 'Повторите последовательность кнопками ниже.'; }, 2000);
      stage.appendChild(pad); stage.appendChild(ans);
      stage._cleanup = function () { clearTimeout(to); };
    }
  });

    add({
    id: 'pi',
    instruction: 'Введите <b>137-ю</b> цифру числа π после запятой.',
    build: function (stage) {
      stage.appendChild(h('div', 'cap-pi', 'π = 3,14159265358979323846264338327950288419716939937510…'));
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Одна цифра'; inp.maxLength = 1; inp.inputMode = 'numeric';
      inp.style.marginTop = '10px'; stage.appendChild(inp);
      stage.appendChild(h('div', 'cap-hint', 'Подсказка не предоставляется.'));
    }
  });

    add({
    id: 'maze',
    instruction: 'Доведите <b>точку</b> от старта (зелёный) до финиша (красный) <b>стрелками клавиатуры</b>, не касаясь стен.',
    build: function (stage) {
      var N = 7;
      var m = [
        's10000e'.split(''),
        '0100110'.split(''),
        '0110010'.split(''),
        '0000010'.split(''),
        '0111110'.split(''),
        '0000000'.split(''),
        '0111110'.split('')
      ];
      var SIZE = 30;
      var grid = h('div', 'cap-maze');
      grid.style.gridTemplateColumns = 'repeat(' + N + ',' + SIZE + 'px)';
      grid.style.width = (N * SIZE) + 'px'; grid.style.margin = '0 auto';
      var cells = [];
      for (var y = 0; y < N; y++) {
        cells[y] = [];
        for (var x = 0; x < N; x++) {
          var ch = m[y][x];
          var cell = h('div', 'cap-maze-cell');
          cell.style.width = SIZE + 'px'; cell.style.height = SIZE + 'px'; cell.style.boxSizing = 'border-box';
          cell.style.display = 'flex'; cell.style.alignItems = 'center'; cell.style.justifyContent = 'center';
          cell.style.background = ch === '1' ? '#1e293b' : ch === 's' ? '#22c55e' : ch === 'e' ? '#ef4444' : '#eef2f7';
          if (ch !== '1') cell.style.boxShadow = 'inset 0 0 0 1px #dbe2ea';
          cells[y][x] = cell; grid.appendChild(cell);
        }
      }
      stage.appendChild(grid);
      var hint = h('div', 'cap-hint', 'Управление: ← ↑ → ↓ на клавиатуре. Касание стены — сброс в начало.');
      stage.appendChild(hint);

      var dot = h('div');
      dot.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#2563eb;box-shadow:0 0 0 2px #fff,0 1px 5px rgba(0,0,0,.45);';
      var pos = { x: 0, y: 0 };
      function render() { cells[pos.y][pos.x].appendChild(dot); }
      render();

      function step(dx, dy) {
        var nx = pos.x + dx, ny = pos.y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) return;
        if (m[ny][nx] === '1') { pos = { x: 0, y: 0 }; render(); hint.textContent = 'Стена! Прогресс сброшен. Управление: ← ↑ → ↓.'; return; }
        pos = { x: nx, y: ny }; render();
        hint.textContent = 'Управление: ← ↑ → ↓ на клавиатуре. Касание стены — сброс.';
      }
      var presses = 0, DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      function onKey(e) {
        var dx, dy;
        if (e.key === 'ArrowLeft') { dx = -1; dy = 0; }
        else if (e.key === 'ArrowRight') { dx = 1; dy = 0; }
        else if (e.key === 'ArrowUp') { dx = 0; dy = -1; }
        else if (e.key === 'ArrowDown') { dx = 0; dy = 1; }
        else return;
        e.preventDefault();
        presses++;
        if (presses % 6 === 0) { var d = pick(DIRS); dx = d[0]; dy = d[1]; hint.textContent = '⚠ Сбой управления: шаг ушёл в случайную сторону.'; }
        step(dx, dy);
      }
      window.addEventListener('keydown', onKey);
      stage._cleanup = function () { window.removeEventListener('keydown', onKey); };
    }
  });

    add({
    id: 'shuffle',
    instruction: 'Выберите все клетки с <b>автобусом</b> 🚌.',
    build: function (stage) {
      var base = ['🚌', '🚕', '🚐', '🚌', '🚓', '🚌', '🚎', '🚌', '🚒', '🚌', '🚜', '🚌'];
      var grid = h('div', 'cap-grid cols-4');
      var tiles = [];
      base.forEach(function (e) {
        var t = h('div', 'cap-tile');
        var g = h('span', 'cap-glyph', e);
        var c = h('span', 'cap-check', '✓'); t.appendChild(g); t.appendChild(c);
        t.addEventListener('click', function () { t.classList.toggle('is-sel'); });
        tiles.push(t); grid.appendChild(t);
      });
      stage.appendChild(grid);
      var iv = setInterval(function () {
        var sh = shuffle(base);
        tiles.forEach(function (t, i) { t.firstChild.textContent = sh[i]; });
      }, 1700);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'memory',
    instruction: 'Найдите и одновременно держите открытыми <b>все 6 пар</b>. Одна ошибка сбрасывает весь прогресс.',
    build: function (stage) {
      var vals = shuffle(['🍎', '🍎', '🍐', '🍐', '🍋', '🍋', '🍇', '🍇', '🍒', '🍒', '🥝', '🥝']);
      var grid = h('div', 'cap-grid cols-4');
      var tiles = [], first = null, lock = false;
      var ro = h('div', 'cap-readout', 'Открыто пар: 0 / 6');
      function done() { var d = 0; tiles.forEach(function (o) { if (o.done) d++; }); return d / 2; }
      function hideAll(msg) {
        tiles.forEach(function (o) { o.open = false; o.done = false; o.el.textContent = '❓'; o.el.classList.remove('is-sel'); });
        first = null; lock = false;
        ro.textContent = 'Открыто пар: 0 / 6' + (msg ? '  ·  ' + msg : '');
      }
      vals.forEach(function (v) {
        var el = h('div', 'cap-tile', '❓');
        var o = { el: el, val: v, open: false, done: false };
        el.addEventListener('click', function () {
          if (lock || o.open || o.done) return;
          o.open = true; el.textContent = v; el.classList.add('is-sel');
          if (!first) { first = o; return; }
          if (first.val === o.val) {
            first.done = o.done = true; first = null;
            ro.textContent = 'Открыто пар: ' + done() + ' / 6';
          } else {
            lock = true;
            setTimeout(function () { hideAll('неверная пара — сброс!'); }, 700);
          }
        });
        tiles.push(o); grid.appendChild(el);
      });
      stage.appendChild(grid); stage.appendChild(ro);
    }
  });

    add({
    id: 'orbit',
    instruction: 'Перетащите <b>Луну</b> 🌙 точно на пунктирную орбиту (допуск ±2px).',
    build: function (stage) {
      var box = h('div', 'cap-orbit');
      var ring = h('div', 'cap-target-ring'); ring.style.width = '120px'; ring.style.height = '120px';
      ring.style.left = '50%'; ring.style.top = '50%'; ring.style.transform = 'translate(-50%,-50%)';
      var planet = h('div', 'cap-planet'); planet.textContent = '🌙'; planet.style.fontSize = '26px';
      planet.style.left = '12px'; planet.style.top = '12px'; planet.style.width = '30px'; planet.style.height = '30px';
      box.appendChild(ring); box.appendChild(planet); stage.appendChild(box);
      dragWithin(box, planet, function () {
        var w = box.clientWidth || 300, hh = box.clientHeight || 160;
        planet.style.transition = 'left .25s ease, top .25s ease';
        planet.style.left = ri(2, Math.max(2, w - 32)) + 'px';
        planet.style.top = ri(2, Math.max(2, hh - 32)) + 'px';
        setTimeout(function () { planet.style.transition = ''; }, 280);
      });
    }
  });

  add({
    id: 'feedcat',
    instruction: 'Покормите кота 🐱 ровно <b>3 рыбками</b> 🐟. Ни больше, ни меньше.',
    build: function (stage) {
      var wrap = h('div', 'cap-center');
      var cat = h('div', 'cap-face', '🐱');
      wrap.appendChild(cat);
      var cnt = 0;
      var ro = h('div', 'cap-readout', 'Дано рыбок: 0.0');
      function fix() {
        if (Math.abs(cnt - 3) < 0.25) cnt += (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.4);
        cnt = Math.max(0, Math.round(cnt * 10) / 10);
        ro.textContent = 'Дано рыбок: ' + cnt.toFixed(1);
        cat.textContent = cnt > 3.2 ? '😼' : (cnt > 0 ? '😺' : '🐱');
      }
      var row = h('div', 'cap-row'); row.style.justifyContent = 'center';
      var minus = h('button', 'cap-btn-lg', '−'); var plus = h('button', 'cap-btn-lg', '+ 🐟');
      plus.addEventListener('click', function () { cnt += 0.4 + Math.random() * 1.3; fix(); });
      minus.addEventListener('click', function () { cnt -= 0.3 + Math.random() * 1.2; fix(); });
      row.appendChild(minus); row.appendChild(plus);
      wrap.appendChild(ro); wrap.appendChild(row);
      wrap.appendChild(h('div', 'cap-hint', 'Рыбки выдаются кусочками — отмеряйте точно.'));
      stage.appendChild(wrap);
    }
  });

    add({
    id: 'rotate',
    instruction: 'Поверните всех <b>животных мордой вправо</b> ➡️. Клик поворачивает на 90°.',
    build: function (stage) {
      var an = ['🐎', '🐕', '🐈', '🐄', '🐖', '🐑'];
      var grid = h('div', 'cap-grid cols-3');
      var cells = [];
      an.forEach(function (e) {
        var t = h('div', 'cap-tile'); var s = h('span', null, e); s.style.fontSize = '30px'; s.style.transition = 'transform .12s';
        var st = { rot: ri(0, 3) * 90, span: s };
        s.style.transform = 'rotate(' + st.rot + 'deg)';
        t.appendChild(s); cells.push(st);
        t.addEventListener('click', function () {
          st.rot = (st.rot + 90) % 360; s.style.transform = 'rotate(' + st.rot + 'deg)';
          var o = cells[ri(0, cells.length - 1)];
          if (o !== st) { o.rot = (o.rot + 90) % 360; o.span.style.transform = 'rotate(' + o.rot + 'deg)'; }
        });
        grid.appendChild(t);
      });
      stage.appendChild(grid);
    }
  });

    add({
    id: 'distort',
    instruction: 'Введите символы с картинки (с учётом регистра).',
    build: function (stage) {
      var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var sym = ['✶', '✦', '✷', '❖', '✤', '☂', '☎', '✈', '❄', '✿', '♣', '♠', '✚', '☘', '✜'];
      function gen() {
        var arr = [];
        for (var i = 0; i < 7; i++) {
          if (Math.random() < 0.35) arr.push(pick(sym) + '\uFE0E');
          else arr.push(chars[ri(0, chars.length - 1)]);
        }
        return arr;
      }
      var box = h('div', 'cap-center');
      var d = h('div', 'cap-distort');
      function paint() {
        clear(d); var code = gen();
        for (var i = 0; i < code.length; i++) {
          var sp = h('span', null, code[i]);
          sp.style.transform = 'rotate(' + ri(-35, 35) + 'deg) translateY(' + ri(-7, 7) + 'px) skewX(' + ri(-20, 20) + 'deg)';
          sp.style.opacity = (ri(50, 100) / 100); sp.style.color = ['#334155', '#475569', '#1e293b'][ri(0, 2)];
          d.appendChild(sp);
        }
      }
      paint();
      box.appendChild(d);
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Код с картинки';
      box.appendChild(inp); stage.appendChild(box);
    }
  });

    add({
    id: 'heartbeat',
    instruction: 'Нажмите кнопку ровно в момент, когда сердце станет <b>красным</b> ❤️.',
    build: function (stage) {
      var wrap = h('div', 'cap-center');
      var hrt = h('div', 'cap-face', '🤍');
      var states = ['🤍', '💛', '💚', '💙', '💜', '🖤'];
      var i = 0, iv = setInterval(function () { i = (i + 1) % states.length; hrt.textContent = states[i]; }, 260);
      var btn = h('button', 'cap-btn-lg', 'Поймать момент');
      wrap.appendChild(hrt); wrap.appendChild(btn);
      stage.appendChild(wrap);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'planets',
    instruction: 'Расположите планеты по размеру: от самой <b>маленькой</b> к самой большой.',
    build: function (stage) { orderList(stage, ['🪐 Юпитер', '🌑 Меркурий', '🌍 Земля', '🔴 Марс', '🟦 Нептун', '🟡 Венера']); }
  });

    add({
    id: 'wordproblem',
    instruction: 'Решите задачу и введите ответ числом.',
    build: function (stage) {
      var a = ri(3, 8), b = ri(2, 6), c = ri(2, 5);
      var txt = 'У фермера было ' + (a * 7) + ' уток. ' +
        'Каждое утро ' + b + ' уток улетали к соседу, но ' + c + ' возвращались к обеду. ' +
        'Половина оставшихся к вечеру пряталась в сарае. Если в среду шёл дождь, ' +
        'а вторник был чётным днём месяца, сколько уток ночевало под открытым небом ' +
        'в ночь на четверг? (Учтите, что одна утка — на самом деле гусь, а сарай вмещает только простое число уток.)';
      stage.appendChild(h('div', 'cap-pi', txt));
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Ответ'; inp.inputMode = 'numeric'; inp.style.marginTop = '10px';
      stage.appendChild(inp);
    }
  });

    add({
    id: 'wordsearch',
    instruction: 'Найдите слово <b>КОТ</b> в таблице и выделите его клетки подряд.',
    build: function (stage) {
      var N = 6, letters = 'АБВГДЕЁЖКЛМНОПРСТУ';
      var grid = h('div', 'cap-word-grid'); grid.style.gridTemplateColumns = 'repeat(' + N + ',1fr)'; grid.style.maxWidth = '210px'; grid.style.margin = '0 auto';
      var cells = [];
      for (var i = 0; i < N * N; i++) {
        var cell = h('div', 'cap-word-cell', letters[ri(0, letters.length - 1)]);
        cell.addEventListener('click', function (e) { e.target.classList.toggle('is-sel'); });
        cells.push(cell); grid.appendChild(cell);
      }
      stage.appendChild(grid);
      var iv = setInterval(function () { cells[ri(0, cells.length - 1)].textContent = letters[ri(0, letters.length - 1)]; }, 900);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'redshapes',
    instruction: 'Уберите <b>все красные квадраты</b> 🟥. Кликните по каждому.',
    build: function (stage) {
      var grid = h('div', 'cap-grid cols-4');
      function fill() {
        clear(grid);
        var set = shuffle(['🟥', '🟩', '🟥', '🟦', '🟥', '🟨', '🟥', '🟪']);
        set.forEach(function (e) {
          var t = h('div', 'cap-tile', e);
          t.addEventListener('click', function () {
            if (t.textContent === '🟥') { t.style.visibility = 'hidden'; setTimeout(fill, 350); }
          });
          grid.appendChild(t);
        });
      }
      fill();
      stage.appendChild(grid);
    }
  });

    add({
    id: 'hold',
    instruction: 'Удерживайте кнопку.',
    build: function (stage) {
      var target = rf(5, 40);
      setInstr('Удерживайте кнопку нажатой ровно <b>' + target.toFixed(3) + '</b> секунд и отпустите.');
      var wrap = h('div', 'cap-center');
      var disp = h('div', 'cap-stop', '0.000');
      var bar = h('div', 'cap-progress'); var fill = h('div', 'cap-progress-bar'); bar.appendChild(fill);
      var btn = h('button', 'cap-btn-lg', 'Удерживать');
      var t0 = 0, raf, held = false;
      function loop(t) { if (!held) return; var s = (t - t0) / 1000 * 1.3; disp.textContent = s.toFixed(3); fill.style.width = Math.min(100, s / target * 100) + '%'; raf = requestAnimationFrame(loop); }
      function start(e) { held = true; t0 = performance.now(); raf = requestAnimationFrame(loop); e.preventDefault(); }
      function end() { held = false; cancelAnimationFrame(raf); }
      btn.addEventListener('mousedown', start); btn.addEventListener('mouseup', end);
      btn.addEventListener('touchstart', start); btn.addEventListener('touchend', end);
      wrap.appendChild(disp); wrap.appendChild(bar); wrap.appendChild(btn);
      stage.appendChild(wrap);
      stage._cleanup = end;
    }
  });

    add({
    id: 'notorange',
    instruction: 'Выберите все картинки, на которых <b>НЕ изображён апельсин</b> 🍊.',
    build: function (stage) {
      renderingGrid(stage, ['🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊'], 3);
    }
  });

    add({
    id: 'puzzle',
    instruction: 'Двигайте ползунок, чтобы <b>кусочек пазла</b> точно совпал с вырезом.',
    build: function (stage) {
      var box = h('div'); box.style.position = 'relative'; box.style.height = '90px'; box.style.background = '#fff';
      box.style.border = '1px solid var(--ev-line)'; box.style.borderRadius = '9px'; box.style.overflow = 'hidden';
      var slot = h('div'); slot.style.cssText = 'position:absolute;top:25px;left:78%;width:40px;height:40px;background:#e2e8f0;border-radius:6px;';
      var piece = h('div'); piece.style.cssText = 'position:absolute;top:25px;left:0;width:40px;height:40px;background:#2f6df6;border-radius:6px;transition:left .05s;';
      box.appendChild(slot); box.appendChild(piece);
      var sl = document.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 100; sl.value = 0; sl.style.width = '100%'; sl.style.marginTop = '12px';
      sl.addEventListener('input', function () {
        var jitter = ri(-7, 7);
        piece.style.left = Math.max(0, Math.min(82, +sl.value * 0.78 + jitter)) + '%';
      });
      stage.appendChild(box); stage.appendChild(sl);
    }
  });

    add({
    id: 'volume',
    instruction: 'Установите громкость точно как на образце: <b>63%</b>.',
    build: function (stage) {
      var wrap = h('div', 'cap-center');
      wrap.appendChild(h('div', 'cap-face', '🔊'));
      var sl = document.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 100; sl.value = 0; sl.style.width = '100%';
      var ro = h('div', 'cap-readout', 'Текущая громкость: 0%');
      sl.addEventListener('input', function () {
        var v = +sl.value + ri(-5, 5);
        ro.textContent = 'Текущая громкость: ' + Math.max(0, Math.min(100, v)) + '%';
      });
      wrap.appendChild(sl); wrap.appendChild(ro);
      stage.appendChild(wrap);
    }
  });

    add({
    id: 'ducks',
    instruction: 'Нажмите на уток 🦆 в порядке <b>возрастания</b> их номеров.',
    build: function (stage) {
      var grid = h('div', 'cap-grid cols-3');
      var labels = [];
      shuffle([3, 1, 7, 2, 9, 5]).forEach(function (n) {
        var t = h('div', 'cap-tile');
        var d = h('div', 'cap-glyph', '🦆'); d.style.fontSize = '24px';
        var num = h('div', null, n); num.style.cssText = 'position:absolute;bottom:2px;right:5px;font-size:13px;font-weight:800';
        t.appendChild(d); t.appendChild(num);
        t.addEventListener('click', function () { t.classList.toggle('is-sel'); });
        labels.push(num); grid.appendChild(t);
      });
      stage.appendChild(grid);
      var iv = setInterval(function () {
        var i = ri(0, labels.length - 1), j = ri(0, labels.length - 1);
        var tmp = labels[i].textContent; labels[i].textContent = labels[j].textContent; labels[j].textContent = tmp;
      }, 1500);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'reverse',
    instruction: 'Введите показанный код <b>в обратном порядке</b>.',
    build: function (stage) {
      var chars = '日月山川水火木金土天地龙凤虎鹿马鸟鱼云雷风雨';
      var code = ''; for (var i = 0; i < 8; i++) code += chars[ri(0, chars.length - 1)];
      var d = h('div', 'cap-distort'); d.style.fontSize = '26px'; d.textContent = code;
      stage.appendChild(d);
      var inp = document.createElement('input'); inp.className = 'cap-input'; inp.placeholder = 'Введите наоборот';
      inp.style.marginTop = '8px';

      ['paste', 'copy', 'cut', 'drop', 'contextmenu'].forEach(function (ev) {
        inp.addEventListener(ev, function (e) { e.preventDefault(); });
      });
      stage.appendChild(inp);
    }
  });

    add({
    id: 'compass',
    instruction: 'Поверните стрелку компаса точно на <b>север (N)</b>.',
    build: function (stage) {
      var box = h('div'); box.style.cssText = 'position:relative;width:140px;height:140px;margin:0 auto;border:2px solid var(--ev-line);border-radius:50%;background:#fff;';
      var north = h('div', null, 'N'); north.style.cssText = 'position:absolute;font-weight:800;color:#dc2626;left:50%;top:6px;transform:translateX(-50%);transition:all .25s;';
      var needle = h('div'); needle.style.cssText = 'position:absolute;left:50%;top:50%;width:4px;height:54px;background:#2f6df6;transform-origin:bottom center;border-radius:2px;';
      var startAng = ri(40, 320);
      needle.style.transform = 'translate(-50%,-100%) rotate(' + startAng + 'deg)';
      box.appendChild(north); box.appendChild(needle);
      stage.appendChild(box);
      var sl = document.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 360; sl.value = startAng; sl.style.width = '100%'; sl.style.marginTop = '10px';
      sl.addEventListener('input', function () {
        needle.style.transform = 'translate(-50%,-100%) rotate(' + sl.value + 'deg)';
        var ang = ri(0, 359);
        north.style.left = (50 + 38 * Math.sin(ang * Math.PI / 180)) + '%';
        north.style.top = (50 - 38 * Math.cos(ang * Math.PI / 180)) + '%';
      });
      stage.appendChild(sl);
    }
  });

    add({
    id: 'letterE',
    instruction: 'Выберите все клетки с буквой <b>Ё</b> (не Е).',
    build: function (stage) {
      var grid = h('div', 'cap-grid cols-4'); grid.style.gridTemplateColumns = 'repeat(4,1fr)';
      var glyphs = [];
      for (var i = 0; i < 12; i++) {
        var t = h('div', 'cap-tile'); t.style.fontSize = '22px';
        var g = h('span', 'cap-glyph', Math.random() < 0.5 ? 'Е' : 'Ё');
        var c = h('span', 'cap-check', '✓'); t.appendChild(g); t.appendChild(c);
        t.addEventListener('click', function () { this.classList.toggle('is-sel'); });
        glyphs.push(g); grid.appendChild(t);
      }
      stage.appendChild(grid);
      var iv = setInterval(function () {
        var g = glyphs[ri(0, glyphs.length - 1)];
        g.textContent = g.textContent === 'Ё' ? 'Е' : 'Ё';
      }, 650);
      stage._cleanup = function () { clearInterval(iv); };
    }
  });

    add({
    id: 'meta',
    instruction: 'Чтобы доказать, что вы <b>не</b> робот, выберите всех <b>роботов</b> 🤖.',
    build: function (stage) {
      renderingGrid(stage, ['🤖', '👤', '🤖', '🧑', '👨', '🤖', '👩', '🤖', '🧓', '🤖', '🧔', '🤖'], 3);
    }
  });

    add({
    id: 'trace',
    instruction: 'Проведите курсором <b>точно по пунктирной линии</b>, не отрываясь и не выходя за неё.',
    build: function (stage) {
      var cv = h('canvas', 'cap-canvas'); cv.width = 360; cv.height = 150;
      var ctx = cv.getContext('2d');
      ctx.setLineDash([7, 6]); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 120);
      ctx.bezierCurveTo(120, 10, 240, 200, 340, 40); ctx.stroke();
      ctx.setLineDash([]); ctx.strokeStyle = '#2f6df6'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      var drawing = false, lx = 0, ly = 0, ox = 0, oy = 0;
      function pos(e) { var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left) * cv.width / r.width, y: (t.clientY - r.top) * cv.height / r.height }; }

      var twitch = setInterval(function () {
        if (Math.random() < 0.4) { ox = ri(-4, 4); oy = ri(-4, 4); setTimeout(function () { ox = 0; oy = 0; }, 130); }
      }, ri(450, 850));
      function start(e) { drawing = true; var p = pos(e); lx = p.x + ox; ly = p.y + oy; ctx.beginPath(); ctx.moveTo(lx, ly); e.preventDefault(); }
      function move(e) { if (!drawing) return; var p = pos(e); var nx = p.x + ox, ny = p.y + oy; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(nx, ny); ctx.stroke(); lx = nx; ly = ny; e.preventDefault(); }
      function up() { drawing = false; }
      cv.addEventListener('mousedown', start); cv.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      cv.addEventListener('touchstart', start); cv.addEventListener('touchmove', move); cv.addEventListener('touchend', up);
      stage.appendChild(cv);
      stage.appendChild(h('div', 'cap-hint', 'Курсор иногда подрагивает. Отклонение более чем на 1px недопустимо.'));
      stage._cleanup = function () { clearInterval(twitch); window.removeEventListener('mouseup', up); };
    }
  });

    add({
    id: 'fill',
    instruction: 'Удерживайте кнопку и наполните стакан 🥛 <b>ровно до отметки</b>.',
    build: function (stage) {
      var box = h('div'); box.style.cssText = 'position:relative;width:80px;height:120px;margin:0 auto;border:3px solid #94a3b8;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;background:#fff;';
      var water = h('div'); water.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:0%;background:#60a5fa;';
      var mark = h('div'); mark.style.cssText = 'position:absolute;left:0;right:0;top:35%;border-top:2px dashed #dc2626;';
      box.appendChild(water); box.appendChild(mark); stage.appendChild(box);
      var btn = h('button', 'cap-btn-lg', 'Налить'); btn.style.margin = '12px auto 0'; btn.style.display = 'block';
      var lvl = 0, raf, holding = false;
      function loop() { if (!holding) return; lvl = Math.min(100, lvl + 2.0); water.style.height = lvl + '%'; raf = requestAnimationFrame(loop); }
      function s(e) { holding = true; raf = requestAnimationFrame(loop); e.preventDefault(); }
      function en() { holding = false; cancelAnimationFrame(raf); }
      btn.addEventListener('mousedown', s); btn.addEventListener('mouseup', en);
      btn.addEventListener('touchstart', s); btn.addEventListener('touchend', en);
      stage.appendChild(btn);
      stage._cleanup = en;
    }
  });

    add({
    id: 'kissdog',
    instruction: 'Поцелуйте собаку <b>10 раз</b>, чтобы продолжить. Каждую из 5 собак — по очереди.',
    build: function (stage) {
      var idx = ri(0, DOGS.length - 1), kisses = 0, dogNum = 1;
      var box = h('div'); box.style.cssText = 'position:relative;width:100%;height:172px;border-radius:10px;overflow:hidden;border:1px solid var(--ev-line);background:#000;cursor:none;';
      var img = document.createElement('img');
      img.src = DOGS[idx]; img.draggable = false;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;';
      img.onerror = function () { img.onerror = null; img.src = DOG_FALLBACK; img.style.objectFit = 'contain'; img.style.background = '#f1d9b5'; };
      box.appendChild(img);

      var lips = h('div', null, '💋');
      lips.style.cssText = 'position:absolute;font-size:26px;pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .15s;z-index:3;';
      box.appendChild(lips);

      var ro = h('div', 'cap-readout', 'Поцелуев: 0 / 10  ·  собака 1 / 5');

      function place(x, y) {
        var mark = h('div', null, '💋');
        mark.style.cssText = 'position:absolute;font-size:' + ri(18, 26) + 'px;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%) rotate(' + ri(-30, 30) + 'deg);pointer-events:none;z-index:2;';
        box.appendChild(mark);
      }
      function clearMarks() {
        Array.prototype.slice.call(box.querySelectorAll('div')).forEach(function (d) { if (d !== lips) box.removeChild(d); });
      }
      function kiss(x, y) {
        place(x, y); kisses++;
        if (Math.random() < 0.10) {
          kisses = 0; clearMarks();
          ro.textContent = '💔 Вы целуете без любви к животному. Поцелуи сброшены.';
          return;
        }
        if (kisses >= 10) {
          kisses = 0; dogNum = dogNum % 5 + 1;
          var ni; do { ni = ri(0, DOGS.length - 1); } while (ni === idx && DOGS.length > 1);
          idx = ni; img.src = DOGS[idx]; clearMarks();
        }
        ro.textContent = 'Поцелуев: ' + kisses + ' / 10  ·  собака ' + dogNum + ' / 5';
      }
      function rel(e) { var r = box.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }
      box.addEventListener('mousemove', function (e) { var p = rel(e); lips.style.left = p.x + 'px'; lips.style.top = p.y + 'px'; lips.style.opacity = '1'; });
      box.addEventListener('mouseleave', function () { lips.style.opacity = '0'; });
      box.addEventListener('click', function (e) { var p = rel(e); kiss(p.x, p.y); });
      box.addEventListener('touchstart', function (e) { var p = rel(e); kiss(p.x, p.y); e.preventDefault(); });

      stage.appendChild(box);
      stage.appendChild(ro);
    }
  });

    add({
    id: 'monkeynod',
    instruction: 'Посмотрите видео и ответьте: <b>сколько раз кивнула обезьянка?</b>',
    build: function (stage) {

      var modal = document.querySelector('.ev-modal');
      var prevMax = modal ? modal.style.maxWidth : '';
      if (modal) modal.style.maxWidth = '420px';

      var pool = []; for (var n = 3; n <= 16; n++) pool.push(n);
      var opts = shuffle(pool).slice(0, 10).sort(function (a, b) { return a - b; });
      var row = h('div', 'cap-row'); row.style.justifyContent = 'center'; row.style.flexWrap = 'wrap'; row.style.marginBottom = '12px';
      opts.forEach(function (v) {
        var b = h('button', 'cap-chip', String(v));
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(row.children, function (ch) { ch.classList.remove('is-sel'); });
          b.classList.add('is-sel');
        });
        row.appendChild(b);
      });
      stage.appendChild(row);

      var img = document.createElement('img');
      img.src = 'assets/img/ezgif-3abb9d96d8afc483.gif?t=' + Date.now();
      img.alt = 'обезьянка';
      img.style.cssText = 'display:block;margin:0 auto;width:320px;max-width:100%;height:auto;border-radius:9px;border:1px solid var(--ev-line);background:#000;';
      stage.appendChild(img);

      stage._cleanup = function () { if (modal) modal.style.maxWidth = prevMax; };
    }
  });

    function orderList(stage, items) {
    var list = h('div', 'cap-list');
    var data = shuffle(items);
    function redraw() {
      clear(list);
      data.forEach(function (label, idx) {
        var row = h('div', 'cap-list-item');
        row.appendChild(h('span', 'cap-grip', '⋮⋮'));
        row.appendChild(h('span', null, label));
        var sp = h('span'); sp.style.flex = '1'; row.appendChild(sp);
        var up = h('button', 'cap-btn-lg', '↑'); up.style.padding = '2px 9px';
        var dn = h('button', 'cap-btn-lg', '↓'); dn.style.padding = '2px 9px';
        up.addEventListener('click', function () { if (idx > 0) { var t = data[idx - 1]; data[idx - 1] = data[idx]; data[idx] = t; redraw(); } });
        dn.addEventListener('click', function () { if (idx < data.length - 1) { var t = data[idx + 1]; data[idx + 1] = data[idx]; data[idx] = t; redraw(); } });
        row.appendChild(up); row.appendChild(dn);
        list.appendChild(row);
      });
    }
    redraw();
    stage.appendChild(list);
    var iv = setInterval(function () {
      var i = ri(0, data.length - 2);
      var t = data[i]; data[i] = data[i + 1]; data[i + 1] = t; redraw();
    }, 2400);
    stage._cleanup = function () { clearInterval(iv); };
  }

    function renderingGrid(stage, emojis, cols) {
    cols = cols || 3;
    var grid = h('div', cols === 4 ? 'cap-grid cols-4' : 'cap-grid cols-3');
    var tiles = [], rows = Math.ceil(emojis.length / cols);
    emojis.forEach(function (e, i) {
      var t = h('div', 'cap-tile');
      var g = h('span', 'cap-glyph', e);
      var noise = h('div', 'cap-noise');
      var c = h('span', 'cap-check', '✓');
      t.appendChild(g); t.appendChild(noise); t.appendChild(c);
      t._row = Math.floor(i / cols); t._glyph = g;
      t.addEventListener('click', function () {
        if (t.classList.contains('is-unrendered') || t.classList.contains('is-broken')) return;
        t.classList.toggle('is-sel');
      });
      tiles.push(t); grid.appendChild(t);
    });
    var renderable = tiles.filter(function (t) { return t._row <= rows - 2; });
    shuffle(renderable).slice(0, 2).forEach(function (t) {
      t.classList.add('is-broken');
      t.style.background = '#eef2f7'; t.style.cursor = 'not-allowed';
      t._glyph.innerHTML = brokenSVG();
    });
    stage.appendChild(grid);
    stage.appendChild(h('div', 'cap-hint', 'Часть изображений не загрузилась. Дождитесь полной отрисовки…'));

    var front = -1;
    function apply() {
      tiles.forEach(function (t) {
        t.classList.toggle('is-unrendered', t._row > front);
        t.classList.toggle('is-front', t._row === front);
      });
    }
    apply();
    var iv = setInterval(function () {
      front++;
      if (front >= rows - 1) {
        front = rows - 2; apply();
        clearInterval(iv); iv = null;
        return;
      }
      apply();
    }, 850);
    stage._cleanup = function () { if (iv) clearInterval(iv); };
  }

    function dragWithin(box, node, onRelease) {
    var dragging = false;
    function move(e) {
      if (!dragging) return;
      var r = box.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
      var x = t.clientX - r.left, y = t.clientY - r.top;
      node.style.left = Math.max(0, Math.min(r.width - 30, x - 15)) + 'px';
      node.style.top = Math.max(0, Math.min(r.height - 30, y - 15)) + 'px';
      e.preventDefault();
    }
    function end() { if (dragging && onRelease) onRelease(); dragging = false; }
    node.addEventListener('mousedown', function () { dragging = true; });
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    node.addEventListener('touchstart', function () { dragging = true; });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
  }

    var FAIL_MSGS = [
    'Проверка не пройдена. Попробуйте ещё раз.',
    'Не удалось подтвердить, что вы человек. Повторите проверку.',
    'Хм, что-то не сходится. Загружаем новую проверку.',
    'Ответ отклонён системой защиты. Ещё одна попытка.',
    'Обнаружена подозрительная активность. Требуется повторная проверка.',
    'Результат не принят. Пройдите проверку заново.'
  ];
  var TIMEOUT_MSG = 'Время вышло. Загружаем новую проверку.';

  var Engine = {
    round: 0,
    lastId: null,
    bag: [],
    dom: null,
    timerInt: null,
    blinkInt: null,
    flashEl: null,
    flashNum: null,

    start: function () {
      this.dom = {
        stage: document.getElementById('ev-stage'),
        instr: document.getElementById('ev-instruction'),
        counter: document.getElementById('ev-counter'),
        widgetId: document.getElementById('ev-widget-id'),
        timer: document.getElementById('ev-timer'),
        timerVal: document.getElementById('evtimerval'),
        result: document.getElementById('ev-result'),
        submit: document.getElementById('ev-submit'),
        reload: document.getElementById('ev-reload')
      };
      var self = this;
      this.dom.submit.addEventListener('click', function () { self.onSubmit(); });
      this.dom.reload.addEventListener('click', function () {
        self.dom.reload.classList.add('is-spin');
        setTimeout(function () { self.dom.reload.classList.remove('is-spin'); }, 600);
        self.next();
      });
      this.next();
    },

    randId: function () {
      var hex = '0123456789abcdef', s = '';
      for (var i = 0; i < 4; i++) s += hex[ri(0, 15)];
      s += '-'; for (var j = 0; j < 2; j++) s += hex[ri(0, 15)];
      return 'ID: ' + s;
    },

    drawCaptcha: function () {
      if (this.bag.length === 0) {
        this.bag = shuffle(CAPTCHAS.slice());
        if (this.bag.length > 1 && this.bag[0].id === this.lastId) this.bag.push(this.bag.shift());
      }
      return this.bag.shift();
    },

    next: function () {
      var d = this.dom;
      this.stopTimer();
      if (d.stage._cleanup) { try { d.stage._cleanup(); } catch (e) {} d.stage._cleanup = null; }
      clear(d.stage);
      d.stage.style.position = 'relative';
      d.result.hidden = true; d.result.className = 'ev-result';
      d.submit.disabled = false; d.submit.textContent = 'Подтвердить';

      this.round++;
      d.counter.textContent = 'Проверка №' + this.round;
      d.widgetId.textContent = this.randId();

      var c = this.drawCaptcha();
      this.lastId = c.id;

      d.instr.innerHTML = c.instruction;
      try { c.build(d.stage, {}); } catch (e) {}

      this.flashEl = h('div', 'ev-flash');
      this.flashEl.style.cssText = 'position:absolute;inset:0;z-index:60;pointer-events:none;opacity:0;transition:opacity .18s;' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(220,38,38,0.94);';
      this.flashNum = h('div', null, '');
      this.flashNum.style.cssText = 'font-size:76px;font-weight:900;line-height:1;color:#fff;font-variant-numeric:tabular-nums;' +
        'text-shadow:0 3px 12px rgba(0,0,0,.5);transition:transform .22s ease;';
      var flbl = h('div', null, '⚠ ВРЕМЯ ИСТЕКАЕТ'); flbl.style.cssText = 'font-size:13px;font-weight:800;letter-spacing:1.5px;color:#fff;';
      this.flashEl.appendChild(this.flashNum); this.flashEl.appendChild(flbl);
      d.stage.appendChild(this.flashEl);

      this.startTimer(ri(15, 30));
    },

    startTimer: function (total) {
      var d = this.dom, self = this, left = total, threshold = Math.ceil(total / 3), blinking = false;
      d.timer.hidden = false; d.timer.classList.remove('is-low');
      d.timerVal.textContent = left;
      this.timerInt = setInterval(function () {
        left--;
        d.timerVal.textContent = Math.max(0, left);
        if (left <= threshold) {
          if (self.flashNum) self.flashNum.textContent = Math.max(0, left);
          if (!blinking) {
            blinking = true;
            d.timer.classList.add('is-low');
            var on = false;
            self.blinkInt = setInterval(function () {
              on = !on;
              if (self.flashEl) self.flashEl.style.opacity = on ? '0.97' : '0.6';
              if (self.flashNum) self.flashNum.style.transform = on ? 'scale(1.22)' : 'scale(1)';
            }, 460);
          }
        }
        if (left <= 0) { self.stopTimer(); self.fail(TIMEOUT_MSG); }
      }, 1000);
    },

    stopTimer: function () {
      if (this.timerInt) { clearInterval(this.timerInt); this.timerInt = null; }
      if (this.blinkInt) { clearInterval(this.blinkInt); this.blinkInt = null; }
      if (this.flashEl) { this.flashEl.style.opacity = '0'; }
      if (this.dom) this.dom.timer.hidden = true;
    },

    onSubmit: function () { this.fail(pick(FAIL_MSGS)); },

    fail: function (msg) {
      var d = this.dom, self = this;
      this.stopTimer();
      d.submit.disabled = true;
      if (d.stage._cleanup) { try { d.stage._cleanup(); } catch (e) {} }

      d.result.hidden = false;
      d.result.className = 'ev-result is-checking';
      clear(d.result);
      d.result.appendChild(h('span', 'ev-result-spinner'));
      d.result.appendChild(h('span', null, 'Проверяем ответ…'));

      setTimeout(function () {
        d.result.className = 'ev-result is-fail';
        clear(d.result);
        d.result.appendChild(h('span', null, '✕'));
        d.result.appendChild(h('span', null, msg));
        setTimeout(function () { self.next(); }, 1150);
      }, 850 + ri(0, 500));
    }
  };

  global.CaptchaEngine = Engine;
  global.TZ_CAPTCHA_COUNT = CAPTCHAS.length;
})(window);
