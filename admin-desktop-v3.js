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
          background: #030405 !important;
          color: #f7f9fc !important;
        }

        body {
          min-height: 100vh;
          overflow-x: hidden;
        }

        #areaAdmin {
          background:
            radial-gradient(circle at 10% 0%, rgba(255,255,255,.075), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(255,255,255,.045), transparent 24%),
            linear-gradient(145deg, #020304 0%, #080a0d 52%, #030405 100%) !important;
          color: #f7f9fc !important;
          min-height: 100vh;
        }

        #areaAdmin .admin-layout {
          min-height: 100vh !important;
          background: transparent !important;
        }

        #areaAdmin .admin-sidebar,
        #areaAdmin .desktop-sidebar {
          background: linear-gradient(180deg, rgba(255,255,255,.105), rgba(255,255,255,.045)) !important;
          border-right: 1px solid rgba(255,255,255,.15) !important;
          box-shadow: 18px 0 55px rgba(0,0,0,.42), inset -1px 0 rgba(255,255,255,.045) !important;
          backdrop-filter: blur(28px) saturate(150%) !important;
          -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
        }

        #areaAdmin .admin-brand {
          color: #ffffff !important;
          text-shadow: 0 1px 18px rgba(255,255,255,.12) !important;
        }

        #areaAdmin .admin-user {
          background: rgba(255,255,255,.055) !important;
          border: 1px solid rgba(255,255,255,.11) !important;
          color: #b9c2cd !important;
          box-shadow: inset 0 1px rgba(255,255,255,.045), 0 8px 24px rgba(0,0,0,.14) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }

        #areaAdmin .admin-user strong {
          color: #ffffff !important;
        }

        #areaAdmin .admin-nav,
        #areaAdmin .desktop-nav,
        #areaAdmin .sidebar .nav {
          gap: 9px !important;
        }

        #areaAdmin .admin-nav button,
        #areaAdmin .desktop-nav button,
        #areaAdmin .sidebar .nav button {
          min-height: 46px !important;
          width: 100% !important;
          padding: 11px 15px !important;
          border: 1px solid rgba(255,255,255,.095) !important;
          border-radius: 14px !important;
          background: linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.035)) !important;
          color: #e8edf3 !important;
          box-shadow: inset 0 1px rgba(255,255,255,.055), 0 8px 22px rgba(0,0,0,.12) !important;
          backdrop-filter: blur(17px) saturate(135%) !important;
          -webkit-backdrop-filter: blur(17px) saturate(135%) !important;
          transition: background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease !important;
        }

        #areaAdmin .admin-nav button:hover,
        #areaAdmin .desktop-nav button:hover,
        #areaAdmin .sidebar .nav button:hover {
          background: linear-gradient(135deg, rgba(255,255,255,.145), rgba(255,255,255,.075)) !important;
          border-color: rgba(255,255,255,.20) !important;
          color: #ffffff !important;
          box-shadow: inset 0 1px rgba(255,255,255,.09), 0 12px 28px rgba(0,0,0,.22) !important;
          transform: translateX(3px) !important;
        }

        #areaAdmin .admin-nav button.active,
        #areaAdmin .desktop-nav button.active,
        #areaAdmin .sidebar .nav button.active {
          background: linear-gradient(135deg, rgba(255,255,255,.21), rgba(255,255,255,.095)) !important;
          border-color: rgba(255,255,255,.29) !important;
          color: #ffffff !important;
          box-shadow: inset 0 1px rgba(255,255,255,.13), 0 12px 30px rgba(0,0,0,.27) !important;
        }

        #areaAdmin .admin-sidebar-bottom {
          margin-top: auto !important;
          padding-top: 22px !important;
        }

        #areaAdmin .admin-sidebar-bottom .danger {
          background: rgba(255,82,96,.12) !important;
          border: 1px solid rgba(255,110,122,.23) !important;
          color: #ffffff !important;
        }

        #areaAdmin .admin-main {
          background: transparent !important;
          color: #f5f7fa !important;
        }

        #areaAdmin .admin-topbar,
        #areaAdmin .desktop-topbar {
          background: linear-gradient(135deg, rgba(255,255,255,.085), rgba(255,255,255,.035)) !important;
          border-bottom: 1px solid rgba(255,255,255,.12) !important;
          color: #ffffff !important;
          box-shadow: 0 10px 35px rgba(0,0,0,.20) !important;
          backdrop-filter: blur(26px) saturate(145%) !important;
          -webkit-backdrop-filter: blur(26px) saturate(145%) !important;
        }

        #areaAdmin .admin-topbar h2,
        #areaAdmin .desktop-topbar h2 {
          color: #ffffff !important;
          font-weight: 800 !important;
          letter-spacing: -.02em !important;
        }

        #areaAdmin .admin-content,
        #areaAdmin .content,
        #areaAdmin .desktop-content {
          background: transparent !important;
          color: #f2f5f8 !important;
        }

        #areaAdmin .admin-card,
        #areaAdmin .org-card,
        #areaAdmin .glass-panel {
          background: linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.038)) !important;
          border: 1px solid rgba(255,255,255,.125) !important;
          border-radius: 18px !important;
          box-shadow: 0 18px 50px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.055) !important;
          backdrop-filter: blur(20px) saturate(135%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(135%) !important;
        }

        #areaAdmin .org-page {
          background: transparent !important;
          color: #f2f5f8 !important;
        }

        #areaAdmin .org-head {
          background: linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.025)) !important;
          border: 1px solid rgba(255,255,255,.095) !important;
          border-radius: 18px !important;
          box-shadow: 0 15px 38px rgba(0,0,0,.20), inset 0 1px rgba(255,255,255,.045) !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
        }

        #areaAdmin .org-page h1,
        #areaAdmin .org-page h2,
        #areaAdmin .org-page h3,
        #areaAdmin .org-page h4,
        #areaAdmin .org-page h5,
        #areaAdmin .org-page h6,
        #areaAdmin .admin-main h1,
        #areaAdmin .admin-main h2,
        #areaAdmin .admin-main h3,
        #areaAdmin .admin-main h4,
        #areaAdmin .admin-main h5,
        #areaAdmin .admin-main h6 {
          color: #ffffff !important;
        }

        #areaAdmin .org-page p,
        #areaAdmin .admin-main p,
        #areaAdmin .admin-main label,
        #areaAdmin .admin-main span,
        #areaAdmin .admin-main strong,
        #areaAdmin .admin-main small,
        #areaAdmin .admin-main li {
          color: #d9e0e7 !important;
        }

        #areaAdmin .admin-main input,
        #areaAdmin .admin-main textarea,
        #areaAdmin .admin-main select,
        #areaAdmin .org-page input,
        #areaAdmin .org-page textarea,
        #areaAdmin .org-page select {
          background: rgba(255,255,255,.065) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,.15) !important;
          border-radius: 12px !important;
          box-shadow: inset 0 1px rgba(255,255,255,.04) !important;
        }

        #areaAdmin .admin-main input::placeholder,
        #areaAdmin .admin-main textarea::placeholder,
        #areaAdmin .org-page input::placeholder,
        #areaAdmin .org-page textarea::placeholder {
          color: #8994a0 !important;
        }

        #areaAdmin .admin-main table,
        #areaAdmin .admin-main th,
        #areaAdmin .admin-main td {
          color: #edf1f5 !important;
          border-color: rgba(255,255,255,.095) !important;
        }

        #areaAdmin .admin-main th {
          background: rgba(255,255,255,.065) !important;
        }

        #areaAdmin .admin-btn,
        #areaAdmin .btn {
          color: #ffffff !important;
        }

        #areaAdmin .hidden,
        #boxLoginAdmin.hidden {
          display: none !important;
        }

        #areaAdmin .admin-btn.primary,
        #areaAdmin .admin-btn.secondary,
        #areaAdmin .glass-action {
          border-radius: 12px !important;
          box-shadow: inset 0 1px rgba(255,255,255,.08), 0 8px 20px rgba(0,0,0,.18) !important;
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
