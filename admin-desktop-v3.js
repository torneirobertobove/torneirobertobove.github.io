(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  let mounted = false;
  let old = {};
  let shell = null;

  const makeButton = (label, cls, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `desktop-btn ${cls || ''}`.trim();
    b.textContent = label;
    if (fn) b.addEventListener('click', fn);
    return b;
  };

  function getSourceDetails(area) {
    const details = [...area.querySelectorAll(':scope > details')];
    return {
      create: details[0] || null,
      tournaments: details[1] || null,
      news: details[2] || null,
      sponsors: details[3] || null,
      manage: $('gestioneTorneoAdmin')
    };
  }

  function tournamentItems() {
    const box = $('listaTorneiAdmin');
    return box ? [...box.querySelectorAll(':scope > .lista-item')] : [];
  }

  function tournamentId(item) {
    const b = [...item.querySelectorAll('button')].find(x =>
      (x.getAttribute('onclick') || '').includes('selezionaTorneoAdmin')
    );
    const m = (b?.getAttribute('onclick') || '').match(/selezionaTorneoAdmin\(([^)]+)\)/);
    return m ? m[1] : null;
  }

  function openDetails(d) {
    if (!d) return;
    d.classList.remove('hidden');
    d.open = true;
  }

  function showWorkspace(target) {
    const workspace = shell?.querySelector('.desktop-workspace');
    if (!workspace) return;

    workspace.innerHTML = '';
    workspace.classList.remove('empty');

    let node = null;
    if (target === 'create') node = old.create;
    if (target === 'tornei') node = old.tournaments;
    if (target === 'manage') node = old.manage;
    if (target === 'news') node = old.news;
    if (target === 'sponsors') node = old.sponsors;

    if (!node) {
      workspace.classList.add('empty');
      return;
    }

    workspace.appendChild(node);
    openDetails(node);
    workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function refreshDashboard() {
    if (!shell) return;

    const stats = shell.querySelector('.desktop-stats');
    const listBody = shell.querySelector('.desktop-tournament-body');
    if (!stats || !listBody) return;

    const items = tournamentItems();
    const req = $('richiesteIscrizione');
    const approved = $('partecipantiAdmin');
    const pendingCount = req ? req.querySelectorAll(':scope > .lista-item').length : 0;
    const approvedCount = approved ? approved.querySelectorAll(':scope > .lista-item').length : 0;
    const activeCount = items.filter(x => !/chiuso/i.test(x.querySelector('.badge')?.innerText || x.innerText)).length;

    stats.innerHTML = '';
    [
      ['Tornei attivi', activeCount, '● In corso'],
      ['Iscritti', pendingCount + approvedCount, 'Dati aggiornati'],
      ['Da approvare', Math.max(0, pendingCount - approvedCount), 'Richiedono attenzione'],
      ['Tabelloni', items.length, 'Link disponibili']
    ].forEach(([label, value, note]) => {
      const s = document.createElement('div');
      s.className = 'desktop-stat';
      s.innerHTML = `<div class="desktop-stat-label">${label}</div><div class="desktop-stat-value">${value}</div><div class="desktop-stat-note">${note}</div>`;
      stats.appendChild(s);
    });

    listBody.innerHTML = '';
    if (!items.length) {
      listBody.innerHTML = '<p class="desktop-muted">Nessun torneo creato.</p>';
      return;
    }

    items.slice(0, 8).forEach(item => {
      const row = document.createElement('div');
      row.className = 'desktop-tournament-row';

      const info = document.createElement('div');
      info.className = 'desktop-t-info';
      const name = item.querySelector('b')?.innerText.trim() || 'Torneo senza nome';
      const lines = item.innerText.split('\n').map(x => x.trim()).filter(Boolean);
      const date = lines.find(x => x.includes('📅')) || '📅 -';
      const places = lines.find(x => x.includes('👥')) || '👥 - posti';
      const badge = item.querySelector('.badge');

      info.innerHTML = `<strong>${name}</strong><small>${date.replace('📅', '').trim()} · ${places.replace('👥', '').trim()}</small>`;
      const status = document.createElement('span');
      status.className = 'desktop-status' + (/chiuso/i.test(badge?.innerText || '') ? ' closed' : '');
      status.textContent = `● ${badge?.innerText.trim() || 'bozza'}`;
      info.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'desktop-actions';
      const id = tournamentId(item);

      actions.append(
        makeButton('Gestisci', '', () => {
          if (id && typeof selezionaTorneoAdmin === 'function') selezionaTorneoAdmin(id);
          setTimeout(() => showWorkspace('manage'), 250);
        }),
        makeButton('🔗', '', () => {
          if (id && typeof selezionaTorneoAdmin === 'function') selezionaTorneoAdmin(id);
          setTimeout(() => {
            if (typeof generaLinkBove === 'function') generaLinkBove();
          }, 350);
        })
      );

      row.append(info, actions);
      listBody.appendChild(row);
    });
  }

  function mount() {
    const area = $('areaAdmin');
    if (!area || mounted || area.classList.contains('hidden')) return;

    old = getSourceDetails(area);
    mounted = true;

    const sourceNodes = [old.create, old.tournaments, old.manage, old.news, old.sponsors].filter(Boolean);
    const sourceList = $('listaTorneiAdmin');
    const sourceParticipants = $('partecipantiAdmin');

    area.classList.add('desktop-mode');

    shell = document.createElement('div');
    shell.className = 'desktop-app';
    shell.innerHTML = `
      <aside class="desktop-sidebar">
        <div class="desktop-brand">
          <div class="desktop-brand-icon">🏆</div>
          <div><strong>ADMIN TORNEI</strong><span>Gestione campionati</span></div>
        </div>

        <div class="desktop-nav-section">Gestione</div>
        <nav class="desktop-nav">
          <button class="active" data-target="dashboard">🏆 <span>Tornei</span></button>
          <button data-target="iscritti">👥 <span>Iscritti</span></button>
          <button data-target="coppie">🔀 <span>Accoppiamenti</span></button>
          <button data-target="tabellone">📋 <span>Tabellone</span></button>
        </nav>

        <div class="desktop-nav-section">Sistema</div>
        <nav class="desktop-nav">
          <button data-target="config">⚙️ <span>Configurazione</span></button>
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
            <div>
              <h1>Dashboard Tornei</h1>
              <p>Panoramica e accesso rapido alle operazioni amministrative.</p>
            </div>
            <div class="desktop-title-actions"></div>
          </div>

          <div class="desktop-stats"></div>

          <div class="desktop-grid">
            <div class="desktop-card desktop-tournaments">
              <div class="desktop-card-head"><h2>🏆 Tornei</h2><span>Elenco recente</span></div>
              <div class="desktop-card-body desktop-tournament-body"></div>
            </div>

            <div class="desktop-card">
              <div class="desktop-card-head"><h2>⚡ Azioni rapide</h2><span>Operazioni frequenti</span></div>
              <div class="desktop-card-body desktop-quick"></div>
            </div>
          </div>

          <div class="desktop-workspace empty"></div>
        </section>
      </main>`;

    area.innerHTML = '';
    area.appendChild(shell);

    const topActions = shell.querySelector('.desktop-top-actions');
    const titleActions = shell.querySelector('.desktop-title-actions');
    const quick = shell.querySelector('.desktop-quick');

    const openCreate = () => showWorkspace('create');

    topActions.append(
      makeButton('↻ Aggiorna', '', async () => {
        if (typeof caricaTorneiSupabase === 'function') await caricaTorneiSupabase();
        setTimeout(refreshDashboard, 350);
      }),
      makeButton('⚙ Impostazioni', '', () => showWorkspace('create')),
      makeButton('＋ Nuovo torneo', 'primary', openCreate)
    );
    titleActions.append(makeButton('＋ Crea torneo', 'primary', openCreate));

    quick.append(
      makeButton('', '', () => showWorkspace('manage')),
      makeButton('', '', () => showWorkspace('manage')),
      makeButton('', '', () => {
        const items = tournamentItems();
        const id = items.length ? tournamentId(items[0]) : null;
        if (id && typeof apriBoveConTorneo === 'function') apriBoveConTorneo(id);
        else alert('Seleziona prima un torneo.');
      }),
      makeButton('', '', () => {
        if (typeof copiaLinkBove === 'function') copiaLinkBove();
        else showWorkspace('link');
      })
    );

    const q = [...quick.children];
    q[0].innerHTML = '<b>👥 Approva iscritti</b><span>Gestisci le richieste</span>';
    q[1].innerHTML = '<b>🔀 Accoppiamenti</b><span>Genera le sfide</span>';
    q[2].innerHTML = '<b>📋 Apri tabellone</b><span>Visualizza il torneo</span>';
    q[3].innerHTML = '<b>🔗 Copia link</b><span>Link pubblico</span>';

    shell.querySelectorAll('.desktop-nav button').forEach(b => {
      b.addEventListener('click', () => {
        shell.querySelectorAll('.desktop-nav button').forEach(x => x.classList.toggle('active', x === b));
        const target = b.dataset.target;
        if (target === 'dashboard') {
          shell.querySelector('.desktop-tournaments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (target === 'iscritti') {
          showWorkspace('manage');
          setTimeout(() => $('richiesteIscrizione')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
        } else if (target === 'coppie') {
          showWorkspace('manage');
          setTimeout(() => $('creaCoppieBox')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
        } else if (target === 'tabellone') {
          const items = tournamentItems();
          const id = items.length ? tournamentId(items[0]) : null;
          if (id && typeof apriBoveConTorneo === 'function') apriBoveConTorneo(id);
        } else if (target === 'config') {
          showWorkspace('create');
        } else if (target === 'link') {
          showWorkspace('manage');
          setTimeout(() => $('linkBoveGenerato')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
        }
      });
    });

    // Keep all original functional nodes detached from the dashboard until requested.
    sourceNodes.forEach(node => node.remove());

    refreshDashboard();

    window.__adminDesktopRender = refreshDashboard;

    if (sourceList) {
      new MutationObserver(() => setTimeout(refreshDashboard, 50)).observe(sourceList, { childList: true, subtree: true });
    }
    if (sourceParticipants) {
      new MutationObserver(() => setTimeout(refreshDashboard, 50)).observe(sourceParticipants, { childList: true, subtree: true });
    }
  }

  function watch() {
    const area = $('areaAdmin');
    if (area && !mounted && !area.classList.contains('hidden')) mount();
  }

  document.addEventListener('DOMContentLoaded', () => {
    watch();
    setTimeout(watch, 300);
    setTimeout(watch, 800);
    setTimeout(watch, 1500);
    setTimeout(watch, 2500);
  });

  document.addEventListener('click', () => setTimeout(watch, 50));
})();