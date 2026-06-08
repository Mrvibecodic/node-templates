(function (global) {
  'use strict';

  var TICKER = [
    'Нейросети научились писать драйверы быстрее людей',
    'Российские разработчики выпустили open-source ускоритель',
    'Квантовый процессор преодолел отметку в 2000 кубитов',
    'Стартап недели: ИИ-ассистент для фермеров',
    'Утечка: характеристики нового складного смартфона',
    'Дата-центры переходят на жидкостное охлаждение',
    'Обзор: ноутбук на ARM против x86 в 2026 году',
    'Браузеры готовят отказ от сторонних cookie'
  ];

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function skel(cls, w) {
    var n = el('span', 'tz-skel ' + cls);
    if (w) n.style.width = w;
    return n;
  }

  function renderTicker(host) {
    if (!host) return;
    host.innerHTML = '';
    TICKER.concat(TICKER).forEach(function (t) {
      var item = el('span', 'tz-ticker-item');
      var b = el('b'); b.textContent = '●';
      item.appendChild(b);
      item.appendChild(document.createTextNode(t));
      host.appendChild(item);
    });
  }

  function renderLeadMain(host) {
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(skel('tz-lead-thumb'));
    var body = el('div', 'tz-lead-body');
    body.appendChild(skel('tz-skel-eyebrow'));
    body.appendChild(skel('tz-skel-title-lg'));
    body.appendChild(skel('tz-skel-title-lg l2'));
    body.appendChild(skel('tz-skel-text', '100%'));
    body.appendChild(skel('tz-skel-text', '95%'));
    body.appendChild(skel('tz-skel-text', '60%'));
    host.appendChild(body);
  }

  function renderLeadSide(host) {
    if (!host) return;
    host.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var card = el('div', 'tz-side-card');
      card.appendChild(skel('tz-side-thumb'));
      var lines = el('div', 'tz-side-lines');
      lines.appendChild(skel('tz-skel-text', '100%'));
      lines.appendChild(skel('tz-skel-text', '80%'));
      lines.appendChild(skel('tz-skel-text', '40%'));
      card.appendChild(lines);
      host.appendChild(card);
    }
  }

  function renderFeed(host) {
    if (!host) return;
    host.innerHTML = '';
    var widths = ['100%', '92%', '70%'];
    for (var i = 0; i < 6; i++) {
      var item = el('div', 'tz-feed-item');
      item.appendChild(skel('tz-feed-thumb'));
      var lines = el('div', 'tz-feed-lines');
      lines.appendChild(skel('tz-skel-text', widths[i % 3]));
      lines.appendChild(skel('tz-skel-text', '85%'));
      var meta = el('div', 'tz-feed-meta');
      meta.appendChild(skel('tz-skel-line', '70px'));
      meta.appendChild(skel('tz-skel-line', '50px'));
      lines.appendChild(meta);
      item.appendChild(lines);
      host.appendChild(item);
    }
  }

  function renderTrending(host) {
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(skel('tz-skel-wh tz-widget-head'));
    for (var i = 0; i < 5; i++) {
      var row = el('div', 'tz-trend-row');
      row.appendChild(skel('tz-trend-num'));
      var lines = el('div', 'tz-trend-lines');
      lines.appendChild(skel('tz-skel-text', '100%'));
      lines.appendChild(skel('tz-skel-text', '55%'));
      row.appendChild(lines);
      host.appendChild(row);
    }
  }

  function renderPromo(host) {
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(skel('tz-skel-wh tz-widget-head'));
    host.appendChild(skel('tz-promo-box'));
  }

  function renderTags(host) {
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(skel('tz-skel-wh tz-widget-head'));
    var wrap = el('div', 'tz-tags-wrap');
    var ws = [54, 78, 44, 90, 62, 50, 84, 40, 70];
    ws.forEach(function (w) { wrap.appendChild(skel('tz-tag', w + 'px')); });
    host.appendChild(wrap);
  }

  function render() {
    renderTicker(document.getElementById('tz-ticker'));
    renderLeadMain(document.getElementById('tz-lead-main'));
    renderLeadSide(document.getElementById('tz-lead-side'));
    renderFeed(document.getElementById('tz-feed'));
    renderTrending(document.getElementById('tz-trending'));
    renderPromo(document.getElementById('tz-promo'));
    renderTags(document.getElementById('tz-tags'));
  }

  global.TZNews = { render: render };
})(window);
