/* Чтобы переименовать сайт — измените значения ниже. Остальной код менять не нужно. */
window.SITE_CONFIG = {
  name: "LevelUp Hub",
  tagline: "игры, рейтинги и скидки",
  mark: ""
};

(function applySiteConfig() {
  var cfg = window.SITE_CONFIG || {};
  var name = (cfg.name || "LevelUp Hub").trim();
  var tagline = (cfg.tagline || "").trim();

  var mark = (cfg.mark || "").trim();
  if (!mark) {
    mark = name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  document.title = tagline ? name + " — " + tagline : name;
  window.SITE_CONFIG.resolved = { name: name, tagline: tagline, mark: mark };

  function apply() {
    document.querySelectorAll("[data-site-name]").forEach(function (el) { el.textContent = name; });
    document.querySelectorAll("[data-site-mark]").forEach(function (el) { el.textContent = mark; });
    var brand = document.querySelector(".brand");
    if (brand) { brand.setAttribute("aria-label", name); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
