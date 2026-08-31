/* Admin desktop: SOLO AGGANCI. Non crea, non sposta e non sostituisce il layout esistente. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fn = name => typeof window[name] === 'function' ? window[name] : null;

  function openConfig() {
    const el = $('configPanel');
    if (el) { el.open = true; el.scrollIntoView({behavior:'smooth', block:'start'}); }
  }

  function selectFirstTournament() {
    try {
      if (typeof adminState !== 'undefined' && adminState.torneoSelezionato != null) return adminState.torneoSelezionato;
      const row = $('listaTorneiAdmin')?.querySelector('.tournament-row');
      const b = row?.querySelector('button[onclick*="selezionaTorneoAdmin"]');
      const m = (b?.getAttribute('onclick') || '').match(/selezionaTorneoAdmin\(([^)]+)\)/);
      if (m && fn('selezionaTorneoAdmin')) { fn('selezionaTorneoAdmin')(m[1]); return m[1]; }
    } catch (_) {}
    return null;
  }

  function openManage(section) {
    const id = selectFirstTournament();
    if (id == null) { alert('Seleziona prima un torneo.'); return; }
    const manage = $('gestioneTorneoAdmin');
    const workspace = $('workspace');
    if (workspace) workspace.open = true;
    if (manage) manage.classList.remove('hidden');
    if (section) setTimeout(() => $(section)?.scrollIntoView({behavior:'smooth', block:'start'}), 150);
  }

  function wire() {
    // Azioni superiori e creazione/configurazione.
    document.querySelectorAll('#areaAdmin [data-action="create"]').forEach(b => {
      if (b.dataset.adminHook === '1') return;
      b.dataset.adminHook = '1';
      b.addEventListener('click', e => { e.preventDefault(); openConfig(); });
    });

    // Aggiornamento.
    const refresh = $('btnAggiorna');
    if (refresh && refresh.dataset.adminHook !== '1') {
      refresh.dataset.adminHook = '1';
      refresh.addEventListener('click', async e => {
        e.preventDefault();
        const load = fn('caricaTorneiSupabase');
        if (load) await load();
        const req = fn('caricaRichiesteIscrizione');
        if (req) await req();
        const render = fn('renderAdmin');
        if (render) render();
      });
    }

    // Navigazione laterale.
    document.querySelectorAll('#areaAdmin [data-nav]').forEach(b => {
      if (b.dataset.adminHook === '1') return;
      b.dataset.adminHook = '1';
      b.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('#areaAdmin [data-nav]').forEach(x => x.classList.toggle('active', x === b));
        const target = b.dataset.nav;
        if (target === 'dashboard') { window.scrollTo({top:0, behavior:'smooth'}); return; }
        if (target === 'configPanel') { openConfig(); return; }
        if (target === 'linkBoveGenerato') {
          const id = selectFirstTournament();
          const open = fn('apriBoveConTorneo');
          if (open && id != null) open(id);
          else openManage('linkBoveGenerato');
          return;
        }
        openManage(target);
      });
    });

    // Azioni rapide.
    const qa = $('quickApprova');
    if (qa && qa.dataset.adminHook !== '1') { qa.dataset.adminHook='1'; qa.addEventListener('click', e => { e.preventDefault(); openManage('richiesteIscrizione'); }); }
    const qc = $('quickCoppie');
    if (qc && qc.dataset.adminHook !== '1') { qc.dataset.adminHook='1'; qc.addEventListener('click', e => { e.preventDefault(); openManage('creaCoppieBox'); }); }
    const qt = $('quickTabellone');
    if (qt && qt.dataset.adminHook !== '1') { qt.dataset.adminHook='1'; qt.addEventListener('click', e => { e.preventDefault(); const id=selectFirstTournament(); const open=fn('apriBoveConTorneo'); if(open&&id!=null) open(id); }); }
    const ql = $('quickLink');
    if (ql && ql.dataset.adminHook !== '1') { ql.dataset.adminHook='1'; ql.addEventListener('click', e => { e.preventDefault(); const gen=fn('generaLinkBove'); if(gen) gen(); openManage('linkBoveGenerato'); }); }

    // Alias di compatibilità richiesti dal nuovo layout, senza sostituire le funzioni originali.
    if (!fn('creaTorneoAdmin') && fn('creaNuovoTorneo')) window.creaTorneoAdmin = fn('creaNuovoTorneo');
    if (!fn('modificaTorneoAdmin')) window.modificaTorneoAdmin = async function(id, patch) {
      const t = (typeof adminState !== 'undefined' && Array.isArray(adminState.tornei)) ? adminState.tornei.find(x => String(x.id) === String(id)) : null;
      if (t) {
        $('adminNomeTorneo') && ($('adminNomeTorneo').value = patch?.nome ?? t.nome ?? '');
        $('adminDataTorneo') && ($('adminDataTorneo').value = patch?.data ?? t.data ?? '');
        $('adminDescrizione') && ($('adminDescrizione').value = patch?.descrizione ?? t.descrizione ?? '');
        $('adminPosti') && ($('adminPosti').value = String(patch?.posti ?? t.posti ?? 8));
      }
      openConfig();
      return t;
    };
  }

  function boot() {
    wire();
    setTimeout(wire, 50);
    setTimeout(wire, 300);
    setTimeout(wire, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

// Evita il submit/reload involontario dei pulsanti admin, lasciando intatti gli onclick esistenti.
document.addEventListener('click', e => {
  const b = e.target.closest?.('#areaAdmin button[type="submit"]');
  if (b) e.preventDefault();
}, true);
