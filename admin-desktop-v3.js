/*
 * Compatibility layer for the approved new admin.html layout.
 * Keeps the new DOM intact and exposes stable admin function names.
 */
(() => {
  'use strict';

  const call = (name, ...args) => {
    const fn = window[name];
    if (typeof fn !== 'function') {
      console.error(`Funzione admin non disponibile: ${name}`);
      return Promise.reject(new Error(`Funzione ${name} non disponibile`));
    }
    return fn(...args);
  };

  window.logoutAdmin = async function logoutAdmin() {
    try {
      if (typeof sb !== 'undefined' && sb?.auth?.signOut) {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
      }
    } catch (e) {
      console.error('Errore logout:', e);
    }
    if (typeof adminState !== 'undefined') {
      adminState.adminLoggato = false;
      adminState.adminEmail = '';
      adminState.torneoSelezionato = null;
      if (typeof salvaAdminState === 'function') salvaAdminState();
    }
    document.getElementById('areaAdmin')?.classList.add('hidden');
    document.getElementById('boxLoginAdmin')?.classList.remove('hidden');
  };

  window.creaTorneoAdmin = async function creaTorneoAdmin(dati = {}) {
    const input = dati && typeof dati === 'object' ? dati : {};
    const nome = String(input.nome ?? document.getElementById('adminNomeTorneo')?.value ?? '').trim() || 'Nuovo Torneo';
    const data = String(input.data ?? document.getElementById('adminDataTorneo')?.value ?? '').trim();
    const descrizione = String(input.descrizione ?? document.getElementById('adminDescrizione')?.value ?? '').trim();
    const posti = Number(input.posti ?? document.getElementById('adminPosti')?.value ?? 8) || 8;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new Error('Data torneo non valida o mancante (formato YYYY-MM-DD).');
    }
    if (typeof sb === 'undefined') throw new Error('Client Supabase non disponibile.');

    const id = Date.now();
    const numeroGironi = Math.ceil(posti / 4);
    const configurazione = {
      coppie: [],
      partecipanti: [],
      rules: {
        locked: false,
        tipoTorneo: 'gironiFinale',
        formatoTorneo: 'gironiFinale',
        numeroSquadre: posti,
        numeroGironi,
        squadrePerGirone: 4,
        formulaGironi: 'italiana',
        formulaFinale: 'eliminazione_diretta',
        w: 3, d: 1, l: 0,
        qualificatePerGirone: 2,
        numeroQualificateFinali: numeroGironi * 2,
        usaQuarti: true,
        usaSemifinali: true,
        usaFinale: true,
        killerPoint: false,
        rigori: true,
        tempoSupplementare: true,
        garaAndataRitorno: false,
        start: '20:00',
        duration: 30
      }
    };

    const record = {
      id,
      nome,
      data,
      data_torneo: data,
      ora_inizio: '20:00',
      posti,
      descrizione,
      formula: 'gironiFinale',
      stato: 'bozza',
      pubblicato: false,
      iscrizioni_chiuse: false,
      configurazione
    };

    const { data: created, error } = await sb.from('tornei').insert(record).select('*').single();
    if (error) {
      console.error(error);
      throw error;
    }

    const torneo = created || record;
    if (typeof adminState !== 'undefined') {
      adminState.tornei = Array.isArray(adminState.tornei) ? adminState.tornei : [];
      adminState.tornei.unshift(torneo);
      adminState.torneoSelezionato = torneo.id;
      if (typeof salvaAdminState === 'function') salvaAdminState();
    }
    if (typeof renderAdmin === 'function') renderAdmin();
    return torneo;
  };

  window.caricaRichiesteAdmin = (...args) => call('caricaRichiesteIscrizione', ...args);
  window.approvaIscrizioneAdmin = (...args) => call('approvaGiocatore', ...args);
  window.rifiutaIscrizioneAdmin = (...args) => call('rifiutaGiocatore', ...args);
  window.generaAccoppiamentiAdmin = (...args) => call('renderCoppie', ...args);
  window.apriTabelloneAdmin = (id) => call('apriBoveConTorneo', id ?? adminState?.torneoSelezionato);
  window.copiaLinkTabelloneAdmin = (...args) => call('copiaLinkBove', ...args);
  window.salvaSponsorAdmin = (...args) => call('salvaSponsor', ...args);
  window.salvaNewsAdmin = (...args) => call('creaNews', ...args);

  async function salvaTorneoCorrente(dati = {}) {
    const t = typeof getTorneoAdminCorrente === 'function' ? getTorneoAdminCorrente() : null;
    if (!t) {
      alert('Seleziona prima un torneo.');
      return null;
    }
    const input = dati && typeof dati === 'object' ? dati : {};
    const nome = input.nome ?? document.getElementById('adminNomeTorneo')?.value;
    const data = input.data ?? document.getElementById('adminDataTorneo')?.value;
    const posti = Number(input.posti ?? document.getElementById('adminPosti')?.value);
    const descrizione = input.descrizione ?? document.getElementById('adminDescrizione')?.value;
    const stato = input.stato ?? document.getElementById('adminStatoTorneo')?.value;

    if (nome) t.nome = String(nome).trim();
    if (data) t.data = String(data).trim();
    if (Number.isFinite(posti) && posti > 0) t.posti = posti;
    if (descrizione !== undefined) t.descrizione = String(descrizione).trim();
    if (stato) t.stato = String(stato);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.data)) throw new Error('Data torneo non valida.');

    if (typeof sb !== 'undefined') {
      const { error } = await sb.from('tornei').update({
        nome: t.nome,
        data: t.data,
        data_torneo: t.data,
        posti: t.posti,
        descrizione: t.descrizione,
        stato: t.stato
      }).eq('id', t.id);
      if (error) throw error;
    }
    if (typeof salvaAdminState === 'function') salvaAdminState();
    if (typeof renderAdmin === 'function') renderAdmin();
    return t;
  }

  window.salvaTorneoAdmin = salvaTorneoCorrente;
  window.modificaTorneoAdmin = salvaTorneoCorrente;

  window.salvaAccoppiamentiAdmin = async function salvaAccoppiamentiAdmin() {
    const t = typeof getTorneoAdminCorrente === 'function' ? getTorneoAdminCorrente() : null;
    if (!t) {
      alert('Seleziona prima un torneo.');
      return;
    }
    t.configurazione = t.configurazione || {};
    t.configurazione.coppie = Array.isArray(t.coppie) ? t.coppie : [];
    if (typeof salvaAdminState === 'function') salvaAdminState();
    if (typeof sb !== 'undefined') {
      const { error } = await sb.from('tornei').update({ configurazione: t.configurazione }).eq('id', t.id);
      if (error) throw error;
    }
    if (typeof renderCoppie === 'function') renderCoppie();
    return t.configurazione.coppie;
  };
})();
