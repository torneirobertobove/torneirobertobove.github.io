/*
 * ADMIN DESKTOP V3
 * Compatibility layer
 *
 * Questo file gestisce esclusivamente:
 * - navigazione dei menu amministrazione
 * - apertura corretta delle pagine
 * - compatibilità tra i nomi delle pagine
 * - tema nero + menu glass
 * - fallback per Tabellone e WhatsApp
 *
 * NON carica altri file di navigazione.
 */

(function () {
  "use strict";

  const LINK_KEY = "padel_admin_generated_link";

  function getArea() {
    return document.getElementById("areaAdmin");
  }

  function getTournamentId() {
    const state = window.adminState;

    if (
      state &&
      state.torneoSelezionato !== null &&
      state.torneoSelezionato !== undefined &&
      state.torneoSelezionato !== ""
    ) {
      return state.torneoSelezionato;
    }

    if (state && Array.isArray(state.tornei) && state.tornei.length) {
      return state.tornei[0].id;
    }

    return null;
  }

  function buildLink(id) {
    if (id === null || id === undefined || id === "") return "";

    return window.location.origin +
      window.location.pathname.replace(/[^/]*$/, "") +
      "Bove.html?idTorneo=" + encodeURIComponent(String(id));
  }

  function setLink(value) {
    if (!value) return;

    ["linkBoveGenerato", "linkBoveGeneratoMirror"].forEach(function (id) {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });

    try {
      localStorage.setItem(LINK_KEY, value);
      sessionStorage.setItem(LINK_KEY, value);
    } catch (error) {}
  }

  function normalizePage(page) {
    const raw = String(page || "").toLowerCase().trim();

    const map = {
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

    return map[raw] || raw;
  }

  function findPage(area, key) {
    if (!area) return null;

    return (
      area.querySelector("#org-page-" + key) ||
      area.querySelector(".admin-page[data-page=\"" + key + "\"]") ||
      area.querySelector("#page-" + key)
    );
  }

  function ensureFallbackPage(area, key) {
    let page = findPage(area, key);

    if (page) return page;

    const content = area.querySelector(".content, .admin-content, .desktop-content");
    if (!content) return null;

    page = document.createElement("section");
    page.id = "org-page-" + key;
    page.className = "org-page org-active";
    page.dataset.page = key;

    const titles = {
      tabellone: ["Tabellone", "Visualizzazione del torneo selezionato"],
      whatsapp: ["WhatsApp", "Comunicazioni ai partecipanti"],
      links: ["Link pubblici", "Collegamenti pubblici del torneo"]
    };

    const title = titles[key] || [key, ""];

    page.innerHTML =
      '<div class="org-head">' +
        '<div><h1>' + title[0] + '</h1><p>' + title[1] + '</p></div>' +
      '</div>' +
      '<div class="org-content"></div>';

    content.appendChild(page);
    return page;
  }

  function ensureTabellonePage(area) {
    const page = ensureFallbackPage(area, "tabellone");
    if (!page) return null;

    const content = page.querySelector(".org-content") || page;

    if (!content.dataset.adminV3Ready) {
      content.dataset.adminV3Ready = "1";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-btn primary";
      button.textContent = "📋 Apri tabellone del torneo selezionato";
      button.addEventListener("click", function () {
        const id = getTournamentId();

        if (
          typeof window.apriBoveConTorneo === "function" &&
          id !== null &&
          id !== undefined &&
          id !== ""
        ) {
          window.apriBoveConTorneo(id);
          return;
        }

        if (typeof window.apriTabellone === "function") {
          window.apriTabellone(id);
          return;
        }

        alert("Seleziona prima un torneo.");
      });

      content.appendChild(button);
    }

    return page;
  }

  function ensureWhatsAppPage(area) {
    const page = ensureFallbackPage(area, "whatsapp");
    if (!page) return null;

    const content = page.querySelector(".org-content") || page;

    if (!content.dataset.adminV3Ready) {
      content.dataset.adminV3Ready = "1";

      const box = document.createElement("div");
      box.className = "admin-card glass-panel";
      box.innerHTML =
        '<h3>📲 Comunicazioni WhatsApp</h3>' +
        '<p>Scrivi il messaggio e apri WhatsApp per inviarlo.</p>' +
        '<textarea id="adminV3WhatsappMessage" rows="5" placeholder="Scrivi comunicazione..."></textarea>' +
        '<div class="admin-toolbar" style="margin-top:12px">' +
          '<button type="button" class="admin-btn primary" id="adminV3WhatsappAll">📲 Invia a tutti</button>' +
          '<button type="button" class="admin-btn secondary" id="adminV3WhatsappApproved">📲 Invia agli approvati</button>' +
        '</div>';

      content.appendChild(box);

      function send() {
        const message = document.getElementById("adminV3WhatsappMessage");
        const text = message ? message.value.trim() : "";

        if (!text) {
          alert("Scrivi prima un messaggio.");
          return;
        }

        if (typeof window.inviaWhatsAppTutti === "function") {
          const old = document.getElementById("messaggioWhatsApp");
          if (old) old.value = text;
          window.inviaWhatsAppTutti();
          return;
        }

        window.open(
          "https://api.whatsapp.com/send?text=" + encodeURIComponent(text),
          "_blank",
          "noopener"
        );
      }

      function sendApproved() {
        const message = document.getElementById("adminV3WhatsappMessage");
        const text = message ? message.value.trim() : "";

        if (!text) {
          alert("Scrivi prima un messaggio.");
          return;
        }

        if (typeof window.inviaWhatsAppApprovati === "function") {
          const old = document.getElementById("messaggioWhatsApp");
          if (old) old.value = text;
          window.inviaWhatsAppApprovati();
          return;
        }

        send();
      }

      document.getElementById("adminV3WhatsappAll").addEventListener("click", send);
      document.getElementById("adminV3WhatsappApproved").addEventListener("click", sendApproved);
    }

    return page;
  }

  function ensureLinksPage(area) {
    const page = ensureFallbackPage(area, "links");
    if (!page) return null;

    const content = page.querySelector(".org-content") || page;

    if (!content.dataset.adminV3Ready) {
      content.dataset.adminV3Ready = "1";

      const box = document.createElement("div");
      box.className = "admin-card glass-panel";
      box.innerHTML =
        '<h3>🔗 Link pubblico del torneo</h3>' +
        '<div class="link-box">' +
          '<input id="adminV3PublicLink" type="text" readonly>' +
          '<button type="button" class="admin-btn primary" id="adminV3GenerateLink">Genera</button>' +
          '<button type="button" class="admin-btn secondary" id="adminV3CopyLink">Copia</button>' +
        '</div>';

      content.appendChild(box);

      const input = document.getElementById("adminV3PublicLink");
      const existing =
        document.getElementById("linkBoveGenerato")?.value ||
        document.getElementById("linkBoveGeneratoMirror")?.value ||
        buildLink(getTournamentId());

      if (input) input.value = existing || "";

      document.getElementById("adminV3GenerateLink").addEventListener("click", function () {
        const id = getTournamentId();
        if (id === null || id === undefined || id === "") {
          alert("Seleziona prima un torneo.");
          return;
        }

        const value = buildLink(id);
        setLink(value);
        if (input) input.value = value;

        if (typeof window.generaLinkBove === "function") {
          try { window.generaLinkBove(); } catch (error) {}
        }
      });

      document.getElementById("adminV3CopyLink").addEventListener("click", async function () {
        const value = input ? input.value : "";
        if (!value) {
          alert("Genera prima il link.");
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          alert("Link copiato negli appunti!");
        } catch (error) {
          if (input) {
            input.focus();
            input.select();
          }
          alert("Il link è pronto: copialo manualmente.");
        }
      });
    }

    return page;
  }

  function refreshPage(key) {
    const names = {
      dashboard: ["renderAdmin", "caricaTorneiSupabase"],
      config: ["renderConfig", "renderConfigurazione"],
      iscritti: ["renderPartecipanti", "renderGestioneTorneo"],
      coppie: ["renderCoppie", "renderAccoppiamenti"],
      tabellone: ["renderTabellone"],
      news: ["renderNews"],
      sponsor: ["renderSponsor"]
    };

    const list = names[key] || [];

    list.some(function (name) {
      if (typeof window[name] !== "function") return false;

      try {
        window[name]();
        return true;
      } catch (error) {
        console.warn("[Padel Admin] Refresh " + key + ":", error);
        return false;
      }
    });

    if (key === "iscritti" && typeof window.caricaRichiesteIscrizione === "function") {
      try { window.caricaRichiesteIscrizione(); } catch (error) {}
    }
  }

  function openMenuPage(page) {
    const area = getArea();
    if (!area) return false;

    const key = normalizePage(page);

    if (key === "tabellone") ensureTabellonePage(area);
    if (key === "whatsapp") ensureWhatsAppPage(area);
    if (key === "links") ensureLinksPage(area);

    const target = findPage(area, key);

    area.querySelectorAll(".org-page").forEach(function (element) {
      element.classList.toggle("org-active", element === target);
    });

    area.querySelectorAll(".admin-page").forEach(function (element) {
      const same = element === target || element.id === "page-" + key;
      element.classList.toggle("active", same);
    });

    if (target) {
      target.classList.add("org-active");
    }

    area.classList.add("admin-organized");

    area.querySelectorAll(
      ".admin-nav button, .desktop-nav button, .sidebar .nav button"
    ).forEach(function (button) {
      const buttonPage = normalizePage(
        button.dataset.page ||
        button.dataset.orgPage ||
        button.dataset.internalPage
      );
      button.classList.toggle("active", buttonPage === key);
    });

    const title = document.getElementById("adminPageTitle");
    const labels = {
      dashboard: "Dashboard",
      iscritti: "Iscritti",
      coppie: "Coppie",
      tabellone: "Tabellone",
      config: "Configurazione",
      news: "News",
      sponsor: "Sponsor",
      links: "Link pubblico",
      whatsapp: "WhatsApp"
    };

    if (title && labels[key]) {
      title.textContent = labels[key];
    }

    refreshPage(key);
    return true;
  }

  function installMenuNavigation() {
    const area = getArea();
    if (!area) return;

    window.openAdminPage = function (page) {
      return openMenuPage(page);
    };
  }

  function ensureInteraction() {
    let style = document.getElementById("admin-v3-compat-style");

    if (!style) {
      style = document.createElement("style");
      style.id = "admin-v3-compat-style";
      style.textContent = `
        html,
        body {
          background: #050505 !important;
          color: #f5f5f5 !important;
        }

        #areaAdmin,
        #areaAdmin .admin-layout,
        #areaAdmin .admin-main,
        #areaAdmin .content,
        #areaAdmin .admin-content {
          background: #050505 !important;
          color: #f5f5f5 !important;
        }

        #areaAdmin .admin-sidebar,
        #areaAdmin .desktop-sidebar {
          background: rgba(255,255,255,.075) !important;
          border-right: 1px solid rgba(255,255,255,.16) !important;
          box-shadow: 10px 0 35px rgba(0,0,0,.35), inset -1px 0 rgba(255,255,255,.04) !important;
          backdrop-filter: blur(22px) saturate(135%) !important;
          -webkit-backdrop-filter: blur(22px) saturate(135%) !important;
        }

        #areaAdmin .admin-nav button,
        #areaAdmin .desktop-nav button,
        #areaAdmin .sidebar .nav button {
          background: rgba(255,255,255,.075) !important;
          color: #f4f4f4 !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          box-shadow: inset 0 1px rgba(255,255,255,.06) !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
          transition: background .18s ease, border-color .18s ease, transform .18s ease !important;
        }

        #areaAdmin .admin-nav button:hover,
        #areaAdmin .desktop-nav button:hover,
        #areaAdmin .sidebar .nav button:hover {
          background: rgba(255,255,255,.16) !important;
          color: #ffffff !important;
          border-color: rgba(255,255,255,.24) !important;
          transform: translateX(2px);
        }

        #areaAdmin .admin-nav button.active,
        #areaAdmin .desktop-nav button.active,
        #areaAdmin .sidebar .nav button.active {
          background: rgba(255,255,255,.23) !important;
          color: #ffffff !important;
          border-color: rgba(255,255,255,.34) !important;
          box-shadow: inset 0 1px rgba(255,255,255,.12), 0 8px 24px rgba(0,0,0,.20) !important;
        }

        #areaAdmin .admin-topbar,
        #areaAdmin .desktop-topbar {
          background: rgba(255,255,255,.06) !important;
          color: #ffffff !important;
          border-bottom: 1px solid rgba(255,255,255,.12) !important;
          backdrop-filter: blur(22px) saturate(135%) !important;
          -webkit-backdrop-filter: blur(22px) saturate(135%) !important;
        }

        #areaAdmin .admin-topbar h2,
        #areaAdmin .desktop-topbar h2,
        #areaAdmin .admin-main h1,
        #areaAdmin .admin-main h2,
        #areaAdmin .admin-main h3,
        #areaAdmin .admin-main h4,
        #areaAdmin .admin-main h5,
        #areaAdmin .admin-main h6,
        #areaAdmin .admin-main p,
        #areaAdmin .admin-main label,
        #areaAdmin .admin-main span,
        #areaAdmin .admin-main strong,
        #areaAdmin .admin-main small,
        #areaAdmin .admin-main li,
        #areaAdmin .org-page,
        #areaAdmin .org-page * {
          color: #f2f2f2 !important;
        }

        #areaAdmin .admin-main input,
        #areaAdmin .admin-main textarea,
        #areaAdmin .admin-main select,
        #areaAdmin .org-page input,
        #areaAdmin .org-page textarea,
        #areaAdmin .org-page select {
          background: rgba(255,255,255,.09) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,.18) !important;
        }

        #areaAdmin .admin-card,
        #areaAdmin .org-card,
        #areaAdmin .glass-panel {
          background: rgba(255,255,255,.065) !important;
          border: 1px solid rgba(255,255,255,.13) !important;
          box-shadow: 0 16px 45px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.045) !important;
          backdrop-filter: blur(18px) saturate(130%) !important;
          -webkit-backdrop-filter: blur(18px) saturate(130%) !important;
        }

        #areaAdmin .admin-main table,
        #areaAdmin .admin-main th,
        #areaAdmin .admin-main td {
          color: #f2f2f2 !important;
          border-color: rgba(255,255,255,.10) !important;
        }

        #areaAdmin .admin-main th {
          background: rgba(255,255,255,.07) !important;
        }

        #areaAdmin .admin-btn,
        #areaAdmin .btn {
          color: #ffffff !important;
        }

        #areaAdmin .hidden {
          display: none !important;
        }

        #boxLoginAdmin.hidden {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    installMenuNavigation();
  }

  function installGlobals() {
    window.__adminRefresh = function () {
      if (typeof window.caricaTorneiSupabase === "function") {
        return window.caricaTorneiSupabase();
      }
      if (typeof window.renderAdmin === "function") {
        return window.renderAdmin();
      }
      return true;
    };

    window.generaLinkBoveMirror = function () {
      const id = getTournamentId();

      if (id === null || id === undefined || id === "") {
        alert("Seleziona prima un torneo.");
        return false;
      }

      if (typeof window.generaLinkBove === "function") {
        try {
          window.generaLinkBove();
        } catch (error) {
          console.error("Generazione link:", error);
        }
      }

      setLink(buildLink(id));
      return true;
    };

    window.__adminButtonAction = function (kind) {
      const names = {
        generate: [
          "generaCoppieAdmin",
          "generaCoppie",
          "generaCoppieAutomatiche",
          "generaSfide"
        ],
        random: [
          "accoppiaACaso",
          "accoppiaCasualmente",
          "generaCoppieCasuali",
          "creaCoppieCasuali"
        ]
      };

      const list = names[kind] || [];

      for (let i = 0; i < list.length; i++) {
        const fn = window[list[i]];
        if (typeof fn === "function") return fn();
      }

      return openMenuPage("coppie");
    };
  }

  function initialize() {
    ensureInteraction();
    installGlobals();

    const id = getTournamentId();

    if (id !== null && id !== undefined && id !== "") {
      let savedLink = "";

      try {
        savedLink =
          sessionStorage.getItem(LINK_KEY) ||
          localStorage.getItem(LINK_KEY) ||
          "";
      } catch (error) {
        savedLink = "";
      }

      setLink(savedLink || buildLink(id));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
