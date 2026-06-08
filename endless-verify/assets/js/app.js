(function () {
  'use strict';

    var CONFIG = {
    siteName: 'Технозона',
    brandHtml: 'Техно<b>зона</b>',
    tagline: 'новости технологий, ИИ и стартапов',
    securityBrand: 'SecureGate'
  };

  var SUBTITLES = [
    'Сервер перегружен запросами. Подтвердите, что вы не робот.',
    'Обнаружена необычная активность. Пройдите проверку безопасности.',
    'Слишком много запросов с вашего IP-адреса. Подтвердите, что вы человек.',
    'Система защиты от ботов активирована. Пройдите верификацию, чтобы продолжить.',
    'Доступ временно ограничен. Подтвердите, что вы не робот.'
  ];
  var TITLES = [
    'Подтвердите, что вы не робот',
    'Проверка безопасности',
    'Подтвердите, что вы человек',
    'Требуется верификация'
  ];

  function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function applyConfig() {
    document.title = CONFIG.siteName + ' — ' + CONFIG.tagline;
    var brand = document.querySelector('.tz-brand');
    if (brand) brand.innerHTML = CONFIG.brandHtml;
    var evBrand = document.getElementById('ev-brand');
    if (evBrand) evBrand.textContent = CONFIG.securityBrand;
    var y = new Date().getFullYear();
    var yEl = document.getElementById('ev-year'); if (yEl) yEl.textContent = y;
  }

  function boot() {
    applyConfig();

    if (window.TZNews) window.TZNews.render();

    var delay = ri(1400, 2200);
    setTimeout(function () {
      var page = document.getElementById('tz-page');
      var overlay = document.getElementById('ev-overlay');
      var title = document.getElementById('ev-title');
      var sub = document.getElementById('ev-subtitle');

      if (title) title.textContent = TITLES[ri(0, TITLES.length - 1)];
      if (sub) sub.textContent = SUBTITLES[ri(0, SUBTITLES.length - 1)];

      if (page) page.classList.add('is-locked');
      if (overlay) overlay.hidden = false;

      if (window.CaptchaEngine) window.CaptchaEngine.start();
    }, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
