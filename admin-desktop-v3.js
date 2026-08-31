/*
 * Compatibility layer for the approved new admin.html layout.
 * The layout itself belongs to admin.html; this file must never replace DOM.
 * It only exposes stable function names used by the console/tests and by
 * older buttons, delegating to the real admin functions already on the page.
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
      if (typeof salvaAdminState === 'function') salvaAdminState();
    }
    document.getElementById('areaAdmin')?.classList.add('hidden');
    document.getElementById('boxLoginAdmin')?.classList.remove('hidden');
  };

  window.creaTorneoAdmin = (...args) => call('creaNuovoTorneo', ...args);
  window.caricaRichiesteAdmin = (...args) => call('caricaRichiesteIscrizione', ...args);
  window.approvaIscrizioneAdmin = (...args) => call('approvaGiocatore', ...args);
  window.rifiutaIscrizioneAdmin = (...args) => call('rifiutaGiocatore', ...args);
  window.generaAccoppiamentiAdmin = (...args) => call('renderCoppie', ...args);
  window.apriTabelloneAdmin = (id) => call('apriBoveConTorneo', id ?? adminState?.torneoSelezionato);
  window.copiaLinkTabelloneAdmin = (...args) => call('copiaLinkBove', ...args);
  window.salvaSponsorAdmin = (...args) => call('salvaSponsor', ...args);
  window.salvaNewsAdmin = (...args) => call('creaNews', ...args);

  async function salvaTorneoCorrente() {
    const t = typeof getTorneoAdminCorrente === 'function' ? getTorneoAdminCorrente() : null;
    if (!t) {
      alert('Seleziona prima un torneo.');
      return;
    }
    const nome = document.getElementById('adminNomeTorneo')?.value.trim();
    const data = document.getElementById('adminDataTorneo')?.value;
    const posti = Number(document.getElementById('adminPosti')?.value);
    const descrizione = document.getElementById('adminDescrizione')?.value.trim();
    const stato = document.getElementById('adminStatoTorneo')?.value;

    if (nome) t.nome = nome;
    if (data !== undefined) t.data = data;
    if (Number.isFinite(posti) && posti > 0) t.posti = posti;
    if (descrizione !== undefined) t.descrizione = descrizione;
    if (stato) t.stato = stato;

    if (typeof salvaAdminState === 'function') salvaAdminState();

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
