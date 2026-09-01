/* ADMIN RESTORE ORIGINAL FUNCTIONS V7 - preserve original admin UI and only repair navigation */
(()=>{
'use strict';
const A=()=>document.getElementById('areaAdmin');
const pages=['dashboard','iscritti','coppie','tabellone','config','news','sponsor','links'];
const aliases={configurazione:'config',config:'config',link:'links',links:'links'};
const key=v=>aliases[String(v||'').toLowerCase().trim()]||String(v||'').toLowerCase().trim();
function clean(){document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0){const t=(el.textContent||'').trim();if(t==='```'||t==='n/n/n/n')el.remove()}})}
function revealOriginal(k){
 const a=A();if(!a)return false;
 a.classList.remove('admin-organized');
 a.querySelectorAll('.org-page').forEach(p=>{p.classList.remove('org-active');p.hidden=true});
 const ws=document.getElementById('workspace');
 if(ws){ws.hidden=false;ws.style.removeProperty('display');}
 ['configPanel','newsPanel','sponsorPanel'].forEach(id=>{const e=document.getElementById(id);if(e){e.hidden=false;e.style.removeProperty('display');}});
 if(k==='tabellone'&&typeof window.__adminDesktopRender==='function')window.__adminDesktopRender();
 if(k==='iscritti'&&typeof window.caricaRichiesteIscrizione==='function')window.caricaRichiesteIscrizione();
 return true;
}
function show(k){
 k=key(k);if(!pages.includes(k))k='dashboard';const a=A();if(!a)return false;
 revealOriginal(k);
 a.querySelectorAll('.sidebar .nav button').forEach(b=>b.classList.toggle('active',key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page)===k));
 const bc=a.querySelector('.breadcrumb b');if(bc)bc.textContent={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor',links:'Link pubblici'}[k]||k;
 try{history.replaceState(null,'','#'+k)}catch{}clean();return true;
}
window.openAdminPage=show;window.goAdminPage=show;window.adminGoPage=show;
window.apriRegoleNuovoTorneo=function(){
 if(typeof window.apriRegoleNuovoTorneoOriginal==='function')return window.apriRegoleNuovoTorneoOriginal();
 revealOriginal('config');
 const cfg=document.getElementById('configPanel');
 if(cfg){const f=cfg.querySelector('#adminNomeTorneo,#adminDataTorneo,input,select,textarea');try{f?.focus()}catch{}return true}
 return false;
};
function install(){
 const a=A();if(!a)return;
 a.querySelectorAll('.sidebar .nav button').forEach(b=>{
  const k=key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page);if(!pages.includes(k))return;
  b.dataset.orgPage=k;b.dataset.internalPage=k;
  b.onclick=e=>{e.preventDefault();e.stopPropagation();show(k)};
 });
 clean();
}
function boot(){install();show(key(location.hash.slice(1))||'dashboard');[100,500,1200,2500].forEach(ms=>setTimeout(install,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
