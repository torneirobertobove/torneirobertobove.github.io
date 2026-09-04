/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED SCRIPT (1/5)
   Core Setup, Supabase Client, Admin State & Tournament Management
   ========================================================================== */
(() => {
  'use strict';

  // 1. Inizializzazione Supabase e Stato Globale
  const sb = window.supabase?.createClient(
    "https://iybjvtmfaupgthqqsngd.supabase.co",
    "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );

  window.sb = sb;
  window.supabaseClient = sb;

  let adminState = {
    adminLoggato: false,
    adminEmail: "",
    torneoSelezionato: null,
    tornei: [],
    sponsor: [],
    news: []
  };

  const ADMIN_STORAGE = "padel_admin_state";
  window.iscrizioniTorneo = [];
  window.giocatoreSelezionatoCorrente = null;
  const STORAGE_LINK = 'padel_admin_generated_link';

  function salvaAdminState() {
    try { localStorage.setItem(ADMIN_STORAGE, JSON.stringify(adminState)); }
    catch (e) { console.error("Errore salvataggio stato admin:", e); }
  }

  function caricaAdminState() {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE);
      if (!raw) return;
      adminState = { ...adminState, ...JSON.parse(raw) };
      if (!Array.isArray(adminState.tornei)) adminState.tornei = [];
      if (!Array.isArray(adminState.sponsor)) adminState.sponsor = [];
      if (!Array.isArray(adminState.news)) adminState.news = [];
    } catch (e) { console.error("Errore caricamento stato admin:", e); }
  }
  window.caricaAdminState = caricaAdminState;
  window.adminState = adminState;

  function getTorneoAdminCorrente() {
    if (!Array.isArray(adminState.tornei)) return null;
    return adminState.tornei.find(t => String(t.id) === String(adminState.torneoSelezionato)) || null;
  }
  window.getTorneoAdminCorrente = getTorneoAdminCorrente;

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }
  window.escapeHtml = escapeHtml;

  function errorText(e) { return e?.message || e?.error_description || String(e || 'Operazione non riuscita'); }
  function report(label, e) { console.error('[ADMIN]', label, e); alert(label + ': ' + errorText(e)); }

  // 2. Utility e Link Bove
  function creaUrlBove(t, apriRegole = false) {
    if (!t?.id) return "";
    if (String(t.id).startsWith("temp_")) {
      const payload = encodeURIComponent(JSON.stringify(t));
      return "Bove.html?torneo=" + payload + (apriRegole ? "&apriRegole=true" : "");
    }
    const id = encodeURIComponent(String(t.id));
    return "Bove.html?idTorneo=" + id + (apriRegole ? "&apriRegole=true" : "");
  }
  window.creaUrlBove = creaUrlBove;

  function buildTournamentLink(id) {
    return location.origin + location.pathname.replace(/[^/]*$/, '') + 'Bove.html?idTorneo=' + encodeURIComponent(String(id));
  }

  function applyGeneratedLink(v) {
    if (!v) return;
    const a = document.getElementById('linkBoveGenerato');
    const b = document.getElementById('linkBoveGeneratoMirror');
    if (a) a.value = v;
    if (b) b.value = v;
  }

  window.generaLinkPerId = function (id) {
    if (id === undefined || id === null || String(id).trim() === '') { alert('Seleziona prima un torneo'); return false; }
    adminState.torneoSelezionato = id;
    salvaAdminState();
    const v = buildTournamentLink(id);
    try { localStorage.setItem(STORAGE_LINK, v); } catch {}
    applyGeneratedLink(v);
    [0, 150, 500].forEach(ms => setTimeout(() => applyGeneratedLink(v), ms));
    return v;
  };

  window.generaLinkBove = function () {
    const id = adminState?.torneoSelezionato;
    return id == null ? (alert('Seleziona prima un torneo'), false) : window.generaLinkPerId(id);
  };

  window.copiaLinkBove = async function () {
    let v = document.getElementById('linkBoveGenerato')?.value || document.getElementById('linkBoveGeneratoMirror')?.value || '';
    if (!v) try { v = localStorage.getItem(STORAGE_LINK) || ''; } catch {}
    if (!v && adminState?.torneoSelezionato != null) {
      window.generaLinkPerId(adminState.torneoSelezionato);
      try { v = localStorage.getItem(STORAGE_LINK) || ''; } catch {}
    }
    if (!v) { alert('Seleziona prima un torneo e genera il link.'); return false; }
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(v);
      else {
        const ta = document.createElement('textarea');
        ta.value = v; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        if (!document.execCommand('copy')) throw Error('Copia non disponibile');
        ta.remove();
      }
      alert('Link copiato negli appunti!');
      return true;
    } catch (e) {
      const i = document.getElementById('linkBoveGenerato') || document.getElementById('linkBoveGeneratoMirror');
      if (i) { i.value = v; i.focus(); i.select(); }
      alert('Il link è pronto: selezionalo e copialo manualmente.');
      return false;
    }
  };

  window.apriBoveConTorneo = function (id) {
    if (id === undefined || id === null || String(id).trim() === '') { alert('Seleziona prima un torneo'); return false; }
    const u = 'Bove.html?idTorneo=' + encodeURIComponent(String(id)), w = window.open(u, '_blank', 'noopener');
    if (!w) window.location.href = u;
    return true;
  };

  // 3. Chiamate Supabase Tornei & Login
  async function caricaTorneiSupabase() {
    try {
      const { data, error } = await sb.from("tornei").select("*").order("id", { ascending: false });
      if (error) throw error;
      if (Array.isArray(data)) adminState.tornei = data;
      salvaAdminState();
      window.renderAdmin?.();
      window.__adminDesktopRender?.();
    } catch (e) { console.error("Errore caricamento tornei Supabase:", e); }
  }
  window.caricaTorneiSupabase = caricaTorneiSupabase;

  async function loginAdmin() {
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      const session = data?.session;
      if (!session) {
        const email = document.getElementById("adminEmail")?.value?.trim();
        const password = document.getElementById("adminPassword")?.value || "";
        if (!email || !password) { mostraLoginMessaggio("Inserisci email e password.", "#ff6678"); return; }
        const result = await sb.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
      }
      const session2 = (await sb.auth.getSession()).data.session;
      adminState.adminLoggato = true;
      adminState.adminEmail = session2?.user?.email || "Admin";
      salvaAdminState();
      document.getElementById("boxLoginAdmin")?.classList.add("hidden");
      document.getElementById("areaAdmin")?.classList.remove("hidden");
      await caricaTorneiSupabase();
      await caricaRichiesteIscrizione();
      window.renderAdmin?.();
    } catch (e) {
      console.error("Errore login:", e);
      mostraLoginMessaggio(e?.message || "Accesso non riuscito.", "#ff6678");
    }
  }
  window.loginAdmin = loginAdmin;

  function mostraLoginMessaggio(testo, colore) {
    const box = document.getElementById("loginMessaggio");
    if (box) { box.textContent = testo; box.style.color = colore || "inherit"; }
  }

  window.apriRegoleNuovoTorneo = function () {
    const nome = document.getElementById("adminNomeTorneo")?.value.trim() || "Nuovo Torneo";
    const data = document.getElementById("adminDataTorneo")?.value || "";
    const posti = Number(document.getElementById("adminPosti")?.value) || 8;
    const descrizione = document.getElementById("adminDescrizione")?.value.trim() || "";
    const tempId = "temp_" + Date.now();
    const torneoTemp = { id: tempId, nome, data, posti, descrizione, formula: "", stato: "bozza", iscritti: [], coppie: [], partecipanti: [], configurazione: { rules: { numeroSquadre: posti, numeroGironi: Math.ceil(posti / 4), squadrePerGirone: 4 } } };
    adminState.tornei.push(torneoTemp);
    adminState.torneoSelezionato = tempId;
    salvaAdminState();
    window.open(creaUrlBove(torneoTemp, true), "_blank");
  };

  window.creaNuovoTorneo = async function () {
    const nome = document.getElementById("adminNomeTorneo")?.value.trim() || "Nuovo Torneo";
    const data = document.getElementById("adminDataTorneo")?.value || "";
    const posti = Number(document.getElementById("adminPosti")?.value) || 8;
    const descrizione = document.getElementById("adminDescrizione")?.value.trim() || "";
    if (!data) { alert('Inserisci la data del torneo.'); return false; }
    const nuovoId = Date.now();
    const numeroGironi = Math.ceil(posti / 4);
    const configurazione = { coppie: [], partecipanti: [], rules: { numeroSquadre: posti, numeroGironi, squadrePerGirone: 4 } };
    const nuovoTorneo = { id: nuovoId, nome, data, posti, descrizione, formula: "", stato: "bozza", iscritti: [], coppie: [], partecipanti: [], configurazione };
    adminState.tornei = adminState.tornei.filter(t => !String(t.id).startsWith("temp_"));
    adminState.tornei.push(nuovoTorneo);
    adminState.torneoSelezionato = nuovoId;
    salvaAdminState();
    try {
      const { error } = await sb.from("tornei").insert({
        id: nuovoId, nome, data, data_torneo: data, ora_inizio: null, posti, descrizione,
        formula: null, stato: "bozza", pubblicato: false, iscrizioni_chiuse: false, configurazione
      });
      if (error) throw error;
      window.renderAdmin?.();
      window.__adminDesktopRender?.();
      window.open('Bove.html?idTorneo=' + encodeURIComponent(nuovoId) + '&apriRegole=true', '_blank');
      return true;
    } catch (e) {
      report('Creazione torneo non riuscita', e);
      return false;
    }
  };

  window.eliminaTorneoAdmin = async function (id) {
    if (!confirm("Vuoi davvero eliminare questo torneo?")) return;
    const { error } = await sb.from("tornei").delete().eq("id", id);
    if (error) { alert("Errore eliminazione torneo"); console.error(error); return; }
    adminState.tornei = adminState.tornei.filter(t => String(t.id) !== String(id));
    if (String(adminState.torneoSelezionato) === String(id)) adminState.torneoSelezionato = null;
    salvaAdminState();
    window.renderAdmin?.();
    window.__adminDesktopRender?.();
  };

  window.pubblicaTorneo = async function () {
    const t = getTorneoAdminCorrente();
    if (!t) { alert("Seleziona prima un torneo"); return; }
    const { error } = await sb.from("tornei").update({ pubblicato: true, stato: "attivo" }).eq("id", t.id);
    if (error) { alert("Errore pubblicazione torneo"); return; }
    t.pubblicato = true; t.stato = "attivo"; salvaAdminState(); window.renderAdmin?.(); alert("Torneo pubblicato con successo!");
  };

  window.chiudiIscrizioniTorneo = async function () {
    const t = getTorneoAdminCorrente();
    if (!t) { alert("Seleziona prima un torneo"); return; }
    const { error } = await sb.from("tornei").update({ iscrizioni_chiuse: true }).eq("id", t.id);
    if (error) { alert("Errore chiusura iscrizioni"); return; }
    t.iscrizioni_chiuse = true; salvaAdminState(); window.renderAdmin?.(); alert("Iscrizioni chiuse.");
  };
})();
/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED SCRIPT (2/5)
   Registrations, Participants, Pair Creation & WhatsApp Integration
   ========================================================================== */
(() => {
  'use strict';

  async function caricaRichiesteIscrizione() {
    const id = Number(window.adminState?.torneoSelezionato);
    if (!Number.isFinite(id) || id <= 0) {
      window.iscrizioniTorneo = [];
      window.renderGestioneTorneo?.();
      window.renderPartecipanti?.();
      window.renderCoppie?.();
      return true;
    }
    try {
      const { data, error } = await window.sb.from('iscrizioni').select('*').eq('torneo_id', id);
      if (error) throw error;
      window.iscrizioniTorneo = Array.isArray(data) ? data : [];
      window.renderGestioneTorneo?.();
      window.renderPartecipanti?.();
      window.renderCoppie?.();
      return true;
    } catch (e) {
      window.iscrizioniTorneo = [];
      window.renderGestioneTorneo?.();
      window.renderPartecipanti?.();
      window.renderCoppie?.();
      console.error('Caricamento iscrizioni non riuscito', e);
      return false;
    }
  }
  window.caricaRichiesteIscrizione = caricaRichiesteIscrizione;

  function renderGestioneTorneo() {
    const box = document.getElementById("dettaglioTorneoAdmin"), card = document.getElementById("gestioneTorneoAdmin");
    if (!box || !card) return;
    const t = window.getTorneoAdminCorrente?.();
    if (!t) { card.classList.add("hidden"); box.innerHTML = ""; return; }
    card.classList.remove("hidden");
    const r = t.configurazione?.rules || t.rules || {};
    box.innerHTML = `<div class="admin-detail"><h3>${window.escapeHtml(t.nome || "Torneo")}</h3><p>📅 ${window.escapeHtml(t.data || "-")} · 👥 ${t.posti || r.numeroSquadre || 0} squadre · 🏆 ${window.escapeHtml(r.tipoTorneo || t.formula || "da configurare in Bove")}</p><p>Stato: <b>${window.escapeHtml(t.stato || "bozza")}</b> · Pubblicato: ${t.pubblicato ? 'Sì' : 'No'} · Iscrizioni: ${t.iscrizioni_chiuse ? 'Chiuse' : 'aperte'}</p></div>`;
    const req = document.getElementById("richiesteIscrizione");
    if (req) {
      req.innerHTML = window.iscrizioniTorneo.length ? window.iscrizioniTorneo.map(g => `<div class="lista-item"><b>${window.escapeHtml(g.nome_giocatore || g.nome || "Giocatore")}</b><br><small>${window.escapeHtml(g.email || "-")}</small><br><span class="badge">${window.escapeHtml(g.stato || "in attesa")}</span><br><button class="btn" onclick="selezionaGiocatoreAdmin(${g.id})">Gestisci</button></div>`).join("") : '<p class="notice">Nessuna richiesta di iscrizione.</p>';
    }
  }
  window.renderGestioneTorneo = renderGestioneTorneo;

  window.selezionaGiocatoreAdmin = async function (id) {
    const { data, error } = await window.sb.from("iscrizioni").select("*").eq("id", id).single();
    if (error || !data) { alert("Giocatore non trovato."); return; }
    window.giocatoreSelezionatoCorrente = data;
    const s = document.getElementById("schedaGiocatoreAdmin");
    if (s) { s.classList.remove("hidden"); s.dataset.giocatoreId = data.id; }
    const setVal = (domId, val) => { const el = document.getElementById(domId); if (el) el.value = val; };
    setVal("adminNomeGiocatore", data.nome_giocatore || data.nome || "");
    setVal("adminEmailGiocatore", data.email || "");
    setVal("adminTelefonoGiocatore", data.telefono || "");
    setVal("adminLivelloGiocatore", data.livello || "-");
    setVal("adminNotaGiocatore", data.note || "");
  };

  window.approvaGiocatore = async function () {
    const id = window.giocatoreSelezionatoCorrente?.id || document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
    if (!id) { alert("Nessun giocatore selezionato"); return; }
    const { data, error } = await window.sb.from("iscrizioni").update({ stato: "approvato", approvato: true }).eq("id", id).select("*").single();
    if (error) { alert("Errore approvazione: " + error.message); return; }
    window.giocatoreSelezionatoCorrente = data;
    window.chiudiSchedaGiocatore();
    await caricaRichiesteIscrizione();
  };

  window.rifiutaGiocatore = async function () {
    const id = window.giocatoreSelezionatoCorrente?.id || document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
    if (!id) { alert("Nessun giocatore selezionato."); return; }
    const { error } = await window.sb.from("iscrizioni").update({ stato: "rifiutato", approvato: false }).eq("id", id);
    if (error) { alert("Errore durante il rifiuto: " + error.message); return; }
    window.chiudiSchedaGiocatore();
    await caricaRichiesteIscrizione();
  };

  window.chiudiSchedaGiocatore = function () {
    const s = document.getElementById("schedaGiocatoreAdmin");
    if (s) { s.classList.add("hidden"); delete s.dataset.giocatoreId; }
  };

  function renderPartecipanti() {
    const box = document.getElementById("partecipantiAdmin");
    if (!box) return;
    const ok = window.iscrizioniTorneo.filter(g => g && (g.stato === "approvato" || g.approvato === true));
    box.innerHTML = ok.length ? ok.map(g => `<div class="lista-item">✅ <b>${window.escapeHtml(g.nome_giocatore || g.nome || "Partecipante")}</b> — ${window.escapeHtml(g.email || "-")}</div>`).join("") : "<p class=\"notice\">Nessun partecipante approvato.</p>";
  }
  window.renderPartecipanti = renderPartecipanti;

  function renderCoppie() {
    const box = document.getElementById("creaCoppieBox"), list = document.getElementById("listaCoppieAdmin");
    if (!box) return;
    const t = window.getTorneoAdminCorrente?.();
    if (!t) { box.innerHTML = '<p class="notice">Nessun torneo selezionato.</p>'; if (list) list.innerHTML = ""; return; }
    if (!Array.isArray(t.coppie)) t.coppie = [];
    if (!t.configurazione) t.configurazione = {};
    if (!Array.isArray(t.configurazione.coppie)) t.configurazione.coppie = t.coppie;
    const approved = window.iscrizioniTorneo.filter(g => g && (g.stato === "approvato" || g.approvato === true));
    const used = new Set(t.coppie.flatMap(c => [c?.giocatore1?.id, c?.giocatore2?.id].filter(x => x != null).map(String)));
    const available = approved.filter(g => !used.has(String(g.id)));
    const name = g => window.escapeHtml([g?.nome, g?.cognome].filter(Boolean).join(" ") || g?.nome_giocatore || g?.email || "Giocatore");

    box.innerHTML = available.length >= 2 ? `<div class="pair-form"><p><b>Giocatori approvati:</b> ${approved.length} · <b>Coppie:</b> ${t.coppie.length}</p><select id="adminCoppiaGiocatore1"><option value="">Primo giocatore</option>${available.map(g => `<option value="${g.id}">${name(g)}</option>`).join("")}</select><select id="adminCoppiaGiocatore2"><option value="">Secondo giocatore</option>${available.map(g => `<option value="${g.id}">${name(g)}</option>`).join("")}</select><button class="btn primary" id="btnCreaCoppiaAdmin">＋ Crea coppia</button></div>` : `<p class="notice">${approved.length < 2 ? 'Servono almeno due giocatori approvati.' : 'Tutti i giocatori approvati sono già assegnati.'}</p>`;
    if (list) list.innerHTML = t.coppie.length ? t.coppie.map((c, i) => `<div class="lista-item"><b>Coppia ${i + 1}</b><br>👤 ${name(c.giocatore1)}<br>👤 ${name(c.giocatore2)}</div>`).join("") : "<p class=\"notice\">Nessuna coppia creata.</p>";

    document.getElementById("btnCreaCoppiaAdmin")?.addEventListener("click", async () => {
      const id1 = document.getElementById("adminCoppiaGiocatore1")?.value, id2 = document.getElementById("adminCoppiaGiocatore2")?.value;
      if (!id1 || !id2 || id1 === id2) { alert("Seleziona due giocatori diversi."); return; }
      const g1 = approved.find(g => String(g.id) === String(id1)), g2 = approved.find(g => String(g.id) === String(id2));
      if (!g1 || !g2) return;
      t.coppie.push({
        id: Date.now(),
        giocatore1: { id: g1.id, nome: g1.nome || "", cognome: g1.cognome || "", nome_giocatore: g1.nome_giocatore || "", email: g1.email || "" },
        giocatore2: { id: g2.id, nome: g2.nome || "", cognome: g2.cognome || "", nome_giocatore: g2.nome_giocatore || "", email: g2.email || "" }
      });
      t.configurazione.coppie = t.coppie;
      window.adminState.tornei[window.adminState.tornei.findIndex(x => String(x.id) === String(t.id))] = t;
      try { localStorage.setItem("padel_admin_state", JSON.stringify(window.adminState)); } catch {}
      const result = await window.sb.from("tornei").update({ configurazione: t.configurazione }).eq("id", t.id);
      if (result.error) console.error(result.error);
      renderCoppie();
    });
  }
  window.renderCoppie = renderCoppie;

  window.inviaWhatsAppTutti = function () {
    const msg = document.getElementById("messaggioWhatsApp")?.value.trim() || document.getElementById("whatsappMenuMessage")?.value.trim();
    if (!msg) { alert("Scrivi un messaggio"); return false; }
    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(msg), "_blank", "noopener");
    return true;
  };
  window.inviaWhatsAppApprovati = function () { return window.inviaWhatsAppTutti(); };
})();
/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED SCRIPT (3/5)
   News Management, Sponsors, Calendar 2026-2028 & Base UI Renderers
   ========================================================================== */
(() => {
  'use strict';

  // 1. Gestione News
  async function caricaNewsAdmin() {
    try {
      const { data, error } = await window.sb.from("news").select("*").order("data", { ascending: false });
      if (error) throw error;
      window.adminState.news = Array.isArray(data) ? data : [];
      window.salvaAdminState?.();
      renderNewsAdmin();
    } catch (e) {
      console.error("Errore caricamento news:", e);
    }
  }
  window.caricaNewsAdmin = caricaNewsAdmin;

  function renderNewsAdmin() {
    const list = document.getElementById("listaNewsAdmin");
    if (!list) return;
    const items = window.adminState.news || [];
    list.innerHTML = items.length ? items.map(n => `<div class="lista-item"><b>${window.escapeHtml(n.titolo || "News")}</b><br><small>${window.escapeHtml(n.data || "-")}</small><p>${window.escapeHtml(n.testo || "")}</p><button class="btn danger" onclick="eliminaNewsAdmin(${n.id})">Elimina</button></div>`).join("") : '<p class="notice">Nessuna news pubblicata.</p>';
  }
  window.renderNewsAdmin = renderNewsAdmin;

  window.creaNewsAdmin = async function () {
    const titolo = document.getElementById("adminTitoloNews")?.value.trim();
    const testo = document.getElementById("adminTestoNews")?.value.trim();
    const data = new Date().toISOString().split("T")[0];
    if (!titolo || !testo) { alert("Compila titolo e testo della news"); return; }
    const { data: res, error } = await window.sb.from("news").insert({ titolo, testo, data }).select("*").single();
    if (error) { alert("Errore creazione news: " + error.message); return; }
    if (res) window.adminState.news.unshift(res);
    window.salvaAdminState?.();
    renderNewsAdmin();
    document.getElementById("adminTitoloNews").value = "";
    document.getElementById("adminTestoNews").value = "";
  };

  window.eliminaNewsAdmin = async function (id) {
    if (!confirm("Eliminare questa news?")) return;
    const { error } = await window.sb.from("news").delete().eq("id", id);
    if (error) { alert("Errore eliminazione"); return; }
    window.adminState.news = (window.adminState.news || []).filter(n => String(n.id) !== String(id));
    window.salvaAdminState?.();
    renderNewsAdmin();
  };

  // 2. Gestione Sponsor
  async function caricaSponsorAdmin() {
    try {
      const { data, error } = await window.sb.from("sponsor").select("*");
      if (error) throw error;
      window.adminState.sponsor = Array.isArray(data) ? data : [];
      window.salvaAdminState?.();
      renderSponsorAdmin();
    } catch (e) {
      console.error("Errore caricamento sponsor:", e);
    }
  }
  window.caricaSponsorAdmin = caricaSponsorAdmin;

  function renderSponsorAdmin() {
    const list = document.getElementById("listaSponsorAdmin");
    if (!list) return;
    const items = window.adminState.sponsor || [];
    list.innerHTML = items.length ? items.map(s => `<div class="lista-item"><b>${window.escapeHtml(s.nome || "Sponsor")}</b><br><small>${window.escapeHtml(s.categoria || "-")}</small><br><button class="btn danger" onclick="eliminaSponsorAdmin(${s.id})">Elimina</button></div>`).join("") : '<p class="notice">Nessuno sponsor inserito.</p>';
  }
  window.renderSponsorAdmin = renderSponsorAdmin;

  window.creaSponsorAdmin = async function () {
    const nome = document.getElementById("adminNomeSponsor")?.value.trim();
    const categoria = document.getElementById("adminCategoriaSponsor")?.value.trim() || "Gold";
    const logo_url = document.getElementById("adminLogoSponsor")?.value.trim() || "";
    if (!nome) { alert("Inserisci il nome dello sponsor"); return; }
    const { data: res, error } = await window.sb.from("sponsor").insert({ nome, categoria, logo_url }).select("*").single();
    if (error) { alert("Errore inserimento sponsor: " + error.message); return; }
    if (res) window.adminState.sponsor.push(res);
    window.salvaAdminState?.();
    renderSponsorAdmin();
    document.getElementById("adminNomeSponsor").value = "";
    document.getElementById("adminLogoSponsor").value = "";
  };

  window.eliminaSponsorAdmin = async function (id) {
    if (!confirm("Rimuovere questo sponsor?")) return;
    const { error } = await window.sb.from("sponsor").delete().eq("id", id);
    if (error) { alert("Errore eliminazione"); return; }
    window.adminState.sponsor = (window.adminState.sponsor || []).filter(s => String(s.id) !== String(id));
    window.salvaAdminState?.();
    renderSponsorAdmin();
  };

  // 3. Calendario 2026-2028 (Generazione automatica e rendering)
  window.creaCalendarioBiennale = function () {
    const annoInizio = Number(document.getElementById("calendarioAnnoInizio")?.value) || 2026;
    const frequenza = document.getElementById("calendarioFrequenza")?.value || "mensile";
    const baseNome = document.getElementById("calendarioNomeBase")?.value.trim() || "Torneo Padel";
    const posti = Number(document.getElementById("calendarioPosti")?.value) || 8;
    
    const torneiGenerati = [];
    let current = new Date(annoInizio, 0, 15); // Partenza 15 gennaio
    const fine = new Date(2028, 11, 31); // Fino a fine 2028

    while (current <= fine) {
      const dataStr = current.toISOString().split("T")[0];
      const nomeTorneo = `${baseNome} - ${current.toLocaleString('it-IT', { month: 'long', year: 'numeric' }).toUpperCase()}`;
      torneiGenerati.push({
        id: "gen_" + Date.now() + Math.floor(Math.random() * 1000),
        nome: nomeTorneo,
        data: dataStr,
        posti: posti,
        descrizione: "Torneo ufficiale programmato da calendario biennale 2026-2028.",
        stato: "bozza",
        configurazione: { rules: { numeroSquadre: posti, numeroGironi: Math.ceil(posti / 4), squadrePerGirone: 4 } }
      });

      if (frequenza === "settimanale") current.setDate(current.getDate() + 7);
      else if (frequenza === "quindicinale") current.setDate(current.getDate() + 14);
      else current.setMonth(current.getMonth() + 1);
    }

    if (!window.adminState.tornei) window.adminState.tornei = [];
    window.adminState.tornei.push(...torneiGenerati);
    window.salvaAdminState?.();
    window.renderAdmin?.();
    window.__adminDesktopRender?.();
    alert(`Creati con successo ${torneiGenerati.length} tornei per il calendario biennale!`);
  };

  // 4. Render Admin Classico di Fallback
  function renderAdmin() {
    const box = document.getElementById("listaTorneiAdmin");
    if (!box) return;
    const tornei = Array.isArray(window.adminState?.tornei) ? window.adminState.tornei : [];
    box.innerHTML = tornei.length ? tornei.map(t => `<div class="lista-item"><b>${window.escapeHtml(t.nome || "Torneo")}</b> (${window.escapeHtml(t.data || "-")})<br><small>Stato: ${window.escapeHtml(t.stato || "bozza")}</small><br><button class="btn" onclick="selezionaTorneoAdmin(${t.id})">Seleziona</button> <button class="btn danger" onclick="eliminaTorneoAdmin('${t.id}')">Elimina</button></div>`).join("") : '<p class="notice">Nessun torneo disponibile.</p>';
  }
  window.renderAdmin = renderAdmin;

  window.selezionaTorneoAdmin = async function (id) {
    window.adminState.torneoSelezionato = id;
    window.salvaAdminState?.();
    window.generaLinkPerId?.(id);
    await window.caricaRichiesteIscrizione?.();
    window.renderGestioneTorneo?.();
    window.renderAdmin?.();
  };
})();
/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED SCRIPT (4/5)
   Desktop UI Shell, Navigation Router & Dynamic Layout Renderer
   ========================================================================== */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let mounted = false;

  function move(id, parent) {
    const el = $(id);
    if (el && parent) parent.appendChild(el);
    return el;
  }

  function button(label, className, handler) {
    const b = document.createElement('button');
    b.className = `desktop-btn ${className || ''}`.trim();
    b.type = 'button';
    b.textContent = label;
    if (handler) b.addEventListener('click', handler);
    return b;
  }

  function mount() {
    const area = $('areaAdmin');
    if (!area || mounted) return;
    mounted = true;

    const old = {
      title: area.querySelector(':scope > h1'),
      create: area.querySelector(':scope > details:nth-of-type(1)'),
      tournaments: area.querySelector(':scope > details:nth-of-type(2)'),
      manage: $('gestioneTorneoAdmin'),
      news: area.querySelector(':scope > details:nth-of-type(3)'),
      sponsors: area.querySelector(':scope > details:nth-of-type(4)')
    };

    const shell = document.createElement('div');
    shell.className = 'desktop-app';
    shell.innerHTML = `
      <aside class="desktop-sidebar">
        <div class="desktop-brand">
          <div class="desktop-brand-icon">🏆</div>
          <div><strong>ADMIN TORNEI</strong><span>Gestione campionati</span></div>
        </div>
        <div class="desktop-nav-section">Gestione</div>
        <nav class="desktop-nav">
          <button class="active" data-target="tornei">🏆 <span>Tornei</span></button>
          <button data-target="iscritti">👥 <span>Iscritti</span></button>
          <button data-target="coppie">🔀 <span>Accoppiamenti</span></button>
          <button data-target="tabellone">📋 <span>Tabellone</span></button>
        </nav>
        <div class="desktop-nav-section">Sistema & Calendario</div>
        <nav class="desktop-nav">
          <button data-target="config">⚙️ <span>Configurazione</span></button>
          <button data-target="calendario">📅 <span>Calendario 26-28</span></button>
          <button data-target="news">📰 <span>News & Sponsor</span></button>
          <button data-target="link">🔗 <span>Link pubblici</span></button>
        </nav>
        <div class="desktop-sidebar-bottom">● Amministratore<br><span>Console gestione tornei</span></div>
      </aside>
      <main class="desktop-main">
        <header class="desktop-topbar">
          <div class="desktop-breadcrumb">Gestione / <b>Tornei</b></div>
          <div class="desktop-top-actions"></div>
        </header>
        <section class="desktop-content">
          <div class="desktop-page-title">
            <div><h1>Dashboard Tornei</h1><p>Panoramica e accesso rapido alle operazioni amministrative.</p></div>
            <div class="desktop-title-actions"></div>
          </div>
          <div class="desktop-stats"></div>
          <div class="desktop-grid">
            <div class="desktop-card desktop-tournaments"><div class="desktop-card-head"><h2>🏆 Tornei</h2><span>Elenco recente</span></div><div class="desktop-card-body desktop-tournament-body"></div></div>
            <div class="desktop-card"><div class="desktop-card-head"><h2>⚡ Azioni rapide</h2><span>Operazioni frequenti</span></div><div class="desktop-card-body desktop-quick"></div></div>
          </div>
          <div class="desktop-lower"></div>
        </section>
      </main>`;

    area.classList.add('desktop-mode');
    area.innerHTML = '';
    area.appendChild(shell);

    const top = shell.querySelector('.desktop-top-actions');
    const titleActions = shell.querySelector('.desktop-title-actions');
    const lower = shell.querySelector('.desktop-lower');
    const tournamentBody = shell.querySelector('.desktop-tournament-body');
    const quick = shell.querySelector('.desktop-quick');
    const stats = shell.querySelector('.desktop-stats');

    const refresh = button('↻ Aggiorna', '', () => {
      if (typeof window.caricaTorneiSupabase === 'function') window.caricaTorneiSupabase();
      if (typeof window.caricaNewsAdmin === 'function') window.caricaNewsAdmin();
      if (typeof window.caricaSponsorAdmin === 'function') window.caricaSponsorAdmin();
    });
    const settings = button('⚙ Impostazioni');
    const newTop = button('＋ Nuovo torneo', 'primary', () => {
      if (old.create) { old.create.open = true; lower.scrollIntoView({behavior:'smooth'}); }
    });
    top.append(refresh, settings, newTop);
    titleActions.appendChild(button('＋ Crea torneo', 'primary', () => {
      if (old.create) { old.create.open = true; lower.scrollIntoView({behavior:'smooth'}); }
    }));

    function renderStats() {
      const tornei = Array.isArray(window.adminState?.tornei) ? window.adminState.tornei : [];
      const attivi = tornei.filter(t => t && (t.stato === 'attivo' || t.pubblicato === true)).length;
      const iscritti = Array.isArray(window.iscrizioniTorneo) ? window.iscrizioniTorneo.length : 0;
      const approvati = Array.isArray(window.iscrizioniTorneo) ? window.iscrizioniTorneo.filter(x => x && (x.stato === 'approvato' || x.approvato === true)).length : 0;
      const daApprovare = Math.max(0, iscritti - approvati);
      stats.innerHTML = '';
      [['Tornei attivi', attivi, '● Online'],['Iscritti', iscritti, 'Dati reali'],['Da approvare', daApprovare, 'Richiedono attenzione'],['Tabelloni', tornei.length, 'Tornei disponibili']].forEach(([l,v,n]) => {
        const s=document.createElement('div'); s.className='desktop-stat'; s.innerHTML=`<div class="desktop-stat-label">${l}</div><div class="desktop-stat-value">${v}</div><div class="desktop-stat-note">${n}</div>`; stats.appendChild(s);
      });
    }

    function renderTournaments() {
      const tornei = Array.isArray(window.adminState?.tornei) ? window.adminState.tornei : [];
      tournamentBody.innerHTML = '';
      if (!tornei.length) { tournamentBody.innerHTML = '<p class="desktop-muted">Nessun torneo creato.</p>'; return; }
      tornei.slice(0,8).forEach(t => {
        const row=document.createElement('div'); row.className='desktop-tournament-row';
        const info=document.createElement('div'); info.className='desktop-t-info';
        const name=document.createElement('strong'); name.textContent=t.nome || 'Torneo senza nome';
        const small=document.createElement('small'); small.textContent=`${t.data || '-'} · ${t.posti || '-'} posti`;
        const st=document.createElement('span'); st.className='desktop-status' + (t.stato === 'chiuso' ? ' closed' : ''); st.textContent=`● ${t.stato || 'bozza'}`;
        info.append(name,small,st);
        const actions=document.createElement('div'); actions.className='desktop-actions';
        actions.appendChild(button('Gestisci','',()=>{ if(typeof window.selezionaTorneoAdmin==='function') window.selezionaTorneoAdmin(t.id); setTimeout(()=>renderAll(),150); }));
        actions.appendChild(button('🔗','',()=>{ if(typeof window.generaLinkBove==='function'){ if(typeof window.selezionaTorneoAdmin==='function') window.selezionaTorneoAdmin(t.id); setTimeout(()=>window.generaLinkBove(),150); } }));
        row.append(info,actions); tournamentBody.appendChild(row);
      });
    }

    function renderQuick() {
      quick.innerHTML='';
      const items=[
        ['👥 Approva iscritti','Gestisci le richieste',()=>{ activate('iscritti'); }],
        ['🔀 Accoppiamenti','Gestisci le coppie',()=>{ activate('coppie'); }],
        ['📋 Apri tabellone','Apri il torneo selezionato',()=>{ if(typeof window.apriBoveConTorneo==='function' && window.adminState?.torneoSelezionato) window.apriBoveConTorneo(window.adminState.torneoSelezionato); }],
        ['🔗 Copia link','Link pubblico',()=>{ if(typeof window.copiaLinkBove==='function') window.copiaLinkBove(); }]
      ];
      items.forEach(([a,b,fn])=>{const q=button('','');q.innerHTML=`<b>${a}</b><span>${b}</span>`;q.addEventListener('click',fn);quick.appendChild(q);});
    }

    function moveLower() {
      if (old.create) lower.appendChild(old.create);
      if (old.tournaments) { old.tournaments.style.display='none'; }
      if (old.manage) lower.appendChild(old.manage);
      if (old.news) lower.appendChild(old.news);
      if (old.sponsors) lower.appendChild(old.sponsors);
    }

    function activate(target) {
      shell.querySelectorAll('.desktop-nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
      if(target==='tornei') shell.querySelector('.desktop-tournaments')?.scrollIntoView({behavior:'smooth'});
      else if(target==='iscritti' || target==='coppie') {
        if (old.manage) { old.manage.classList.remove('hidden'); old.manage.open = true; old.manage.scrollIntoView({behavior:'smooth'}); }
        if(target==='iscritti') setTimeout(()=>document.getElementById('richiesteIscrizione')?.scrollIntoView({behavior:'smooth'}),250);
        if(target==='coppie') setTimeout(()=>document.getElementById('creaCoppieBox')?.scrollIntoView({behavior:'smooth'}),250);
      } else if(target==='config') old.create?.scrollIntoView({behavior:'smooth'});
      else if(target==='calendario') document.getElementById('sezioneCalendarioBiennale')?.scrollIntoView({behavior:'smooth'});
      else if(target==='news') old.news?.scrollIntoView({behavior:'smooth'});
      else if(target==='link') document.getElementById('linkBoveGenerato')?.scrollIntoView({behavior:'smooth'});
      else if(target==='tabellone' && typeof window.apriBoveConTorneo==='function' && window.adminState?.torneoSelezionato) window.apriBoveConTorneo(window.adminState.torneoSelezionato);
    }

    shell.querySelectorAll('.desktop-nav button').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));
    moveLower();
    renderStats(); renderTournaments(); renderQuick();

    window.__adminDesktopRender = () => { renderStats(); renderTournaments(); renderQuick(); };
  }

  function watch() {
    const area = $('areaAdmin');
    if (!area) return;
    if (!mounted && !area.classList.contains('hidden')) mount();
    if (mounted && window.__adminDesktopRender) window.__adminDesktopRender();
  }

  document.addEventListener('DOMContentLoaded', () => {
    watch();
    setTimeout(watch, 250);
    setTimeout(watch, 1000);
    const observer = new MutationObserver(() => setTimeout(watch, 0));
    observer.observe(document.body, {subtree:true, attributes:true, attributeFilter:['class']});
  });
})();
/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED SCRIPT (5/5)
   Initialization, DOM Watchers, Event Listeners & Startup Hooks
   ========================================================================== */
(() => {
  'use strict';

  // 1. Inizializzazione automatica al caricamento del DOM
  document.addEventListener("DOMContentLoaded", async () => {
    window.caricaAdminState?.();
    
    // Aggiorna i campi di input login se presenti
    const emailInput = document.getElementById("adminEmail");
    if (emailInput && window.adminState?.adminEmail && !emailInput.value) {
      emailInput.value = window.adminState.adminEmail;
    }

    // Verifica sessione Supabase attiva
    try {
      const { data } = await window.sb.auth.getSession();
      if (data?.session) {
        window.adminState.adminLoggato = true;
        document.getElementById("boxLoginAdmin")?.classList.add("hidden");
        document.getElementById("areaAdmin")?.classList.remove("hidden");
        await window.caricaTorneiSupabase?.();
        await window.caricaNewsAdmin?.();
        await window.caricaSponsorAdmin?.();
        await window.caricaRichiesteIscrizione?.();
      }
    } catch (e) {
      console.error("Errore verifica sessione iniziale:", e);
    }

    // Associazione listener su bottoni globali se non già presenti tramite onclick HTML
    document.getElementById("btnLoginAdmin")?.addEventListener("click", window.loginAdmin);
    document.getElementById("btnCreaNuovoTorneo")?.addEventListener("click", window.creaNuovoTorneo);
    document.getElementById("btnApriRegoleNuovoTorneo")?.addEventListener("click", window.apriRegoleNuovoTorneo);
    document.getElementById("btnPubblicaTorneo")?.addEventListener("click", window.pubblicaTorneo);
    document.getElementById("btnChiudiIscrizioni")?.addEventListener("click", window.chiudiIscrizioniTorneo);
    document.getElementById("btnApprovaGiocatore")?.addEventListener("click", window.approvaGiocatore);
    document.getElementById("btnRifiutaGiocatore")?.addEventListener("click", window.rifiutaGiocatore);
    document.getElementById("btnChiudiSchedaGiocatore")?.addEventListener("click", window.chiudiSchedaGiocatore);
    document.getElementById("btnCreaNewsAdmin")?.addEventListener("click", window.creaNewsAdmin);
    document.getElementById("btnCreaSponsorAdmin")?.addEventListener("click", window.creaSponsorAdmin);
    document.getElementById("btnGeneraCalendarioBiennale")?.addEventListener("click", window.creaCalendarioBiennale);
    document.getElementById("btnCopiaLinkBove")?.addEventListener("click", window.copiaLinkBove);
    document.getElementById("btnCopiaLinkBoveMirror")?.addEventListener("click", window.copiaLinkBove);
    document.getElementById("btnInviaWhatsApp")?.addEventListener("click", window.inviaWhatsAppTutti);

    // Seleziona il primo torneo di default se presente e nessuno selezionato
    if (!window.adminState.torneoSelezionato && Array.isArray(window.adminState.tornei) && window.adminState.tornei.length > 0) {
      window.adminState.torneoSelezionato = window.adminState.tornei[0].id;
      window.salvaAdminState?.();
      await window.caricaRichiesteIscrizione?.();
    }

    window.renderAdmin?.();
    window.renderGestioneTorneo?.();
    window.renderPartecipanti?.();
    window.renderCoppie?.();
    window.renderNewsAdmin?.();
    window.renderSponsorAdmin?.();
  });

  // 2. Controllo Periodico stato Supabase e Sincronizzazione
  window.addEventListener('online', async () => {
    console.log('[ADMIN] Connessione ripristinata. Sincronizzazione in corso...');
    await window.caricaTorneiSupabase?.();
    await window.caricaNewsAdmin?.();
    await window.caricaSponsorAdmin?.();
  });

  console.log('[ADMIN] Master Console (1-5) caricata e pronta all\'uso.');
})();
