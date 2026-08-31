(() => {
  'use strict';

  let mounted = false;
  let pool = {};
  let shell = null;

  const $ = id => document.getElementById(id);

  function btn(label, cls, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `desktop-btn ${cls || ''}`.trim();
    if (label) b.textContent = label;
    if (fn) b.addEventListener('click', fn);
    return b;
  }

  function detailsMap(area) {
    const d = [...area.querySelectorAll(':scope > details')];
    return {
      create: d[0] || null,
      tournaments: d[1] || null,
      news: d[2] || null,
      sponsors: d[3] || null,
      manage: $('gestioneTorneoAdmin') || null
    };
  }

  function tournamentRows() {
    const box = $('listaTorneiAdmin');
    return box ? [...box.querySelectorAll(':scope > .lista-item')] : [];
  }

  function getId(row) {
    const b = [...row.querySelectorAll('button')].find(x => /selezionaTorneoAdmin/.test(x.getAttribute('onclick') || ''));
    const m = (b?.getAttribute('onclick') || '').match(/selezionaTorneoAdmin\(([^)]+)\)/);
    return m ? m[1] : null;
  }

  function selectedId() {
    try { return typeof adminState !== 'undefined' ? adminState.torneoSelezionato : null; } catch (_) { return null; }
  }

  function workspace(title, node) {
    const w = shell?.querySelector('.desktop-workspace');
    if (!w || !node) return;
    w.innerHTML = '';
    w.classList.remove('empty');

    const panel = document.createElement('details');
    panel.className = 'desktop-workspace-panel';
    panel.open = true;

    const summary = document.createElement('summary');
    summary.textContent = title;
    panel.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'desktop-workspace-body';
    body.appendChild(node);
    panel.appendChild(body);
    w.appendChild(panel);
    w.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openCreate() {
    if (!pool.create) return;
    workspace('⚙️ Configurazione torneo', pool.create);
    pool.create.open = true;
  }

  function openManage(section) {
    if (!pool.manage) return;
    if (selectedId() == null) {
      const first = tournamentRows()[0];
      const id = first && getId(first);
      if (id && typeof window.selezionaTorneoAdmin === 'function') window.selezionaTorneoAdmin(id);
    }
    setTimeout(() => {
      workspace('⚙️ Gestione torneo', pool.manage);
      pool.manage.classList.remove('hidden');
      if (section) setTimeout(() => $(section)?.scrollIntoView({behavior:'smooth', block:'start'}), 120);
    }, 120);
  }

  function openLink() {
    openManage('linkBoveGenerato');
  }

  function refresh() {
    if (!shell) return;
    const stats = shell.querySelector('.desktop-stats');
    const body = shell.querySelector('.desktop-tournament-body');
    if (!stats || !body) return;

    const rows = tournamentRows();
    const req = $('richiesteIscrizione');
    const approved = $('partecipantiAdmin');
    const pending = req ? req.querySelectorAll(':scope > .lista-item').length : 0;
    const ok = approved ? approved.querySelectorAll(':scope > .lista-item').length : 0;
    const active = rows.filter(r => !/chiuso/i.test(r.querySelector('.badge')?.textContent || '')).length;

    stats.innerHTML = '';
    [['Tornei attivi',active,'● In corso'],['Iscritti',pending+ok,'Dati aggiornati'],['Da approvare',pending,'Richiedono attenzione'],['Tabelloni',rows.length,'Link disponibili']].forEach(x => {
      const s = document.createElement('div');
      s.className = 'desktop-stat';
      s.innerHTML = `<div class="desktop-stat-label">${x[0]}</div><div class="desktop-stat-value">${x[1]}</div><div class="desktop-stat-note">${x[2]}</div>`;
      stats.appendChild(s);
    });

    body.innerHTML = '';
    if (!rows.length) {
      body.innerHTML = '<p class="desktop-muted">Nessun torneo creato.</p>';
      return;
    }

    rows.slice(0,8).forEach(r => {
      const row = document.createElement('div');
      row.className = 'desktop-tournament-row';
      const info = document.createElement('div');
      info.className = 'desktop-t-info';
      const name = r.querySelector('b')?.textContent.trim() || 'Torneo senza nome';
      const text = r.innerText.split('\n').map(v=>v.trim()).filter(Boolean);
      const date = text.find(v=>v.includes('📅')) || '📅 -';
      const places = text.find(v=>v.includes('👥')) || '👥 -';
      const badge = r.querySelector('.badge');
      info.innerHTML = `<strong>${name}</strong><small>${date.replace('📅','').trim()} · ${places.replace('👥','').trim()}</small>`;
      const st = document.createElement('span');
      st.className = 'desktop-status' + (/chiuso/i.test(badge?.textContent || '') ? ' closed' : '');
      st.textContent = `● ${(badge?.textContent || 'bozza').trim()}`;
      info.appendChild(st);

      const actions = document.createElement('div');
      actions.className = 'desktop-actions';
      const id = getId(r);
      actions.append(
        btn('Gestisci','',()=>{
          if (id && typeof window.selezionaTorneoAdmin === 'function') window.selezionaTorneoAdmin(id);
          setTimeout(()=>openManage(),180);
        }),
        btn('🔗','',()=>{
          if (id && typeof window.selezionaTorneoAdmin === 'function') window.selezionaTorneoAdmin(id);
          setTimeout(()=>{ if(typeof window.generaLinkBove==='function') window.generaLinkBove(); openLink(); },220);
        })
      );
      row.append(info,actions);
      body.appendChild(row);
    });
  }

  function mount() {
    const area = $('areaAdmin');
    if (!area || mounted || area.classList.contains('hidden')) return;

    pool = detailsMap(area);
    mounted = true;

    shell = document.createElement('div');
    shell.className = 'desktop-app';
    shell.innerHTML = `
      <aside class="desktop-sidebar">
        <div class="desktop-brand"><div class="desktop-brand-icon">🏆</div><div><strong>ADMIN TORNEI</strong><span>Gestione campionati</span></div></div>
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
        <header class="desktop-topbar"><div class="desktop-breadcrumb">Gestione / <b>Tornei</b></div><div class="desktop-top-actions"></div></header>
        <section class="desktop-content">
          <div class="desktop-page-title"><div><h1>Dashboard Tornei</h1><p>Panoramica e accesso rapido alle operazioni amministrative.</p></div><div class="desktop-title-actions"></div></div>
          <div class="desktop-stats"></div>
          <div class="desktop-grid">
            <div class="desktop-card desktop-tournaments"><div class="desktop-card-head"><h2>🏆 Tornei</h2><span>Elenco recente</span></div><div class="desktop-card-body desktop-tournament-body"></div></div>
            <div class="desktop-card"><div class="desktop-card-head"><h2>⚡ Azioni rapide</h2><span>Operazioni frequenti</span></div><div class="desktop-card-body desktop-quick"></div></div>
          </div>
          <div class="desktop-workspace empty"></div>
        </section>
      </main>`;

    area.classList.add('desktop-mode');
    area.innerHTML = '';
    area.appendChild(shell);

    const top = shell.querySelector('.desktop-top-actions');
    const title = shell.querySelector('.desktop-title-actions');
    const quick = shell.querySelector('.desktop-quick');

    top.append(
      btn('↻ Aggiorna','',async()=>{
        if(typeof window.caricaTorneiSupabase==='function') await window.caricaTorneiSupabase();
        if(typeof window.caricaNewsAdmin==='function') await window.caricaNewsAdmin();
        if(typeof window.caricaSponsorAdmin==='function') await window.caricaSponsorAdmin();
        setTimeout(refresh,250);
      }),
      btn('⚙ Impostazioni','',openCreate),
      btn('＋ Nuovo torneo','primary',openCreate)
    );
    title.append(btn('＋ Crea torneo','primary',openCreate));

    const q1=btn('','',()=>openManage('richiesteIscrizione')); q1.innerHTML='<b>👥 Approva iscritti</b><span>Gestisci le richieste</span>';
    const q2=btn('','',()=>openManage('creaCoppieBox')); q2.innerHTML='<b>🔀 Accoppiamenti</b><span>Genera le sfide</span>';
    const q3=btn('','',()=>{const r=tournamentRows()[0],id=r&&getId(r);if(id&&typeof window.apriBoveConTorneo==='function')window.apriBoveConTorneo(id);else alert('Seleziona prima un torneo.');}); q3.innerHTML='<b>📋 Apri tabellone</b><span>Visualizza il torneo</span>';
    const q4=btn('','',()=>{if(typeof window.copiaLinkBove==='function')window.copiaLinkBove();else openLink();}); q4.innerHTML='<b>🔗 Copia link</b><span>Link pubblico</span>';
    quick.append(q1,q2,q3,q4);

    shell.querySelectorAll('.desktop-nav button').forEach(b=>b.addEventListener('click',()=>{
      shell.querySelectorAll('.desktop-nav button').forEach(x=>x.classList.toggle('active',x===b));
      const t=b.dataset.target;
      if(t==='dashboard') shell.querySelector('.desktop-tournaments')?.scrollIntoView({behavior:'smooth',block:'start'});
      if(t==='iscritti') openManage('richiesteIscrizione');
      if(t==='coppie') openManage('creaCoppieBox');
      if(t==='config') openCreate();
      if(t==='link') openLink();
      if(t==='tabellone'){
        const id=selectedId() || (tournamentRows()[0] && getId(tournamentRows()[0]));
        if(id&&typeof window.apriBoveConTorneo==='function') window.apriBoveConTorneo(id);
      }
    }));

    Object.values(pool).forEach(n=>{ if(n && n.parentNode) n.remove(); });
    [
      $('listaTorneiAdmin'),$('richiesteIscrizione'),$('partecipantiAdmin'),$('listaCoppieAdmin'),$('listaNewsAdmin'),$('listaSponsorAdmin')
    ].filter(Boolean).forEach(el=>new MutationObserver(()=>setTimeout(refresh,80)).observe(el,{childList:true,subtree:true}));

    refresh();
    window.__adminDesktopRender = refresh;
  }

  function watch(){
    const area=$('areaAdmin');
    if(area && !mounted && !area.classList.contains('hidden')) mount();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    watch();
    setTimeout(watch,200);
    setTimeout(watch,700);
    setTimeout(watch,1500);
    setTimeout(watch,2500);
  });
  document.addEventListener('click',()=>setTimeout(watch,50));
})();
