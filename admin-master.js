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
    /*
   * ------------------------------------------------------------
   * SPONSOR
   * ------------------------------------------------------------
   */

  async function caricaSponsorAdmin() {
    const client = ensureClient();

    if (!client) {
      return [];
    }

    try {
      const result =
        await client
          .from("sponsor")
          .select("*")
          .order("created_at", {
            ascending: false
          });

      if (result.error) {
        throw result.error;
      }

      adminState.sponsor =
        Array.isArray(result.data)
          ? result.data
          : [];

      renderSponsor();

      return adminState.sponsor;
    } catch (error) {
      console.error(
        "Errore caricaSponsor:",
        error
      );

      adminState.sponsor = [];

      renderSponsor(
        "Errore caricamento sponsor."
      );

      return [];
    }
  }

  const caricaSponsor =
    caricaSponsorAdmin;

  async function creaSponsor() {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const nome =
      text(
        byId("nomeSponsor")?.value
      ).trim();

    const immagine =
      text(
        byId("logoSponsor")?.value
      ).trim();

    const link =
      text(
        byId("linkSponsor")?.value
      ).trim();

    if (!nome) {
      window.alert(
        "Inserisci il nome dello sponsor."
      );

      return null;
    }

    const result =
      await client
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

    const nomeInput =
      byId("nomeSponsor");

    const logoInput =
      byId("logoSponsor");

    const linkInput =
      byId("linkSponsor");

    if (nomeInput) {
      nomeInput.value = "";
    }

    if (logoInput) {
      logoInput.value = "";
    }

    if (linkInput) {
      linkInput.value = "";
    }

    await caricaSponsorAdmin();

    return result.data;
  }

  async function modificaSponsor(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    const sponsor =
      adminState.sponsor.find(function (item) {
        return String(item.id) ===
          String(id);
      });

    if (!sponsor) {
      return null;
    }

    const nome =
      window.prompt(
        "Nome sponsor:",
        sponsor.nome || ""
      );

    if (nome === null) {
      return null;
    }

    const immagine =
      window.prompt(
        "URL immagine/logo:",
        sponsor.immagine || ""
      );

    if (immagine === null) {
      return null;
    }

    const link =
      window.prompt(
        "Link:",
        sponsor.link || ""
      );

    if (link === null) {
      return null;
    }

    const result =
      await client
        .from("sponsor")
        .update({
          nome: nome,
          immagine: immagine || null,
          link: link || null
        })
        .eq("id", id)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    await caricaSponsorAdmin();

    return result.data;
  }

  async function eliminaSponsor(id) {
    const client = ensureClient();

    if (!client) {
      throw new Error(
        "Supabase non disponibile."
      );
    }

    if (
      !window.confirm(
        "Eliminare questo sponsor?"
      )
    ) {
      return false;
    }

    const result =
      await client
        .from("sponsor")
        .delete()
        .eq("id", id);

    if (result.error) {
      throw result.error;
    }

    await caricaSponsorAdmin();

    return true;
  }

  /*
   * ------------------------------------------------------------
   * CALENDARIO
   * ------------------------------------------------------------
   */

  function generaCalendario(torneo) {
    const selected =
      torneo ||
      adminState.torneoSelezionato;

    if (!selected) {
      return [];
    }

    const config =
      getConfig(selected);

    const calendario =
      Array.isArray(config.calendario)
        ? config.calendario
        : [];

    const container =
      byId("adminCalendar") ||
      byId("calendarioAdmin");

    if (container) {
      if (!calendario.length) {
        container.innerHTML =
          '<div class="empty-state">' +
          "Nessuna partita programmata." +
          "</div>";
      } else {
        container.innerHTML =
          calendario
            .map(function (item) {
              return (
                '<div class="match-card">' +
                "<strong>" +
                escapeHtml(
                  item.data || ""
                ) +
                "</strong>" +
                "<div>" +
                escapeHtml(
                  item.ora || ""
                ) +
                "</div>" +
                "</div>"
              );
            })
            .join("");
      }
    }

    return calendario;
  }

  const caricaCalendario =
    generaCalendario;

  const renderCalendario =
    generaCalendario;

  /*
   * ------------------------------------------------------------
   * WHATSAPP
   * ------------------------------------------------------------
   */

  function normalizePhone(phone) {
    return text(phone)
      .replace(/[^\d+]/g, "")
      .replace(/^\+/, "");
  }

  function getParticipantPhone(item) {
    if (!item) {
      return "";
    }

    return (
      item.telefono ||
      item.phone ||
      ""
    );
  }

  function inviaWhatsApp(
    messaggio,
    destinatari
  ) {
    const message =
      text(messaggio).trim();

    if (!message) {
      window.alert(
        "Inserisci un messaggio."
      );

      return false;
    }

    const recipients =
      Array.isArray(destinatari)
        ? destinatari
        : [];

    if (!recipients.length) {
      const url =
        "https://wa.me/?text=" +
        encodeURIComponent(message);

      window.open(
        url,
        "_blank",
        "noopener"
      );

      return true;
    }

    recipients.forEach(function (item) {
      const phone =
        normalizePhone(
          getParticipantPhone(item)
        );

      const url = phone
        ? "https://wa.me/" +
          phone +
          "?text=" +
          encodeURIComponent(message)
        : "https://wa.me/?text=" +
          encodeURIComponent(message);

      window.open(
        url,
        "_blank",
        "noopener"
      );
    });

    return true;
  }

  function getWhatsAppMessage() {
    return text(
      byId("messaggioWhatsApp")?.value
    ).trim();
  }

  function inviaWhatsAppTutti() {
    const message =
      getWhatsAppMessage();

    return inviaWhatsApp(
      message,
      adminState.iscrizioni
    );
  }

  function inviaWhatsAppApprovati() {
    const message =
      getWhatsAppMessage();

    return inviaWhatsApp(
      message,
      adminState.partecipanti
    );
  }

  /*
   * ------------------------------------------------------------
   * LINK PUBBLICO
   * ------------------------------------------------------------
   */

  function generaLink(torneoId) {
    const id =
      torneoId ||
      getSelectedTournamentId();

    if (!id) {
      window.alert(
        "Seleziona prima un torneo."
      );

      return "";
    }

    const origin =
      window.location.origin ||
      "";

    const url =
      origin +
      "/?torneo=" +
      encodeURIComponent(id);

    const input =
      byId("linkBoveGenerato");

    const mirror =
      byId("linkBoveGeneratoMirror");

    if (input) {
      input.value = url;
    }

    if (mirror) {
      mirror.value = url;
    }

    return url;
  }

  function generaLinkBoveMirror() {
    return generaLink(
      getSelectedTournamentId()
    );
  }

  async function copiaLink() {
    const input =
      byId("linkBoveGenerato");

    const url =
      text(
        input?.value
      ).trim() ||
      generaLinkBoveMirror();

    if (!url) {
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(
          url
        );
      } else {
        const temporary =
          document.createElement("textarea");

        temporary.value = url;

        document.body.appendChild(
          temporary
        );

        temporary.select();

        document.execCommand("copy");

        temporary.remove();
      }

      showMessage(
        "Link copiato.",
        "success"
      );

      return true;
    } catch (error) {
      console.error(
        "Errore copia link:",
        error
      );

      window.prompt(
        "Copia questo link:",
        url
      );

      return false;
    }
  }

  function apriLink() {
    const input =
      byId("linkBoveGenerato");

    const url =
      text(
        input?.value
      ).trim() ||
      generaLinkBoveMirror();

    if (!url) {
      return false;
    }

    window.open(
      url,
      "_blank",
      "noopener"
    );

    return true;
  }

  function apriBoveConTorneo(id) {
    const url =
      generaLink(
        id ||
        getSelectedTournamentId()
      );

    if (!url) {
      return false;
    }

    window.open(
      url,
      "_blank",
      "noopener"
    );

    return true;
  }

  /*
   * ------------------------------------------------------------
   * RENDER DASHBOARD
   * ------------------------------------------------------------
   */

  function renderDashboard(errorMessage) {
    const statTornei =
      byId("statTornei");

    const statIscritti =
      byId("statIscritti");

    const statCoppie =
      byId("statCoppie");

    const statStato =
      byId("statStato");

    if (statTornei) {
      statTornei.textContent =
        String(
          adminState.tornei.length
        );
    }

    if (statIscritti) {
      statIscritti.textContent =
        String(
          adminState.iscrizioni.length
        );
    }

    if (statCoppie) {
      statCoppie.textContent =
        String(
          adminState.coppie.length
        );
    }

    if (statStato) {
      const torneo =
        adminState.torneoSelezionato;

      statStato.textContent =
        torneo
          ? (
              torneo.stato ||
              (
                torneo.pubblicato
                  ? "pubblicato"
                  : "non pubblicato"
              )
            )
          : "—";
    }

    const container =
      byId("listaTorneiAdmin");

    if (!container) {
      return;
    }

    if (errorMessage) {
      container.innerHTML =
        '<div class="empty-state">' +
        escapeHtml(errorMessage) +
        "</div>";

      return;
    }

    if (!adminState.tornei.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessun torneo presente." +
        "</div>";

      return;
    }

    container.innerHTML =
      adminState.tornei
        .map(function (torneo) {
          const selected =
            adminState.torneoSelezionato &&
            String(
              adminState.torneoSelezionato.id
            ) ===
              String(torneo.id);

          const date =
            normalizeTournamentDate(
              torneo
            );

          const stato =
            torneo.stato ||
            (
              torneo.pubblicato
                ? "pubblicato"
                : "bozza"
            );

          return (
            '<div class="admin-list-item">' +

            "<strong>" +
            escapeHtml(
              getTournamentName(
                torneo
              )
            ) +
            "</strong>" +

            "<div>" +
            escapeHtml(
              formatDate(date)
            ) +
            (
              torneo.ora_inizio
                ? " — " +
                  escapeHtml(
                    formatTime(
                      torneo.ora_inizio
                    )
                  )
                : ""
            ) +
            "</div>" +

            "<div style=\"margin-top:6px;\">" +

            '<span class="badge ' +
            (
              torneo.pubblicato
                ? "ok"
                : "wait"
            ) +
            '">' +
            escapeHtml(
              stato
            ) +
            "</span>" +

            (
              torneo.iscrizioni_chiuse
                ? ' <span class="badge no">Iscrizioni chiuse</span>'
                : ""
            ) +

            "</div>" +

            '<div class="admin-list-actions">' +

            '<button type="button" class="admin-btn" ' +
            'data-action="select-torneo" ' +
            'data-id="' +
            escapeHtml(
              torneo.id
            ) +
            '">' +
            (
              selected
                ? "Selezionato"
                : "Seleziona"
            ) +
            "</button>" +

            '<button type="button" class="admin-btn secondary" ' +
            'data-action="pubblica-torneo" ' +
            'data-id="' +
            escapeHtml(
              torneo.id
            ) +
            '">' +
            (
              torneo.pubblicato
                ? "Rendi bozza"
                : "Pubblica"
            ) +
            "</button>" +

            '<button type="button" class="admin-btn warning" ' +
            'data-action="chiudi-torneo" ' +
            'data-id="' +
            escapeHtml(
              torneo.id
            ) +
            '">' +
            "Chiudi iscrizioni" +
            "</button>" +

            '<button type="button" class="admin-btn danger" ' +
            'data-action="elimina-torneo" ' +
            'data-id="' +
            escapeHtml(
              torneo.id
            ) +
            '">' +
            "Elimina" +
            "</button>" +

            "</div>" +
            "</div>"
          );
        })
        .join("");

    container
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          async function () {
            const action =
              button.dataset.action;

            const id =
              button.dataset.id;

            try {
              if (
                action ===
                "select-torneo"
              ) {
                selezionaTorneo(id);
              }

              if (
                action ===
                "pubblica-torneo"
              ) {
                const torneo =
                  adminState.tornei.find(
                    function (item) {
                      return String(
                        item.id
                      ) ===
                        String(id);
                    }
                  );

                await pubblicaTorneo(
                  id,
                  !torneo?.pubblicato
                );
              }

              if (
                action ===
                "chiudi-torneo"
              ) {
                await chiudiTorneo(
                  id
                );
              }

              if (
                action ===
                "elimina-torneo"
              ) {
                await eliminaTorneo(
                  id
                );
              }
            } catch (error) {
              console.error(
                error
              );

              window.alert(
                error?.message ||
                "Operazione non riuscita."
              );
            }
          }
        );
      });
  }

  /*
   * ------------------------------------------------------------
   * RENDER CONFIGURAZIONE
   * ------------------------------------------------------------
   */

  function renderTournamentConfig() {
    const container =
      byId("configTorneoAdmin");

    if (!container) {
      return;
    }

    const torneo =
      adminState.torneoSelezionato;

    if (!torneo) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Seleziona un torneo." +
        "</div>";

      return;
    }

    const config =
      getConfig(torneo);

    container.innerHTML =
      "<div>" +

      "<p><strong>Nome:</strong> " +
      escapeHtml(
        getTournamentName(
          torneo
        )
      ) +
      "</p>" +

      "<p><strong>Data:</strong> " +
      escapeHtml(
        formatDate(
          normalizeTournamentDate(
            torneo
          )
        )
      ) +
      "</p>" +

      "<p><strong>Ora:</strong> " +
      escapeHtml(
        formatTime(
          torneo.ora_inizio
        ) || "—"
      ) +
      "</p>" +

      "<p><strong>Posti:</strong> " +
      escapeHtml(
        torneo.posti ??
        "—"
      ) +
      "</p>" +

      "<p><strong>Formula:</strong> " +
      escapeHtml(
        torneo.formula ||
        "—"
      ) +
      "</p>" +

      "<p><strong>Pubblicato:</strong> " +
      (
        torneo.pubblicato
          ? "Sì"
          : "No"
      ) +
      "</p>" +

      "<p><strong>Iscrizioni chiuse:</strong> " +
      (
        torneo.iscrizioni_chiuse
          ? "Sì"
          : "No"
      ) +
      "</p>" +

      "<p><strong>Coppie salvate:</strong> " +
      String(
        Array.isArray(
          config.coppie
        )
          ? config.coppie.length
          : 0
      ) +
      "</p>" +

      "</div>";
  }

  /*
   * ------------------------------------------------------------
   * RENDER ISCRITTI
   * ------------------------------------------------------------
   */

  function renderIscritti(errorMessage) {
    const container =
      byId("listaIscrittiAdmin");

    if (!container) {
      return;
    }

    if (errorMessage) {
      container.innerHTML =
        '<div class="empty-state">' +
        escapeHtml(errorMessage) +
        "</div>";

      return;
    }

    if (!adminState.torneoSelezionato) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Seleziona un torneo." +
        "</div>";

      return;
    }

    if (!adminState.iscrizioni.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessuna iscrizione per questo torneo." +
        "</div>";

      return;
    }

    const rows =
      adminState.iscrizioni
        .map(function (item) {
          const approved =
            isApprovedRegistration(
              item
            );

          const stato =
            item.stato ||
            (
              approved
                ? "approvata"
                : "richiesta"
            );

          return (
            "<tr>" +

            "<td>" +
            escapeHtml(
              participantName(
                item
              )
            ) +
            "</td>" +

            "<td>" +
            escapeHtml(
              item.email ||
              item.email_giocatore ||
              "—"
            ) +
            "</td>" +

            "<td>" +
            escapeHtml(
              item.telefono ||
              "—"
            ) +
            "</td>" +

            "<td>" +
            escapeHtml(
              item.livello ||
              item.categoria ||
              "—"
            ) +
            "</td>" +

            "<td>" +

            '<span class="badge ' +
            (
              approved
                ? "ok"
                : (
                    stato === "rifiutata"
                      ? "no"
                      : "wait"
                  )
            ) +
            '">' +
            escapeHtml(
              stato
            ) +
            "</span>" +

            "</td>" +

            "<td>" +

            (
              approved
                ? (
                  '<button type="button" class="admin-btn danger" ' +
                  'data-action="reject-iscrizione" ' +
                  'data-id="' +
                  escapeHtml(
                    item.id
                  ) +
                  '">' +
                  "Rifiuta" +
                  "</button>"
                )
                : (
                  '<button type="button" class="admin-btn success" ' +
                  'data-action="approve-iscrizione" ' +
                  'data-id="' +
                  escapeHtml(
                    item.id
                  ) +
                  '">' +
                  "Approva" +
                  "</button>"
                )
            ) +

            "</td>" +

            "</tr>"
          );
        })
        .join("");

    container.innerHTML =
      '<div class="admin-table-wrap">' +
      "<table>" +

      "<thead>" +
      "<tr>" +
      "<th>Giocatore</th>" +
      "<th>Email</th>" +
      "<th>Telefono</th>" +
      "<th>Livello</th>" +
      "<th>Stato</th>" +
      "<th>Azioni</th>" +
      "</tr>" +
      "</thead>" +

      "<tbody>" +
      rows +
      "</tbody>" +

      "</table>" +
      "</div>";

    container
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          async function () {
            try {
              if (
                button.dataset.action ===
                "approve-iscrizione"
              ) {
                await approvaIscrizione(
                  button.dataset.id
                );
              }

              if (
                button.dataset.action ===
                "reject-iscrizione"
              ) {
                await rifiutaIscrizione(
                  button.dataset.id
                );
              }
            } catch (error) {
              console.error(
                error
              );

              window.alert(
                error?.message ||
                "Operazione non riuscita."
              );
            }
          }
        );
      });
  }

  /*
   * ------------------------------------------------------------
   * RENDER COPPIE
   * ------------------------------------------------------------
   */

  function renderCoppie() {
    const container =
      byId("coppieAdmin");

    if (!container) {
      return;
    }

    if (!adminState.coppie.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessuna coppia generata." +
        "</div>";

      return;
    }

    container.innerHTML =
      '<div class="pair-grid">' +

      adminState.coppie
        .map(function (pair, index) {
          const first =
            pair.giocatore1?.nome ||
            "Giocatore 1";

          const second =
            pair.giocatore2?.nome ||
            "Da assegnare";

          return (
            '<div class="pair-card">' +

            "<h4>Coppia " +
            String(
              pair.numero ||
              index + 1
            ) +
            "</h4>" +

            "<div>1. " +
            escapeHtml(
              first
            ) +
            "</div>" +

            "<div>2. " +
            escapeHtml(
              second
            ) +
            "</div>" +

            "</div>"
          );
        })
        .join("") +

      "</div>";
  }

  /*
   * ------------------------------------------------------------
   * RENDER TABELLONE
   * ------------------------------------------------------------
   */

  function renderTabellone() {
    const container =
      byId("tabelloneAdmin");

    if (!container) {
      return;
    }

    if (!adminState.tabellone.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessun tabellone generato." +
        "</div>";

      return;
    }

    container.innerHTML =
      '<div class="bracket-grid">' +

      adminState.tabellone
        .map(function (match) {
          const first =
            match.coppia1
              ? (
                "Coppia " +
                (
                  match.coppia1.numero ||
                  "?"
                )
              )
              : "—";

          const second =
            match.coppia2
              ? (
                "Coppia " +
                (
                  match.coppia2.numero ||
                  "?"
                )
              )
              : "—";

          return (
            '<div class="match-card">' +

            "<h4>Match " +
            escapeHtml(
              match.numero ||
              ""
            ) +
            "</h4>" +

            "<div>" +
            escapeHtml(
              first
            ) +
            "</div>" +

            "<div>" +
            escapeHtml(
              second
            ) +
            "</div>" +

            (
              match.vincitore
                ? (
                  "<div style=\"margin-top:8px;\">" +
                  "<strong>Vincitore:</strong> " +
                  escapeHtml(
                    match.vincitore
                  ) +
                  "</div>"
                )
                : ""
            ) +

            "</div>"
          );
        })
        .join("") +

      "</div>";
  }

  /*
   * ------------------------------------------------------------
   * RENDER NEWS
   * ------------------------------------------------------------
   */

  function renderNews(errorMessage) {
    const container =
      byId("newsPanel");

    if (!container) {
      return;
    }

    if (errorMessage) {
      container.innerHTML =
        '<div class="empty-state">' +
        escapeHtml(errorMessage) +
        "</div>";

      return;
    }

    if (!adminState.news.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessuna news presente." +
        "</div>";

      return;
    }

    container.innerHTML =
      '<div class="cards-list">' +

      adminState.news
        .map(function (news) {
          return (
            '<div class="admin-list-item">' +

            "<strong>" +
            escapeHtml(
              news.titolo ||
              "Senza titolo"
            ) +
            "</strong>" +

            "<div>" +
            escapeHtml(
              news.testo ||
              ""
            ) +
            "</div>" +

            "<div class=\"admin-list-actions\">" +

            '<button type="button" class="admin-btn secondary" ' +
            'data-action="edit-news" ' +
            'data-id="' +
            escapeHtml(
              news.id
            ) +
            '">' +
            "Modifica" +
            "</button>" +

            '<button type="button" class="admin-btn danger" ' +
            'data-action="delete-news" ' +
            'data-id="' +
            escapeHtml(
              news.id
            ) +
            '">' +
            "Elimina" +
            "</button>" +

            "</div>" +

            "</div>"
          );
        })
        .join("") +

      "</div>";

    container
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          async function () {
            try {
              if (
                button.dataset.action ===
                "edit-news"
              ) {
                await modificaNews(
                  button.dataset.id
                );
              }

              if (
                button.dataset.action ===
                "delete-news"
              ) {
                await eliminaNews(
                  button.dataset.id
                );
              }
            } catch (error) {
              console.error(
                error
              );

              window.alert(
                error?.message ||
                "Operazione non riuscita."
              );
            }
          }
        );
      });
  }

  /*
   * ------------------------------------------------------------
   * RENDER SPONSOR
   * ------------------------------------------------------------
   */

  function renderSponsor(errorMessage) {
    const container =
      byId("sponsorPanel");

    if (!container) {
      return;
    }

    if (errorMessage) {
      container.innerHTML =
        '<div class="empty-state">' +
        escapeHtml(errorMessage) +
        "</div>";

      return;
    }

    if (!adminState.sponsor.length) {
      container.innerHTML =
        '<div class="empty-state">' +
        "Nessuno sponsor presente." +
        "</div>";

      return;
    }

    container.innerHTML =
      '<div class="cards-list">' +

      adminState.sponsor
        .map(function (sponsor) {
          const image =
            sponsor.immagine || "";

          const link =
            sponsor.link || "";

          return (
            '<div class="admin-list-item">' +

            "<strong>" +
            escapeHtml(
              sponsor.nome ||
              "Sponsor"
            ) +
            "</strong>" +

            (
              image
                ? (
                  '<div style="margin-top:8px;">' +
                  '<img src="' +
                  escapeHtml(
                    image
                  ) +
                  '" alt="' +
                  escapeHtml(
                    sponsor.nome ||
                    "Sponsor"
                  ) +
                  '" style="max-width:180px;max-height:80px;object-fit:contain;">' +
                  "</div>"
                )
                : ""
            ) +

            (
              link
                ? (
                  '<div style="margin-top:8px;">' +
                  '<a href="' +
                  escapeHtml(
                    link
                  ) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  escapeHtml(
                    link
                  ) +
                  "</a>" +
                  "</div>"
                )
                : ""
            ) +

            '<div class="admin-list-actions">' +

            '<button type="button" class="admin-btn secondary" ' +
            'data-action="edit-sponsor" ' +
            'data-id="' +
            escapeHtml(
              sponsor.id
            ) +
            '">' +
            "Modifica" +
            "</button>" +

            '<button type="button" class="admin-btn danger" ' +
            'data-action="delete-sponsor" ' +
            'data-id="' +
            escapeHtml(
              sponsor.id
            ) +
            '">' +
            "Elimina" +
            "</button>" +

            "</div>" +

            "</div>"
          );
        })
        .join("") +

      "</div>";

    container
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          async function () {
            try {
              if (
                button.dataset.action ===
                "edit-sponsor"
              ) {
                await modificaSponsor(
                  button.dataset.id
                );
              }

              if (
                button.dataset.action ===
                "delete-sponsor"
              ) {
                await eliminaSponsor(
                  button.dataset.id
                );
              }
            } catch (error) {
              console.error(
                error
              );

              window.alert(
                error?.message ||
                "Operazione non riuscita."
              );
            }
          }
        );
      });
  }

  /*
   * ------------------------------------------------------------
   * REFRESH COMPLETO
   * ------------------------------------------------------------
   */

  async function refreshAdmin() {
    const client = ensureClient();

    if (!client) {
      return false;
    }

    adminState.loading = true;

    try {
      await caricaTorneiAdmin();
      await caricaNewsAdmin();
      await caricaSponsorAdmin();

      if (
        adminState.torneoSelezionato
      ) {
        await caricaIscrizioni(
          adminState.torneoSelezionato.id
        );
      }

      renderCoppie();
      renderTabellone();
      renderTournamentConfig();
      renderDashboard();

      adminState.initialized = true;

      return true;
    } catch (error) {
      console.error(
        "Errore refresh admin:",
        error
      );

      return false;
    } finally {
      adminState.loading = false;
    }
  }

  const avviaDatiAdmin =
    refreshAdmin;

  /*
   * ------------------------------------------------------------
   * PULSANTI ADMIN
   * ------------------------------------------------------------
   */

  async function adminButtonAction(
    action
  ) {
    try {
      if (action === "generate") {
        return await generaCoppie();
      }

      if (action === "random") {
        return await generaCoppieLocali();
      }

      return null;
    } catch (error) {
      console.error(
        "Errore pulsante admin:",
        error
      );

      window.alert(
        error?.message ||
        "Operazione non riuscita."
      );

      return null;
    }
  }

  /*
   * ------------------------------------------------------------
   * NUOVO TORNEO
   * ------------------------------------------------------------
   */

  function apriRegoleNuovoTorneo() {
    const conferma =
      window.confirm(
        "Vuoi creare un nuovo torneo?"
      );

    if (!conferma) {
      return null;
    }

    return creaTorneo();
  }

  /*
   * ------------------------------------------------------------
   * EVENTI AUTH
   * ------------------------------------------------------------
   */

  async function installAuthListener() {
    const client =
      ensureClient();

    if (!client?.auth) {
      return;
    }

    client.auth.onAuthStateChange(
      async function (event, session) {
        console.log(
          "[Padel Admin] Auth event:",
          event
        );

        if (
          event ===
            "SIGNED_IN" &&
          session?.user
        ) {
          showApp(
            session.user
          );

          if (
            !adminState.initialized
          ) {
            await refreshAdmin();
          }
        }

        if (
          event ===
          "SIGNED_OUT"
        ) {
          showLogin();
        }
      }
    );
  }

  /*
   * ------------------------------------------------------------
   * API PUBBLICA
   * ------------------------------------------------------------
   *
   * Tutte le funzioni vengono esposte esplicitamente su window
   * per compatibilità con admin.html e admin-test.js.
   */

  window.loginAdmin =
    loginAdmin;

  window.logoutAdmin =
    logoutAdmin;

  window.avviaAdmin =
    avviaAdmin;

  window.caricaTorneiAdmin =
    caricaTorneiAdmin;

  window.caricaTornei =
    caricaTornei;

  window.creaTorneo =
    creaTorneo;

  window.eliminaTorneo =
    eliminaTorneo;

  window.pubblicaTorneo =
    pubblicaTorneo;

  window.chiudiTorneo =
    chiudiTorneo;

  window.cambiaStatoIscrizione =
    cambiaStatoIscrizione;

  window.caricaIscrizioni =
    caricaIscrizioni;

  window.approvaIscrizione =
    approvaIscrizione;

  window.rifiutaIscrizione =
    rifiutaIscrizione;

  window.caricaPartecipanti =
    caricaPartecipanti;

  window.generaCoppie =
    generaCoppie;

  window.generaCoppieLocali =
    generaCoppieLocali;

  window.salvaConfigurazioneTorneo =
    salvaConfigurazioneTorneo;

  window.inviaWhatsApp =
    inviaWhatsApp;

  window.inviaWhatsAppTutti =
    inviaWhatsAppTutti;

  window.inviaWhatsAppApprovati =
    inviaWhatsAppApprovati;

  window.caricaNewsAdmin =
    caricaNewsAdmin;

  window.caricaNews =
    caricaNews;

  window.creaNews =
    creaNews;

  window.creaNewsAdmin =
    creaNews;

  window.modificaNews =
    modificaNews;

  window.eliminaNews =
    eliminaNews;

  window.caricaSponsorAdmin =
    caricaSponsorAdmin;

  window.caricaSponsor =
    caricaSponsor;

  window.creaSponsor =
    creaSponsor;

  window.creaSponsorAdmin =
    creaSponsor;

  window.modificaSponsor =
    modificaSponsor;

  window.eliminaSponsor =
    eliminaSponsor;

  window.caricaCalendario =
    caricaCalendario;

  window.generaCalendario =
    generaCalendario;

  window.renderCalendario =
    renderCalendario;

  window.generaLink =
    generaLink;

  window.generaLinkBoveMirror =
    generaLinkBoveMirror;

  window.copiaLink =
    copiaLink;

  window.copiaLinkBove =
    copiaLink;

  window.apriLink =
    apriLink;

  window.apriLinkBove =
    apriLink;

  window.apriBoveConTorneo =
    apriBoveConTorneo;

  window.renderCoppie =
    renderCoppie;

  window.renderTabellone =
    renderTabellone;

  window.renderNews =
    renderNews;

  window.renderSponsor =
    renderSponsor;

  window.apriRegoleNuovoTorneo =
    apriRegoleNuovoTorneo;

  window.__adminRefresh =
    refreshAdmin;

  window.__adminButtonAction =
    adminButtonAction;

  /*
   * ------------------------------------------------------------
   * AVVIO
   * ------------------------------------------------------------
   */

  async function boot() {
    console.log(
      "[Padel Admin] admin-master.js v" +
      ADMIN_MASTER_VERSION +
      " avvio..."
    );

    const client =
      await waitForSupabase(
        12000
      );

    if (!client) {
      console.error(
        "[Padel Admin] Supabase non disponibile."
      );

      showLogin();

      setLoginMessage(
        "Supabase non disponibile."
      );

      return;
    }

    window._supabase =
      client;

    window.sb =
      client;

    window.supabaseClient =
      client;

    await installAuthListener();

    await avviaAdmin();

    console.log(
      "[Padel Admin] admin-master.js v" +
      ADMIN_MASTER_VERSION +
      " pronto."
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }

})();
