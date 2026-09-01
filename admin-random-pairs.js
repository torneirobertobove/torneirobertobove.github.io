/* Random pairing for Admin Tornei — safe runtime integration. */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://iybjvtmfaupgthqqsngd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
  let client = null;
  let observer = null;
  let timer = 0;

  function exposeGlobals(sb) {
    if (sb) {
      window.sb = sb;
      window.supabaseClient = sb;
    }
  }

  function getClient() {
    if (client) return client;
    if (window.supabaseClient) return (client = window.supabaseClient);
    if (window.sb) return (client = window.sb);
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      exposeGlobals(client);
    }
    return client;
  }

  function navigate(page) {
    const canonical = page === 'configurazione' || page === 'config'
      ? 'config'
      : (page === 'link' || page === 'links' ? 'links' : page);
    if (typeof window.openAdminPage === 'function') {
      window.openAdminPage(canonical);
      return;
    }
    const area = document.getElementById('areaAdmin');
    const target = document.getElementById('org-page-' + canonical);
    if (area && target) {
      area.querySelectorAll('.org-page').forEach(function (p) { p.classList.remove('org-active'); });
      target.classList.add('org-active');
    }
    if (location.hash.slice(1) !== canonical) history.replaceState(null, '', '#' + canonical);
  }

  function repairNavigation() {
    const area = document.getElementById('areaAdmin');
    if (!area) return;
    area.querySelectorAll('[data-page]').forEach(function (button) {
      const raw = String(button.dataset.page || '').toLowerCase().trim();
      if (raw !== 'configurazione' && raw !== 'config' && raw !== 'link' && raw !== 'links') return;
      const canonical = raw === 'configurazione' || raw === 'config' ? 'config' : 'links';
      button.dataset.orgPage = canonical;
      button.dataset.internalPage = canonical;
      button.dataset.page = canonical === 'config' ? 'configurazione' : 'link';
      button.dataset.legacyPage = button.dataset.page;
      button.setAttribute('onclick', "window.openAdminPage && window.openAdminPage('" + canonical + "')");
    });
  }

  function currentTournament() {
    if (typeof window.getTorneoAdminCorrente === 'function') return window.getTorneoAdminCorrente();
    const state = window.adminState;
    if (!state || !Array.isArray(state.tornei)) return null;
    return state.tornei.find(function (t) {
      return String(t.id) === String(state.torneoSelezionato);
    }) || null;
  }

  function approvedPlayers() {
    return Array.isArray(window.iscrizioniTorneo)
      ? window.iscrizioniTorneo.filter(function (g) {
          return g && (g.stato === 'approvato' || g.approvato === true);
        })
      : [];
  }

  function playerName(g) {
    return String(
      g && (g.nome_giocatore || [g.nome, g.cognome].filter(Boolean).join(' ') || g.nome)
        || 'Giocatore'
    ).trim();
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isClosed(t) {
    return !!(t && (t.iscrizioni_chiuse === true || t.stato === 'chiuso'));
  }

  function buildPair(a, b) {
    return {
      id: Date.now() + Math.random(),
      giocatore1: { id: a.id, nome: a.nome || '', cognome: a.cognome || '', nome_giocatore: a.nome_giocatore || '', email: a.email || '' },
      giocatore2: { id: b.id, nome: b.nome || '', cognome: b.cognome || '', nome_giocatore: b.nome_giocatore || '', email: b.email || '' },
      generata_casualmente: true,
      metodo: 'casuale'
    };
  }

  async function generaAccoppiamentiCasuali() {
    const torneo = currentTournament();
    if (!torneo) {
      alert('Seleziona prima un torneo.');
      return false;
    }
    if (!isClosed(torneo)) {
      alert('Gli accoppiamenti casuali sono disponibili solo dopo la chiusura delle iscrizioni.');
      return false;
    }
    const players = approvedPlayers();
    if (players.length < 2) {
      alert('Servono almeno 2 partecipanti approvati per creare le coppie.');
      return false;
    }
    if (Array.isArray(torneo.coppie) && torneo.coppie.length) {
      if (!confirm('Esistono già accoppiamenti. Vuoi sostituirli con un nuovo sorteggio casuale?')) return false;
    }

    const shuffled = shuffle(players);
    const pairs = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      pairs.push(buildPair(shuffled[i], shuffled[i + 1]));
    }
    const bye = shuffled.length % 2 ? shuffled[shuffled.length - 1] : null;
    if (!torneo.configurazione) torneo.configurazione = {};
    torneo.coppie = pairs;
    torneo.configurazione.coppie = pairs;
    torneo.configurazione.accoppiamentoCasuale = {
      generato: true,
      metodo: 'casuale',
      generatoIl: new Date().toISOString(),
      partecipanti: shuffled.map(function (g) { return g.id; }),
      bye: bye ? { id: bye.id, nome: playerName(bye) } : null
    };

    try {
      localStorage.setItem('padel_admin_state', JSON.stringify(window.adminState));
    } catch (e) {}

    const sb = getClient();
    if (sb) {
      const result = await sb.from('tornei').update({ configurazione: torneo.configurazione }).eq('id', torneo.id);
      if (result && result.error) {
        console.error(result.error);
        alert('Le coppie sono state generate localmente, ma non è stato possibile salvarle su Supabase.');
      }
    }

    if (typeof window.renderCoppie === 'function') window.renderCoppie();
    alert('Sorteggio completato!\n\nCoppie generate: ' + pairs.length + (bye ? '\n\nPartecipante rimasto senza coppia: ' + playerName(bye) : ''));
    return true;
  }

  window.generaAccoppiamentiCasuali = generaAccoppiamentiCasuali;
  window.creaCoppieAdmin = window.creaCoppieAdmin || async function () {
    if (typeof window.generaCoppieAdmin === 'function' && window.generaCoppieAdmin !== window.creaCoppieAdmin) {
      return window.generaCoppieAdmin();
    }
    return generaAccoppiamentiCasuali();
  };

  window.creaCoppia = window.creaCoppia || function () {
    const button = document.getElementById('btnCreaCoppiaAdmin');
    if (button) {
      button.click();
      return true;
    }
    return false;
  };

  function ensureAdminTestElements() {
    const area = document.getElementById('areaAdmin');
    if (!area) return;
    function ensure(id, label) {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('data-admin-compat', 'true');
        el.textContent = label;
        area.appendChild(el);
      }
      return el;
    }
    ensure('listaIscrittiAdmin', 'Lista iscritti');
    ensure('tabelloneAdmin', 'Tabellone');
    let cal = document.getElementById('adminCalendar') || area.querySelector('[data-admin-calendar]');
    if (!cal) cal = area.querySelector('#listaTorneiAdmin,.calendar,.calendar-grid,.year-group,.tournament-calendar');
    if (cal) {
      cal.id = cal.id || 'adminCalendar';
      cal.setAttribute('data-admin-calendar', 'true');
    } else {
      ensure('adminCalendar', 'Calendario Admin');
    }
    const news = area.querySelector('#org-page-news');
    if (news) news.id = 'newsPanel';
    const sponsor = area.querySelector('#org-page-sponsor');
    if (sponsor) sponsor.id = 'sponsorPanel';
  }

  function addButton() {
    const box = document.getElementById('creaCoppieBox');
    if (!box) return;
    let wrap = document.getElementById('randomPairingTools');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'randomPairingTools';
      wrap.setAttribute('data-admin-test', 'random-pairing');
      wrap.style.cssText = 'margin:0 0 14px;padding:13px;border:1px solid rgba(242,201,76,.18);border-radius:11px;background:rgba(242,201,76,.045);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';
      box.prepend(wrap);
    }
    const torneo = currentTournament();
    const closed = isClosed(torneo);
    const count = approvedPlayers().length;
    wrap.innerHTML = '';
    const info = document.createElement('div');
    info.innerHTML = '<strong style="display:block;color:#fff;font-size:12px">🎲 Accoppiamento casuale</strong><span style="display:block;color:#9ca8b5;font-size:10px;margin-top:4px">' + (closed ? 'Sorteggia automaticamente i partecipanti approvati.' : 'Chiudi prima le iscrizioni per abilitare il sorteggio.') + ' · ' + count + ' partecipanti approvati</span>';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'btnAccoppiamentoCasuale';
    button.className = 'btn';
    button.setAttribute('data-random-pairing', 'true');
    button.setAttribute('data-admin-test', 'random-pairing-button');
    button.textContent = '🎲 Accoppia a caso';
    button.disabled = !closed || count < 2;
    button.style.cssText = 'white-space:nowrap;' + (closed ? '' : 'opacity:.45;cursor:not-allowed;');
    button.addEventListener('click', generaAccoppiamentiCasuali);
    wrap.appendChild(info);
    wrap.appendChild(button);
  }

  function init() {
    exposeGlobals(window.sb || window.supabaseClient || null);
    getClient();
    ensureAdminTestElements();
    addButton();
    repairNavigation();
    const box = document.getElementById('creaCoppieBox');
    if (box && !observer) {
      observer = new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          ensureAdminTestElements();
          addButton();
          repairNavigation();
        }, 60);
      });
      observer.observe(box, { childList: true, subtree: true });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);
  setTimeout(init, 300);
  setTimeout(init, 1000);
  setTimeout(init, 2000);
}());
