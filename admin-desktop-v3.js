/* Admin desktop v7: pagine autonome, navigazione pulita */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const fn=n=>typeof window[n]==='function'?window[n]:null;
const call=(names,...args)=>{for(const n of names){const f=fn(n);if(f)return f(...args)}};
const selectedId=()=>window.getTorneoAdminCorrente?.()?.id??null;
const firstId=()=>selectedId()??document.querySelector('#listaTorneiAdmin .tournament-row')?.dataset?.torneoId??null;
const PAGES=['dashboard','iscritti','coppie','tabellone','config','news','sponsor','link'];
const LABELS={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor',link:'Link pubblici'};
let moving=false;

function style(){
 if($('admin-v7-style'))return;
 const s=document.createElement('style');s.id='admin-v7-style';
 s.textContent=`
#areaAdmin .content{position:relative}
#areaAdmin .admin-page-shell{display:none!important;min-height:calc(100vh - 100px)}
#areaAdmin .admin-page-shell.active{display:block!important}
#areaAdmin .admin-page-shell>.page-inner{width:100%;max-width:1450px;margin:0 auto}
#areaAdmin .admin-view-title{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;padding:18px 20px;background:#12161b;border:1px solid #2a3139;border-radius:14px}
#areaAdmin .admin-view-shell-title{margin:0;font-size:22px}
#areaAdmin .admin-view-shell-sub{margin:5px 0 0;color:#8f9aa6;font-size:12px}
#areaAdmin .page-tools{display:flex;gap:8px;flex-wrap:wrap}
#areaAdmin .admin-page-shell>.page-inner>.panel{margin-top:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel{display:block!important;border:0;background:transparent;margin:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel .panel-content{border-top:0;padding:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel,
#areaAdmin .admin-page-shell[data-page="link"] .public-link-panel{display:block!important;margin:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel>summary,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel .panel-content,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel .panel-content{border-top:0}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace,
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace{display:block!important;margin:0}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="coppie"],
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="iscritti"]{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="iscritti"],
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="coppie"]{display:block!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .admin-section-actions{display:flex!important}
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .admin-section-actions{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace> .panel-content,
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace> .panel-content{padding-top:0}
#areaAdmin .admin-page-shell[data-page="tabellone"] .tabellone-launch{display:block}
#areaAdmin .admin-page-shell[data-page="dashboard"] .page-title{display:flex}
#areaAdmin .admin-page-shell[data-page="dashboard"] .stats{display:grid}
#areaAdmin .admin-page-shell[data-page="dashboard"] .grid{display:grid}
#areaAdmin .month-group{border:1px solid #2a3139;border-radius:12px;margin-bottom:10px;overflow:hidden;background:#101419}
#areaAdmin .month-group>summary{cursor:pointer;list-style:none;padding:13px 15px;font-size:12px;font-weight:800;display:flex;justify-content:space-between;align-items:center}
#areaAdmin .month-group>summary::-webkit-details-marker{display:none}
#areaAdmin .month-group>summary:after{content:'＋';color:#8f9aa6;font-size:16px}
#areaAdmin .month-group[open]>summary:after{content:'−'}
#areaAdmin .month-body{padding:0 14px 8px}
#areaAdmin .compact-group{border:1px solid #2a3139;border-radius:12px;margin:12px 0;overflow:hidden;background:#101419}
#areaAdmin .compact-group>summary{cursor:pointer;list-style:none;padding:13px 15px;font-weight:800;font-size:13px}
#areaAdmin .compact-group>summary::-webkit-details-marker{display:none}
#areaAdmin .compact-group>summary:after{content:'＋';float:right;color:#8f9aa6}
#areaAdmin .compact-group[open]>summary:after{content:'−'}
#areaAdmin .compact-group-body{padding:0 14px 12px}
#areaAdmin .page-nav-note{font-size:11px;color:#8f9aa6;margin:0 0 12px}
`;
 document.head.appendChild(s);
}

function shell(page,title,sub){
 let c=$('admin-page-'+page);if(c)return c;
 c=document.createElement('div');c.id='admin-page-'+page;c.className='admin-page-shell';c.dataset.page=page;
 c.innerHTML='<div class="page-inner"><div class="admin-view-title"><div><h1 class="admin-view-shell-title"></h1><p class="admin-view-shell-sub"></p></div><div class="page-tools"></div></div></div>';
 c.querySelector('h1').textContent=title;c.querySelector('p').textContent=sub;
 document.querySelector('#areaAdmin .content')?.appendChild(c);return c;
}
function backButton(el){if(el.querySelector('.page-back'))return;const b=document.createElement('button');b.type='button';b.className='btn page-back';b.textContent='← Tornei';b.addEventListener('click',()=>navigate('dashboard'));el.querySelector('.page-tools')?.appendChild(b)}

function moveExisting(){
 if(moving)return;const content=document.querySelector('#areaAdmin .content');if(!content)return;moving=true;
 try{
  const dash=shell('dashboard','Tornei','Panoramica dei tornei');
  const cfg=shell('config','Configurazione','Crea e configura il torneo');
  const isc=shell('iscritti','Iscritti','Richieste e partecipanti del torneo selezionato');
  const cop=shell('coppie','Accoppiamenti','Gestione delle coppie e delle sfide');
  const tab=shell('tabellone','Tabellone','Apri e visualizza il tabellone del torneo selezionato');
  const news=shell('news','News','Pubblica e gestisci le comunicazioni');
  const sp=shell('sponsor','Sponsor','Gestisci sponsor e materiali');
  const link=shell('link','Link pubblici','Link del torneo e del tabellone');
  [isc,cop,tab,cfg,news,sp,link].forEach(backButton);
  const direct=[...content.children].filter(e=>e.classList.contains('page-title')||e.classList.contains('stats')||e.classList.contains('grid'));
  direct.forEach(e=>dash.querySelector('.page-inner').appendChild(e));
  const cp=$('configPanel');if(cp)cfg.querySelector('.page-inner').appendChild(cp);
  const ws=$('workspace');if(ws)isc.querySelector('.page-inner').appendChild(ws);
  const np=$('newsPanel');if(np)news.querySelector('.page-inner').appendChild(np);
  const spn=$('sponsorPanel');if(spn)sp.querySelector('.page-inner').appendChild(spn);
  const publicPanels=[...content.querySelectorAll('details.panel')].filter(x=>x!==cp&&x!==ws&&!x.id);
  publicPanels.forEach(p=>{if(/Link pubblico/i.test(p.textContent)){p.classList.add('public-link-panel');link.querySelector('.page-inner').appendChild(p)}});
  prepareWorkspace();
  addTabelloneLauncher(tab);
  addCompactGroups();
 }finally{moving=false}
}

function prepareWorkspace(){
 const g=$('gestioneTorneoAdmin');if(!g)return;
 g.querySelectorAll('#dettaglioTorneoAdmin,#richiesteIscrizione,#partecipantiAdmin,#schedaGiocatoreAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='iscritti'});
 g.querySelectorAll('#creaCoppieBox,#listaCoppieAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='coppie'});
 const a=[...g.children].find(e=>e.matches('div[style]'));if(a)a.classList.add('admin-section-actions');
}
function addCompactGroups(){
 const g=$('gestioneTorneoAdmin');if(!g||g.dataset.compactV7)return;g.dataset.compactV7='1';
 const req=$('richiesteIscrizione'),part=$('partecipantiAdmin');
 [req,part].forEach((box,i)=>{if(!box||box.parentElement?.dataset?.compactGroup)return;const parent=box.parentElement;const title=i===0?'👥 Richieste iscrizione':'✅ Partecipanti approvati';const d=document.createElement('details');d.className='compact-group';const s=document.createElement('summary');s.textContent=title;const body=document.createElement('div');body.className='compact-group-body';parent.insertBefore(d,box);d.append(s,body);body.appendChild(box);});
}
function addTabelloneLauncher(tab){
 if(tab.querySelector('.tabellone-launch'))return;const box=document.createElement('div');box.className='tabellone-launch';
 box.innerHTML='<p class="page-nav-note">Il tabellone si apre separatamente per il torneo selezionato.</p><button type="button" class="btn primary">📋 Apri tabellone</button>';
 box.querySelector('button').addEventListener('click',()=>{const id=selectedId()||firstId();const f=fn('apriBoveConTorneo')||fn('apriTabellone');if(f)f(id);else if(id)window.open('Bove.html?idTorneo='+encodeURIComponent(id),'_blank')});
 tab.querySelector('.page-inner').appendChild(box);
}

function routeFromUrl(){const p=new URLSearchParams(location.search).get('page');return PAGES.includes(p)?p:'dashboard'}
function nav(){
 const maps={dashboard:'dashboard',richiesteIscrizione:'iscritti',creaCoppieBox:'coppie',linkBoveGenerato:'tabellone',configPanel:'config'};
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(b.dataset.v7hook)return;b.dataset.v7hook='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const raw=b.dataset.nav||b.dataset.page;const page=maps[raw]||raw;if(PAGES.includes(page))navigate(page)})});
 $('quickApprova')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('iscritti')});
 $('quickCoppie')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('coppie')});
 $('quickTabellone')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('tabellone')});
 $('quickLink')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('link')});
 document.querySelectorAll('#areaAdmin [data-action="create"]').forEach(b=>{if(b.dataset.v7create)return;b.dataset.v7create='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('config')})});
 const sidebar=document.querySelectorAll('#areaAdmin .nav')[1];
 if(sidebar&&!sidebar.querySelector('[data-nav="news"]')){
  const n=document.createElement('button');n.type='button';n.dataset.nav='news';n.innerHTML='📰 <span>News</span>';sidebar.appendChild(n);
  const s=document.createElement('button');s.type='button';s.dataset.nav='sponsor';s.innerHTML='🏷️ <span>Sponsor</span>';sidebar.appendChild(s);
  const l=document.createElement('button');l.type='button';l.dataset.nav='link';l.innerHTML='🔗 <span>Link pubblici</span>';sidebar.appendChild(l);
 }
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(!b.dataset.v7hook){b.dataset.v7hook='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const raw=b.dataset.nav||b.dataset.page;const page=maps[raw]||raw;if(PAGES.includes(page))navigate(page)})}});
}
function navigate(page){
 if(!PAGES.includes(page))page='dashboard';moveExisting();
 const current=routeFromUrl();
 const target='admin.html?page='+encodeURIComponent(page);
 if(current!==page)history.pushState({page},'',target);
 PAGES.forEach(p=>$('admin-page-'+p)?.classList.toggle('active',p===page));
 const area=$('areaAdmin');area.className=area.className.replace(/\badmin-page-\S+/g,'');area.classList.add('admin-page-'+page);
 const top=area.querySelector('.topbar .breadcrumb b');if(top)top.textContent=LABELS[page];
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{const raw=b.dataset.nav||b.dataset.page;const maps={dashboard:'dashboard',richiesteIscrizione:'iscritti',creaCoppieBox:'coppie',linkBoveGenerato:'tabellone',configPanel:'config'};b.classList.toggle('active',(maps[raw]||raw)===page)});
 if(page==='iscritti')call(['caricaRichiesteIscrizione']);
 if(page==='coppie')call(['renderCoppie']);
 if(page==='config')$('configPanel')?.setAttribute('open','');else $('configPanel')?.removeAttribute('open');
}
function groupTournaments(){
 const box=$('listaTorneiAdmin');if(!box||box.dataset.groupedV7)return;box.dataset.groupedV7='1';
 const rows=[...box.querySelectorAll(':scope > .tournament-row')];if(!rows.length)return;
 const groups=new Map();rows.forEach(r=>{const txt=r.querySelector('.t-info small')?.textContent||'';const m=txt.match(/(\d{4})[-\/.](\d{1,2})/);const key=m?m[1]+'-'+String(m[2]).padStart(2,'0'):'Senza data';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)});
 box.innerHTML='';[...groups.entries()].sort((a,b)=>b[0].localeCompare(a[0])).forEach(([key,list],i)=>{const d=document.createElement('details');d.className='month-group';d.open=i===0;const s=document.createElement('summary');s.textContent=monthLabel(key);const body=document.createElement('div');body.className='month-body';list.forEach(r=>body.appendChild(r));d.append(s,body);box.appendChild(d)})
}
function monthLabel(k){if(k==='Senza data')return k;const [y,m]=k.split('-');return ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'][+m]+' '+y}
function boot(){
 style();moveExisting();nav();groupTournaments();navigate(routeFromUrl());
 window.addEventListener('popstate',()=>navigate(routeFromUrl()));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();