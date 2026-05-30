/* ScreenWire — клиентский агрегатор ссылок.
   Три keyless-источника с открытым CORS:
     • Игры    — CheapShark (свежие скидки/релизы в Steam и других магазинах)
     • Фильмы  — Apple Marketing RSS (топ фильмов iTunes)
     • Сериалы — TVMaze (эпизоды в эфире сегодня)
   Ключи не нужны. При сбое сети показываются резервные данные, чтобы лента не пустовала. */

(function () {
  "use strict";

  var PAGE = 15;            // сколько строк показывать за раз
  var state = {
    feed: "all",
    shown: PAGE,
    cache: {}              // kind -> массив нормализованных элементов
  };

  var elFeed = document.getElementById("feed");
  var elTitle = document.getElementById("feed-title");
  var elSub = document.getElementById("feed-sub");
  var elMore = document.getElementById("more");
  var elTabs = document.getElementById("tabs");

  var LABEL = { all: "Свежее", games: "Игры", movies: "Фильмы", series: "Сериалы" };

  /* ---------- утилиты ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function fetchJSON(url) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 9000);
    return fetch(url, { signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }

  /* ---------- нормализация источников ---------- */
  // CheapShark -> игры
  function mapGames(arr) {
    var STORES = { "1": "Steam", "7": "GOG", "8": "Origin", "11": "Humble", "13": "Uplay", "25": "Epic", "23": "GamersGate" };
    return (arr || []).map(function (d) {
      var price = parseFloat(d.salePrice), normal = parseFloat(d.normalPrice);
      var meta = [];
      meta.push('<span class="score">$' + price.toFixed(2) + "</span>");
      if (normal > price) meta.push("<b>−" + Math.round(parseFloat(d.savings)) + "%</b> от $" + normal.toFixed(2));
      if (d.steamRatingText && d.steamRatingText !== "0") meta.push(esc(d.steamRatingText));
      return {
        kind: "games",
        title: d.title,
        url: "https://www.cheapshark.com/redirect?dealID=" + encodeURIComponent(d.dealID),
        source: STORES[d.storeID] || "магазин",
        img: d.thumb || "",
        meta: meta
      };
    });
  }
  // Apple RSS -> фильмы
  function mapMovies(json) {
    var res = (json && json.feed && json.feed.results) || [];
    return res.map(function (m) {
      var meta = [];
      if (m.genres && m.genres[0]) meta.push(esc(m.genres[0].name));
      if (m.releaseDate) meta.push((m.releaseDate + "").slice(0, 4));
      if (m.artistName) meta.push("реж. " + esc(m.artistName));
      var art = m.artworkUrl100 ? m.artworkUrl100.replace(/100x100/, "200x200") : "";
      return { kind: "movies", title: m.name, url: m.url, source: "iTunes", img: art, meta: meta };
    });
  }
  // TVMaze -> сериалы (поддержка /schedule -> e.show и /schedule/web -> e._embedded.show)
  var SKIP_TYPE = { "News": 1, "Talk Show": 1, "Variety": 1, "Sports": 1, "Game Show": 1, "Panel Show": 1, "Award Show": 1 };
  function mapSeries(arr) {
    return (arr || []).map(function (e) {
      return { e: e, show: e.show || (e._embedded && e._embedded.show) };
    }).filter(function (x) { return x.show && !SKIP_TYPE[x.show.type]; }).map(function (x) {
      var e = x.e, show = x.show;
      var net = (show.webChannel && show.webChannel.name) || (show.network && show.network.name);
      var meta = [];
      if (show.type && show.type !== "Scripted") meta.push(esc(show.type));
      if (e.season && e.number) meta.push("S" + e.season + "·E" + e.number);
      if (e.airtime) meta.push(esc(e.airtime));
      var title = show.name + (e.name ? " — " + e.name : "");
      var img = show.image && (show.image.medium || show.image.original) || "";
      return { kind: "series", title: title, url: e.url || show.url, source: net || "TVMaze", img: img, meta: meta };
    });
  }

  /* ---------- резервные данные (фолбэк при сбое сети) ---------- */
  var DEMO = {
    games: [
      { kind: "games", title: "Baldur's Gate 3", url: "#", source: "Steam", meta: ['<span class="score">$35.99</span>', "<b>−40%</b> от $59.99", "Overwhelmingly Positive"] },
      { kind: "games", title: "Hades II", url: "#", source: "Steam", meta: ['<span class="score">$24.49</span>', "<b>−30%</b> от $34.99", "Very Positive"] },
      { kind: "games", title: "Elden Ring", url: "#", source: "Steam", meta: ['<span class="score">$41.99</span>', "<b>−30%</b> от $59.99", "Very Positive"] }
    ],
    movies: [
      { kind: "movies", title: "Dune: Part Two", url: "#", source: "iTunes", meta: ["Sci-Fi", "2024", "реж. Denis Villeneuve"] },
      { kind: "movies", title: "Oppenheimer", url: "#", source: "iTunes", meta: ["Drama", "2023", "реж. Christopher Nolan"] },
      { kind: "movies", title: "Poor Things", url: "#", source: "iTunes", meta: ["Comedy", "2023", "реж. Yorgos Lanthimos"] }
    ],
    series: [
      { kind: "series", title: "Severance — Cold Harbor", url: "#", source: "TVMaze", meta: ["Apple TV+", "S2·E10", "21:00"] },
      { kind: "series", title: "The Last of Us — Endure and Survive", url: "#", source: "TVMaze", meta: ["HBO", "S2·E5", "21:00"] },
      { kind: "series", title: "Andor — Welcome to the Rebellion", url: "#", source: "TVMaze", meta: ["Disney+", "S2·E9", "00:00"] }
    ]
  };

  /* ---------- загрузка одного раздела ---------- */
  function loadKind(kind) {
    if (state.cache[kind]) return Promise.resolve(state.cache[kind]);
    var p;
    if (kind === "games") {
      p = fetchJSON("https://www.cheapshark.com/api/1.0/deals?sortBy=Recent&pageSize=40&onSale=1").then(mapGames);
    } else if (kind === "movies") {
      p = fetchJSON("https://rss.applemarketingtools.com/api/v2/us/movies/top-movies/25/movies.json").then(mapMovies);
    } else {
      p = fetchJSON("https://api.tvmaze.com/schedule?country=US&date=" + today()).then(mapSeries);
    }
    return p.then(function (items) {
      if (!items || !items.length) throw new Error("empty");
      state.cache[kind] = items;
      return items;
    }).catch(function () {
      state.cache[kind] = DEMO[kind].slice();
      state.cache[kind]._demo = true;
      return state.cache[kind];
    });
  }

  /* ---------- рендер ---------- */
  function rowHTML(item, rank) {
    var tagName = { games: "Игры", movies: "Фильмы", series: "Сериалы" }[item.kind];
    var initial = { games: "G", movies: "M", series: "S" }[item.kind];
    var meta = item.meta && item.meta.length ? item.meta.join('<span class="sep">·</span>') : "";
    var thumb = item.img
      ? '<a class="thumb" href="' + esc(item.url) + '" target="_blank" rel="noopener">' +
          '<img loading="lazy" src="' + esc(item.img) + '" alt="" ' +
          'onerror="this.parentNode.classList.add(\'ph\',\'' + item.kind + '\');this.parentNode.textContent=\'' + initial + '\'"></a>'
      : '<span class="thumb ph ' + item.kind + '">' + initial + '</span>';
    return '' +
      '<li class="row">' +
        '<span class="rank">' + rank + '</span>' +
        thumb +
        '<div class="main">' +
          '<div class="title-line">' +
            '<a class="title" href="' + esc(item.url) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a>' +
            '<span class="src">(' + esc(item.source) + ')</span>' +
          '</div>' +
          '<div class="meta">' +
            '<span class="tag ' + item.kind + '">' + tagName + '</span>' +
            (meta ? '<span class="sep">·</span>' + meta : '') +
          '</div>' +
        '</div>' +
      '</li>';
  }

  function interleave(lists) {
    var out = [], i = 0, more = true;
    while (more) {
      more = false;
      for (var k = 0; k < lists.length; k++) {
        if (lists[k][i]) { out.push(lists[k][i]); more = true; }
      }
      i++;
    }
    return out;
  }

  function render(items, demo) {
    var slice = items.slice(0, state.shown);
    if (!slice.length) {
      elFeed.innerHTML = '<li class="feed-empty">Ничего не нашлось. Попробуйте «Обновить».</li>';
      elMore.hidden = true;
      return;
    }
    elFeed.innerHTML = slice.map(function (it, i) { return rowHTML(it, i + 1); }).join("");
    elMore.hidden = state.shown >= items.length;
  }

  var SUB = { all: "Свежее за сегодня", games: "Скидки и релизы", movies: "Премьеры и новинки", series: "Сегодня в эфире" };

  function show() {
    elTitle.textContent = LABEL[state.feed];
    elSub.textContent = SUB[state.feed] || "";
    if (state.feed === "all") {
      Promise.all([loadKind("games"), loadKind("movies"), loadKind("series")]).then(function (r) {
        var demo = r[0]._demo || r[1]._demo || r[2]._demo;
        render(interleave([r[0], r[1], r[2]]), demo);
      });
    } else {
      loadKind(state.feed).then(function (items) { render(items, !!items._demo); });
    }
  }

  /* ---------- события ---------- */
  function setFeed(feed) {
    state.feed = feed;
    state.shown = PAGE;
    [].forEach.call(elTabs.querySelectorAll(".tab"), function (b) {
      b.classList.toggle("is-active", b.dataset.feed === feed);
    });
    elFeed.innerHTML = '<li class="row row-skeleton"><span class="sk"></span></li>'.repeat(5);
    show();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  elTabs.addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (b) setFeed(b.dataset.feed);
  });
  document.addEventListener("click", function (e) {
    var f = e.target.closest("[data-feed]");
    if (f && !f.classList.contains("tab")) { e.preventDefault(); setFeed(f.dataset.feed); }
  });
  elMore.addEventListener("click", function () { state.shown += PAGE; show(); });
  document.getElementById("refresh").addEventListener("click", function () {
    state.cache = {};
    setFeed(state.feed);
  });

  /* старт */
  setFeed("all");
})();
