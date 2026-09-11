(() => {
  function restoreNeutralFormulaFromAdmin() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      const raw = params.get('torneo');
      if (!raw) return;

      const torneo = JSON.parse(decodeURIComponent(raw));
      const rules = torneo?.configurazione?.rules || torneo?.rules || {};

      if (typeof state !== 'undefined' && state.rules) {
        if (rules.tipoTorneo === '') state.rules.tipoTorneo = '';
        if (rules.formatoTorneo === '') state.rules.formatoTorneo = '';
        if (rules.formulaGironi === '') state.rules.formulaGironi = '';
        if (rules.formulaFinale === '') state.rules.formulaFinale = '';
      }
    } catch (e) {
      console.error('Errore ripristino formula neutra:', e);
    }
  }

  function preserveTournamentResults() {
    try {
      if (typeof generaPartiteGironi !== 'function' || typeof state === 'undefined') return;
      if (window.__BOVE_RESULTS_PATCHED__) return;

      const original = generaPartiteGironi;
      window.__BOVE_RESULTS_PATCHED__ = true;

      generaPartiteGironi = function () {
        const saved = {};
        ['A','B','C','D','E','F','G'].forEach(g => {
          ['res','time','camp'].forEach(suffix => {
            const key = g + suffix;
            if (Array.isArray(state[key]) && state[key].length) {
              saved[key] = state[key].slice();
            }
          });
        });

        original();

        Object.keys(saved).forEach(key => {
          if (Array.isArray(state[key]) && state[key].length === saved[key].length) {
            state[key] = saved[key];
          }
        });
      };
    } catch (e) {
      console.error('Errore protezione risultati torneo:', e);
    }
  }

  preserveTournamentResults();

  function openRequestedRules() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      restoreNeutralFormulaFromAdmin();
      if (typeof window.openRules === 'function') {
        window.openRules();
      }
    } catch (e) {
      console.error('Errore apertura configurazione formula:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(openRequestedRules, 0);
  });

  async function salvaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const s = typeof state !== 'undefined' ? state : null;
    const id = s?.idTorneo || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    const snapshot = (() => { try { return JSON.parse(JSON.stringify(s || {})); } catch (e) { return {}; } })();
    const rules = snapshot.rules || {};
    const payload = {
      configurazione: snapshot,
      nome: snapshot.nomeTorneo || undefined,
      data_torneo: snapshot.dataTorneo || undefined,
      posti: Number(rules.numeroSquadre) || undefined,
      formula: rules.formulaScelta || snapshot.formula || undefined
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    const { error } = await client.from('tornei').update(payload).eq('id', id);
    if (error) { console.error(error); alert('Salvataggio torneo non riuscito: ' + error.message); return false; }
    try { localStorage.setItem('torneoState', JSON.stringify(snapshot)); } catch (e) {}
    alert('Torneo salvato su Supabase.');
    return true;
  }

  async function archiviaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const s = typeof state !== 'undefined' ? state : null;
    const id = s?.idTorneo || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    if (!confirm('Confermi la chiusura definitiva e l\'archiviazione del torneo?')) return false;
    if (!(await salvaTorneoBove())) return false;
    const { error } = await client.from('tornei').update({ stato: 'archiviato', iscrizioni_chiuse: true, pubblicato: false }).eq('id', id);
    if (error) { alert('Archiviazione non riuscita: ' + error.message); return false; }
    if (s) { s.stato = 'archiviato'; s.iscrizioni_chiuse = true; }
    alert('Torneo archiviato correttamente.');
    return true;
  }

  async function eliminaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const id = (typeof state !== 'undefined' ? state?.idTorneo : null) || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    if (!confirm('ATTENZIONE: eliminare definitivamente questo torneo?')) return false;
    const { error } = await client.from('tornei').delete().eq('id', id);
    if (error) { alert('Eliminazione non riuscita: ' + error.message); return false; }
    try { localStorage.removeItem('torneoState'); localStorage.removeItem('savedTeams'); } catch (e) {}
    window.location.href = 'admin.html';
    return true;
  }

  function chiudiMenuBove() {
    const menu = document.getElementById('menuComandi');
    if (!menu) return;
    menu.classList.remove('show');
    menu.style.display = 'none';
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
  }

  function installBoveControls() {
    const menu = document.getElementById('menuComandi');
    if (!menu || menu.dataset.managementReady === '1') return;
    menu.dataset.managementReady = '1';

    const save = [...menu.querySelectorAll('button')].find(b => /salva/i.test(b.textContent || ''));
    if (save) {
      save.textContent = '💾 Salva Torneo';
      save.onclick = salvaTorneoBove;
    }

    const add = (id, text, fn) => {
      if (document.getElementById(id)) return;
      const b = document.createElement('button');
      b.type = 'button'; b.id = id; b.textContent = text; b.onclick = fn;
      menu.appendChild(b);
    };
    add('boveChiudiMenu', '✖️ Chiudi', chiudiMenuBove);
    add('boveArchiviaTorneo', '📦 Archivia Torneo', archiviaTorneoBove);
    add('boveEliminaTorneo', '🗑️ Elimina Torneo', eliminaTorneoBove);
  }

  window.salvaTorneoBove = salvaTorneoBove;
  window.archiviaTorneoBove = archiviaTorneoBove;
  window.eliminaTorneoBove = eliminaTorneoBove;

  const observeBove = () => {
    installBoveControls();
    new MutationObserver(installBoveControls).observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeBove, { once: true });
  else observeBove();
})();
