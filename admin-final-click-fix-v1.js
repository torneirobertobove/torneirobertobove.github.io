/* ADMIN FINAL CLICK FIX V1 */
(()=>{
'use strict';
const A=()=>document.getElementById('areaAdmin');
const pages=['dashboard','iscritti','coppie','tabellone','config','news','sponsor','links'];
const aliases={configurazione:'config',config:'config',link:'links',links:'links'};
function key(v){v=String(v||'').toLowerCase().trim();return aliases[v]||v}
function show(k){
 k=key(k);if(!pages.includes(k))k='dashboard';
 const a=A();if(!a)return false;
 a.classList.add('admin-organized');
 a.querySelectorAll('.org-page').forEach(p=>p.classList.toggle('org-active',p.dataset.page===k));
 a.querySelectorAll('.admin-page').forEach(p=>{const pk=key(p.dataset.page||p.dataset.orgPage||p.id.replace(/^admin-page-/,'')||'');if(!p.closest('.org-page'))p.classList.toggle('active',pk===k)});
 a.querySelectorAll('.sidebar .nav button').forEach(b=>b.classList.toggle('active',key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page)===k));
 const b=a.querySelector('.breadcrumb b');if(b){const n={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor',links:'Link pubblici'}[k];b.textContent=n||k}
 if(k==='news'){const news=a.querySelector('section#newsPanel[data-page="news"]');if(news){news.hidden=false;news.style.setProperty('display','block','important')}}
 if(k==='tabellone'&&typeof window.__adminDesktopRender==='function')window.__adminDesktopRender();
 if(k==='iscritti'&&typeof window.caricaRichiesteIscrizione==='function')window.caricaRichiesteIscrizione();
 try{history.replaceState(null,'','#'+k)}catch{}
 return true;
}
window.openAdminPage=show;window.goAdminPage=show;window.adminGoPage=show;
function install(){
 const a=A();if(!a)return;
 let cal=document.getElementById('adminCalendar');if(!cal){cal=document.createElement('div');cal.id='adminCalendar';cal.setAttribute('aria-hidden','true');cal.style.display='none';a.appendChild(cal)}
 if(!document.getElementById('admin-final-click-style')){const s=document.createElement('style');s.id='admin-final-click-style';s.textContent='#areaAdmin.admin-organized .org-page{display:none!important}#areaAdmin.admin-organized .org-page.org-active{display:block!important}#areaAdmin.admin-organized .org-page.org-active#newsPanel{display:block!important}#areaAdmin.admin-organized .org-page.org-active #configPanel,#areaAdmin.admin-organized .org-page.org-active #newsPanel,#areaAdmin.admin-organized .org-page.org-active #sponsorPanel{display:block!important}#areaAdmin.admin-organized .org-page.org-active button,#areaAdmin.admin-organized .org-page.org-active input,#areaAdmin.admin-organized .org-page.org-active select,#areaAdmin.admin-organized .org-page.org-active textarea,#areaAdmin.admin-organized .org-page.org-active summary{pointer-events:auto!important}';document.head.appendChild(s)}
 const nav=a.querySelector('.sidebar .nav');if(nav){nav.querySelectorAll('button').forEach(b=>{const k=key(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page);if(pages.includes(k)){b.dataset.orgPage=k;b.dataset.internalPage=k;b.onclick=e=>{e.preventDefault();e.stopPropagation();show(k)};b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('"+k+"')")}})}
 a.querySelectorAll('[data-page="configurazione"],[data-page="link"],[data-page="config"],[data-page="links"]').forEach(b=>{const k=key(b.dataset.orgPage||b.dataset.page);if(pages.includes(k)&&!b.closest('.sidebar'))b.onclick=e=>{e.preventDefault();e.stopPropagation();show(k)}})
 const buttons=[...a.querySelectorAll('button')];
 buttons.forEach(b=>{
   const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(!b.getAttribute('onclick')){
     if(t.includes('crea coppia'))b.setAttribute('onclick','window.creaCoppieAdmin&&window.creaCoppieAdmin();');
     else if(t.includes('crea torneo'))b.setAttribute('onclick','window.creaNuovoTorneo&&window.creaNuovoTorneo();');
     else if(t==='×')b.setAttribute('onclick','this.closest(\'.modal,.dialog,[role="dialog"]\')?.remove();');
     else if(t==='annulla')b.setAttribute('onclick','this.closest(\'.modal,.dialog,[role="dialog"]\')?.remove();');
   }
 });
}
function boot(){install();show(key(location.hash.slice(1))||'dashboard');setTimeout(install,100);setTimeout(install,500);setTimeout(install,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();