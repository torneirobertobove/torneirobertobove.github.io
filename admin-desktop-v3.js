/* ADMIN DESKTOP V3 - stable native admin bootstrap */
(function(){
  'use strict';

  function area(){ return document.getElementById('areaAdmin'); }

  function pageAlias(page){
    page = String(page || '').toLowerCase();
    if(page === 'config') return 'configurazione';
    if(page === 'links') return 'link';
    return page;
  }

  function openPage(page){
    page = pageAlias(page || 'dashboard');
    var target = document.getElementById('page-' + page);
    if(!target) return false;

    document.querySelectorAll('.admin-page').forEach(function(p){
      p.classList.remove('active');
    });
    target.classList.add('active');

    document.querySelectorAll('.sidebar [data-page]').forEach(function(btn){
      var p = pageAlias(btn.dataset.page || '');
      btn.classList.toggle('active', p === page);
    });

    var title = document.getElementById('breadcrumbTitle');
    var titles = {
      dashboard:'Tornei',
      iscritti:'Iscritti',
      coppie:'Accoppiamenti',
      tabellone:'Tabellone',
      news:'News',
      sponsor:'Sponsor',
      configurazione:'Nuovo torneo',
      link:'Link pubblici',
      comunicazioni:'Comunicazioni'
    };
    if(title) title.textContent = titles[page] || 'Gestione';

    try { history.replaceState(null, '', '#' + page); } catch(e) {}
    window.scrollTo({top:0, behavior:'smooth'});
    return true;
  }

  window.openAdminPage = openPage;
  window.goAdminPage = openPage;
  window.adminGoPage = openPage;

  function boot(){
    var a = area();
    if(!a) return;

    /* Keep the native admin UI clickable. */
    a.querySelectorAll('button,a,input,select,textarea,summary').forEach(function(el){
      el.style.pointerEvents = 'auto';
    });

    /* Native data-page navigation. */
    a.querySelectorAll('[data-page]').forEach(function(btn){
      if(btn.dataset.adminNativeBound === '1') return;
      btn.dataset.adminNativeBound = '1';
      btn.addEventListener('click', function(e){
        var page = btn.dataset.page;
        if(!page) return;
        e.preventDefault();
        e.stopPropagation();
        openPage(page);
      });
    });

    /* The real create button must open the real configuration screen. */
    a.querySelectorAll('button').forEach(function(btn){
      var text = String(btn.textContent || '').replace(/\s+/g,' ').trim().toLowerCase();
      if(/nuovo torneo|crea torneo/.test(text) && btn.dataset.page !== 'dashboard'){
        if(!btn.dataset.adminCreateBound){
          btn.dataset.adminCreateBound = '1';
          btn.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            openPage('configurazione');
          });
        }
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }

  window.addEventListener('load', boot);
})();