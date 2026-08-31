(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let mounted = false;

  const btn = (label, cls, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `desktop-btn ${cls || ''}`.trim();
    b.textContent = label;
    if (fn) b.addEventListener('click', fn);
    return b;
  };

  function mount() {
    const area = $('areaAdmin');
    if (!area || mounted || area.classList.contains('hidden')) return;
    mounted = true;

    const old = {
      create: area.querySelector(':scope > details:nth-of-type(1)'),
      tournaments: area.querySelector(':scope > details:nth-of-type(2)'),
      manage: $('gestioneTorneoAdmin'),
      news: area.querySelector(':scope > details:nth-of-type(3)'),
      sponsors: area.querySelector(':scope > details:nth-of-type(4)')
    };

    const sourceList = $('listaTorneiAdmin');
    const sourceParticipants = $('partecipantiAdmin');
    area.classList.add('desktop-mode');

    const shell = document.createElement('div');
    shell.className = 'desktop-app';
    shell.innerHTML = `
      <aside class="desktop-sidebar">
        <div class="desktop-brand"><div class="desktop-brand-icon">🏆</div><div><strong>ADMIN TORNEI</strong><span>Gestione campionati</span></div></div>
        <div class="desktop-nav-section">Gestione</div>
        <nav class="desktop-nav">
          <button class="active" data-target="tornei">🏆 <span>Tornei</span></button>
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
          <div class="desktop-lower"></div>
        </section>
      </main>`;

    area.innerHTML = '';
    area.appendChild(shell);

    const lower = shell.querySelector('.desktop-lower');
    const listBody = shell.querySelector('.desktop-tournament-body');
    const stats = shell.querySelector('.desktop-stats');
    const quick = shell.querySelector('.desktop-quick');

    const openCreate = () => {
      if (old.create) {
        old.create.open = true;
        lower.prepend(old.create);
        old.create.scrollIntoView({behavior:'smooth', block:'start'});
      }
    };

    shell.querySelector('.desktop-top-actions').append(
      btn('↻ Aggiorna','',()=>{ if(typeof caricaTorneiSupabase==='function') caricaTorneiSupabase(); setTimeout(renderAll,500); }),
      btn('⚙ Impostazioni','',()=>activate('config')),
      btn('＋ Nuovo torneo','primary',openCreate)
    );
    shell.querySelector('.desktop-title-actions').append(btn('＋ Crea torneo','primary',openCreate));

    const items = () => sourceList ? [...sourceList.querySelectorAll(':scope > .lista-item')] : [];
    const tournamentId = item => {
      const b = [...item.querySelectorAll('button')].find(x => (x.getAttribute('onclick') || '').includes('selezionaTorneoAdmin'));
      const m = (b?.getAttribute('onclick') || '').match(/selezionaTorneoAdmin\(([^)]+)\)/);
      return m ? m[1] : null;
    };

    function renderStats() {
      const ts = items();
      const req = $('richiesteIscrizione')?.querySelectorAll(':scope > .lista-item').length || 0;
      const app = sourceParticipants?.querySelectorAll(':scope > .lista-item').length || 0;
      const active = ts.filter(x => !/chiuso/i.test(x.querySelector('.badge')?.innerText || x.innerText)).length;
      stats.innerHTML = '';
      [['Tornei attivi',active,'● In corso'],['Iscritti',req + app,'Dati aggiornati'],['Da approvare',Math.max(0,req-app),'Richiedono attenzione'],['Tabelloni',ts.length,'Tornei disponibili']].forEach(([a,b,c]) => {
        const s=document.createElement('div'); s.className='desktop-stat';
        s.innerHTML=`<div class="desktop-stat-label">${a}</div><div class="desktop-stat-value">${b}</div><div class="desktop-stat-note">${c}</div>`;
        stats.appendChild(s);
      });
    }

    function renderTournaments() {
      listBody.innerHTML='';
      const ts=items();
      if(!ts.length){ listBody.innerHTML='<p class="desktop-muted">Nessun torneo creato.</p>'; return; }
      ts.slice(0,8).forEach(item => {
        const row=document.createElement('div'); row.className='desktop-tournament-row';
        const info=document.createElement('div'); info.className='desktop-t-info';
        const lines=item.innerText.split('\n').map(x=>x.trim()).filter(Boolean);
        const name=document.createElement('strong'); name.textContent=item.querySelector('b')?.innerText.trim()||'Torneo senza nome';
        const date=lines.find(x=>x.includes('📅'))||'📅 -';
        const places=lines.find(x=>x.includes('👥'))||'👥 - posti';
        const small=document.createElement('small'); small.textContent=`${date.replace('📅','').trim()} · ${places.replace('👥','').trim()}`;
        const badge=item.querySelector('.badge');
        const st=document.createElement('span'); st.className='desktop-status'+(/chiuso/i.test(badge?.innerText||'')?' closed':''); st.textContent=`● ${badge?.innerText.trim()||'bozza'}`;
        info.append(name,small,st);
        const actions=document.createElement('div'); actions.className='desktop-actions';
        const id=tournamentId(item);
        actions.append(
          btn('Gestisci','',()=>{ if(id&&typeof selezionaTorneoAdmin==='function') selezionaTorneoAdmin(id); if(old.manage){ old.manage.classList.remove('hidden'); lower.prepend(old.manage); } setTimeout(renderAll,300); }),
          btn('🔗','',()=>{ if(id&&typeof selezionaTorneoAdmin==='function') selezionaTorneoAdmin(id); setTimeout(()=>{ if(typeof generaLinkBove==='function') generaLinkBove(); },350); })
        );
        row.append(info,actions); listBody.appendChild(row);
      });
    }

    function renderQuick() {
      quick.innerHTML='';
      [['👥 Approva iscritti','Gestisci le richieste',()=>activate('iscritti')],['🔀 Accoppiamenti','Gestisci le coppie',()=>activate('coppie')],['📋 Apri tabellone','Apri il torneo selezionato',()=>activate('tabellone')],['🔗 Copia link','Link pubblico',()=>{ if(typeof copiaLinkBove==='function') copiaLinkBove(); }]].forEach(([a,b,f])=>{
        const q=btn('',''); q.innerHTML=`<b>${a}</b><span>${b}</span>`; q.addEventListener('click',f); quick.appendChild(q);
      });
    }

    function activate(target) {
      shell.querySelectorAll('.desktop-nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
      if(target==='tornei') shell.querySelector('.desktop-tournaments')?.scrollIntoView({behavior:'smooth'});
      if(target==='iscritti'||target==='coppie'){
        if(old.manage){ old.manage.classList.remove('hidden'); lower.prepend(old.manage); const d=old.manage.querySelector(':scope > details'); if(d)d.open=true; }
        setTimeout(()=>$(target==='iscritti'?'richiesteIscrizione':'creaCoppieBox')?.scrollIntoView({behavior:'smooth'}),250);
      }
      if(target==='config') openCreate();
      if(target==='link') { if(old.manage){ old.manage.classList.remove('hidden'); lower.prepend(old.manage); } setTimeout(()=>$('linkBoveGenerato')?.scrollIntoView({behavior:'smooth'}),150); }
      if(target==='tabellone') { const id=tournamentId(items()[0]); if(id&&typeof apriBoveConTorneo==='function') apriBoveConTorneo(id); }
    }

    shell.querySelectorAll('.desktop-nav button').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));

    // Gli elementi reali vengono spostati DOPO la dashboard, senza cambiare ID o funzioni.
    if(old.create) lower.appendChild(old.create);
    if(old.manage) lower.appendChild(old.manage);
    if(old.news) lower.appendChild(old.news);
    if(old.sponsors) lower.appendChild(old.sponsors);

    function renderAll(){ renderStats(); renderTournaments(); renderQuick(); }
    renderAll();
    window.__adminDesktopRender=renderAll;
    if(sourceList) new MutationObserver(()=>setTimeout(renderAll,40)).observe(sourceList,{childList:true,subtree:true});
    if(sourceParticipants) new MutationObserver(()=>setTimeout(renderAll,40)).observe(sourceParticipants,{childList:true,subtree:true});
  }

  function watch(){ const area=$('areaAdmin'); if(area&&!mounted&&!area.classList.contains('hidden')) mount(); }
  document.addEventListener('DOMContentLoaded',()=>{ watch(); setTimeout(watch,300); setTimeout(watch,1000); setTimeout(watch,2000); });
  document.addEventListener('click',()=>setTimeout(watch,50));
})();