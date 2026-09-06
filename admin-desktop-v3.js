/* ADMIN DESKTOP V3 - stable native admin bootstrap */
(function(){
  'use strict';

  var nativeSnapshot = null;
  var restoring = false;

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

  function bindNativeControls(){
    var a = area();
    if(!a) return;

    a.querySelectorAll('button,a,input,select,textarea,summary').forEach(function(el){
      el.style.pointerEvents = 'auto';
    });

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
  }

  function captureNative(){
    var a = area();
    if(!a || nativeSnapshot) return;
    if(a.querySelector('.sidebar') && a.querySelector('#page-dashboard') && a.querySelector('#page-configurazione')){
      nativeSnapshot = a.innerHTML;
    }
  }

  function isNativeLayout(){
    var a = area();
    return !!(a && a.querySelector('.sidebar') && a.querySelector('#page-dashboard') && a.querySelector('#page-configurazione'));
  }

  function restoreNativeIfOverwritten(){
    var a = area();
    if(!a || restoring || !nativeSnapshot || isNativeLayout()) return;
    restoring = true;
    a.innerHTML = nativeSnapshot;
    restoring = false;
    bindNativeControls();
    openPage('dashboard');
    console.warn('ADMIN DESKTOP V3: bloccata la sostituzione della struttura nativa admin.');
  }

  function boot(){
    var a = area();
    if(!a) return;
    captureNative();
    restoreNativeIfOverwritten();
    bindNativeControls();
  }

  function watchArea(){
    var a = area();
    if(!a || a.dataset.adminNativeObserver === '1') return;
    a.dataset.adminNativeObserver = '1';
    var observer = new MutationObserver(function(){
      if(!restoring) restoreNativeIfOverwritten();
    });
    observer.observe(a, {childList:true, subtree:true});
    a._adminNativeObserver = observer;
  }

  function start(){
    boot();
    watchArea();
    [100,300,700,1500,3000].forEach(function(t){
      setTimeout(function(){ boot(); watchArea(); }, t);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    start();
  }
  window.addEventListener('load', start);
})();