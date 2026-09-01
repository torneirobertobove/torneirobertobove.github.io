/* ADMIN RESTORE ORIGINAL FUNCTIONS V9 - restore the original working admin interface */
(()=>{
'use strict';
const A=()=>document.getElementById('areaAdmin');
const pages=['dashboard','iscritti','coppie','tabellone','config','news','sponsor','links'];
const aliases={configurazione:'config',config:'config',link:'links',links:'links'};
const key=v=>aliases[String(v||'').toLowerCase().trim()]||String(v||'').toLowerCase().trim();
const ids=['gestioneTorneoAdmin','dettaglioTorneoAdmin','richiesteIscrizione','partecipantiAdmin','schedaGiocatoreAdmin','creaCoppieBox','listaCoppieAdmin','configPanel','newsPanel','sponsorPanel','workspace'];
function clean(){document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0){const t=(el.textContent||'').trim();if(t==='```'||t==='n/n/n/n')el.remove()}})}
function restoreDom(){
 const a=A();if(!a)return false;
 a.classList.remove('admin-organized');
 const content=a.querySelector('.content'),ws=document.getElementById('workspace');
 if(ws&&content&&!content.contains(ws))content.appendChild(ws);
 const parents=[
  ['gestioneTorneoAdmin','workspace'],['dettaglioTorneoAdmin','gestioneTorneoAdmin'],['richiesteIscrizione','gestioneTorneoAdmin'],['partecipantiAdmin','gestioneTorneoAdmin'],['schedaGiocatoreAdmin','gestioneTorneoAdmin'],
  ['creaCoppieBox','workspace'],['listaCoppieAdmin','workspace'],['configPanel','workspace'],['newsPanel','workspace'],['sponsorPanel','workspace']
 ];
 parents.forEach(([id,pid])=>{const e=document.getElementById(id),p=document.getElementById(pid);if(e&&p&&!p.contains(e))p.appendChild(e)});
 a.querySelectorAll('.org-page').forEach(p=>{p.classList.remove('org-active');p.hidden=true;p.style.setProperty('display','none','important')});
 if(ws){ws.hidden=false;ws.style.removeProperty('display');}
 ids.forEach(id=>{const e=document.getElementById(id);if(e){e.hidden=false;e.style.removeProperty('display')}});
 return true;
}
function show(k){
 k=key(k);if(!pages.includes(k))k='dashboard';const a=A();if(!a)return false;
 restoreDom();
 a.querySelectorAll('.sidebar .nav button').forEach(b=>b.classList.toggle('active',key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page)===k));
 const bc=a.querySelector('.breadcrumb b');if(bc)bc.textContent={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor',links:'Link pubblici'}[k]||k;
 if(k==='tabellone'&&typeof window.__adminDesktopRender==='function')window.__adminDesktopRender();
 if(k==='iscritti'&&typeof window.caricaRichiesteIscrizione==='function')window.caricaRichiesteIscrizione();
 try{history.replaceState(null,'','#'+k)}catch{}clean();return true;
}
window.openAdminPage=show;window.goAdminPage=show;window.adminGoPage=show;
window.apriRegoleNuovoTorneo=function(){
 restoreDom();
 const cfg=document.getElementById('configPanel');
 if(cfg){cfg.hidden=false;cfg.style.removeProperty('display');try{cfg.scrollIntoView({block:'start'})}catch{}const f=cfg.querySelector('#adminNomeTorneo,#adminDataTorneo');try{f?.focus()}catch{}return true}
 return show('config');
};
function install(){
 const a=A();if(!a)return;
 restoreDom();
 a.querySelectorAll('.sidebar .nav button').forEach(b=>{const k=key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page);if(!pages.includes(k))return;b.dataset.orgPage=k;b.dataset.internalPage=k;b.onclick=e=>{e.preventDefault();e.stopPropagation();show(k)}});
}
function boot(){install();show(key(location.hash.slice(1))||'dashboard');[50,150,300,600,1200,2500,5000].forEach(ms=>setTimeout(install,ms));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(()=>{clearTimeout(window.__adminRestoreTimer);window.__adminRestoreTimer=setTimeout(install,20)}).observe(document.documentElement,{childList:true,subtree:true});
})();
