(function () {
  "use strict";

  var TWITCH_PARENT = (location.hostname && location.hostname !== "") ? location.hostname : "localhost";

  var GAMES = [
    {
      id: "cs2", name: "Counter-Strike 2", short: "CS2", color: "#f5a623", icon: "assets/img/si-counterstrike.svg",
      streams: [
        { channel: "esl_csgo", title: "ESL Pro League - 24/7 Stage", studio: "ESL", logo: "assets/img/si-counterstrike.svg", avatar: "assets/img/si-twitch.svg", tags: ["FPS", "Pro League"], live: true, viewers: 48210 },
        { channel: "pgl", title: "PGL Major - Replays Marathon", studio: "PGL", logo: "assets/img/si-counterstrike.svg", avatar: "assets/img/si-twitch.svg", tags: ["Major", "Rerun"], live: true, viewers: 21640 }
      ]
    },
    {
      id: "dota2", name: "Dota 2", short: "Dota 2", color: "#c23c2a", icon: "assets/img/si-dota2.svg",
      streams: [
        { channel: "esl_dota2", title: "ESL One - Non-stop Hub", studio: "ESL", logo: "assets/img/si-dota2.svg", avatar: "assets/img/si-twitch.svg", tags: ["MOBA", "ESL One"], live: true, viewers: 33980 },
        { channel: "pgl_dota2", title: "Wallachia Series - Playlist", studio: "PGL", logo: "assets/img/si-dota2.svg", avatar: "assets/img/si-twitch.svg", tags: ["Wallachia", "Rerun"], live: false, viewers: 9120 }
      ]
    },
    {
      id: "lol", name: "League of Legends", short: "LoL", color: "#0bc6e3", icon: "assets/img/si-leagueoflegends.svg",
      streams: [
        { channel: "riotgames", title: "LEC / LCK / LCS - Worldwide Feed", studio: "Riot Games", logo: "assets/img/si-leagueoflegends.svg", avatar: "assets/img/si-riotgames.svg", tags: ["MOBA", "LEC"], live: true, viewers: 71450 }
      ]
    },
    {
      id: "sc2", name: "StarCraft II", short: "SC2", color: "#7b68ee", wordmark: true,
      icon: "https://commons.wikimedia.org/wiki/Special:FilePath/StarCraft_logo.svg",
      iconFallback: "assets/img/si-battledotnet.svg",
      streams: [
        { channel: "esl_sc2", title: "StarCraft Pro Tour - Endless Ladder", studio: "ESL", logo: "assets/img/si-battledotnet.svg", avatar: "assets/img/si-twitch.svg", tags: ["RTS", "Pro Tour"], live: true, viewers: 6730 }
      ]
    }
  ];

  var SCHEDULE_ENDPOINT = null;

  var DEMO_SCHEDULE = [
    { game: "cs2", tournament: "ESL Pro League S23", stage: "Group A - BO3", start: "2026-05-30T18:00:00", a: { name: "Vitality", c: "#f8d62b", t: "#111" }, b: { name: "FaZe", c: "#d3222a" }, live: true },
    { game: "lol", tournament: "MSI 2026", stage: "Rumble Stage", start: "2026-05-30T20:30:00", a: { name: "T1", c: "#e2012d" }, b: { name: "G2", c: "#ee2b2b" }, live: true },
    { game: "dota2", tournament: "ESL One Bangkok", stage: "Upper Bracket QF", start: "2026-05-30T22:00:00", a: { name: "Team Spirit", c: "#1f2d5c" }, b: { name: "Falcons", c: "#0aa36a" }, live: false },
    { game: "cs2", tournament: "PGL Astana Major", stage: "Quarterfinal - BO3", start: "2026-05-31T15:00:00", a: { name: "NAVI", c: "#ffe500", t: "#111" }, b: { name: "Spirit", c: "#1f2d5c" }, live: false },
    { game: "sc2", tournament: "StarCraft Pro Tour", stage: "Ro16 - BO5", start: "2026-05-31T17:30:00", a: { name: "Serral", c: "#2e7d32" }, b: { name: "Clem", c: "#1565c0" }, live: false },
    { game: "dota2", tournament: "DreamLeague S26", stage: "Group Stage", start: "2026-05-31T19:00:00", a: { name: "Liquid", c: "#02385e" }, b: { name: "Gaimin", c: "#7b1fa2" }, live: false },
    { game: "lol", tournament: "LEC Summer", stage: "Week 1 - Day 2", start: "2026-06-01T16:00:00", a: { name: "Fnatic", c: "#ff5800" }, b: { name: "MAD", c: "#111", t: "#fff" }, live: false },
    { game: "cs2", tournament: "IEM Cologne", stage: "Play-in - BO1", start: "2026-06-01T18:00:00", a: { name: "G2", c: "#ee2b2b" }, b: { name: "MOUZ", c: "#e2231a" }, live: false }
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function fmt(n) { return n.toLocaleString("en-US"); }
  var PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var EYE_SVG = '<svg viewBox="0 0 24 24"><path d="M12 5C6.5 5 2.7 8.6 1 12c1.7 3.4 5.5 7 11 7s9.3-3.6 11-7c-1.7-3.4-5.5-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z"/></svg>';

  // Rotating blurred esports backdrop for the hero (random on each load).
  // Mix of local CC0 shots + real esports photos (Pexels license: free, no attribution, no watermark).
  var HERO_IMAGES = [
    "assets/img/hero-arena.jpg",
    "assets/img/event-2.jpg",
    "assets/img/event-3.jpg",
    "assets/img/event-4.jpg",
    "https://images.pexels.com/photos/929839/pexels-photo-929839.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/34697345/pexels-photo-34697345.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/30469968/pexels-photo-30469968.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/28779690/pexels-photo-28779690.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/4500123/pexels-photo-4500123.jpeg?auto=compress&cs=tinysrgb&w=1600"
  ];
  function initHeroBg() {
    var p = document.getElementById("hero-photo");
    if (!p) return;
    var src = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
    var probe = new Image();
    probe.onload = function () { p.style.backgroundImage = "url('" + src + "')"; p.classList.add("in"); };
    probe.onerror = function () { p.style.backgroundImage = "url('assets/img/hero-arena.jpg')"; p.classList.add("in"); };
    probe.src = src;
  }

  function buildTabs() {
    var tabsWrap = document.getElementById("stream-tabs");
    var grid = document.getElementById("stream-grid");
    if (!tabsWrap || !grid) return;
    GAMES.forEach(function (g, i) {
      var t = el("button", "tab" + (i === 0 ? " active" : ""));
      t.dataset.game = g.id;
      var fb = g.iconFallback ? ' onerror="this.onerror=null;this.src=\'' + g.iconFallback + '\'"' : '';
      t.innerHTML = g.wordmark
        ? '<img class="ico ico-wide" src="' + g.icon + '" alt="' + g.name + '"' + fb + '> <span class="count">' + g.streams.length + '</span>'
        : '<img class="ico" src="' + g.icon + '" alt="">' + g.short + ' <span class="count">' + g.streams.length + '</span>';
      t.addEventListener("click", function () {
        tabsWrap.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        renderStreams(g.id);
      });
      tabsWrap.appendChild(t);
    });
    renderStreams(GAMES[0].id);
  }

  function renderStreams(gameId) {
    var grid = document.getElementById("stream-grid");
    var game = GAMES.filter(function (g) { return g.id === gameId; })[0];
    grid.innerHTML = "";
    game.streams.forEach(function (s) {
      var card = el("div", "stream-card");
      var player = el("div", "player");

      var corner = el("div", "corner");
      corner.innerHTML = s.live
        ? '<span class="badge badge-live"><span class="dot"></span>Live</span>'
        : '<span class="badge badge-soon">Rerun</span>';
      var cornerR = el("div", "corner-r");
      cornerR.innerHTML = '<span class="badge badge-game viewers">' + EYE_SVG + fmt(s.viewers) + '</span>';

      var iframe = el("iframe");
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("loading", "lazy");
      iframe.src = "https://player.twitch.tv/?channel=" + encodeURIComponent(s.channel) +
        "&parent=" + encodeURIComponent(TWITCH_PARENT) + "&muted=true&autoplay=true";
      player.appendChild(iframe);
      player.appendChild(corner);
      player.appendChild(cornerR);

      var info = el("div", "stream-info");
      info.innerHTML =
        '<img class="ava" src="' + s.avatar + '" alt="' + s.studio + '">' +
        '<div class="txt"><h4>' + s.title + '</h4><p>' + s.studio + ' - twitch.tv/' + s.channel + '</p>' +
        '<div class="tags">' + s.tags.map(function (x) { return '<span class="chip">' + x + '</span>'; }).join("") + '</div></div>';

      card.appendChild(player);
      card.appendChild(info);
      grid.appendChild(card);
    });
  }

  var scheduleData = DEMO_SCHEDULE;
  function loadSchedule() {
    if (SCHEDULE_ENDPOINT) {
      fetch(SCHEDULE_ENDPOINT)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (data) { renderSchedule(data, "all"); })
        .catch(function () { renderSchedule(DEMO_SCHEDULE, "all"); });
    } else {
      renderSchedule(DEMO_SCHEDULE, "all");
    }
    buildScheduleFilters();
  }

  function buildScheduleFilters() {
    var bar = document.getElementById("sched-filters");
    if (!bar) return;
    var opts = [{ id: "all", name: "All games" }].concat(GAMES.map(function (g) { return { id: g.id, name: g.short }; }));
    opts.forEach(function (o, i) {
      var b = el("button", "filter" + (i === 0 ? " active" : ""), o.name);
      b.addEventListener("click", function () {
        bar.querySelectorAll(".filter").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        renderSchedule(scheduleData, o.id);
      });
      bar.appendChild(b);
    });
  }

  function renderSchedule(data, filter) {
    scheduleData = data;
    var list = document.getElementById("sched-list");
    if (!list) return;
    list.innerHTML = "";
    var rows = data.filter(function (m) { return filter === "all" || m.game === filter; });
    if (!rows.length) { list.appendChild(el("p", "muted", "No matches scheduled for this game.")); return; }

    var lastDay = "";
    rows.forEach(function (m) {
      var d = new Date(m.start);
      var dayKey = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      if (dayKey !== lastDay) { list.appendChild(el("div", "sched-day", dayKey)); lastDay = dayKey; }
      var time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      var g = GAMES.filter(function (x) { return x.id === m.game; })[0] || { short: m.game };

      var row = el("div", "match");
      row.innerHTML =
        '<div class="time"><b>' + time + '</b><span>' + d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + '</span></div>' +
        '<div class="body">' +
          '<div class="tournament">' + (m.live ? '<span class="badge badge-live"><span class="dot"></span>Live</span>' : '') + g.short + ' - ' + m.tournament + '</div>' +
          '<div class="versus">' + teamHtml(m.a) + '<span class="vs">vs</span>' + teamHtml(m.b) + '</div>' +
          '<div class="stage">' + m.stage + '</div>' +
        '</div>' +
        '<div class="act">' +
          (m.live
            ? '<button class="btn btn-live btn-sm" data-watch="1">' + PLAY_SVG + ' Watch</button>'
            : '<button class="btn btn-ghost btn-sm" data-remind="1">Remind me</button>') +
        '</div>';
      list.appendChild(row);
    });

    list.querySelectorAll("[data-watch]").forEach(function (b) {
      b.addEventListener("click", function () { document.getElementById("streams").scrollIntoView({ behavior: "smooth" }); });
    });
    list.querySelectorAll("[data-remind]").forEach(function (b) {
      b.addEventListener("click", function () { b.textContent = "Reminder set"; b.classList.add("btn-primary"); b.classList.remove("btn-ghost"); toast("We'll ping you before this match"); });
    });
  }
  function teamHtml(t) {
    var initials = t.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 3).toUpperCase();
    return '<span class="team"><span class="tlogo" style="background:' + t.c + ';color:' + (t.t || "#fff") + '">' + initials + '</span>' + t.name + '</span>';
  }

  var INVITE_CODES = ["ESL-2026", "MAJOR-VIP", "ARENA-PRO"];
  function initModals() {
    document.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { openModal(b.dataset.open); });
    });
    document.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { closeModal(b.closest(".modal-root")); });
    });
    document.querySelectorAll(".modal-root .backdrop").forEach(function (bd) {
      bd.addEventListener("click", function () { closeModal(bd.closest(".modal-root")); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.querySelectorAll(".modal-root.open").forEach(closeModal);
    });

    var reg = document.getElementById("form-register");
    if (reg) reg.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = (reg.querySelector("[name=code]").value || "").trim().toUpperCase();
      var email = (reg.querySelector("[name=email]").value || "").trim();
      var msg = reg.querySelector(".form-msg");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.className = "form-msg err"; msg.textContent = "Enter a valid email address."; return; }
      if (INVITE_CODES.indexOf(code) === -1) { msg.className = "form-msg err"; msg.textContent = "Invite code not recognised. Check with the member who invited you."; return; }
      msg.className = "form-msg ok"; msg.textContent = "Invite accepted - welcome to the arena.";
      setTimeout(function () { closeModal(reg.closest(".modal-root")); toast("Account created - " + email); reg.reset(); msg.textContent = ""; }, 900);
    });

    var login = document.getElementById("form-login");
    if (login) login.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = login.querySelector(".form-msg");
      msg.className = "form-msg ok"; msg.textContent = "Signing you in...";
      setTimeout(function () { closeModal(login.closest(".modal-root")); toast("Signed in"); login.reset(); msg.textContent = ""; }, 800);
    });

    document.querySelectorAll("[data-switch]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); document.querySelectorAll(".modal-root.open").forEach(closeModal); openModal(a.dataset.switch); });
    });
  }
  function openModal(id) { var m = document.getElementById(id); if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; var f = m.querySelector("input"); if (f) setTimeout(function () { f.focus(); }, 60); } }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    if (!document.querySelector(".modal-root.open")) document.body.style.overflow = "";
  }

  // Bottom-centered toast notifications.
  var toastHost = null;
  function toast(message) {
    if (!toastHost) { toastHost = el("div", "toast-host"); document.body.appendChild(toastHost); }
    var t = el("div", "toast", '<span class="dot"></span><span class="t"></span>');
    t.querySelector(".t").textContent = message;
    toastHost.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("in"); });
    setTimeout(function () {
      t.classList.remove("in");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 280);
    }, 3200);
  }

  // Hamburger / mobile nav drawer.
  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;
    function close() { links.classList.remove("open"); toggle.classList.remove("active"); toggle.setAttribute("aria-expanded", "false"); }
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  // Count-up for the hero stats once they scroll into view.
  function animateCount(node) {
    var target = parseFloat(node.dataset.count) || 0;
    var suffix = node.dataset.suffix || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target.toLocaleString("en-US") + suffix;
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) { nodes.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  // Reveal-on-scroll for elements tagged with data-reveal.
  function initReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) { nodes.forEach(function (n) { n.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function init() {
    initHeroBg();
    buildTabs();
    loadSchedule();
    initModals();
    initNav();
    initCounters();
    initReveal();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
