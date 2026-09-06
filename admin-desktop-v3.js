/* ADMIN DESKTOP V4 - stable native admin navigation */
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
      btn.classList.toggle('active', pageAlias(btn.dataset.page || '') === page);
    });

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
    window.scrollTo({top:0, behavior:'smooth'});
    return true;
  }

  window.openAdminPage = openPage;
  window.goAdminPage = openPage;
  window.adminGoPage = openPage;

  function bind(){
    var a = area();
    if(!a || a.dataset.adminNavBound === '1') return;
    a.dataset.adminNavBound = '1';

    a.addEventListener('click', function(e){
      var btn = e.target.closest('[data-page]');
      if(!btn || !a.contains(btn)) return;
      var page = pageAlias(btn.dataset.page);
      if(!page) return;
      e.preventDefault();
      e.stopPropagation();
      openPage(page);
    });
  }

  function start(){
    bind();
    if(location.hash){
      var page = location.hash.replace(/^#/, '');
      if(document.getElementById('page-' + page)) openPage(page);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', start);
})();