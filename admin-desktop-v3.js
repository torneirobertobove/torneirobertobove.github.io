/* ADMIN DESKTOP V17 - restore real menu content + current tournament wizard */
(function(){
'use strict';
function area(){return document.getElementById('areaAdmin');}
function alias(p){p=String(p||'').toLowerCase();return p==='config'?'configurazione':(p==='links'?'link':p);}
function call(name){var fn=window[name];if(typeof fn!=='function')return false;try{return fn.apply(window,Array.prototype.slice.call(arguments,1));}catch(e){console.error('[ADMIN V17] '+name,e);return false;}}
function targetFor(page){page=alias(page||'dashboard');return document.getElementById('page-'+page)||document.getElementById('org-page-'+page)||null;}
function restoreRealPages(){
 var a=area(),content=a&&a.querySelector('.content');if(!a||!content)return false;
 var names=['dashboard','iscritti','coppie','tabellone','news','sponsor','configurazione','link'];
 names.forEach(function(name){
  var p=document.getElementById('page-'+name);if(!p)return;
  if(p.parentElement!==content)content.appendChild(p);
  p.classList.remove('org-installed-hidden');
  p.style.display='';
 });
 a.querySelectorAll('.org-page').forEach(function(p){p.classList.remove('org-active');p.style.display='none';});
 a.classList.remove('admin-organized');
 return true;
}
function openPage(page){
 page=alias(page||'dashboard');restoreRealPages();
 var target=document.getElementById('page-'+page);if(!target)return false;
 document.querySelectorAll('#areaAdmin .admin-page').forEach(function(p){p.classList.remove('active');});
 target.classList.add('active');
 document.querySelectorAll('#areaAdmin .sidebar [data-page],#areaAdmin .sidebar [data-org-page]').forEach(function(b){b.classList.toggle('active',alias(b.dataset.page||b.dataset.orgPage||'')===page);});
 var title=document.getElementById('breadcrumbTitle');
 var titles={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',news:'News',sponsor:'Sponsor',configurazione:'Configurazione',link:'Link pubblici'};
 if(title)title.textContent=titles[page]||'Gestione';
 try{history.replaceState(null,'','#'+page);}catch(e){}
 if(page==='iscritti')call('caricaRichiesteIscrizione');
 if(page==='dashboard')call('renderAdmin');
 return true;
}
function aggiorna(){var r=call('caricaTorneiSupabase');call('caricaRichiesteIscrizione');setTimeout(restoreRealPages,100);return r!==false;}
function loadScript(src,flag,ready){if(window[flag])return;window[flag]=true;var s=document.createElement('script');s.src=src;s.onload=ready;s.onerror=function(e){console.error('[ADMIN V17] load failed',src,e);};document.head.appendChild(s);}
function loadCurrentWizard(){
 if(window.__currentWizardLoaded)return;
 window.__currentWizardLoaded=true;
 var s=document.createElement('script');s.src='admin-function-fixes-v1.js?v=19';
 s.onload=function(){window.__currentWizardReady=true;replaceLegacyWizard();};
 s.onerror=function(e){console.error('[ADMIN V17] wizard load failed',e);};
 document.head.appendChild(s);
}
function replaceLegacyWizard(){['adminFlowV15','adminFlowV16','adminFlowV17'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});return typeof window.apriWizardTorneo==='function';}
function isCreateButton(b){var text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();return text.indexOf('nuovo torneo')>=0||text.indexOf('crea torneo')>=0;}
function openCreation(){if(typeof window.apriWizardTorneo!=='function'){console.error('[ADMIN V17] apriWizardTorneo non disponibile');return false;}try{replaceLegacyWizard();window.apriWizardTorneo();return true;}catch(e){console.error('[ADMIN V17] apertura wizard',e);return false;}}
function exposeAdminStateCompat(){
 try{
  var raw=localStorage.getItem('padel_admin_state');
  var saved=raw?JSON.parse(raw):{};
  if(!window.adminState)window.adminState=saved||{};
  if(!Array.isArray(window.adminState.tornei))window.adminState.tornei=Array.isArray(saved.tornei)?saved.tornei:[];
  if(!Array.isArray(window.adminState.sponsor))window.adminState.sponsor=Array.isArray(saved.sponsor)?saved.sponsor:[];
  if(!Array.isArray(window.adminState.news))window.adminState.news=Array.isArray(saved.news)?saved.news:[];
  if(window.adminState.torneoSelezionato==null&&saved.torneoSelezionato!=null)window.adminState.torneoSelezionato=saved.torneoSelezionato;
 }catch(e){console.warn('[ADMIN V17] state compatibility',e)}
}
function logoutAdmin(){
 try{if(window.sb&&window.sb.auth)window.sb.auth.signOut();}catch(e){console.warn('[ADMIN V17] logout',e)}
 try{localStorage.removeItem('padel_admin_state');}catch(e){}
 var areaEl=area(),login=document.getElementById('boxLoginAdmin');
 if(areaEl)areaEl.classList.add('hidden');
 if(login)login.classList.remove('hidden');
}
function installDashboardActions(){
 var a=area();if(!a)return;
 var top=a.querySelector('.top-actions');
 if(top&&!top.querySelector('[data-admin-exit]')){
  var b=document.createElement('button');b.type='button';b.className='btn';b.textContent='↪ Esci';b.setAttribute('data-admin-exit','1');b.addEventListener('click',logoutAdmin);top.appendChild(b);
 }
 var list=document.getElementById('listaTorneiAdmin');
 if(list&&!list.__deleteObserver){
  var addDeletes=function(){
   list.querySelectorAll('.tournament-row').forEach(function(row){
    var actions=row.querySelector('.actions');if(!actions||actions.querySelector('[data-admin-delete]'))return;
    var manage=actions.querySelector('button');if(!manage)return;
    var raw=String(manage.getAttribute('onclick')||'');var m=raw.match(/selezionaTorneoAdmin\((.+)\)/);if(!m)return;
    var id;
    try{id=JSON.parse(m[1]);}catch(e){id=m[1];}
    var del=document.createElement('button');del.type='button';del.className='btn';del.textContent='Elimina';del.setAttribute('data-admin-delete','1');
    del.addEventListener('click',function(){if(typeof window.eliminaTorneoAdmin==='function')window.eliminaTorneoAdmin(id);else if(typeof window.eliminaTorneo==='function')window.eliminaTorneo(id);});
    actions.appendChild(del);
   });
  };
  list.__deleteObserver=new MutationObserver(addDeletes);list.__deleteObserver.observe(list,{childList:true,subtree:true});addDeletes();
 }
 var tab=document.getElementById('page-tabellone');
 if(tab&&!tab.querySelector('[data-admin-exit-tabellone]')){
  var title=tab.querySelector('.page-title');
  if(title){var b2=document.createElement('button');b2.type='button';b2.className='btn';b2.textContent='↩ Esci da tabellone';b2.setAttribute('data-admin-exit-tabellone','1');b2.addEventListener('click',function(){openPage('dashboard');});title.appendChild(b2);}
 }
}
function bind(){
 var a=area();if(!a||a.dataset.adminNavBound==='v17')return;
 a.dataset.adminNavBound='v17';
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;if(!b||!a.contains(b))return;
  if(isCreateButton(b)){e.preventDefault();e.stopImmediatePropagation();openCreation();return;}
  if(b.id==='btnAggiorna'){e.preventDefault();e.stopImmediatePropagation();aggiorna();return;}
  var page=b.getAttribute('data-page')||b.getAttribute('data-org-page');if(!page)return;
  page=alias(page);
  if(targetFor(page)){e.preventDefault();e.stopImmediatePropagation();openPage(page);}
 },true);
}
function start(){
 var a=area();if(!a)return;
 exposeAdminStateCompat();
 restoreRealPages();
 bind();
 loadCurrentWizard();
 replaceLegacyWizard();
 installDashboardActions();
 var h=alias(String(location.hash||'').replace(/^#/,'')||'dashboard');
 openPage(document.getElementById('page-'+h)?h:'dashboard');
 installDashboardActions();
 setTimeout(function(){restoreRealPages();openPage(h);installDashboardActions();},250);
 setTimeout(function(){restoreRealPages();installDashboardActions();},1000);
 setTimeout(function(){restoreRealPages();installDashboardActions();},2500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',start);
window.openAdminPage=openPage;window.goAdminPage=openPage;window.adminGoPage=openPage;window.aggiornaAdmin=aggiorna;
window.nuovoTorneoAdmin=openCreation;
window.logoutAdmin=logoutAdmin;
window.gestisciTorneoAdmin=function(id){return call('selezionaTorneoAdmin',id);};
window.eliminaTorneoAdmin=function(id){return call('eliminaTorneoAdmin',id);};
window.pubblicaTorneoAdmin=function(){return call('pubblicaTorneo');};
window.chiudiIscrizioniAdmin=function(){return call('chiudiIscrizioniTorneo');};
window.apriBoveAdmin=function(id){return call('apriBoveConTorneo',id);};
window.generaLinkAdmin=function(id){return id!=null?call('generaLinkPerId',id):call('generaLinkBove');};
window.copiaLinkAdmin=function(){return call('copiaLinkBove');};
window.creaNewsAdmin=function(){return call('creaNews');};
window.salvaSponsorAdmin=function(){return call('salvaSponsor');};
})();
