/* ADMIN DESKTOP V6 - complete explicit admin function bridge */
(function(){
  'use strict';

  function area(){ return document.getElementById('areaAdmin'); }
  function alias(p){ p=String(p||'').toLowerCase(); return p==='config'?'configurazione':(p==='links'?'link':p); }
  function call(name){
    var fn=window[name];
    if(typeof fn!=='function') return false;
    try { return fn.apply(window,Array.prototype.slice.call(arguments,1)); }
    catch(e){ console.error('[ADMIN V6] '+name,e); return false; }
  }

  function openPage(page){
    page=alias(page||'dashboard');
    var target=document.getElementById('page-'+page);
    if(!target) return false;
    document.querySelectorAll('#areaAdmin .admin-page').forEach(function(p){p.classList.remove('active');});
    target.classList.add('active');
    document.querySelectorAll('#areaAdmin [data-page]').forEach(function(b){b.classList.toggle('active',alias(b.dataset.page)===page);});
    document.querySelectorAll('#areaAdmin .org-page').forEach(function(p){p.classList.remove('org-active');});
    var org=document.getElementById('org-page-'+page); if(org) org.classList.add('org-active');
    var titles={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',news:'News',sponsor:'Sponsor',configurazione:'Configurazione',link:'Link pubblici'};
    var title=document.getElementById('breadcrumbTitle'); if(title) title.textContent=titles[page]||'Gestione';
    try{history.replaceState(null,'','#'+page);}catch(e){}
    return true;
  }

  function nuovoTorneo(){
    if(call('openWizard')) return true;
    if(call('apriWizardTorneo')) return true;
    if(call('apriRegoleNuovoTorneo')) return true;
    if(call('nuovoTorneo')) return true;
    return openPage('configurazione');
  }
  function aggiorna(){
    var r=call('caricaTorneiSupabase');
    call('caricaRichiesteIscrizione');
    return r!==false;
  }
  function gestisciTorneo(id){ return call('selezionaTorneoAdmin',id); }
  function eliminaTorneo(id){ return call('eliminaTorneoAdmin',id); }
  function pubblica(){ return call('pubblicaTorneo'); }
  function chiudiIscrizioni(){ return call('chiudiIscrizioniTorneo'); }
  function apriBove(id){ return call('apriBoveConTorneo',id); }
  function generaLink(id){ if(id!=null) call('generaLinkPerId',id); else call('generaLinkBove'); return true; }
  function copiaLink(){ return call('copiaLinkBove'); }
  function creaNews(){ return call('creaNews'); }
  function salvaSponsor(){ return call('salvaSponsor'); }

  window.openAdminPage=openPage;
  window.goAdminPage=openPage;
  window.adminGoPage=openPage;
  window.nuovoTorneoAdmin=nuovoTorneo;
  window.aggiornaAdmin=aggiorna;
  window.gestisciTorneoAdmin=gestisciTorneo;
  window.eliminaTorneoAdmin=eliminaTorneo;
  window.pubblicaTorneoAdmin=pubblica;
  window.chiudiIscrizioniAdmin=chiudiIscrizioni;
  window.apriBoveAdmin=apriBove;
  window.generaLinkAdmin=generaLink;
  window.copiaLinkAdmin=copiaLink;
  window.creaNewsAdmin=creaNews;
  window.salvaSponsorAdmin=salvaSponsor;

  function click(e){
    var a=area(); if(!a) return;
    var b=e.target.closest('button,a,[role="button"]');
    if(!b||!a.contains(b)) return;
    if(b.id==='btnAggiorna'){e.preventDefault();e.stopImmediatePropagation();aggiorna();return;}
    var dp=b.getAttribute('data-page');
    if(dp){
      var p=alias(dp);
      var text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(p==='configurazione'&&(text.indexOf('nuovo torneo')>=0||text.indexOf('crea torneo')>=0)){
        e.preventDefault();e.stopImmediatePropagation();nuovoTorneo();return;
      }
      if(document.getElementById('page-'+p)){e.preventDefault();e.stopImmediatePropagation();openPage(p);return;}
    }
  }

  function start(){
    var a=area(); if(!a) return;
    if(a.dataset.adminNavBound==='v6') return;
    a.dataset.adminNavBound='v6';
    document.addEventListener('click',click,true);
    var h=alias(String(location.hash||'').replace(/^#/,'')||'dashboard');
    openPage(document.getElementById('page-'+h)?h:'dashboard');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.addEventListener('load',start);
})();