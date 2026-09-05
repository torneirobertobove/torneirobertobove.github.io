/*
 * ADMIN DESKTOP V3
 * Compatibility layer
 *
 * IMPORTANTE:
 * Questo file NON deve più caricare:
 * - admin-desktop-v4.js
 * - admin-legacy-navigation.js
 * - admin-final-click-fix-v1.js
 *
 * La navigazione viene gestita direttamente da admin.html.
 * La logica viene gestita da admin-master.js.
 */

(function () {
  "use strict";

  const LINK_KEY = "padel_admin_generated_link";

  function getArea() {
    return document.getElementById("areaAdmin");
  }

  function getTournamentId() {
    const state = window.adminState;

    if (state && state.torneoSelezionato !== null && state.torneoSelezionato !== undefined && state.torneoSelezionato !== "") {
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
      configurazione: "config",
      config: "config",
      link: "links",
      links: "links",
      dashboard: "dashboard",
      iscritti: "iscritti",
      coppie: "coppie",
      tabellone: "tabellone",
      news: "news",
      sponsor: "sponsor",
      whatsapp: "whatsapp"
    };
    return map[raw] || raw;
  }

  function openMenuPage(page) {
    const area = getArea();
    if (!area) return false;

    const key = normalizePage(page);
    const orgPage = area.querySelector('#org-page-' + key);
    const adminPage = area.querySelector('.admin-page[data-page="' + key + '"]');

    area.querySelectorAll('.org-page').forEach(function (element) {
      element.classList.toggle('org-active', element === orgPage);
    });

    area.querySelectorAll('.admin-page').forEach(function (element) {
      const same = element === adminPage || element.id === 'page-' + key;
      element.classList.toggle('active', same);
    });

    area.classList.add('admin-organized');

    area.querySelectorAll('.admin-nav button, .desktop-nav button, .sidebar .nav button').forEach(function (button) {
      const buttonPage = normalizePage(
        button.dataset.page || button.dataset.orgPage || button.dataset.internalPage
      );
      button.classList.toggle('active', buttonPage === key);
    });

    const title = document.getElementById('adminPageTitle');
    const labels = {
      dashboard: 'Dashboard',
      iscritti: 'Iscritti',
      coppie: 'Coppie',
      tabellone: 'Tabellone',
      config: 'Configurazione',
      news: 'News',
      sponsor: 'Sponsor',
      links: 'Link pubblici',
      whatsapp: 'WhatsApp'
    };
    if (title && labels[key]) title.textContent = labels[key];

    if (key === 'iscritti' && typeof window.caricaRichiesteIscrizione === 'function') {
      try { window.caricaRichiesteIscrizione(); } catch (error) {}
    }

    return true;
  }

  function installMenuNavigation() {
    const area = getArea();
    if (!area || area.dataset.adminV3MenuReady === '1') return;

    area.dataset.adminV3MenuReady = '1';

    area.addEventListener('click', function (event) {
      const button = event.target.closest('.admin-nav button, .desktop-nav button, .sidebar .nav button');
      if (!button || !area.contains(button)) return;

      const page = button.dataset.page || button.dataset.orgPage || button.dataset.internalPage || '';
      if (!page) return;

      event.preventDefault();
      event.stopPropagation();
      openMenuPage(page);
    }, true);

    window.openAdminPage = function (page) {
      return openMenuPage(page);
    };
  }

  function ensureInteraction() {
    if (document.getElementById("admin-v3-compat-style")) {
      installMenuNavigation();
      return;
    }

    const style = document.createElement("style");
    style.id = "admin-v3-compat-style";
    style.textContent = `
      #boxLoginAdmin.hidden { display:none !important; }
      #areaAdmin.hidden { display:none !important; }
      #areaAdmin:not(.hidden) { pointer-events:auto !important; }
      #areaAdmin button,#areaAdmin a,#areaAdmin input,#areaAdmin select,#areaAdmin textarea,#areaAdmin summary { pointer-events:auto !important; }

      /* Menu: testo leggibile */
      #areaAdmin .admin-nav button,
      #areaAdmin .desktop-nav button,
      #areaAdmin .sidebar .nav button { color:#111 !important; }
      #areaAdmin .admin-nav button:hover,
      #areaAdmin .desktop-nav button:hover,
      #areaAdmin .sidebar .nav button:hover,
      #areaAdmin .admin-nav button.active,
      #areaAdmin .desktop-nav button.active,
      #areaAdmin .sidebar .nav button.active { color:#000 !important; }

      /* Configurazione */
      #areaAdmin .admin-nav button[data-page="configurazione"] { background:#fff !important; color:#000 !important; border-color:rgba(255,255,255,.45) !important; }
      #areaAdmin .admin-nav button[data-page="configurazione"]:hover,
      #areaAdmin .admin-nav button[data-page="configurazione"].active { background:#fff !important; color:#000 !important; border-color:rgba(255,255,255,.70) !important; }

      /* Contenuti */
      #areaAdmin .admin-main,
      #areaAdmin .admin-main h1,#areaAdmin .admin-main h2,#areaAdmin .admin-main h3,#areaAdmin .admin-main h4,#areaAdmin .admin-main h5,#areaAdmin .admin-main h6,
      #areaAdmin .admin-main p,#areaAdmin .admin-main label,#areaAdmin .admin-main span,#areaAdmin .admin-main div,#areaAdmin .admin-main strong,#areaAdmin .admin-main small,
      #areaAdmin .admin-main td,#areaAdmin .admin-main th,#areaAdmin .admin-main li { color:#111 !important; }
      #areaAdmin .admin-main input,#areaAdmin .admin-main textarea,#areaAdmin .admin-main select { color:#111 !important; background:#fff !important; }
      #areaAdmin .admin-main button { color:#111 !important; }
      #areaAdmin .admin-main button.admin-btn,#areaAdmin .admin-main button[class*="primary"],#areaAdmin .admin-main button[class*="success"],#areaAdmin .admin-main button[class*="danger"],#areaAdmin .admin-main button[class*="warning"] { color:#fff !important; }
    `;
    document.head.appendChild(style);
    installMenuNavigation();
  }

  function installGlobals() {
    window.__adminRefresh = function () {
      if (typeof window.caricaTorneiSupabase === "function") return window.caricaTorneiSupabase();
      if (typeof window.renderAdmin === "function") return window.renderAdmin();
      return true;
    };

    window.generaLinkBoveMirror = function () {
      const id = getTournamentId();
      if (id === null || id === undefined || id === "") {
        alert("Seleziona prima un torneo.");
        return false;
      }
      if (typeof window.generaLinkBove === "function") {
        try { window.generaLinkBove(); } catch (error) { console.error("Generazione link:", error); }
      }
      setLink(buildLink(id));
      return true;
    };

    window.__adminButtonAction = function (kind) {
      const names = {
        generate: ["generaCoppieAdmin","generaCoppie","generaCoppieAutomatiche","generaSfide"],
        random: ["accoppiaACaso","accoppiaCasualmente","generaCoppieCasuali","creaCoppieCasuali"]
      };
      const list = names[kind] || [];
      for (let i = 0; i < list.length; i++) {
        const fn = window[list[i]];
        if (typeof fn === "function") return fn();
      }
      if (typeof window.openAdminPage === "function") return window.openAdminPage("coppie");
      return true;
    };
  }

  function initialize() {
    ensureInteraction();
    installGlobals();

    const id = getTournamentId();
    if (id !== null && id !== undefined && id !== "") {
      let savedLink = "";
      try {
        savedLink = sessionStorage.getItem(LINK_KEY) || localStorage.getItem(LINK_KEY) || "";
      } catch (error) { savedLink = ""; }
      setLink(savedLink || buildLink(id));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once:true });
  } else {
    initialize();
  }
})();

/*
 * FINE FILE: admin-desktop-v3.js
 *
 * Nessun caricamento di:
 * - admin-test.js
 * - admin-desktop-v4.js
 * - admin-legacy-navigation.js
 * - admin-final-click-fix-v1.js
 */
