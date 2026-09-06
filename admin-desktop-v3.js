/* ADMIN DESKTOP V11 - load current tournament wizard and creation repair */
(function(){
'use strict';
function area(){return document.getElementById('areaAdmin');}
function alias(p){p=String(p||'').toLowerCase();return p==='config'?'configurazione':(p==='links'?'link':p);}
function call(name){var fn=window[name];if(typeof fn!=='function')return false;try{return fn.apply(window,Array.prototype.slice.call(arguments,1));}catch(e){console.error('[ADMIN V11] '+name,e);return false;}}
function openPage(page){
 page=alias(page||'dashboard');var target=document.getElementById('page-'+page);if(!target)return false;
 document.querySelectorAll('#areaAdmin .admin-page').forEach(function(p){p.classList.remove('active');});target.classList.add('active');
 document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(function(b){b.classList.toggle('active',alias(b.dataset.page||'')===page);});
 var title=document.getElementById('breadcrumbTitle');var titles={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',news:'News',sponsor:'Sponsor',configurazione:'Configurazione',link:'Link pubblici'};if(title)title.textContent=titles[page]||'Gestione';
 try{history.replaceState(null,'','#'+page);}catch(e){}return true;
}
function aggiorna(){var r=call('caricaTorneiSupabase');call('caricaRichiesteIscrizione');return r!==false;}
function loadScript(src,flag,ready){
 if(window[flag])return;
 window[flag]=true;
 var s=document.createElement('script');s.src=src;s.onload=ready;s.onerror=function(e){console.error('[ADMIN V11] load failed',src,e);};document.head.appendChild(s);
}
function loadCurrentWizard(){
 if(window.__currentWizardLoaded)return;
 window.__currentWizardLoaded=true;
 var s=document.createElement('script');
 s.src='admin-'+'function-fixes-v1.js?v=18';
 s.onload=function(){window.__currentWizardReady=true;replaceLegacyWizard();loadRepair();};
 s.onerror=function(e){console.error('[ADMIN V11] current wizard load failed',e);loadRepair();};
 document.head.appendChild(s);
}
function loadRepair(){
 loadScript('admin-creation-repair-v1.js?v=1','__creationRepairLoaded',function(){window.__creationRepairReady=true;replaceLegacyWizard();});
}
function replaceLegacyWizard(){
 ['adminFlowV15','adminFlowV16','adminFlowV17'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
 if(typeof window.apriWizardTorneo==='function')return true;
 return false;
}
function start(){
 var a=area();
 if(a&&a.dataset.adminNavBound!=='v11'){
  a.dataset.adminNavBound='v11';
  document.addEventListener('click',function(e){
   var b=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;if(!b||!a.contains(b))return;
   if(b.id==='btnAggiorna'){e.preventDefault();e.stopImmediatePropagation();aggiorna();return;}
   var page=b.getAttribute('data-page');if(!page)return;
   var text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(alias(page)==='configurazione'&&(text.indexOf('nuovo torneo')>=0||text.indexOf('crea torneo')>=0))return;
   var p=alias(page);if(document.getElementById('page-'+p)){e.preventDefault();e.stopImmediatePropagation();openPage(p);}
  },true);
 }
 loadCurrentWizard();
 loadRepair();
 replaceLegacyWizard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',start);
window.openAdminPage=openPage;window.goAdminPage=openPage;window.adminGoPage=openPage;window.aggiornaAdmin=aggiorna;
})();