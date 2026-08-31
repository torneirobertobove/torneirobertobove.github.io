/* Admin desktop v4: clean collapsible pages + month/year tournament catalog */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const fn=n=>typeof window[n]==='function'?window[n]:null;
const call=(names,...args)=>{for(const n of names){const f=fn(n);if(f)return f(...args)}};
const selectedId=()=>window.getTorneoAdminCorrente?.()?.id??null;
const firstId=()=>selectedId()??document.querySelector('#listaTorneiAdmin .tournament-row')?.dataset?.torneoId??null;
const clean=()=>{
  const area=$('areaAdmin'); if(!area)return;
  const content=area.querySelector('.content'); if(!content)return;
  if(!content.dataset.cleanShell){
    content.dataset.cleanShell='1';
    const title=content.querySelector('.page-title');
    if(title) title.dataset.adminHome='1';
    const stats=content.querySelector('.stats'); if(stats)stats.dataset.adminHome='1';
    const grid=content.querySelector('.grid'); if(grid)grid.dataset.adminHome='1';
    const cfg=$('configPanel'); if(cfg)cfg.dataset.adminView='config';
    const ws=$('workspace'); if(ws)ws.dataset.adminView='workspace';
    const gp=$('gestioneTorneoAdmin'); if(gp)gp.dataset.adminView='workspace';
    const news=$('newsPanel'); if(news)news.dataset.adminView='news';
    const sponsor=$('sponsorPanel'); if(sponsor)sponsor.dataset.adminView='sponsor';
    const nav=area.querySelector('.nav');
    if(nav){
      const section=document.createElement('div');section.className='nav-section';section.textContent='Contenuti';
      const links=document.createElement('nav');links.className='nav';
      links.innerHTML='<button type="button" data-page="news">📰 <span>News</span></button><button type="button" data-page="sponsor">🏆 <span>Sponsor</span></button>';
      nav.parentNode.insertBefore(section,area.querySelector('.sidebar-bottom'));nav.parentNode.insertBefore(links,area.querySelector('.sidebar-bottom'));
    }
    const style=document.createElement('style');style.id='admin-clean-v4';style.textContent=`
      #areaAdmin .content [data-admin-view="news"],#areaAdmin .content [data-admin-view="sponsor"],#areaAdmin .content [data-admin-view="config"],#areaAdmin .content [data-admin-view="workspace"]{display:none}
      #areaAdmin.admin-page-news .content [data-admin-view="news"],#areaAdmin.admin-page-sponsor .content [data-admin-view="sponsor"],#areaAdmin.admin-page-config .content [data-admin-view="config"],#areaAdmin.admin-page-iscritti .content [data-admin-view="workspace"],#areaAdmin.admin-page-coppie .content [data-admin-view="workspace"]{display:block}
      #areaAdmin.admin-page-news .content [data-admin-home],#areaAdmin.admin-page-sponsor .content [data-admin-home],#areaAdmin.admin-page-config .content [data-admin-home],#areaAdmin.admin-page-iscritti .content [data-admin-home],#areaAdmin.admin-page-coppie .content [data-admin-home]{display:none}
      #areaAdmin .admin-view-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding:18px 20px;background:#12161b;border:1px solid #2a3139;border-radius:14px}
      #areaAdmin .admin-view-title h1{margin:0;font-size:22px}#areaAdmin .admin-view-title p{margin:5px 0 0;color:#8f9aa6;font-size:12px}
      #areaAdmin .month-group{border:1px solid #2a3139;border-radius:12px;margin-bottom:12px;overflow:hidden;background:#101419}
      #areaAdmin .month-group>summary{cursor:pointer;list-style:none;padding:12px 14px;font-size:12px;font-weight:800;display:flex;justify-content:space-between;align-items:center}
      #areaAdmin .month-group>summary::-webkit-details-marker{display:none}#areaAdmin .month-group>summary:after{content:'＋';color:#8f9aa6}.month-group[open]>summary:after{content:'−'}
      #areaAdmin .month-body{padding:0 14px 8px}.month-body .tournament-row{background:transparent}
      #areaAdmin .page-tools{display:flex;gap:8px;flex-wrap:wrap}.page-tools .btn{margin:0!important}
      #areaAdmin .workspace-clean-section{display:none!important}.admin-page-iscritti .workspace-clean-section[data-section="iscritti"]{display:block!important}.admin-page-coppie .workspace-clean-section[data-section="coppie"]{display:block!important}
      #areaAdmin .workspace-clean-section{background:#12161b;border:1px solid #2a3139;border-radius:14px;padding:18px;margin-bottom:14px}
      #areaAdmin .workspace-clean-section h3{margin-top:0}
    `;document.head.appendChild(style);
    setupWorkspaceSections();
    setupNav();
  }
  groupTournaments();
};
function setupWorkspaceSections(){
 const g=$('gestioneTorneoAdmin');if(!g||g.dataset.sectionsReady)return;g.dataset.sectionsReady='1';
 const detail=$('dettaglioTorneoAdmin');
 const req=$('richiesteIscrizione');const part=$('partecipantiAdmin');const player=$('schedaGiocatoreAdmin');
 [detail,req,part,player].forEach(e=>e?.classList.add('workspace-clean-section'));
 detail?.setAttribute('data-section','iscritti');req?.setAttribute('data-section','iscritti');part?.setAttribute('data-section','iscritti');player?.setAttribute('data-section','iscritti');
 const pair=$('creaCoppieBox');const list=$('listaCoppieAdmin');
 [pair,list].forEach(e=>{if(e){e.classList.add('workspace-clean-section');e.setAttribute('data-section','coppie')}});
 [...g.querySelectorAll('h3')].forEach(h=>{const txt=(h.textContent||'').toLowerCase();if(txt.includes('richieste')||txt.includes('partecipanti'))h.classList.add('workspace-clean-section');});
}
function setupNav(){document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(b.dataset.pageHook)return;b.dataset.pageHook='1';b.addEventListener('click',()=>navigate(b.dataset.page||b.dataset.nav));});
 const quick={quickApprova:'iscritti',quickCoppie:'coppie'};Object.entries(quick).forEach(([id,page])=>$(id)?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate(page)}));
 $('quickTabellone')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();call(['apriBoveConTorneo','apriTabellone'],selectedId()||firstId())});
 $('quickLink')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();call(['generaLinkBove','generaLinkPerId'],selectedId()||firstId())});
}
function navigate(page){
 const area=$('areaAdmin');if(!area)return;
 ['dashboard','iscritti','coppie','config','news','sponsor'].forEach(p=>area.classList.remove('admin-page-'+p));
 area.classList.add('admin-page-'+(page==='dashboard'?'dashboard':page));
 const labels={dashboard:['Tornei','Panoramica dei campionati'],iscritti:['Iscritti','Richieste e partecipanti del torneo selezionato'],coppie:['Accoppiamenti','Gestione delle coppie e delle sfide'],config:['Configurazione','Crea e configura il torneo'],news:['News','Pubblica e gestisci le comunicazioni'],sponsor:['Sponsor','Gestisci sponsor, loghi e collegamenti']};
 const top=area.querySelector('.topbar .breadcrumb b');if(top)top.textContent=labels[page]?.[0]||'Tornei';
 let vt=area.querySelector('.admin-view-title');if(!vt){vt=document.createElement('div');vt.className='admin-view-title';const content=area.querySelector('.content');content.prepend(vt)}
 if(page==='dashboard'){vt.remove();return}
 vt.innerHTML='<div><h1>'+labels[page][0]+'</h1><p>'+labels[page][1]+'</p></div><div class="page-tools"></div>';
 if(page==='iscritti'||page==='coppie'){const tools=vt.querySelector('.page-tools');const back=document.createElement('button');back.className='btn';back.type='button';back.textContent='← Tornei';back.onclick=()=>navigate('dashboard');tools.appendChild(back)}
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>b.classList.toggle('active',(b.dataset.page||b.dataset.nav)===page));
 const ws=$('workspace');if(ws&&['iscritti','coppie'].includes(page))ws.open=true;
 if(page==='config')$('configPanel')?.setAttribute('open','');
 if(page==='news')$('newsPanel')?.scrollIntoView({block:'start'});
 if(page==='sponsor')$('sponsorPanel')?.scrollIntoView({block:'start'});
}
function groupTournaments(){
 const box=$('listaTorneiAdmin');if(!box||box.dataset.grouped==='1')return;
 const rows=[...box.querySelectorAll(':scope > .tournament-row')];if(!rows.length)return;
 box.dataset.grouped='1';const groups=new Map();
 rows.forEach(row=>{const small=row.querySelector('.t-info small');const txt=small?.textContent||'';const m=txt.match(/(\d{4})[-\/.](\d{1,2})/);const key=m?m[1]+'-'+String(m[2]).padStart(2,'0'):'Senza data';(groups.get(key)||groups.set(key,[]).get(key)).push(row)});
 box.innerHTML='';[...groups.entries()].sort((a,b)=>b[0].localeCompare(a[0])).forEach(([key,list],i)=>{const d=document.createElement('details');d.className='month-group';d.open=i===0;const s=document.createElement('summary');s.textContent=labelMonth(key);const body=document.createElement('div');body.className='month-body';list.forEach(r=>body.appendChild(r));d.append(s,body);box.appendChild(d)});
}
function labelMonth(key){if(key==='Senza data')return 'Senza data';const [y,m]=key.split('-');const names=['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];return names[Number(m)]+' '+y}
function wire(root=document){root.querySelectorAll('button').forEach(b=>{if(b.dataset.adminHook)return;b.dataset.adminHook='1';if(b.closest('.nav'))return;b.addEventListener('click',()=>{});});}
function boot(){clean();wire();const obs=new MutationObserver(ms=>{let changed=false;ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){wire(n);changed=true}}));if(changed){setupWorkspaceSections();groupTournaments()}});obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();