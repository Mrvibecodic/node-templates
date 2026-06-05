const SITE_CONFIG = {
  name: "WildPlanet",
  tagline: { en: "Zoos of the World", ru: "Зоопарки мира", zh: "世界动物园" },
  defaultLang: "en"
};

(function () {
  const SUPPORTED = ["en", "ru", "zh"];
  const store = {
    get lang() {
      const saved = localStorage.getItem("wz_lang");
      if (saved && SUPPORTED.includes(saved)) return saved;
      const nav = (navigator.language || "en").slice(0, 2);
      return SUPPORTED.includes(nav) ? nav : SITE_CONFIG.defaultLang;
    },
    set lang(v) { localStorage.setItem("wz_lang", v); }
  };

  let activeGroup = "all";
  let primatesOnly = false;
  const loaded = new Set();

  function t(key) {
    const dict = window.I18N[store.lang] || window.I18N.en;
    return dict[key] != null ? dict[key] : (window.I18N.en[key] || key);
  }

  function applyBranding() {
    document.querySelectorAll("[data-brand]").forEach(el => { el.textContent = SITE_CONFIG.name; });
    document.querySelectorAll("[data-brand-tagline]").forEach(el => {
      el.textContent = SITE_CONFIG.tagline[store.lang] || SITE_CONFIG.tagline.en;
    });
    document.title = SITE_CONFIG.name + " — " + (SITE_CONFIG.tagline[store.lang] || SITE_CONFIG.tagline.en);
  }

  function applyI18n() {
    document.documentElement.lang = store.lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-lang-btn") === store.lang);
    });
    applyBranding();
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    store.lang = lang;
    applyI18n();
    renderCams();
    renderSpecies();
  }

  function parentHost() {
    return location.hostname || "localhost";
  }

  function resolveEmbed(cam) {
    if (cam.type === "twitch") {
      return cam.embed.replace(/PARENT_HOST/g, encodeURIComponent(parentHost()));
    }
    return cam.embed;
  }

  function statusLabel(cam) {
    return cam.live247 ? t("cams.247") : t("cams.daylight");
  }

  function camCard(cam) {
    const card = document.createElement("article");
    card.className = "cam-card";
    card.setAttribute("data-group", cam.group);
    card.setAttribute("data-primate", cam.primate ? "1" : "0");

    const media = document.createElement("div");
    media.className = "cam-media";

    const poster = document.createElement("div");
    poster.className = "cam-poster";
    poster.style.backgroundImage = "url('" + cam.image + "')";

    const playBtn = document.createElement("button");
    playBtn.className = "cam-play";
    playBtn.setAttribute("aria-label", t("cams.play"));
    playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

    const live = document.createElement("span");
    live.className = "cam-badge" + (cam.live247 ? " is-live" : "");
    live.innerHTML = '<span class="dot"></span>' + (cam.live247 ? t("cams.live") : statusLabel(cam));

    media.appendChild(poster);
    media.appendChild(live);
    media.appendChild(playBtn);

    function startStream() {
      if (loaded.has(cam.id)) return;
      loaded.add(cam.id);
      const frame = document.createElement("iframe");
      frame.className = "cam-frame";
      frame.src = resolveEmbed(cam);
      frame.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
      frame.setAttribute("allowfullscreen", "");
      frame.setAttribute("loading", "lazy");
      frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      media.classList.add("playing");
      media.appendChild(frame);
    }

    playBtn.addEventListener("click", startStream);
    poster.addEventListener("click", startStream);

    const body = document.createElement("div");
    body.className = "cam-body";

    const flag = document.createElement("span");
    flag.className = "cam-region";
    flag.textContent = cam.country[store.lang] || cam.country.en;

    const h = document.createElement("h3");
    h.textContent = cam.name[store.lang] || cam.name.en;

    const sp = document.createElement("p");
    sp.className = "cam-species";
    sp.textContent = (cam.species[store.lang] || cam.species.en) + " · " + (cam.city[store.lang] || cam.city.en);

    const foot = document.createElement("div");
    foot.className = "cam-foot";
    const src = document.createElement("span");
    src.className = "cam-src";
    src.textContent = t("cams.provider") + ": " + cam.provider;
    const link = document.createElement("a");
    link.className = "cam-link";
    link.href = cam.official;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = t("cams.official");
    foot.appendChild(src);
    foot.appendChild(link);

    body.appendChild(flag);
    body.appendChild(h);
    body.appendChild(sp);
    body.appendChild(foot);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function renderCams() {
    const grid = document.getElementById("cam-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const list = window.ZOO_CAMS.filter(cam => {
      if (primatesOnly && !cam.primate) return false;
      if (activeGroup === "all") return true;
      return cam.group === activeGroup;
    });
    list.sort((a, b) => (b.primate - a.primate));
    if (!list.length) {
      const empty = document.createElement("p");
      empty.className = "cam-empty";
      empty.textContent = t("cams.empty");
      grid.appendChild(empty);
      return;
    }
    list.forEach((cam, i) => {
      const c = camCard(cam);
      c.style.setProperty("--i", i % 8);
      grid.appendChild(c);
    });
    revealObserve();
  }

  function buildFilters() {
    const bar = document.getElementById("cam-filters");
    if (!bar) return;
    const groups = ["all", "apes", "monkeys", "pandas", "elephants", "birds", "savanna", "other"];
    bar.innerHTML = "";
    groups.forEach(g => {
      const b = document.createElement("button");
      b.className = "chip" + (g === activeGroup ? " active" : "");
      b.setAttribute("data-i18n", "cams." + g);
      b.textContent = t("cams." + g);
      b.addEventListener("click", () => {
        activeGroup = g;
        bar.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        renderCams();
      });
      bar.appendChild(b);
    });
    const toggle = document.getElementById("primates-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        primatesOnly = toggle.checked;
        renderCams();
      });
    }
  }

  function renderSpecies() {
    const grid = document.getElementById("species-grid");
    if (!grid) return;
    const cards = [
      { k: "apes", group: "apes" },
      { k: "monkeys", group: "monkeys" },
      { k: "pandas", group: "pandas" },
      { k: "elephants", group: "elephants" }
    ];
    grid.innerHTML = "";
    cards.forEach((c, i) => {
      const count = window.ZOO_CAMS.filter(z => z.group === c.group).length;
      const el = document.createElement("button");
      el.className = "species-card";
      el.style.setProperty("--i", i);
      el.innerHTML =
        '<span class="species-count">' + count + '</span>' +
        '<h3>' + t("species." + c.k + "T") + '</h3>' +
        '<p>' + t("species." + c.k + "D") + '</p>' +
        '<span class="species-go">' + t("cams.play") + ' →</span>';
      el.addEventListener("click", () => {
        activeGroup = c.group;
        const bar = document.getElementById("cam-filters");
        if (bar) {
          bar.querySelectorAll(".chip").forEach(x => {
            x.classList.toggle("active", x.getAttribute("data-i18n") === "cams." + c.group);
          });
        }
        renderCams();
        document.getElementById("cams").scrollIntoView({ behavior: "smooth" });
      });
      grid.appendChild(el);
    });
    revealObserve();
  }

  function hookMap() {
    const stats = {};
    window.ZOO_CAMS.forEach(c => { stats[c.region] = (stats[c.region] || 0) + 1; });
    document.querySelectorAll("[data-region]").forEach(node => {
      const r = node.getAttribute("data-region");
      const badge = node.querySelector(".region-count");
      if (badge) badge.textContent = stats[r] || 0;
      node.addEventListener("mouseenter", () => node.classList.add("hot"));
      node.addEventListener("mouseleave", () => node.classList.remove("hot"));
      node.addEventListener("click", () => {
        document.getElementById("cams").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function animateCounts() {
    document.querySelectorAll("[data-count]").forEach(el => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      let cur = 0;
      const step = Math.max(1, target / 60);
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target + suffix; return; }
        el.textContent = Math.floor(cur) + suffix;
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  function fillHeroStats() {
    const total = window.ZOO_CAMS.length;
    const primates = window.ZOO_CAMS.filter(c => c.primate).length;
    const regions = new Set(window.ZOO_CAMS.map(c => c.region)).size;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.setAttribute("data-count", v); };
    set("stat-cams", total);
    set("stat-regions", regions);
    set("stat-primates", primates);
  }

  let revealIO;
  function revealObserve() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("in"));
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
    }
    document.querySelectorAll("[data-reveal]:not(.in)").forEach(el => revealIO.observe(el));
  }

  function hookNav() {
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => links.classList.toggle("open"));
      links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
    }
    const header = document.querySelector(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  function hookLang() {
    document.querySelectorAll("[data-lang-btn]").forEach(b => {
      b.addEventListener("click", () => setLang(b.getAttribute("data-lang-btn")));
    });
  }

  function hookForm() {
    const form = document.getElementById("feedback-form");
    if (!form) return;
    const fields = {
      name: form.querySelector("#fb-name"),
      email: form.querySelector("#fb-email"),
      message: form.querySelector("#fb-message")
    };
    const sent = document.getElementById("fb-success");

    function showError(input, msgKey) {
      const wrap = input.closest(".field");
      wrap.classList.add("invalid");
      const err = wrap.querySelector(".field-error");
      if (err) err.textContent = t(msgKey);
    }
    function clearError(input) {
      const wrap = input.closest(".field");
      wrap.classList.remove("invalid");
      const err = wrap.querySelector(".field-error");
      if (err) err.textContent = "";
    }
    Object.values(fields).forEach(f => f && f.addEventListener("input", () => clearError(f)));

    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!fields.name.value.trim()) { showError(fields.name, "fb.err.name"); ok = false; }
      if (!emailRe.test(fields.email.value.trim())) { showError(fields.email, "fb.err.email"); ok = false; }
      if (fields.message.value.trim().length < 10) { showError(fields.message, "fb.err.message"); ok = false; }
      if (!ok) return;
      form.reset();
      if (sent) {
        sent.textContent = t("fb.sent");
        sent.classList.add("show");
        setTimeout(() => sent.classList.remove("show"), 6000);
      }
    });
  }

  function hookYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    buildFilters();
    fillHeroStats();
    renderCams();
    renderSpecies();
    hookMap();
    hookNav();
    hookLang();
    hookForm();
    hookYear();
    animateCounts();
    revealObserve();
  });
})();
