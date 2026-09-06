/* ADMIN DESKTOP V9 - activate live tournament creation wizard */
(function(){
'use strict';
function area(){return document.getElementById('areaAdmin');}
function alias(p){p=String(p||'').toLowerCase();return p==='config'?'configurazione':(p==='links'?'link':p);}
function call(name){var fn=window[name];if(typeof fn!=='function')return false;try{return fn.apply(window,Array.prototype.slice.call(arguments,1));}catch(e){console.error('[ADMIN V9] '+name,e);return false;}}
function openPage(page){
 page=alias(page||'dashboard');var target=document.getElementById('page-'+page);if(!target)return false;
 document.querySelectorAll('#areaAdmin .admin-page').forEach(function(p){p.classList.remove('active');});target.classList.add('active');
 document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(function(b){b.classList.toggle('active',alias(b.dataset.page||'')===page);});
 var title=document.getElementById('breadcrumbTitle');var titles={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',news:'News',sponsor:'Sponsor',configurazione:'Configurazione',link:'Link pubblici'};if(title)title.textContent=titles[page]||'Gestione';
 try{history.replaceState(null,'','#'+page);}catch(e){}return true;
}
function aggiorna(){var r=call('caricaTorneiSupabase');call('caricaRichiesteIscrizione');return r!==false;}
function forceCreation(){
 var old=document.getElementById('adminFlowV15');
 if(old){old.remove();}
 if(typeof window.apriWizardTorneo==='function'){
   try{window.apriWizardTorneo();return true;}catch(e){console.error('[ADMIN V9] wizard',e);}
 }
 return false;
}
function bind(){
 var a=area();if(!a||a.dataset.adminNavBound==='v9')return;a.dataset.adminNavBound='v9';
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;if(!b||!a.contains(b))return;
  if(b.closest('.sidebar .nav'))return;
  if(b.id==='btnAggiorna'){e.preventDefault();e.stopImmediatePropagation();aggiorna();return;}
  var page=b.getAttribute('data-page');if(!page)return;
  var text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(alias(page)==='configurazione'&&(text.indexOf('nuovo torneo')>=0||text.indexOf('crea torneo')>=0))return;
  var p=alias(page);if(document.getElementById('page-'+p)){e.preventDefault();e.stopImmediatePropagation();openPage(p);}
 },true);
}
function start(){
 bind();
 if(typeof window.apriWizardTorneo==='function')window.__creationWizardReady=true;
 var observer=new MutationObserver(function(){
   var old=document.getElementById('adminFlowV15');
   if(old&&window.__creationWizardReady)forceCreation();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',start);
window.openAdminPage=openPage;window.goAdminPage=openPage;window.adminGoPage=openPage;window.aggiornaAdmin=aggiorna;
})();