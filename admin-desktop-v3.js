/* ADMIN DESKTOP V5 - explicit admin functions */
(function(){
  'use strict';

  function area(){ return document.getElementById('areaAdmin'); }

  function pageAlias(page){
    page = String(page || '').toLowerCase();
    if(page === 'config') return 'configurazione';
    if(page === 'links') return 'link';
    return page;
  }

  function syncOrgPage(page){
    var orgPage = document.getElementById('org-page-' + pageAlias(page));
    document.querySelectorAll('#areaAdmin .org-page').forEach(function(p){
      p.classList.remove('org-active');
    });
    if(orgPage) orgPage.classList.add('org-active');
  }

  function openPage(page){
    page = pageAlias(page || 'dashboard');
    var target = document.getElementById('page-' + page);
    if(!target) return false;

    document.querySelectorAll('#areaAdmin .admin-page').forEach(function(p){
      p.classList.remove('active');
    });
    target.classList.add('active');

    document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(function(btn){
      btn.classList.toggle('active', pageAlias(btn.dataset.page || '') === page);
    });

    syncOrgPage(page);

    var title = document.getElementById('breadcrumbTitle');
    var titles = {
      dashboard:'Tornei',
      iscritti:'Iscritti',
      coppie:'Accoppiamenti',
      tabellone:'Tabellone',
      news:'News',
      sponsor:'Sponsor',
      configurazione:'Configurazione',
      link:'Link pubblici',
      comunicazioni:'Comunicazioni'
    };
    if(title) title.textContent = titles[page] || 'Gestione';
    try { history.replaceState(null, '', '#' + page); } catch(e) {}
    try { window.scrollTo({top:0, behavior:'smooth'}); } catch(e) { window.scrollTo(0,0); }
    return true;
  }

  function nuovoTorneo(){
    if(typeof window.openWizard === 'function'){
      window.openWizard();
      return true;
    }
    if(typeof window.apriWizardTorneo === 'function'){
      window.apriWizardTorneo();
      return true;
    }
    if(typeof window.nuovoTorneo === 'function'){
      window.nuovoTorneo();
      return true;
    }
    return openPage('configurazione');
  }

  function aggiorna(){
    if(typeof window.caricaTorneiSupabase === 'function'){
      var result = window.caricaTorneiSupabase();
      if(result && typeof result.catch === 'function') result.catch(function(e){ console.error('[ADMIN NAV] aggiornamento',e); });
    }
    return true;
  }

  window.openAdminPage = openPage;
  window.goAdminPage = openPage;
  window.adminGoPage = openPage;
  window.nuovoTorneoAdmin = nuovoTorneo;
  window.aggiornaAdmin = aggiorna;

  function isCreateButton(btn){
    if(!btn) return false;
    if(btn.dataset && btn.dataset.page === 'configurazione'){
      var text = (btn.textContent || '').replace(/\s+/g,' ').trim().toLowerCase();
      return text.indexOf('nuovo torneo') >= 0 || text.indexOf('crea torneo') >= 0;
    }
    return false;
  }

  function handleClick(e){
    var btn = e.target && e.target.closest ? e.target.closest('button,[role="button"],a[data-page]') : null;
    if(!btn) return;
    var a = area();
    if(!a || !a.contains(btn)) return;

    if(btn.id === 'btnAggiorna'){
      e.preventDefault();
      e.stopImmediatePropagation();
      aggiorna();
      return;
    }

    if(isCreateButton(btn)){
      e.preventDefault();
      e.stopImmediatePropagation();
      nuovoTorneo();
      return;
    }

    var page = btn.getAttribute('data-page');
    if(page){
      page = pageAlias(page);
      if(document.getElementById('page-' + page)){
        e.preventDefault();
        e.stopImmediatePropagation();
        openPage(page);
      }
    }
  }

  function bind(){
    var a = area();
    if(!a) return false;
    if(a.dataset.adminNavBound === 'v5') return true;
    a.dataset.adminNavBound = 'v5';

    document.addEventListener('click', handleClick, true);
    return true;
  }

  function start(){
    bind();
    var hash = String(location.hash || '').replace(/^#/,'');
    if(hash && document.getElementById('page-' + pageAlias(hash))) openPage(hash);
    else openPage('dashboard');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    start();
  }
  window.addEventListener('load', start);
})();