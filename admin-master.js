(function () {
  "use strict";

  const VERSION = "23";

  const SUPABASE_URL = "https://iybjvtmfaupgthqqsngd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl";

  console.log("[Padel Admin] admin-master.js v23 avvio...");

  window.__ADMIN_MASTER_VERSION = VERSION;

  const defaultState = {
    tornei: [],
    torneoSelezionato: null,
    iscrizioni: [],
    partecipanti: [],
    coppie: [],
    tabellone: [],
    news: [],
    sponsor: [],
    loading: false,
    initialized: false
  };

  if (!window.adminState || typeof window.adminState !== "object") {
    window.adminState = {};
  }

  Object.keys(defaultState).forEach(function (key) {
    if (!(key in window.adminState)) {
      window.adminState[key] = defaultState[key];
    }
  });

  const adminState = window.adminState;

  let supabaseClient = null;
  let authSubscription = null;
  let refreshTimer = null;

  function log() {
    try {
      console.log.apply(console, arguments);
    } catch (_) {}
  }

  function warn() {
    try {
      console.warn.apply(console, arguments);
    } catch (_) {}
  }

  function errorLog() {
    try {
      console.error.apply(console, arguments);
    } catch (_) {}
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function formatDate(value) {
    if (!value) return "—";

    try {
      const date = new Date(value + (String(value).length === 10 ? "T00:00:00" : ""));

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (_) {
      return String(value);
    }
  }

  function formatDateTime(value) {
    if (!value) return "—";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return String(value);
    }
  }

  function showNotice(message, type) {
    const text = String(message || "");
    const kind = type || "info";

    let box = byId("adminNotice");

    if (!box) {
      box = document.createElement("div");
      box.id = "adminNotice";
      box.style.position = "fixed";
      box.style.right = "20px";
      box.style.bottom = "20px";
      box.style.zIndex = "99999";
      box.style.maxWidth = "420px";
      box.style.padding = "14px 18px";
      box.style.borderRadius = "10px";
      box.style.background = "#222";
      box.style.color = "#fff";
      box.style.boxShadow = "0 8px 30px rgba(0,0,0,.25)";
      box.style.fontFamily = "Arial,sans-serif";
      document.body.appendChild(box);
    }

    box.textContent = text;

    if (kind === "error") {
      box.style.background = "#b42318";
    } else if (kind === "success") {
      box.style.background = "#087443";
    } else if (kind === "warning") {
      box.style.background = "#9a6700";
    } else {
      box.style.background = "#222";
    }

    box.style.display = "block";

    clearTimeout(box.__timer);

    box.__timer = setTimeout(function () {
      box.style.display = "none";
    }, 3500);
  }

  function getSupabaseClient() {
    if (supabaseClient) {
      return supabaseClient;
    }

    if (
      window.supabaseClient &&
      typeof window.supabaseClient.from === "function"
    ) {
      supabaseClient = window.supabaseClient;
    }

    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === "function") {
      try {
        supabaseClient = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );
      } catch (err) {
        errorLog("[Padel Admin] Errore creazione Supabase:", err);
        return null;
      }
    }

    if (supabaseClient) {
      window._supabase = supabaseClient;
      window.sb = supabaseClient;
      window.supabaseClient = supabaseClient;
    }

    return supabaseClient;
  }

  function waitForSupabase(timeout) {
    timeout = timeout || 10000;

    return new Promise(function (resolve, reject) {
      const start = Date.now();

      function check() {
        const client = getSupabaseClient();

        if (client) {
          resolve(client);
          return;
        }

        if (Date.now() - start >= timeout) {
          reject(new Error("Supabase non disponibile"));
          return;
        }

        setTimeout(check, 100);
      }

      check();
    });
  }

  function getCurrentSession() {
    const client = getSupabaseClient();

    if (!client || !client.auth) {
      return Promise.resolve(null);
    }

    return client.auth.getSession()
      .then(function (result) {
        if (result && result.data) {
          return result.data.session || null;
        }

        return null;
      })
      .catch(function (err) {
        errorLog("[Padel Admin] getSession:", err);
        return null;
      });
  }

  function setLoginState(session) {
    const loginBox = byId("boxLoginAdmin");
    const areaAdmin = byId("areaAdmin");
    const emailDisplay = byId("adminEmailDisplay");

    if (loginBox) {
      loginBox.style.display = session ? "none" : "flex";
    }

    if (areaAdmin) {
      areaAdmin.style.display = session ? "block" : "none";
    }

    if (emailDisplay) {
      emailDisplay.textContent =
        session && session.user
          ? session.user.email || "—"
          : "—";
    }
  }

  function getSelectedTournament() {
    if (adminState.torneoSelezionato) {
      return adminState.torneoSelezionato;
    }

    if (adminState.tornei && adminState.tornei.length) {
      adminState.torneoSelezionato = adminState.tornei[0];
      return adminState.tornei[0];
    }

    return null;
  }

  function getSelectedTournamentId() {
    const torneo = getSelectedTournament();

    if (!torneo) {
      return null;
    }

    return torneo.id;
  }

  function normalizeTournamentConfig(torneo) {
    let config = torneo && torneo.configurazione;

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      config = {};
    }

    if (!Array.isArray(config.coppie)) {
      config.coppie = [];
    }

    if (!Array.isArray(config.tabellone)) {
      config.tabellone = [];
    }

    return config;
  }

  function participantName(person) {
    if (!person) {
      return "Giocatore";
    }

    if (person.nome_giocatore) {
      return String(person.nome_giocatore).trim();
    }

    const fullName = [
      person.nome,
      person.cognome
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }

    if (person.alias) {
      return String(person.alias).trim();
    }

    if (person.email) {
      return String(person.email).trim();
    }

    return "Giocatore";
  }

  function participantPhone(person) {
    if (!person) return "";

    return String(
      person.telefono ||
      person.phone ||
      ""
    ).trim();
  }

  function isApprovedRegistration(row) {
    if (!row) return false;

    return (
      row.approvato === true ||
      String(row.stato || "").toLowerCase() === "approvata"
    );
  }

  function sortTournaments(list) {
    return list.slice().sort(function (a, b) {
      const da = a && (a.data_torneo || a.data);
      const db = b && (b.data_torneo || b.data);

      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      return String(da).localeCompare(String(db));
    });
  }

  function updateDashboardStats() {
    const tournaments = adminState.tornei || [];
    const registrations = adminState.iscrizioni || [];
    const pairs = adminState.coppie || [];

    const statTornei = byId("statTornei");
    const statIscritti = byId("statIscritti");
    const statCoppie = byId("statCoppie");
    const statStato = byId("statStato");

    if (statTornei) {
      statTornei.textContent = String(tournaments.length);
    }

    if (statIscritti) {
      statIscritti.textContent = String(
        registrations.filter(isApprovedRegistration).length
      );
    }

    if (statCoppie) {
      statCoppie.textContent = String(pairs.length);
    }

    if (statStato) {
      const selected = getSelectedTournament();

      if (!selected) {
        statStato.textContent = "Nessun torneo";
      } else if (selected.iscrizioni_chiuse) {
        statStato.textContent = "Iscrizioni chiuse";
      } else if (selected.pubblicato) {
        statStato.textContent = "Pubblicato";
      } else {
        statStato.textContent = "Bozza";
      }
    }

    const legacyMap = {
      totTornei: tournaments.length,
      totIscritti: registrations.filter(isApprovedRegistration).length,
      totCoppie: pairs.length,
      totPartite: (adminState.tabellone || []).length
    };

    Object.keys(legacyMap).forEach(function (id) {
      const element = byId(id);

      if (element) {
        element.textContent = String(legacyMap[id]);
      }
    });
  }

  function renderTorneiAdmin() {
    const container = byId("listaTorneiAdmin");

    if (!container) {
      return;
    }

    const tournaments = adminState.tornei || [];

    if (!tournaments.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessun torneo presente.</div>';
      return;
    }

    container.innerHTML = tournaments.map(function (torneo) {
      const selected =
        adminState.torneoSelezionato &&
        String(adminState.torneoSelezionato.id) === String(torneo.id);

      const name = escapeHtml(torneo.nome || "Torneo senza nome");
      const date = formatDate(torneo.data_torneo || torneo.data);
      const time = torneo.ora_inizio
        ? escapeHtml(String(torneo.ora_inizio).slice(0, 5))
        : "";

      const state = torneo.iscrizioni_chiuse
        ? "Chiuso"
        : torneo.pubblicato
          ? "Pubblicato"
          : "Bozza";

      return `
        <div class="admin-torneo-card ${selected ? "selected" : ""}"
             data-torneo-id="${escapeAttr(torneo.id)}"
             style="border:1px solid #ddd;border-radius:12px;padding:16px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <h3 style="margin:0 0 6px;">${name}</h3>
              <div>${escapeHtml(date)}${time ? " · " + time : ""}</div>
              <div style="margin-top:5px;font-size:13px;opacity:.75;">
                ${escapeHtml(state)}
              </div>
            </div>

            <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              <button type="button"
                      onclick="window.selezionaTorneoAdmin(${Number(torneo.id)})">
                Seleziona
              </button>

              <button type="button"
                      onclick="window.pubblicaTorneo(${Number(torneo.id)}, ${torneo.pubblicato ? "false" : "true"})">
                ${torneo.pubblicato ? "Depubblica" : "Pubblica"}
              </button>

              <button type="button"
                      onclick="window.chiudiTorneo(${Number(torneo.id)})">
                Chiudi iscrizioni
              </button>

              <button type="button"
                      onclick="window.eliminaTorneo(${Number(torneo.id)})">
                Elimina
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderConfig() {
    const container = byId("configTorneoAdmin");

    if (!container) {
      return;
    }

    const torneo = getSelectedTournament();

    if (!torneo) {
      container.innerHTML =
        '<div class="admin-empty">Seleziona un torneo.</div>';
      return;
    }

    const config = normalizeTournamentConfig(torneo);

    container.innerHTML = `
      <div style="padding:16px;border:1px solid #ddd;border-radius:12px;">
        <h3 style="margin-top:0;">${escapeHtml(torneo.nome || "Torneo")}</h3>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
          <div><strong>Data</strong><br>${escapeHtml(formatDate(torneo.data_torneo || torneo.data))}</div>
          <div><strong>Ora</strong><br>${escapeHtml(torneo.ora_inizio || "—")}</div>
          <div><strong>Formula</strong><br>${escapeHtml(torneo.formula || "—")}</div>
          <div><strong>Posti</strong><br>${escapeHtml(torneo.posti == null ? "—" : torneo.posti)}</div>
          <div><strong>Stato</strong><br>${torneo.iscrizioni_chiuse ? "Chiuso" : "Aperto"}</div>
          <div><strong>Pubblicato</strong><br>${torneo.pubblicato ? "Sì" : "No"}</div>
        </div>

        <div style="margin-top:15px;">
          <strong>Coppie:</strong> ${config.coppie.length}
          &nbsp; · &nbsp;
          <strong>Partite:</strong> ${config.tabellone.length}
        </div>
      </div>
    `;
  }

  function renderCoppie() {
    const container = byId("coppieAdmin");

    if (!container) {
      return;
    }

    const pairs = adminState.coppie || [];

    if (!pairs.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessuna coppia generata.</div>';
      return;
    }

    container.innerHTML = pairs.map(function (pair, index) {
      const a = pair.giocatore1 || pair.player1 || "—";
      const b = pair.giocatore2 || pair.player2 || "—";

      return `
        <div class="admin-pair"
             style="display:flex;justify-content:space-between;gap:12px;padding:12px;border-bottom:1px solid #eee;">
          <strong>Coppia ${index + 1}</strong>
          <span>${escapeHtml(a)} &amp; ${escapeHtml(b)}</span>
        </div>
      `;
    }).join("");
  }

  function renderTabellone() {
    const container = byId("tabelloneAdmin");

    if (!container) {
      return;
    }

    const bracket = adminState.tabellone || [];

    if (!bracket.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessun tabellone generato.</div>';
      return;
    }

    container.innerHTML = bracket.map(function (match, index) {
      const p1 = match.coppia1 || match.team1 || "—";
      const p2 = match.coppia2 || match.team2 || "—";

      return `
        <div class="admin-match"
             style="border:1px solid #ddd;border-radius:10px;padding:12px;margin-bottom:10px;">
          <strong>Partita ${index + 1}</strong>
          <div style="margin-top:6px;">${escapeHtml(p1)}</div>
          <div style="margin-top:4px;">${escapeHtml(p2)}</div>
          <div style="margin-top:6px;font-size:12px;opacity:.65;">
            ${escapeHtml(match.round || "1° turno")}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderNews() {
    const container =
      byId("listaNewsAdmin") ||
      byId("newsAdmin");

    if (!container) {
      return;
    }

    const news = adminState.news || [];

    if (!news.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessuna news presente.</div>';
      return;
    }

    container.innerHTML = news.map(function (item) {
      return `
        <article style="border:1px solid #ddd;border-radius:12px;padding:15px;margin-bottom:10px;">
          <h3 style="margin-top:0;">${escapeHtml(item.titolo || "")}</h3>
          <div style="white-space:pre-wrap;">${escapeHtml(item.testo || "")}</div>

          <div style="margin-top:10px;font-size:12px;opacity:.65;">
            ${escapeHtml(formatDateTime(item.created_at))}
            · ${item.pubblicata ? "Pubblicata" : "Bozza"}
          </div>

          <div style="margin-top:10px;display:flex;gap:6px;">
            <button type="button"
                    onclick="window.modificaNews(${Number(item.id)})">
              Modifica
            </button>

            <button type="button"
                    onclick="window.eliminaNews(${Number(item.id)})">
              Elimina
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderSponsor() {
    const container =
      byId("listaSponsorAdmin") ||
      byId("sponsorAdmin");

    if (!container) {
      return;
    }

    const sponsors = adminState.sponsor || [];

    if (!sponsors.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessuno sponsor presente.</div>';
      return;
    }

    container.innerHTML = sponsors.map(function (item) {
      const link = item.link || "";

      return `
        <article style="border:1px solid #ddd;border-radius:12px;padding:15px;margin-bottom:10px;">
          <h3 style="margin-top:0;">${escapeHtml(item.nome || "")}</h3>

          ${item.immagine
            ? `<img src="${escapeAttr(item.immagine)}"
                    alt=""
                    style="max-width:180px;max-height:90px;object-fit:contain;">`
            : ""}

          ${link
            ? `<div style="margin-top:8px;">${escapeHtml(link)}</div>`
            : ""}

          <div style="margin-top:10px;display:flex;gap:6px;">
            <button type="button"
                    onclick="window.modificaSponsor(${Number(item.id)})">
              Modifica
            </button>

            <button type="button"
                    onclick="window.eliminaSponsor(${Number(item.id)})">
              Elimina
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderCalendar() {
    const container =
      byId("adminCalendar") ||
      byId("calendarioAdmin");

    if (!container) {
      return;
    }

    const tournaments = adminState.tornei || [];

    if (!tournaments.length) {
      container.innerHTML =
        '<div class="admin-empty">Nessun evento in calendario.</div>';
      return;
    }

    container.innerHTML = tournaments.map(function (torneo) {
      const date = torneo.data_torneo || torneo.data;

      return `
        <div style="border-left:4px solid currentColor;padding:10px 14px;margin-bottom:10px;">
          <strong>${escapeHtml(formatDate(date))}</strong>
          <div>${escapeHtml(torneo.nome || "Torneo")}</div>
          <small>${escapeHtml(torneo.ora_inizio || "")}</small>
        </div>
      `;
    }).join("");
  }

  function renderAll() {
    updateDashboardStats();
    renderTorneiAdmin();
    renderConfig();
    renderCoppie();
    renderTabellone();
    renderNews();
    renderSponsor();
    renderCalendar();
  }

  async function loginAdmin() {
    const client = getSupabaseClient();

    if (!client) {
      showNotice("Supabase non è disponibile.", "error");
      return false;
    }

    const emailElement = byId("emailAdmin");
    const passwordElement = byId("passwordAdmin");

    const email = emailElement
      ? String(emailElement.value || "").trim()
      : "";

    const password = passwordElement
      ? String(passwordElement.value || "")
      : "";

    if (!email || !password) {
      showNotice("Inserisci email e password.", "warning");
      return false;
    }

    try {
      adminState.loading = true;

      const result = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (result.error) {
        throw result.error;
      }

      setLoginState(result.data.session);

      showNotice("Accesso effettuato.", "success");

      await refreshAdmin();

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Login:", err);
      showNotice(
        err && err.message
          ? err.message
          : "Errore durante il login.",
        "error"
      );
      return false;
    } finally {
      adminState.loading = false;
    }
  }

  async function logoutAdmin() {
    const client = getSupabaseClient();

    if (!client) {
      setLoginState(null);
      return;
    }

    try {
      await client.auth.signOut();
    } catch (err) {
      errorLog("[Padel Admin] Logout:", err);
    }

    setLoginState(null);

    adminState.tornei = [];
    adminState.torneoSelezionato = null;
    adminState.iscrizioni = [];
    adminState.partecipanti = [];
    adminState.coppie = [];
    adminState.tabellone = [];

    renderAll();

    showNotice("Sessione terminata.", "success");
  }

  async function caricaTorneiAdmin() {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    try {
      const result = await client
        .from("tornei")
        .select("*");

      if (result.error) {
        throw result.error;
      }

      adminState.tornei = sortTournaments(result.data || []);

      if (adminState.torneoSelezionato) {
        const updated = adminState.tornei.find(function (torneo) {
          return String(torneo.id) === String(adminState.torneoSelezionato.id);
        });

        adminState.torneoSelezionato = updated || null;
      }

      if (!adminState.torneoSelezionato && adminState.tornei.length) {
        adminState.torneoSelezionato = adminState.tornei[0];
      }

      renderAll();

      return adminState.tornei;
    } catch (err) {
      errorLog("[Padel Admin] Caricamento tornei:", err);
      showNotice(
        "Impossibile caricare i tornei: " +
        (err.message || "errore"),
        "error"
      );
      return [];
    }
  }

  async function caricaTornei() {
    return caricaTorneiAdmin();
  }

  async function selezionaTorneoAdmin(id) {
    const torneo = (adminState.tornei || []).find(function (item) {
      return String(item.id) === String(id);
    });

    if (!torneo) {
      return null;
    }

    adminState.torneoSelezionato = torneo;

    const config = normalizeTournamentConfig(torneo);

    adminState.coppie = config.coppie || [];
    adminState.tabellone = config.tabellone || [];

    await caricaIscrizioni();

    renderAll();

    return torneo;
  }

  async function creaTorneo() {
    const client = getSupabaseClient();

    if (!client) {
      showNotice("Supabase non disponibile.", "error");
      return null;
    }

    const nome = window.prompt("Nome del torneo:");

    if (!nome || !nome.trim()) {
      return null;
    }

    const data = window.prompt(
      "Data del torneo (AAAA-MM-GG):",
      new Date().toISOString().slice(0, 10)
    );

    if (!data) {
      return null;
    }

    const ora = window.prompt(
      "Ora di inizio (HH:MM):",
      "09:00"
    );

    const postiText = window.prompt(
      "Numero posti:",
      "32"
    );

    const formula = window.prompt(
      "Formula:",
      "Padel"
    );

    let posti = parseInt(postiText, 10);

    if (Number.isNaN(posti)) {
      posti = null;
    }

    try {
      const session = await getCurrentSession();

      const payload = {
        nome: nome.trim(),
        data: data,
        data_torneo: data,
        ora_inizio: ora || null,
        posti: posti,
        formula: formula || null,
        stato: "attivo",
        pubblicato: false,
        iscrizioni_chiuse: false,
        configurazione: {
          coppie: [],
          tabellone: []
        }
      };

      if (session && session.user && session.user.id) {
        payload.created_by = session.user.id;
      }

      const result = await client
        .from("tornei")
        .insert(payload)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      showNotice("Torneo creato.", "success");

      await caricaTorneiAdmin();

      if (result.data) {
        await selezionaTorneoAdmin(result.data.id);
      }

      return result.data;
    } catch (err) {
      errorLog("[Padel Admin] Creazione torneo:", err);
      showNotice(
        "Errore creazione torneo: " +
        (err.message || "errore"),
        "error"
      );
      return null;
    }
  }

  function apriRegoleNuovoTorneo() {
    return creaTorneo();
  }

  async function eliminaTorneo(id) {
    const client = getSupabaseClient();

    if (!client) {
      showNotice("Supabase non disponibile.", "error");
      return false;
    }

    const torneo = (adminState.tornei || []).find(function (item) {
      return String(item.id) === String(id);
    });

    if (!torneo) {
      return false;
    }

    const confirmed = window.confirm(
      'Eliminare definitivamente il torneo "' +
      (torneo.nome || "") +
      '"?'
    );

    if (!confirmed) {
      return false;
    }

    try {
      const registrationsDelete = await client
        .from("iscrizioni")
        .delete()
        .eq("torneo_id", id);

      if (registrationsDelete.error) {
        warn(
          "[Padel Admin] Impossibile eliminare le iscrizioni:",
          registrationsDelete.error
        );
      }

      const result = await client
        .from("tornei")
        .delete()
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      if (
        adminState.torneoSelezionato &&
        String(adminState.torneoSelezionato.id) === String(id)
      ) {
        adminState.torneoSelezionato = null;
        adminState.iscrizioni = [];
        adminState.partecipanti = [];
        adminState.coppie = [];
        adminState.tabellone = [];
      }

      showNotice("Torneo eliminato.", "success");

      await caricaTorneiAdmin();

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Eliminazione torneo:", err);
      showNotice(
        "Errore eliminazione torneo: " +
        (err.message || "errore"),
        "error"
      );
      return false;
    }
  }

  async function pubblicaTorneo(id, value) {
    const client = getSupabaseClient();

    if (!client) {
      showNotice("Supabase non disponibile.", "error");
      return false;
    }

    try {
      const result = await client
        .from("tornei")
        .update({
          pubblicato: Boolean(value)
        })
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      showNotice(
        value ? "Torneo pubblicato." : "Torneo rimosso dalla pubblicazione.",
        "success"
      );

      await caricaTorneiAdmin();

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Pubblicazione torneo:", err);
      showNotice(
        "Errore pubblicazione: " +
        (err.message || "errore"),
        "error"
      );
      return false;
    }
  }

  async function chiudiTorneo(id) {
    const client = getSupabaseClient();

    if (!client) {
      showNotice("Supabase non disponibile.", "error");
      return false;
    }

    const confirmed = window.confirm(
      "Vuoi chiudere le iscrizioni a questo torneo?"
    );

    if (!confirmed) {
      return false;
    }

    try {
      const result = await client
        .from("tornei")
        .update({
          iscrizioni_chiuse: true,
          stato: "chiuso"
        })
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      showNotice("Iscrizioni chiuse.", "success");

      await caricaTorneiAdmin();

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Chiusura torneo:", err);
      showNotice(
        "Errore chiusura iscrizioni: " +
        (err.message || "errore"),
        "error"
      );
      return false;
    }
  }

  async function caricaIscrizioni() {
    const client = getSupabaseClient();
    const torneoId = getSelectedTournamentId();

    if (!client || !torneoId) {
      adminState.iscrizioni = [];
      adminState.partecipanti = [];
      updateDashboardStats();
      return [];
    }

    try {
      const result = await client
        .from("iscrizioni")
        .select("*")
        .eq("torneo_id", torneoId)
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      adminState.iscrizioni = result.data || [];

      adminState.partecipanti =
        adminState.iscrizioni.filter(isApprovedRegistration);

      updateDashboardStats();

      return adminState.iscrizioni;
    } catch (err) {
      errorLog("[Padel Admin] Caricamento iscrizioni:", err);
      showNotice(
        "Errore caricamento iscrizioni: " +
        (err.message || "errore"),
        "error"
      );
      return [];
    }
  }

  async function cambiaStatoIscrizione(id, stato) {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const approved =
        String(stato).toLowerCase() === "approvata";

      const result = await client
        .from("iscrizioni")
        .update({
          stato: stato,
          approvato: approved
        })
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      await caricaIscrizioni();

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Stato iscrizione:", err);
      showNotice(
        "Errore aggiornamento iscrizione.",
        "error"
      );
      return false;
    }
  }

  async function approvaIscrizione(id) {
    return cambiaStatoIscrizione(id, "approvata");
  }

  async function rifiutaIscrizione(id) {
    return cambiaStatoIscrizione(id, "rifiutata");
  }

  async function caricaPartecipanti() {
    if (!adminState.iscrizioni || !adminState.iscrizioni.length) {
      await caricaIscrizioni();
    }

    adminState.partecipanti =
      (adminState.iscrizioni || []).filter(isApprovedRegistration);

    updateDashboardStats();

    return adminState.partecipanti;
  }

  function buildPairs(participants) {
    const pairs = [];

    for (let i = 0; i < participants.length; i += 2) {
      const p1 = participants[i];
      const p2 = participants[i + 1] || null;

      pairs.push({
        id: i / 2 + 1,
        giocatore1: participantName(p1),
        giocatore2: p2 ? participantName(p2) : "BYE",
        giocatore1_id: p1 && p1.id != null ? p1.id : null,
        giocatore2_id: p2 && p2.id != null ? p2.id : null
      });
    }

    return pairs;
  }

  function buildBracket(pairs) {
    const matches = [];

    for (let i = 0; i < pairs.length; i += 2) {
      const first = pairs[i];
      const second = pairs[i + 1] || null;

      matches.push({
        id: i / 2 + 1,
        round: "1° turno",
        coppia1: first
          ? "Coppia " + first.id
          : "—",
        coppia2: second
          ? "Coppia " + second.id
          : "BYE",
        coppia1_id: first ? first.id : null,
        coppia2_id: second ? second.id : null,
        risultato: null,
        vincitore: null
      });
    }

    return matches;
  }

  async function salvaConfigurazioneTorneo(config) {
    const client = getSupabaseClient();
    const torneo = getSelectedTournament();

    if (!client || !torneo) {
      return false;
    }

    try {
      const result = await client
        .from("tornei")
        .update({
          configurazione: config
        })
        .eq("id", torneo.id);

      if (result.error) {
        throw result.error;
      }

      torneo.configurazione = config;

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Salvataggio configurazione:", err);
      showNotice(
        "Errore salvataggio configurazione: " +
        (err.message || "errore"),
        "error"
      );
      return false;
    }
  }

  async function generaCoppie() {
    await caricaPartecipanti();

    const torneo = getSelectedTournament();

    if (!torneo) {
      showNotice("Seleziona prima un torneo.", "warning");
      return [];
    }

    const participants = adminState.partecipanti || [];

    if (participants.length < 2) {
      showNotice(
        "Servono almeno 2 partecipanti approvati.",
        "warning"
      );
      return [];
    }

    const pairs = buildPairs(participants);
    const bracket = buildBracket(pairs);

    const config = normalizeTournamentConfig(torneo);

    config.coppie = pairs;
    config.tabellone = bracket;

    const saved = await salvaConfigurazioneTorneo(config);

    if (!saved) {
      return [];
    }

    adminState.coppie = pairs;
    adminState.tabellone = bracket;

    renderAll();

    showNotice("Coppie generate.", "success");

    return pairs;
  }

  function shuffle(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }

    return result;
  }

  async function generaCoppieLocali() {
    await caricaPartecipanti();

    const torneo = getSelectedTournament();

    if (!torneo) {
      showNotice("Seleziona prima un torneo.", "warning");
      return [];
    }

    const participants = adminState.partecipanti || [];

    if (participants.length < 2) {
      showNotice(
        "Servono almeno 2 partecipanti approvati.",
        "warning"
      );
      return [];
    }

    const shuffled = shuffle(participants);
    const pairs = buildPairs(shuffled);
    const bracket = buildBracket(pairs);

    const config = normalizeTournamentConfig(torneo);

    config.coppie = pairs;
    config.tabellone = bracket;

    const saved = await salvaConfigurazioneTorneo(config);

    if (!saved) {
      return [];
    }

    adminState.coppie = pairs;
    adminState.tabellone = bracket;

    renderAll();

    showNotice("Coppie casuali generate.", "success");

    return pairs;
  }

  async function creaCoppieAdmin() {
    return generaCoppieLocali();
  }

  async function caricaNewsAdmin() {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    try {
      const result = await client
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      adminState.news = result.data || [];

      renderNews();

      return adminState.news;
    } catch (err) {
      errorLog("[Padel Admin] News:", err);
      showNotice(
        "Errore caricamento news: " +
        (err.message || "errore"),
        "error"
      );
      return [];
    }
  }

  async function creaNews() {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    let titoloElement = byId("titoloNews");
    let testoElement = byId("testoNews");

    let titolo = titoloElement
      ? String(titoloElement.value || "").trim()
      : "";

    let testo = testoElement
      ? String(testoElement.value || "").trim()
      : "";

    if (!titolo) {
      titolo = window.prompt("Titolo news:", "") || "";
      titolo = titolo.trim();
    }

    if (!titolo) {
      return null;
    }

    if (!testo) {
      testo = window.prompt("Testo news:", "") || "";
    }

    try {
      const result = await client
        .from("news")
        .insert({
          titolo: titolo,
          testo: testo,
          pubblicata: true
        })
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      if (titoloElement) titoloElement.value = "";
      if (testoElement) testoElement.value = "";

      await caricaNewsAdmin();

      showNotice("News creata.", "success");

      return result.data;
    } catch (err) {
      errorLog("[Padel Admin] Creazione news:", err);
      showNotice(
        "Errore creazione news: " +
        (err.message || "errore"),
        "error"
      );
      return null;
    }
  }

  async function modificaNews(id) {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    const item = (adminState.news || []).find(function (news) {
      return String(news.id) === String(id);
    });

    if (!item) {
      return null;
    }

    const titolo = window.prompt(
      "Titolo news:",
      item.titolo || ""
    );

    if (titolo === null) {
      return null;
    }

    const testo = window.prompt(
      "Testo news:",
      item.testo || ""
    );

    if (testo === null) {
      return null;
    }

    try {
      const result = await client
        .from("news")
        .update({
          titolo: titolo.trim(),
          testo: testo
        })
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      await caricaNewsAdmin();

      showNotice("News modificata.", "success");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Modifica news:", err);
      showNotice(
        "Errore modifica news.",
        "error"
      );
      return false;
    }
  }

  async function eliminaNews(id) {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    if (!window.confirm("Eliminare questa news?")) {
      return false;
    }

    try {
      const result = await client
        .from("news")
        .delete()
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      await caricaNewsAdmin();

      showNotice("News eliminata.", "success");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Eliminazione news:", err);
      showNotice(
        "Errore eliminazione news.",
        "error"
      );
      return false;
    }
  }

  async function caricaSponsorAdmin() {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    try {
      const result = await client
        .from("sponsor")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      adminState.sponsor = result.data || [];

      renderSponsor();

      return adminState.sponsor;
    } catch (err) {
      errorLog("[Padel Admin] Sponsor:", err);
      showNotice(
        "Errore caricamento sponsor: " +
        (err.message || "errore"),
        "error"
      );
      return [];
    }
  }

  async function creaSponsor() {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    const nomeElement = byId("nomeSponsor");
    const logoElement = byId("logoSponsor");
    const linkElement = byId("linkSponsor");

    let nome = nomeElement
      ? String(nomeElement.value || "").trim()
      : "";

    let immagine = logoElement
      ? String(logoElement.value || "").trim()
      : "";

    let link = linkElement
      ? String(linkElement.value || "").trim()
      : "";

    if (!nome) {
      nome = window.prompt("Nome sponsor:", "") || "";
      nome = nome.trim();
    }

    if (!nome) {
      return null;
    }

    if (!immagine) {
      immagine = window.prompt("URL logo/immagine:", "") || "";
    }

    if (!link) {
      link = window.prompt("URL sponsor:", "") || "";
    }

    try {
      const result = await client
        .from("sponsor")
        .insert({
          nome: nome,
          immagine: immagine || null,
          link: link || null
        })
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      if (nomeElement) nomeElement.value = "";
      if (logoElement) logoElement.value = "";
      if (linkElement) linkElement.value = "";

      await caricaSponsorAdmin();

      showNotice("Sponsor creato.", "success");

      return result.data;
    } catch (err) {
      errorLog("[Padel Admin] Creazione sponsor:", err);
      showNotice(
        "Errore creazione sponsor: " +
        (err.message || "errore"),
        "error"
      );
      return null;
    }
  }

  async function modificaSponsor(id) {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    const item = (adminState.sponsor || []).find(function (sponsor) {
      return String(sponsor.id) === String(id);
    });

    if (!item) {
      return false;
    }

    const nome = window.prompt(
      "Nome sponsor:",
      item.nome || ""
    );

    if (nome === null) {
      return false;
    }

    const immagine = window.prompt(
      "URL logo/immagine:",
      item.immagine || ""
    );

    if (immagine === null) {
      return false;
    }

    const link = window.prompt(
      "URL sponsor:",
      item.link || ""
    );

    if (link === null) {
      return false;
    }

    try {
      const result = await client
        .from("sponsor")
        .update({
          nome: nome.trim(),
          immagine: immagine.trim() || null,
          link: link.trim() || null
        })
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      await caricaSponsorAdmin();

      showNotice("Sponsor modificato.", "success");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Modifica sponsor:", err);
      showNotice(
        "Errore modifica sponsor.",
        "error"
      );
      return false;
    }
  }

  async function eliminaSponsor(id) {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    if (!window.confirm("Eliminare questo sponsor?")) {
      return false;
    }

    try {
      const result = await client
        .from("sponsor")
        .delete()
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      await caricaSponsorAdmin();

      showNotice("Sponsor eliminato.", "success");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Eliminazione sponsor:", err);
      showNotice(
        "Errore eliminazione sponsor.",
        "error"
      );
      return false;
    }
  }

  function generaCalendario() {
    renderCalendar();

    return adminState.tornei || [];
  }

  async function caricaCalendario() {
    await caricaTorneiAdmin();
    return generaCalendario();
  }

  function renderCalendario() {
    return generaCalendario();
  }

  async function inviaWhatsApp(messaggio, destinatari) {
    const message = String(
      messaggio ||
      "Ciao! Comunicazione dal Padel Admin."
    );

    let targets = destinatari;

    if (!Array.isArray(targets)) {
      targets = [];
    }

    targets = targets
      .map(function (item) {
        if (typeof item === "string") {
          return item;
        }

        return participantPhone(item);
      })
      .map(function (phone) {
        return String(phone || "").replace(/\D/g, "");
      })
      .filter(Boolean);

    const encoded = encodeURIComponent(message);

    if (!targets.length) {
      window.open(
        "https://wa.me/?text=" + encoded,
        "_blank",
        "noopener"
      );

      return true;
    }

    targets.forEach(function (phone) {
      window.open(
        "https://wa.me/" + phone + "?text=" + encoded,
        "_blank",
        "noopener"
      );
    });

    return true;
  }

  async function inviaWhatsAppTutti() {
    await caricaIscrizioni();

    const targets = (adminState.iscrizioni || [])
      .map(function (item) {
        return participantPhone(item);
      })
      .filter(Boolean);

    const message = window.prompt(
      "Messaggio WhatsApp:",
      "Ciao! Comunicazione dal torneo di padel."
    );

    if (message === null) {
      return false;
    }

    return inviaWhatsApp(message, targets);
  }

  async function inviaWhatsAppApprovati() {
    await caricaIscrizioni();

    const targets = (adminState.iscrizioni || [])
      .filter(isApprovedRegistration)
      .map(function (item) {
        return participantPhone(item);
      })
      .filter(Boolean);

    const message = window.prompt(
      "Messaggio WhatsApp per gli iscritti approvati:",
      "Ciao! Comunicazione dal torneo di padel."
    );

    if (message === null) {
      return false;
    }

    return inviaWhatsApp(message, targets);
  }

  function generaLink(torneoId) {
    const id = torneoId || getSelectedTournamentId();

    if (!id) {
      showNotice("Seleziona un torneo.", "warning");
      return "";
    }

    const base =
      window.location.origin +
      window.location.pathname.replace(/\/[^/]*$/, "/");

    const cleanBase = base.endsWith("/")
      ? base
      : base + "/";

    return cleanBase +
      "?torneo=" +
      encodeURIComponent(id);
  }

  function setLinkInputs(url) {
    [
      "linkBove",
      "linkTorneo",
      "urlTorneo",
      "linkGenerato"
    ].forEach(function (id) {
      const element = byId(id);

      if (element) {
        element.value = url;
        element.textContent = url;
      }
    });
  }

  function generaLinkBoveMirror(torneoId) {
    const url = generaLink(torneoId);

    if (url) {
      setLinkInputs(url);
      showNotice("Link generato.", "success");
    }

    return url;
  }

  async function copiaLinkBove(torneoId) {
    const url = generaLink(torneoId);

    if (!url) {
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setLinkInputs(url);

      showNotice("Link copiato.", "success");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Copia link:", err);
      showNotice(
        "Impossibile copiare automaticamente il link.",
        "warning"
      );
      return false;
    }
  }

  function apriLinkBove(torneoId) {
    const url = generaLink(torneoId);

    if (!url) {
      return false;
    }

    window.open(url, "_blank", "noopener");

    return true;
  }

  function apriBoveConTorneo(torneoId) {
    return apriLinkBove(torneoId);
  }

  function __adminButtonAction(action) {
    if (action === "generate") {
      return generaCoppie();
    }

    if (action === "random") {
      return generaCoppieLocali();
    }

    warn("[Padel Admin] Azione pulsante sconosciuta:", action);

    return null;
  }

  async function refreshAdmin() {
    if (adminState.loading) {
      return;
    }

    adminState.loading = true;

    try {
      await caricaTorneiAdmin();

      if (getSelectedTournamentId()) {
        await caricaIscrizioni();

        const torneo = getSelectedTournament();
        const config = normalizeTournamentConfig(torneo);

        adminState.coppie = config.coppie || [];
        adminState.tabellone = config.tabellone || [];
      }

      await Promise.all([
        caricaNewsAdmin(),
        caricaSponsorAdmin()
      ]);

      renderAll();
    } catch (err) {
      errorLog("[Padel Admin] Refresh:", err);
    } finally {
      adminState.loading = false;
    }
  }

  function __adminRefresh() {
    clearTimeout(refreshTimer);

    refreshTimer = setTimeout(function () {
      refreshAdmin();
    }, 50);

    return true;
  }

  async function avviaAdmin() {
    try {
      await waitForSupabase();

      const session = await getCurrentSession();

      setLoginState(session);

      if (session) {
        await refreshAdmin();
      }

      adminState.initialized = true;

      log("[Padel Admin] admin-master.js v23 pronto.");

      return true;
    } catch (err) {
      errorLog("[Padel Admin] Avvio:", err);

      setLoginState(null);

      showNotice(
        "Impossibile inizializzare il pannello amministrazione.",
        "error"
      );

      return false;
    }
  }

  function setupAuthListener() {
    const client = getSupabaseClient();

    if (!client || !client.auth) {
      return;
    }

    if (authSubscription) {
      return;
    }

    try {
      const result = client.auth.onAuthStateChange(
        function (event, session) {
          log("[Padel Admin] Auth event:", event);

          setLoginState(session);

          if (event === "SIGNED_IN") {
            setTimeout(function () {
              refreshAdmin();
            }, 0);
          }

          if (event === "SIGNED_OUT") {
            adminState.tornei = [];
            adminState.torneoSelezionato = null;
            adminState.iscrizioni = [];
            adminState.partecipanti = [];
            adminState.coppie = [];
            adminState.tabellone = [];

            renderAll();
          }

          if (event === "INITIAL_SESSION" && session) {
            setTimeout(function () {
              refreshAdmin();
            }, 0);
          }
        }
      );

      if (result && result.data) {
        authSubscription = result.data.subscription;
      }
    } catch (err) {
      errorLog("[Padel Admin] Auth listener:", err);
    }
  }

  function exposeApi() {
    window.avviaAdmin = avviaAdmin;

    window.loginAdmin = loginAdmin;
    window.logoutAdmin = logoutAdmin;

    window.caricaTorneiAdmin = caricaTorneiAdmin;
    window.caricaTornei = caricaTornei;

    window.creaTorneo = creaTorneo;
    window.apriRegoleNuovoTorneo = apriRegoleNuovoTorneo;
    window.eliminaTorneo = eliminaTorneo;
    window.pubblicaTorneo = pubblicaTorneo;
    window.chiudiTorneo = chiudiTorneo;
    window.selezionaTorneoAdmin = selezionaTorneoAdmin;

    window.caricaIscrizioni = caricaIscrizioni;
    window.approvaIscrizione = approvaIscrizione;
    window.rifiutaIscrizione = rifiutaIscrizione;
    window.cambiaStatoIscrizione = cambiaStatoIscrizione;

    window.caricaPartecipanti = caricaPartecipanti;

    window.generaCoppie = generaCoppie;
    window.generaCoppieLocali = generaCoppieLocali;
    window.creaCoppieAdmin = creaCoppieAdmin;
    window.salvaConfigurazioneTorneo = salvaConfigurazioneTorneo;

    window.caricaNews = caricaNewsAdmin;
    window.caricaNewsAdmin = caricaNewsAdmin;
    window.creaNews = creaNews;
    window.creaNewsAdmin = creaNews;
    window.modificaNews = modificaNews;
    window.eliminaNews = eliminaNews;

    window.caricaSponsor = caricaSponsorAdmin;
    window.caricaSponsorAdmin = caricaSponsorAdmin;
    window.creaSponsor = creaSponsor;
    window.creaSponsorAdmin = creaSponsor;
    window.modificaSponsor = modificaSponsor;
    window.eliminaSponsor = eliminaSponsor;

    window.caricaCalendario = caricaCalendario;
    window.generaCalendario = generaCalendario;
    window.renderCalendario = renderCalendario;

    window.inviaWhatsApp = inviaWhatsApp;
    window.inviaWhatsAppTutti = inviaWhatsAppTutti;
    window.inviaWhatsAppApprovati = inviaWhatsAppApprovati;

    window.generaLink = generaLink;
    window.generaLinkBoveMirror = generaLinkBoveMirror;
    window.copiaLinkBove = copiaLinkBove;
    window.apriLinkBove = apriLinkBove;
    window.apriBoveConTorneo = apriBoveConTorneo;

    window.__adminRefresh = __adminRefresh;
    window.__adminButtonAction = __adminButtonAction;

    window.adminState = adminState;

    window._supabase = getSupabaseClient();
    window.sb = window._supabase;
    window.supabaseClient = window._supabase;
  }

  function bindLoginForm() {
    const form = byId("formLoginAdmin");

    if (!form || form.__adminBound) {
      return;
    }

    form.__adminBound = true;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      loginAdmin();
    });
  }

  function bindPasswordEnter() {
    const password = byId("passwordAdmin");

    if (!password || password.__adminBound) {
      return;
    }

    password.__adminBound = true;

    password.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        loginAdmin();
      }
    });
  }

  async function bootstrap() {
    exposeApi();

    bindLoginForm();
    bindPasswordEnter();

    try {
      await waitForSupabase();

      setupAuthListener();

      await avviaAdmin();
    } catch (err) {
      errorLog("[Padel Admin] Bootstrap:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

})();
