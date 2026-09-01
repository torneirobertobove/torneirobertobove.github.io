/* ADMIN FINAL CLICK FIX V6 - navigation only; preserve original admin functions */
(()=>{
'use strict';
const A=()=>document.getElementById('areaAdmin');
const pages=['dashboard','iscritti','coppie','tabellone','config','news','sponsor','links'];
const aliases={configurazione:'config',config:'config',link:'links',links:'links'};
const key=v=>aliases[String(v||'').toLowerCase().trim()]||String(v||'').toLowerCase().trim();
function clean(){
 document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0){const t=(el.textContent||'').trim();if(t==='```'||t==='n/n/n/n')el.remove()}});
 const m=document.getElementById('adminEmailMini');if(m&&m.previousSibling?.nodeType===3)m.previousSibling.textContent=m.previousSibling.textContent.replace(/^\s*●\s*/,'');
}
function show(k){
 k=key(k);if(!pages.includes(k))k='dashboard';const a=A();if(!a)return false;a.classList.add('admin-organized');
 a.querySelectorAll('.org-page').forEach(p=>p.classList.toggle('org-active',key(p.dataset.page||p.dataset.orgPage||p.id.replace(/^admin-page-/,'')||'')===k));
 a.querySelectorAll('.admin-page').forEach(p=>{const pk=key(p.dataset.page||p.dataset.orgPage||p.id.replace(/^admin-page-/,'')||'');if(!p.closest('.org-page'))p.classList.toggle('active',pk===k)});
 a.querySelectorAll('.sidebar .nav button').forEach(b=>b.classList.toggle('active',key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page)===k));
 const bc=a.querySelector('.breadcrumb b');if(bc)bc.textContent={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor',links:'Link pubblici'}[k]||k;
 if(k==='config'){const c=document.getElementById('configPanel');if(c){c.hidden=false;c.style.setProperty('display','block','important')}}
 if(k==='news'){const n=document.getElementById('newsPanel');if(n){n.hidden=false;n.style.setProperty('display','block','important')}}
 if(k==='tabellone'&&typeof window.__adminDesktopRender==='function')window.__adminDesktopRender();
 if(k==='iscritti'&&typeof window.caricaRichiesteIscrizione==='function')window.caricaRichiesteIscrizione();
 try{history.replaceState(null,'','#'+k)}catch{}clean();return true;
}
window.openAdminPage=show;window.goAdminPage=show;window.adminGoPage=show;window.apriRegoleNuovoTorneo=()=>show('config');
function install(){
 const a=A();if(!a)return;
 if(!document.getElementById('admin-final-click-style')){const s=document.createElement('style');s.id='admin-final-click-style';s.textContent='#areaAdmin.admin-organized .org-page{display:none!important}#areaAdmin.admin-organized .org-page.org-active{display:block!important}#areaAdmin.admin-organized .org-page.org-active #configPanel,#areaAdmin.admin-organized .org-page.org-active #newsPanel,#areaAdmin.admin-organized .org-page.org-active #sponsorPanel{display:block!important}#areaAdmin.admin-organized .org-page.org-active button,#areaAdmin.admin-organized .org-page.org-active input,#areaAdmin.admin-organized .org-page.org-active select,#areaAdmin.admin-organized .org-page.org-active textarea,#areaAdmin.admin-organized .org-page.org-active summary{pointer-events:auto!important}';document.head.appendChild(s)}
 a.querySelectorAll('.sidebar .nav button').forEach(b=>{
   const k=key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page);
   if(!pages.includes(k))return;
   b.dataset.orgPage=k;b.dataset.internalPage=k;
   b.onclick=e=>{e.preventDefault();e.stopPropagation();show(k)};
   b.removeAttribute('onclick');
 });
 clean();
}
function boot(){install();show(key(location.hash.slice(1))||'dashboard');[100,500,1200,2500].forEach(ms=>setTimeout(install,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
