/*
 * ADMIN DESKTOP V3
 * Navigazione + layout dark glass per area amministrazione.
 */
(function () {
  "use strict";

  const LINK_KEY = "padel_admin_generated_link";
  let observer = null;
  let initialized = false;

  const PAGE_MAP = {
    dashboard: "dashboard",
    home: "dashboard",
    tornei: "dashboard",
    configurazione: "config",
    configurazione_torneo: "config",
    config: "config",
    iscritti: "iscritti",
    iscrizioni: "iscritti",
    coppie: "coppie",
    accoppiamenti: "coppie",
    tabellone: "tabellone",
    news: "news",
    sponsor: "sponsor",
    whatsapp: "whatsapp",
    link: "links",
    links: "links",
    "link pubblico": "links",
    "link pubblici": "links"
  };

  const LABELS = {
    dashboard: "Dashboard",
    config: "Configurazione",
    iscritti: "Iscritti",
    coppie: "Coppie",
    tabellone: "Tabellone",
    news: "News",
    sponsor: "Sponsor",
    whatsapp: "WhatsApp",
    links: "Link pubblico"
  };

  function area() {
    return document.getElementById("areaAdmin");
  }

  function normalize(page) {
    const raw = String(page || "").toLowerCase().trim();
    return PAGE_MAP[raw] || raw;
  }

  function tournamentId() {
    const state = window.adminState;
    if (state && state.torneoSelezionato !== null && state.torneoSelezionato !== undefined && state.torneoSelezionato !== "") {
      return state.torneoSelezionato;
    }
    if (typeof window.getTorneoAdminCorrente === "function") {
      try {
        const current = window.getTorneoAdminCorrente();
        if (current && current.id !== undefined && current.id !== null && current.id !== "") return current.id;
      } catch (error) {}
    }
    if (state && Array.isArray(state.tornei) && state.tornei.length) return state.tornei[0].id;
    return null;
  }

  function publicLink(id) {
    if (id === null || id === undefined || id === "") return "";
    return window.location.origin +
      window.location.pathname.replace(/[^/]*$/, "") +
      "Bove.html?idTorneo=" + encodeURIComponent(String(id));
  }

  function saveLink(value) {
    if (!value) return;
    ["linkBoveGenerato", "linkBoveGeneratoMirror", "adminV3PublicLink"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el && "value" in el) el.value = value;
    });
    try {
      localStorage.setItem(LINK_KEY, value);
      sessionStorage.setItem(LINK_KEY, value);
    } catch (error) {}
  }

  function findPage(root, key) {
    if (!root) return null;
    return root.querySelector("#org-page-" + key) ||
      root.querySelector('.org-page[data-page="' + key + '"]') ||
      root.querySelector('.admin-page[data-page="' + key + '"]') ||
      root.querySelector("#page-" + key);
  }

  function contentHost(root) {
    return root.querySelector(".content, .admin-content, .desktop-content");
  }

  function createPage(root, key, title, subtitle) {
    let page = findPage(root, key);
    if (page) return page;
    const host = contentHost(root);
    if (!host) return null;

    page = document.createElement("section");
    page.id = "org-page-" + key;
    page.dataset.page = key;
    page.className = "org-page";
    page.innerHTML =
      '<div class="org-head">' +
        '<div><h1>' + title + '</h1><p>' + subtitle + '</p></div>' +
      '</div>' +
      '<div class="org-content"></div>';
    host.appendChild(page);
    return page;
  }

  function ensureCustomPages(root) {
    const tab = findPage(root, "tabellone") || createPage(root, "tabellone", "Tabellone", "Visualizzazione del torneo selezionato");
    if (tab && !tab.dataset.adminV3Built) {
      tab.dataset.adminV3Built = "1";
      const body = tab.querySelector(".org-content") || tab;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-btn primary glass-action";
      button.textContent = "📋 Apri tabellone del torneo";
      button.addEventListener("click", function () {
        const id = tournamentId();
        if (typeof window.apriBoveConTorneo === "function" && id !== null && id !== undefined && id !== "") {
          window.apriBoveConTorneo(id);
          return;
        }
        if (typeof window.apriTabellone === "function") {
          window.apriTabellone(id);
          return;
        }
        alert("Seleziona prima un torneo.");
      });
      body.appendChild(button);
    }

    const wa = findPage(root, "whatsapp") || createPage(root, "whatsapp", "WhatsApp", "Comunicazioni ai partecipanti");
    if (wa && !wa.dataset.adminV3Built) {
      wa.dataset.adminV3Built = "1";
      const body = wa.querySelector(".org-content") || wa;
      const card = document.createElement("div");
      card.className = "admin-card glass-panel";
      card.innerHTML =
        '<h3>📲 Comunicazioni WhatsApp</h3>' +
        '<p>Prepara il messaggio e apri WhatsApp.</p>' +
        '<textarea id="adminV3WhatsappMessage" rows="6" placeholder="Scrivi la comunicazione..."></textarea>' +
        '<div class="admin-toolbar glass-actions">' +
          '<button type="button" class="admin-btn primary glass-action" id="adminV3WhatsappAll">Invia a tutti</button>' +
          '<button type="button" class="admin-btn secondary glass-action" id="adminV3WhatsappApproved">Invia agli approvati</button>' +
        '</div>';
      body.appendChild(card);

      function message() {
        const el = document.getElementById("adminV3WhatsappMessage");
        return el ? el.value.trim() : "";
      }

      function sendAll() {
        const text = message();
        if (!text) return alert("Scrivi prima un messaggio.");
        if (typeof window.inviaWhatsAppTutti === "function") {
          const old = document.getElementById("messaggioWhatsApp");
          if (old) old.value = text;
          window.inviaWhatsAppTutti();
          return;
        }
        window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank", "noopener");
      }

      function sendApproved() {
        const text = message();
        if (!text) return alert("Scrivi prima un messaggio.");
        if (typeof window.inviaWhatsAppApprovati === "function") {
          const old = document.getElementById("messaggioWhatsApp");
          if (old) old.value = text;
          window.inviaWhatsAppApprovati();
          return;
        }
        sendAll();
      }

      document.getElementById("adminV3WhatsappAll").addEventListener("click", sendAll);
      document.getElementById("adminV3WhatsappApproved").addEventListener("click", sendApproved);
    }

    const links = findPage(root, "links") || createPage(root, "links", "Link pubblici", "Collegamenti pubblici del torneo");
    if (links && !links.dataset.adminV3Built) {
      links.dataset.adminV3Built = "1";
      const body = links.querySelector(".org-content") || links;
      const card = document.createElement("div");
      card.className = "admin-card glass-panel";
      card.innerHTML =
        '<h3>🔗 Link pubblico del torneo</h3>' +
        '<div class="link-box glass-link-box">' +
          '<input id="adminV3PublicLink" type="text" readonly placeholder="Genera il link...">' +
          '<button type="button" class="admin-btn primary glass-action" id="adminV3GenerateLink">Genera</button>' +
          '<button type="button" class="admin-btn secondary glass-action" id="adminV3CopyLink">Copia</button>' +
        '</div>';
      body.appendChild(card);

      const input = document.getElementById("adminV3PublicLink");
      const old = document.getElementById("linkBoveGenerato");
      if (input) input.value = (old && old.value) || publicLink(tournamentId()) || "";

      document.getElementById("adminV3GenerateLink").addEventListener("click", function () {
        const id = tournamentId();
        if (id === null || id === undefined || id === "") return alert("Seleziona prima un torneo.");
        const value = publicLink(id);
        saveLink(value);
        if (input) input.value = value;
        if (typeof window.generaLinkBove === "function") {
          try { window.generaLinkBove(); } catch (error) {}
        }
      });

      document.getElementById("adminV3CopyLink").addEventListener("click", async function () {
        const value = input ? input.value : "";
        if (!value) return alert("Genera prima il link.");
        try {
          await navigator.clipboard.writeText(value);
          alert("Link copiato negli appunti!");
        } catch (error) {
          if (input) { input.focus(); input.select(); }
          alert("Il link è pronto: copialo manualmente.");
        }
      });
    }
  }

  function activate(root, requested) {
    const key = normalize(requested);
    if (!key) return false;

    if (key === "tabellone" || key === "whatsapp" || key === "links") ensureCustomPages(root);

    const target = findPage(root, key);
    const pages = root.querySelectorAll(".org-page, .admin-page");
    pages.forEach(function (page) {
      const isTarget = page === target || page.id === "page-" + key || page.dataset.page === key;
      if (page.classList.contains("org-page")) page.classList.toggle("org-active", isTarget);
      if (page.classList.contains("admin-page")) page.classList.toggle("active", isTarget);
    });

    root.querySelectorAll(".admin-nav button, .desktop-nav button, .sidebar .nav button").forEach(function (button) {
      const buttonKey = normalize(button.dataset.page || button.dataset.orgPage || button.dataset.internalPage || button.getAttribute("data-page"));
      button.classList.toggle("active", buttonKey === key);
      button.setAttribute("aria-current", buttonKey === key ? "page" : "false");
    });

    root.classList.add("admin-v3-ready");
    const title = document.getElementById("adminPageTitle");
    if (title && LABELS[key]) title.textContent = LABELS[key];
    return !!target;
  }

  function openPage(page) {
    const root = area();
    if (!root) return false;
    return activate(root, page);
  }

  function installNavigation(root) {
    window.openAdminPage = openPage;

    if (root.dataset.adminV3NavInstalled === "1") return;
    root.dataset.adminV3NavInstalled = "1";

    root.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-page], button[data-org-page], button[data-internal-page]");
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute("onclick")) return;
      const key = button.dataset.page || button.dataset.orgPage || button.dataset.internalPage;
      if (!key) return;
      event.preventDefault();
      openPage(key);
    });
  }

  function installStyle() {
    if (document.getElementById("admin-v3-compat-style")) return;
    const style = document.createElement("style");
    style.id = "admin-v3-compat-style";
    style.textContent = `
      html,body{background:#050608!important;color:#f4f7fb!important}
      body{min-height:100vh}
      #areaAdmin{background:#050608!important;color:#f4f7fb!important}
      #areaAdmin .admin-layout{min-height:100vh;background:radial-gradient(circle at 15% 0%,rgba(255,255,255,.055),transparent 34%),radial-gradient(circle at 100% 15%,rgba(255,255,255,.035),transparent 30%),#050608!important}
      #areaAdmin .admin-sidebar,#areaAdmin .desktop-sidebar{background:rgba(255,255,255,.065)!important;border-right:1px solid rgba(255,255,255,.13)!important;box-shadow:14px 0 45px rgba(0,0,0,.42),inset -1px 0 rgba(255,255,255,.04)!important;backdrop-filter:blur(26px) saturate(145%)!important;-webkit-backdrop-filter:blur(26px) saturate(145%)!important}
      #areaAdmin .admin-brand{color:#fff!important;letter-spacing:.2px}
      #areaAdmin .admin-user{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.09)!important;color:#b9c2cc!important;box-shadow:inset 0 1px rgba(255,255,255,.04)!important}
      #areaAdmin .admin-user strong{color:#fff!important}
      #areaAdmin .admin-nav{gap:8px!important}
      #areaAdmin .admin-nav button,#areaAdmin .desktop-nav button,#areaAdmin .sidebar .nav button{min-height:44px!important;width:100%!important;padding:11px 14px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:13px!important;background:rgba(255,255,255,.055)!important;color:#e9eef4!important;box-shadow:inset 0 1px rgba(255,255,255,.055),0 7px 18px rgba(0,0,0,.10)!important;backdrop-filter:blur(15px)!important;-webkit-backdrop-filter:blur(15px)!important;transition:all .18s ease!important}
      #areaAdmin .admin-nav button:hover,#areaAdmin .desktop-nav button:hover,#areaAdmin .sidebar .nav button:hover{background:rgba(255,255,255,.115)!important;border-color:rgba(255,255,255,.19)!important;color:#fff!important;transform:translateX(3px)!important}
      #areaAdmin .admin-nav button.active,#areaAdmin .desktop-nav button.active,#areaAdmin .sidebar .nav button.active{background:rgba(255,255,255,.18)!important;border-color:rgba(255,255,255,.28)!important;color:#fff!important;box-shadow:inset 0 1px rgba(255,255,255,.12),0 10px 28px rgba(0,0,0,.25)!important}
      #areaAdmin .admin-sidebar-bottom{margin-top:auto!important;padding-top:22px!important}
      #areaAdmin .admin-sidebar-bottom .danger{background:rgba(255,80,95,.13)!important;border:1px solid rgba(255,100,115,.22)!important;color:#fff!important}
      #areaAdmin .admin-topbar,#areaAdmin .desktop-topbar{background:rgba(255,255,255,.055)!important;border-bottom:1px solid rgba(255,255,255,.11)!important;color:#fff!important;backdrop-filter:blur(24px) saturate(140%)!important;-webkit-backdrop-filter:blur(24px) saturate(140%)!important}
      #areaAdmin .admin-topbar h2,#areaAdmin .desktop-topbar h2{color:#fff!important;font-weight:800!important}
      #areaAdmin .admin-content,#areaAdmin .content,#areaAdmin .desktop-content{background:transparent!important;color:#f2f5f8!important}
      #areaAdmin .admin-card,#areaAdmin .org-card,#areaAdmin .glass-panel,#areaAdmin .stat-card,#areaAdmin .pair-card,#areaAdmin .match-card,#areaAdmin .admin-list-item{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.10)!important;color:#eef2f6!important;box-shadow:0 18px 50px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.045)!important;backdrop-filter:blur(18px) saturate(135%)!important;-webkit-backdrop-filter:blur(18px) saturate(135%)!important}
      #areaAdmin .org-head{background:rgba(255,255,255,.065)!important;border:1px solid rgba(255,255,255,.11)!important;color:#fff!important;box-shadow:0 18px 48px rgba(0,0,0,.22),inset 0 1px rgba(255,255,255,.05)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}
      #areaAdmin .org-head h1,#areaAdmin .org-head p,#areaAdmin .admin-main h1,#areaAdmin .admin-main h2,#areaAdmin .admin-main h3,#areaAdmin .admin-main h4,#areaAdmin .admin-main h5,#areaAdmin .admin-main h6,#areaAdmin .admin-main p,#areaAdmin .admin-main label,#areaAdmin .admin-main span,#areaAdmin .admin-main strong,#areaAdmin .admin-main small,#areaAdmin .admin-main li{color:#f3f6fa!important}
      #areaAdmin input,#areaAdmin textarea,#areaAdmin select{background:rgba(0,0,0,.28)!important;color:#fff!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:11px!important;outline:none!important}
      #areaAdmin input::placeholder,#areaAdmin textarea::placeholder{color:#89939e!important}
      #areaAdmin input:focus,#areaAdmin textarea:focus,#areaAdmin select:focus{border-color:rgba(255,255,255,.34)!important;box-shadow:0 0 0 3px rgba(255,255,255,.055)!important}
      #areaAdmin table,#areaAdmin th,#areaAdmin td{color:#edf1f5!important;border-color:rgba(255,255,255,.09)!important}
      #areaAdmin th{background:rgba(255,255,255,.06)!important}
      #areaAdmin .admin-btn,#areaAdmin .btn{color:#fff!important}
      #areaAdmin .admin-btn.primary,#areaAdmin .btn.primary{background:rgba(255,255,255,.16)!important;border:1px solid rgba(255,255,255,.22)!important;box-shadow:inset 0 1px rgba(255,255,255,.09),0 8px 24px rgba(0,0,0,.18)!important}
      #areaAdmin .admin-btn.secondary,#areaAdmin .btn.secondary{background:rgba(255,255,255,.075)!important;border:1px solid rgba(255,255,255,.13)!important}
      #areaAdmin .glass-action:hover{background:rgba(255,255,255,.23)!important;transform:translateY(-1px)!important}
      #areaAdmin .glass-link-box{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
      #areaAdmin .glass-link-box input{flex:1;min-width:220px}
      #areaAdmin .org-page{max-width:1400px;margin:0 auto}
      #areaAdmin .org-page.org-active{animation:adminV3In .18s ease-out}
      @keyframes adminV3In{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}
      @media(max-width:760px){#areaAdmin .glass-link-box{flex-direction:column;align-items:stretch}#areaAdmin .glass-link-box input{min-width:0;width:100%}}
    `;
    document.head.appendChild(style);
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    const root = area();
    if (!root) return;

    installStyle();
    installNavigation(root);
    ensureCustomPages(root);

    if (!root.dataset.adminV3Observer) {
      root.dataset.adminV3Observer = "1";
      observer = new MutationObserver(function () {
        installNavigation(root);
        ensureCustomPages(root);
        const active = root.querySelector(".admin-nav button.active, .desktop-nav button.active");
        if (active) activate(root, active.dataset.page || active.dataset.orgPage || active.dataset.internalPage);
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    const id = tournamentId();
    if (id !== null && id !== undefined && id !== "") {
      let saved = "";
      try { saved = sessionStorage.getItem(LINK_KEY) || localStorage.getItem(LINK_KEY) || ""; } catch (error) {}
      saveLink(saved || publicLink(id));
    }

    activate(root, "dashboard");
  }

  window.openAdminPage = openPage;
  window.generaLinkBoveMirror = function () {
    const id = tournamentId();
    if (id === null || id === undefined || id === "") {
      alert("Seleziona prima un torneo.");
      return false;
    }
    if (typeof window.generaLinkBove === "function") {
      try { window.generaLinkBove(); } catch (error) {}
    }
    saveLink(publicLink(id));
    return true;
  };

  window.__adminRefresh = function () {
    if (typeof window.caricaTorneiSupabase === "function") return window.caricaTorneiSupabase();
    if (typeof window.renderAdmin === "function") return window.renderAdmin();
    return true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
