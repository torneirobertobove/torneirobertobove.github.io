(function () {
  "use strict";

  /*
   * ============================================================
   * PADEL ADMIN - ADMIN MASTER
   * Versione: 23
   * ============================================================
   *
   * Questo file contiene esclusivamente JavaScript.
   * NON deve essere incollato dentro admin.html.
   */

  const ADMIN_MASTER_VERSION = "23";

  const SUPABASE_URL =
    "https://iybjvtmfaupgthqqsngd.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl";

  window.__ADMIN_MASTER_VERSION = ADMIN_MASTER_VERSION;

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

  const adminState = Object.assign({}, defaultState);

  window.adminState = adminState;

  let supabaseClient = null;

  /*
   * ------------------------------------------------------------
   * UTILITY
   * ------------------------------------------------------------
   */

  function byId(id) {
    return document.getElementById(id);
  }

  function text(value) {
    return value === null || value === undefined
      ? ""
      : String(value);
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return text(value);
      }

      return date.toLocaleDateString("it-IT");
    } catch (e) {
      return text(value);
    }
  }

  function formatTime(value) {
    if (!value) return "";

    const valueText = text(value);

    if (valueText.length >= 5) {
      return valueText.substring(0, 5);
    }

    return valueText;
  }

  function showMessage(message, type) {
    const loginMessage = byId("messaggioLoginAdmin");

    if (loginMessage && !byId("areaAdmin")?.style.display) {
      loginMessage.textContent = text(message);
    }

    if (typeof window.alert === "function" && type === "error") {
      console.error(message);
    }

    try {
      if (typeof window.__adminToast === "function") {
        window.__adminToast(message, type);
      }
    } catch (e) {}

    console.log("[PADel Admin]", message);
  }

  function setLoginMessage(message) {
    const element = byId("messaggioLoginAdmin");

    if (element) {
      element.textContent = text(message);
    }
  }

  function getCurrentUser() {
    if (!supabaseClient) return null;

    return supabaseClient.auth
      ? supabaseClient.auth.getUser()
      : null;
  }

  function ensureClient() {
    if (supabaseClient) {
      return supabaseClient;
    }

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      return null;
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    window._supabase = supabaseClient;
    window.sb = supabaseClient;
    window.supabaseClient = supabaseClient;

    return supabaseClient;
  }

  function waitForSupabase(timeout) {
    const maxTime = Number(timeout) || 10000;

    return new Promise(function (resolve) {
      const started = Date.now();

      function check() {
        const client = ensureClient();

        if (client) {
          resolve(client);
          return;
        }

        if (Date.now() - started >= maxTime) {
          resolve(null);
          return;
        }

        setTimeout(check, 50);
      }

      check();
    });
  }

  function getSelectedTournamentId() {
    if (!adminState.torneoSelezionato) {
      return null;
    }

    return adminState.torneoSelezionato.id || null;
  }

  function normalizeTournamentDate(torneo) {
    if (!torneo) return "";

    return torneo.data_torneo ||
      torneo.data ||
      "";
  }

  function getTournamentName(torneo) {
    if (!torneo) return "Torneo";

    return torneo.nome ||
      torneo.titolo ||
      "Torneo";
  }

  function getConfig(torneo) {
    if (!torneo) return {};

    if (
      torneo.configurazione &&
      typeof torneo.configurazione === "object"
    ) {
      return torneo.configurazione;
    }

    return {};
  }

  function mergeConfig(torneo, patch) {
    const current = getConfig(torneo);

    return Object.assign({}, current, patch || {});
  }

  /*
   * ------------------------------------------------------------
   * UI LOGIN
   * ------------------------------------------------------------
   */

  function showLogin() {
    const login = byId("boxLoginAdmin");
    const app = byId("areaAdmin");

    if (login) {
      login.style.display = "flex";
    }

    if (app) {
      app.style.display = "none";
    }
  }

  function showApp(user) {
    const login = byId("boxLoginAdmin");
    const app = byId("areaAdmin");

    if (login) {
      login.style.display = "none";
    }

    if (app) {
      app.style.display = "block";
    }

    const emailDisplay = byId("adminEmailDisplay");

    if (emailDisplay) {
      emailDisplay.textContent =
        user?.email ||
        "Utente autenticato";
    }

    try {
      if (typeof window.openAdminPage === "function") {
        const currentHash =
          location.hash
            ? location.hash.substring(1)
            : "dashboard";

        window.openAdminPage(currentHash || "dashboard");
      }
    } catch (e) {
      console.warn("Navigazione admin non disponibile:", e);
    }
  }

  /*
   * ------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------
   */

  async function loginAdmin() {
    const client = ensureClient();

    if (!client) {
      setLoginMessage(
        "Supabase non è ancora disponibile. Riprova tra qualche secondo."
      );
      return false;
    }

    const emailInput = byId("emailAdmin");
    const passwordInput = byId("passwordAdmin");

    const email = emailInput
      ? text(emailInput.value).trim()
      : "";

    const password = passwordInput
      ? text(passwordInput.value)
      : "";

    if (!email || !password) {
      setLoginMessage(
        "Inserisci email e password."
      );
      return false;
    }

    setLoginMessage("Accesso in corso...");

    try {
      const result =
        await client.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (result.error) {
        console.error(
          "Errore login Supabase:",
          result.error
        );

        setLoginMessage(
          result.error.message ||
          "Accesso non riuscito."
        );

        return false;
      }

      const user =
        result.data?.user ||
        null;

      setLoginMessage("");

      showApp(user);

      await avviaDatiAdmin();

      return true;
    } catch (error) {
      console.error(
        "Errore loginAdmin:",
        error
      );

      setLoginMessage(
        error?.message ||
        "Errore durante il login."
      );

      return false;
    }
  }

  async function logoutAdmin() {
    const client = ensureClient();

    try {
      if (client) {
        await client.auth.signOut();
      }
    } catch (error) {
      console.warn(
        "Errore logout:",
        error
      );
    }

    Object.assign(
      adminState,
      JSON.parse(
        JSON.stringify(defaultState)
      )
    );

    showLogin();

    setLoginMessage("");

    return true;
  }

  async function avviaAdmin() {
    const client = await waitForSupabase(12000);

    if (!client) {
      console.error(
        "Supabase non disponibile."
      );

      showLogin();

      setLoginMessage(
        "Impossibile inizializzare Supabase."
      );

      return false;
    }

    try {
      const result =
        await client.auth.getSession();

      if (result.error) {
        console.warn(
          "Errore recupero sessione:",
          result.error
        );

        showLogin();

        return false;
      }

      const session =
        result.data?.session ||
        null;

      if (session?.user) {
        showApp(session.user);
        await avviaDatiAdmin();
        return true;
      }

      showLogin();

      return false;
    } catch (error) {
      console.error(
        "Errore avviaAdmin:",
        error
      );

      showLogin();

      return false;
    }
  }

  /*
   * ------------------------------------------------------------
   * TORNEI
   * ------------------------------------------------------------
   */

  async function caricaTorneiAdmin() {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    adminState.loading = true;

    try {
      const result =
        await client
          .from("tornei")
          .select("*")
          .order("data_torneo", {
            ascending: true,
            nullsFirst: false
          })
          .order("data", {
            ascending: true,
            nullsFirst: false
          });

      if (result.error) {
        throw result.error;
      }

      adminState.tornei =
        Array.isArray(result.data)
          ? result.data
          : [];

      if (adminState.torneoSelezionato) {
        const selected =
          adminState.tornei.find(function (torneo) {
            return String(torneo.id) ===
              String(adminState.torneoSelezionato.id);
          });

        if (selected) {
          adminState.torneoSelezionato = selected;
        }
      }

      if (
        !adminState.torneoSelezionato &&
        adminState.tornei.length
      ) {
        adminState.torneoSelezionato =
          adminState.tornei[0];
      }

      renderDashboard();
      renderTournamentConfig();

      if (adminState.torneoSelezionato) {
        await caricaIscrizioni();
      }

      return adminState.tornei;
    } catch (error) {
      console.error(
        "Errore caricaTorneiAdmin:",
        error
      );

      renderDashboard(
        "Errore caricamento tornei."
      );

      return [];
    } finally {
      adminState.loading = false;
    }
  }

  const caricaTornei =
    caricaTorneiAdmin;

  async function creaTorneo(data) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    let payload = data || null;

    if (!payload) {
      const nome = window.prompt(
        "Nome del torneo:"
      );

      if (!nome) {
        return null;
      }

      const dataTorneo = window.prompt(
        "Data torneo (YYYY-MM-DD):",
        new Date()
          .toISOString()
          .slice(0, 10)
      );

      if (!dataTorneo) {
        return null;
      }

      const oraInizio = window.prompt(
        "Ora inizio (HH:MM):",
        "09:00"
      );

      const postiText = window.prompt(
        "Numero posti:",
        "32"
      );

      const formula = window.prompt(
        "Formula:",
        "padel"
      );

      payload = {
        nome: nome.trim(),
        data: dataTorneo,
        data_torneo: dataTorneo,
        ora_inizio: oraInizio || null,
        posti: Number(postiText) || null,
        formula: formula || null,
        stato: "attivo",
        pubblicato: false,
        iscrizioni_chiuse: false
      };
    }

    const result =
      await client
        .from("tornei")
        .insert(payload)
        .select()
        .single();

    if (result.error) {
      console.error(
        "Errore creazione torneo:",
        result.error
      );

      throw result.error;
    }

    const torneo = result.data;

    adminState.tornei.push(torneo);
    adminState.torneoSelezionato = torneo;

    renderDashboard();
    renderTournamentConfig();

    return torneo;
  }

  async function eliminaTorneo(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    if (!id) {
      return false;
    }

    const torneo =
      adminState.tornei.find(function (item) {
        return String(item.id) === String(id);
      });

    const nome =
      getTournamentName(torneo);

    const conferma =
      window.confirm(
        'Eliminare definitivamente il torneo "' +
        nome +
        '"?'
      );

    if (!conferma) {
      return false;
    }

    const result =
      await client
        .from("tornei")
        .delete()
        .eq("id", id);

    if (result.error) {
      console.error(
        "Errore eliminazione torneo:",
        result.error
      );

      throw result.error;
    }

    adminState.tornei =
      adminState.tornei.filter(function (item) {
        return String(item.id) !== String(id);
      });

    if (
      adminState.torneoSelezionato &&
      String(adminState.torneoSelezionato.id) ===
        String(id)
    ) {
      adminState.torneoSelezionato =
        adminState.tornei[0] || null;

      adminState.iscrizioni = [];
      adminState.partecipanti = [];
      adminState.coppie = [];
      adminState.tabellone = [];
    }

    renderDashboard();
    renderTournamentConfig();
    renderIscritti();
    renderCoppie();
    renderTabellone();

    return true;
  }

  async function pubblicaTorneo(id, value) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const pubblicato =
      typeof value === "boolean"
        ? value
        : true;

    const result =
      await client
        .from("tornei")
        .update({
          pubblicato: pubblicato
        })
        .eq("id", id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    updateLocalTournament(result.data);

    renderDashboard();
    renderTournamentConfig();

    return result.data;
  }

  async function chiudiTorneo(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const result =
      await client
        .from("tornei")
        .update({
          iscrizioni_chiuse: true,
          stato: "chiuso"
        })
        .eq("id", id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    updateLocalTournament(result.data);

    renderDashboard();
    renderTournamentConfig();

    return result.data;
  }

  function updateLocalTournament(torneo) {
    if (!torneo) return;

    const index =
      adminState.tornei.findIndex(function (item) {
        return String(item.id) ===
          String(torneo.id);
      });

    if (index >= 0) {
      adminState.tornei[index] = torneo;
    } else {
      adminState.tornei.push(torneo);
    }

    if (
      adminState.torneoSelezionato &&
      String(adminState.torneoSelezionato.id) ===
        String(torneo.id)
    ) {
      adminState.torneoSelezionato = torneo;
    }
  }

  function selezionaTorneo(id) {
    const torneo =
      adminState.tornei.find(function (item) {
        return String(item.id) === String(id);
      });

    if (!torneo) {
      return null;
    }

    adminState.torneoSelezionato = torneo;

    adminState.iscrizioni = [];
    adminState.partecipanti = [];

    const config = getConfig(torneo);

    adminState.coppie =
      Array.isArray(config.coppie)
        ? config.coppie
        : [];

    adminState.tabellone =
      Array.isArray(config.tabellone)
        ? config.tabellone
        : [];

    renderDashboard();
    renderTournamentConfig();
    renderCoppie();
    renderTabellone();

    caricaIscrizioni();

    return torneo;
  }

  /*
   * ------------------------------------------------------------
   * ISCRIZIONI
   * ------------------------------------------------------------
   */

  async function caricaIscrizioni(torneoId) {
    const client = ensureClient();

    if (!client) {
      return [];
    }

    const id =
      torneoId ||
      getSelectedTournamentId();

    if (!id) {
      adminState.iscrizioni = [];
      adminState.partecipanti = [];
      renderIscritti();
      return [];
    }

    try {
      const result =
        await client
          .from("iscrizioni")
          .select("*")
          .eq("torneo_id", id)
          .order("created_at", {
            ascending: true
          });

      if (result.error) {
        throw result.error;
      }

      adminState.iscrizioni =
        Array.isArray(result.data)
          ? result.data
          : [];

      adminState.partecipanti =
        adminState.iscrizioni.filter(
          isApprovedRegistration
        );

      renderIscritti();
      renderDashboard();

      return adminState.iscrizioni;
    } catch (error) {
      console.error(
        "Errore caricaIscrizioni:",
        error
      );

      adminState.iscrizioni = [];
      adminState.partecipanti = [];

      renderIscritti(
        "Errore caricamento iscrizioni."
      );

      return [];
    }
  }

  function isApprovedRegistration(item) {
    if (!item) return false;

    return item.approvato === true ||
      text(item.stato).toLowerCase() ===
        "approvata";
  }

  async function cambiaStatoIscrizione(
    id,
    stato
  ) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const normalized =
      text(stato)
        .trim()
        .toLowerCase();

    const approved =
      normalized === "approvata" ||
      normalized === "approvato" ||
      normalized === "approved";

    const result =
      await client
        .from("iscrizioni")
        .update({
          stato: approved
            ? "approvata"
            : normalized,
          approvato: approved
        })
        .eq("id", id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    const index =
      adminState.iscrizioni.findIndex(
        function (item) {
          return String(item.id) === String(id);
        }
      );

    if (index >= 0) {
      adminState.iscrizioni[index] =
        result.data;
    }

    adminState.partecipanti =
      adminState.iscrizioni.filter(
        isApprovedRegistration
      );

    renderIscritti();
    renderDashboard();

    return result.data;
  }

  async function approvaIscrizione(id) {
    return cambiaStatoIscrizione(
      id,
      "approvata"
    );
  }

  async function rifiutaIscrizione(id) {
    return cambiaStatoIscrizione(
      id,
      "rifiutata"
    );
  }

  async function caricaPartecipanti(torneoId) {
    await caricaIscrizioni(
      torneoId ||
      getSelectedTournamentId()
    );

    adminState.partecipanti =
      adminState.iscrizioni.filter(
        isApprovedRegistration
      );

    renderIscritti();
    renderCoppie();
    renderDashboard();

    return adminState.partecipanti;
  }

  /*
   * ------------------------------------------------------------
   * COPPIE
   * ------------------------------------------------------------
   */

  function participantName(item) {
    if (!item) {
      return "Giocatore";
    }

    const nomeCompleto =
      [
        item.nome,
        item.cognome
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
      nomeCompleto ||
      item.nome_giocatore ||
      item.alias ||
      item.email ||
      "Giocatore"
    );
  }

  function createPair(player1, player2, index) {
    return {
      id:
        "coppia-" +
        Date.now() +
        "-" +
        index,
      numero: index + 1,
      giocatore1: {
        id: player1?.id || null,
        nome: participantName(player1),
        email: player1?.email || null,
        telefono: player1?.telefono || null
      },
      giocatore2: player2
        ? {
            id: player2?.id || null,
            nome: participantName(player2),
            email: player2?.email || null,
            telefono: player2?.telefono || null
          }
        : null
    };
  }

  function buildPairs(participants) {
    const list =
      Array.isArray(participants)
        ? participants.slice()
        : [];

    const pairs = [];

    for (
      let index = 0;
      index < list.length;
      index += 2
    ) {
      pairs.push(
        createPair(
          list[index],
          list[index + 1] || null,
          pairs.length
        )
      );
    }

    return pairs;
  }

  function shuffle(array) {
    const result =
      Array.isArray(array)
        ? array.slice()
        : [];

    for (
      let i = result.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      const temp = result[i];

      result[i] = result[j];
      result[j] = temp;
    }

    return result;
  }

  async function generaCoppie() {
    await caricaPartecipanti();

    if (!adminState.torneoSelezionato) {
      throw new Error(
        "Seleziona prima un torneo."
      );
    }

    const participants =
      adminState.partecipanti;

    if (!participants.length) {
      window.alert(
        "Non ci sono iscritti approvati."
      );

      adminState.coppie = [];

      renderCoppie();

      return [];
    }

    adminState.coppie =
      buildPairs(participants);

    adminState.tabellone =
      buildBracket(
        adminState.coppie
      );

    await salvaConfigurazioneTorneo();

    renderCoppie();
    renderTabellone();
    renderDashboard();

    return adminState.coppie;
  }

  async function generaCoppieLocali() {
    await caricaPartecipanti();

    if (!adminState.torneoSelezionato) {
      throw new Error(
        "Seleziona prima un torneo."
      );
    }

    const shuffled =
      shuffle(
        adminState.partecipanti
      );

    adminState.coppie =
      buildPairs(shuffled);

    adminState.tabellone =
      buildBracket(
        adminState.coppie
      );

    await salvaConfigurazioneTorneo();

    renderCoppie();
    renderTabellone();
    renderDashboard();

    return adminState.coppie;
  }

  async function salvaConfigurazioneTorneo() {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const torneo =
      adminState.torneoSelezionato;

    if (!torneo?.id) {
      throw new Error(
        "Nessun torneo selezionato."
      );
    }

    const configurazione =
      mergeConfig(torneo, {
        coppie: adminState.coppie,
        tabellone: adminState.tabellone
      });

    const result =
      await client
        .from("tornei")
        .update({
          configurazione:
            configurazione
        })
        .eq("id", torneo.id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    updateLocalTournament(
      result.data
    );

    return result.data;
  }

  /*
   * ------------------------------------------------------------
   * TABELLONE
   * ------------------------------------------------------------
   */

  function buildBracket(pairs) {
    const list =
      Array.isArray(pairs)
        ? pairs
        : [];

    if (!list.length) {
      return [];
    }

    const matches = [];

    for (
      let index = 0;
      index < list.length;
      index += 2
    ) {
      matches.push({
        id:
          "match-" +
          (index / 2 + 1),
        turno: 1,
        numero:
          index / 2 + 1,
        coppia1:
          list[index] || null,
        coppia2:
          list[index + 1] || null,
        risultato: null,
        vincitore: null
      });
    }

    return matches;
  }

  /*
   * ------------------------------------------------------------
   * NEWS
   * ------------------------------------------------------------
   */

  async function caricaNewsAdmin() {
    const client = ensureClient();

    if (!client) {
      return [];
    }

    try {
      const result =
        await client
          .from("news")
          .select("*")
          .order("created_at", {
            ascending: false
          });

      if (result.error) {
        throw result.error;
      }

      adminState.news =
        Array.isArray(result.data)
          ? result.data
          : [];

      renderNews();

      return adminState.news;
    } catch (error) {
      console.error(
        "Errore caricaNews:",
        error
      );

      adminState.news = [];

      renderNews(
        "Errore caricamento news."
      );

      return [];
    }
  }

  const caricaNews =
    caricaNewsAdmin;

  async function creaNews() {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const titolo =
      text(
        byId("titoloNews")?.value
      ).trim();

    const testo =
      text(
        byId("testoNews")?.value
      ).trim();

    if (!titolo) {
      window.alert(
        "Inserisci il titolo della news."
      );

      return null;
    }

    const result =
      await client
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

    const titoloInput =
      byId("titoloNews");

    const testoInput =
      byId("testoNews");

    if (titoloInput) {
      titoloInput.value = "";
    }

    if (testoInput) {
      testoInput.value = "";
    }

    await caricaNewsAdmin();

    return result.data;
  }

  async function modificaNews(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const news =
      adminState.news.find(function (item) {
        return String(item.id) ===
          String(id);
      });

    if (!news) {
      return null;
    }

    const titolo =
      window.prompt(
        "Titolo:",
        news.titolo || ""
      );

    if (titolo === null) {
      return null;
    }

    const testo =
      window.prompt(
        "Testo:",
        news.testo || ""
      );

    if (testo === null) {
      return null;
    }

    const result =
      await client
        .from("news")
        .update({
          titolo: titolo,
          testo: testo
        })
        .eq("id", id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    await caricaNewsAdmin();

    return result.data;
  }

  async function eliminaNews(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    if (
      !window.confirm(
        "Eliminare questa news?"
      )
    ) {
      return false;
    }

    const result =
      await client
        .from("news")
        .delete()
        .eq("id", id);

    if (result.error) {
      throw result.error;
    }

    await caricaNewsAdmin();

    return true;
  }
