window.SITE_CONFIG = {
  name: "PLAYZA",
  tagline: "флеш-игры в браузере",
  mark: "▚"
};

(function () {
  var cfg = window.SITE_CONFIG || {};
  var name = (cfg.name || "PLAYZA").trim();
  var tagline = (cfg.tagline || "").trim();
  var mark = (cfg.mark || "").trim() || name.charAt(0).toUpperCase();

  document.title = tagline ? name + " — " + tagline : name;
  window.SITE_CONFIG.resolved = { name: name, tagline: tagline, mark: mark };

  function apply() {
    document.querySelectorAll("[data-site-name]").forEach(function (n) { n.textContent = name; });
    document.querySelectorAll("[data-site-mark]").forEach(function (n) { n.textContent = mark; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
