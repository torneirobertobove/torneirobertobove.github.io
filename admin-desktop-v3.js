/* Admin desktop v8 — gestionale tornei: navigazione a pagine, calendario Anno/Mese/Giorno e pannelli puliti */
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
let groupingTimer=0;
function style(){
 if($('admin-v8-style'))return;
 const s=document.createElement('style');s.id='admin-v8-style';
 s.textContent=`
#areaAdmin .content{position:relative}
#areaAdmin .admin-page-shell{display:none!important;min-height:calc(100vh - 100px)}
#areaAdmin .admin-page-shell.active{display:block!important}
#areaAdmin .admin-page-shell>.page-inner{width:100%;max-width:1450px;margin:0 auto}
#areaAdmin .admin-view-title{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;padding:18px 20px;background:rgba(25,30,37,.72);border:1px solid rgba(255,255,255,.10);border-radius:16px;box-shadow:0 14px 35px rgba(0,0,0,.12),inset 0 1px rgba(255,255,255,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
#areaAdmin .admin-view-shell-title{margin:0;font-size:22px;color:#fff}
#areaAdmin .admin-view-shell-sub{margin:5px 0 0;color:#9ca8b5;font-size:12px}
#areaAdmin .page-tools{display:flex;gap:8px;flex-wrap:wrap}
#areaAdmin .page-back{background:rgba(255,255,255,.055)!important}
#areaAdmin .admin-page-shell>.page-inner>.panel{margin-top:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel{display:block!important;border:0;background:transparent;margin:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel .panel-content{border-top:0;padding:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel,#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel,#areaAdmin .admin-page-shell[data-page="link"] .public-link-panel{display:block!important;margin:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel>summary,#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel .panel-content,#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel .panel-content{border-top:0}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace,#areaAdmin .admin-page-shell[data-page="coppie"] #workspace{display:block!important;margin:0}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="coppie"],#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="iscritti"]{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="iscritti"],#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="coppie"]{display:block!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .admin-section-actions{display:flex!important;gap:8px;flex-wrap:wrap}
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .admin-section-actions{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace>.panel-content,#areaAdmin .admin-page-shell[data-page="coppie"] #workspace>.panel-content{padding-top:0}
#areaAdmin .admin-page-shell[data-page="dashboard"] .page-title{display:flex}
#areaAdmin .admin-page-shell[data-page="dashboard"] .stats{display:grid}
#areaAdmin .admin-page-shell[data-page="dashboard"] .grid{display:grid}

/* CALENDARIO TORNEI: ANNO → 12 MESI ALLINEATI → GIORNI */
#listaTorneiAdmin{padding:0!important;display:block!important}
#listaTorneiAdmin .calendar-year{margin:0 0 16px;border:1px solid rgba(255,255,255,.10);border-radius:16px;overflow:hidden;background:rgba(18,23,29,.78);box-shadow:0 14px 34px rgba(0,0,0,.14);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
#listaTorneiAdmin .calendar-year>summary{list-style:none;cursor:pointer;padding:15px 18px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,rgba(77,163,255,.10),rgba(255,255,255,.02));border-bottom:1px solid rgba(255,255,255,.07);font-size:15px;font-weight:850;color:#fff}
#listaTorneiAdmin .calendar-year>summary::-webkit-details-marker{display:none}
#listaTorneiAdmin .calendar-year>summary:after{content:'＋';color:#9ca8b5;font-size:17px}
#listaTorneiAdmin .calendar-year[open]>summary:after{content:'−'}
#listaTorneiAdmin .calendar-year-body{padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:start}
#listaTorneiAdmin .calendar-month{margin:0!important;min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:13px;overflow:hidden;background:rgba(8,12,17,.30);height:100%}
#listaTorneiAdmin .calendar-month>summary{list-style:none;cursor:pointer;min-height:44px;padding:11px 12px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.025);border-bottom:1px solid rgba(255,255,255,.06);font-size:12px;font-weight:800;color:#e8edf2}
#listaTorneiAdmin .calendar-month>summary::-webkit-details-marker{display:none}
#listaTorneiAdmin .calendar-month>summary:after{content:'＋';color:#7f8b97}
#listaTorneiAdmin .calendar-month[open]>summary:after{content:'−'}
#listaTorneiAdmin .calendar-month-body{padding:8px;min-height:44px}
#listaTorneiAdmin .calendar-month-empty{padding:10px 6px;text-align:center;color:#66717d;font-size:10px}
#listaTorneiAdmin .calendar-day{display:grid;grid-template-columns:56px minmax(0,1fr);align-items:center;gap:10px;padding:9px 8px;border:1px solid rgba(255,255,255,.065);border-radius:10px;background:rgba(255,255,255,.025);margin-bottom:6px}
#listaTorneiAdmin .calendar-day:last-child{margin-bottom:0}
#listaTorneiAdmin .calendar-day:hover{background:rgba(77,163,255,.07);border-color:rgba(77,163,255,.17)}
#listaTorneiAdmin .calendar-date{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:42px;border-right:1px solid rgba(255,255,255,.08);padding-right:8px}
#listaTorneiAdmin .calendar-date strong{font-size:18px;line-height:1;color:#fff}
#listaTorneiAdmin .calendar-date span{font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:#8f9aa6;margin-top:4px}
#listaTorneiAdmin .calendar-tournament{min-width:0}
#listaTorneiAdmin .calendar-tournament .tournament-row{margin:0!important;padding:0!important;border:0!important;background:transparent!important;display:block!important;transform:none!important;box-shadow:none!important}
#listaTorneiAdmin .calendar-tournament .t-info strong{display:block;font-size:12px;color:#fff}
#listaTorneiAdmin .calendar-tournament .t-info small{display:block;margin-top:3px;color:#8f9aa6;font-size:10px}
#listaTorneiAdmin .calendar-tournament .status{margin-top:5px;font-size:9px;padding:4px 7px}
#listaTorneiAdmin .calendar-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;margin-top:6px}
#listaTorneiAdmin .calendar-actions .btn{padding:6px 8px!important;font-size:9px!important}
#listaTorneiAdmin .calendar-day.selected{border-color:rgba(77,163,255,.28);background:rgba(77,163,255,.10);box-shadow:inset 3px 0 #4da3ff}
#listaTorneiAdmin .calendar-empty{padding:28px 16px;text-align:center;color:#8f9aa6;font-size:12px;border:1px dashed rgba(255,255,255,.10);border-radius:12px;background:rgba(255,255,255,.018)}
#areaAdmin .compact-group{border:1px solid rgba(255,255,255,.10);border-radius:14px;margin:12px 0;overflow:hidden;background:rgba(16,20,25,.76);box-shadow:0 10px 26px rgba(0,0,0,.12)}
#areaAdmin .compact-group>summary{cursor:pointer;list-style:none;padding:14px 15px;font-weight:800;font-size:13px;color:#fff;background:rgba(255,255,255,.025)}
#areaAdmin .compact-group>summary::-webkit-details-marker{display:none}
#areaAdmin .compact-group>summary:after{content:'＋';float:right;color:#8f9aa6}
#areaAdmin .compact-group[open]>summary:after{content:'−'}
#areaAdmin .compact-group-body{padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.07)}
#areaAdmin .page-nav-note{font-size:11px;color:#8f9aa6;margin:0 0 12px}
#areaAdmin .tabellone-launch{margin-top:4px;padding:16px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(20,25,31,.68);box-shadow:0 10px 28px rgba(0,0,0,.12)}
@media(max-width:1000px){#listaTorneiAdmin .calendar-year-body{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:760px){#listaTorneiAdmin .calendar-year-body{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-view-title{align-items:flex-start!important;flex-direction:column!important}}
@media(max-width:480px){#listaTorneiAdmin .calendar-year-body{grid-template-columns:1fr}#listaTorneiAdmin .calendar-day{grid-template-columns:52px minmax(0,1fr);gap:8px;padding:9px 7px}}
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
  const dash=shell('dashboard','Tornei','Calendario e gestione dei campionati');
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
  prepareWorkspace();addTabelloneLauncher(tab);addCompactGroups();
 }finally{moving=false}
}
function prepareWorkspace(){
 const g=$('gestioneTorneoAdmin');if(!g)return;
 g.querySelectorAll('#dettaglioTorneoAdmin,#richiesteIscrizione,#partecipantiAdmin,#schedaGiocatoreAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='iscritti'});
 g.querySelectorAll('#creaCoppieBox,#listaCoppieAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='coppie'});
 const a=[...g.children].find(e=>e.matches('div[style]'));if(a)a.classList.add('admin-section-actions');
}
function addCompactGroups(){
 const g=$('gestioneTorneoAdmin');if(!g||g.dataset.compactV8)return;g.dataset.compactV8='1';
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
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(b.dataset.v8hook)return;b.dataset.v8hook='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const raw=b.dataset.nav||b.dataset.page;const page=maps[raw]||raw;if(PAGES.includes(page))navigate(page)})});
 $('quickApprova')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('iscritti')});
 $('quickCoppie')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('coppie')});
 $('quickTabellone')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('tabellone')});
 $('quickLink')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('link')});
 document.querySelectorAll('#areaAdmin [data-action="create"]').forEach(b=>{if(b.dataset.v8create)return;b.dataset.v8create='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('config')})});
 const sidebar=document.querySelectorAll('#areaAdmin .nav')[1];
 if(sidebar&&!sidebar.querySelector('[data-nav="news"]')){
  const n=document.createElement('button');n.type='button';n.dataset.nav='news';n.innerHTML='📰 <span>News</span>';sidebar.appendChild(n);
  const sp=document.createElement('button');sp.type='button';sp.dataset.nav='sponsor';sp.innerHTML='🏷️ <span>Sponsor</span>';sidebar.appendChild(sp);
  const l=document.createElement('button');l.type='button';l.dataset.nav='link';l.innerHTML='🔗 <span>Link pubblici</span>';sidebar.appendChild(l);
 }
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(!b.dataset.v8hook){b.dataset.v8hook='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const raw=b.dataset.nav||b.dataset.page;const page=maps[raw]||raw;if(PAGES.includes(page))navigate(page)})}});
}
function navigate(page){
 if(!PAGES.includes(page))page='dashboard';moveExisting();
 const current=routeFromUrl();const target='admin.html?page='+encodeURIComponent(page);if(current!==page)history.pushState({page},'',target);
 PAGES.forEach(p=>$('admin-page-'+p)?.classList.toggle('active',p===page));
 const area=$('areaAdmin');if(area){area.className=area.className.replace(/\badmin-page-\S+/g,'');area.classList.add('admin-page-'+page)}
 const top=area?.querySelector('.topbar .breadcrumb b');if(top)top.textContent=LABELS[page];
 document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{const raw=b.dataset.nav||b.dataset.page;const maps={dashboard:'dashboard',richiesteIscrizione:'iscritti',creaCoppieBox:'coppie',linkBoveGenerato:'tabellone',configPanel:'config'};b.classList.toggle('active',(maps[raw]||raw)===page)});
 if(page==='iscritti')call(['caricaRichiesteIscrizione']);if(page==='coppie')call(['renderCoppie']);if(page==='config')$('configPanel')?.setAttribute('open','');else $('configPanel')?.removeAttribute('open');
}
function parseDate(row){
 const raw=(row.dataset?.data||row.dataset?.date||row.querySelector('.t-info small')?.textContent||'').trim();
 let m=raw.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3]);
 m=raw.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);
 const d=Date.parse(raw);return Number.isNaN(d)?null:new Date(d);
}
function monthName(m){return ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'][m-1]||''}
function dayName(d){return ['DOM','LUN','MAR','MER','GIO','VEN','SAB'][d.getDay()]||''}
function dateKey(d){return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'Senza data'}
function groupTournaments(){
 const box=$('listaTorneiAdmin');if(!box)return;const rows=[...box.querySelectorAll(':scope > .tournament-row')];if(!rows.length)return;if(rows.some(r=>r.closest('.calendar-year')))return;
 const years=new Map();
 [2026,2027,2028].forEach(y=>{const months=new Map();for(let m=1;m<=12;m++)months.set(String(m).padStart(2,'0'),[]);years.set(String(y),months)});
 let noDate=[];
 rows.forEach(row=>{const d=parseDate(row);if(!d){noDate.push({row,date:null});return}const year=String(d.getFullYear());if(!years.has(year)){years.set(year,new Map());for(let m=1;m<=12;m++)years.get(year).set(String(m).padStart(2,'0'),[])}years.get(year).get(String(d.getMonth()+1).padStart(2,'0')).push({row,date:d})});
 box.innerHTML='';
 [...years.entries()].sort((a,b)=>b[0].localeCompare(a[0])).forEach(([year,months],yi)=>{
  const yd=document.createElement('details');yd.className='calendar-year';yd.open=yi===0;const ys=document.createElement('summary');ys.textContent=`Anno ${year}`;const yb=document.createElement('div');yb.className='calendar-year-body';
  [...months.entries()].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([month,items],mi)=>{
   const md=document.createElement('details');md.className='calendar-month';md.open=items.length>0&&yi===0&&mi===new Date().getMonth();const ms=document.createElement('summary');ms.textContent=monthName(+month);const mb=document.createElement('div');mb.className='calendar-month-body';
   if(!items.length){const empty=document.createElement('div');empty.className='calendar-month-empty';empty.textContent='Nessun torneo';mb.appendChild(empty)}
   items.sort((a,b)=>(a.date?.getTime()||0)-(b.date?.getTime()||0)).forEach(({row,date})=>{
    const day=document.createElement('div');day.className='calendar-day';if(row.classList.contains('selected'))day.classList.add('selected');
    const dateBox=document.createElement('div');dateBox.className='calendar-date';dateBox.innerHTML=`<strong>${String(date.getDate()).padStart(2,'0')}</strong><span>${dayName(date)}</span>`;
    const info=document.createElement('div');info.className='calendar-tournament';const tinfo=row.querySelector('.t-info');if(tinfo)info.appendChild(tinfo);else info.appendChild(row);
    const actions=row.querySelector('.actions');const actionBox=document.createElement('div');actionBox.className='calendar-actions';if(actions)[...actions.children].forEach(x=>actionBox.appendChild(x));
    day.append(dateBox,info);if(actionBox.children.length)day.appendChild(actionBox);mb.appendChild(day);
   });
   md.append(ms,mb);yb.appendChild(md);
  });
  yd.append(ys,yb);box.appendChild(yd);
 });
 if(noDate.length){
  const yd=document.createElement('details');yd.className='calendar-year';const ys=document.createElement('summary');ys.textContent='Senza data';const yb=document.createElement('div');yb.className='calendar-year-body';const md=document.createElement('details');md.className='calendar-month';md.open=true;const ms=document.createElement('summary');ms.textContent='Senza data';const mb=document.createElement('div');mb.className='calendar-month-body';noDate.forEach(({row})=>{const wrap=document.createElement('div');wrap.className='calendar-day';const dateBox=document.createElement('div');dateBox.className='calendar-date';dateBox.innerHTML='<strong>—</strong><span>DATA</span>';const info=document.createElement('div');info.className='calendar-tournament';const tinfo=row.querySelector('.t-info');if(tinfo)info.appendChild(tinfo);else info.appendChild(row);wrap.append(dateBox,info);mb.appendChild(wrap)});md.append(ms,mb);yb.appendChild(md);yd.append(ys,yb);box.appendChild(yd)}
 box.dataset.calendarV8='1';
}
function scheduleGrouping(){clearTimeout(groupingTimer);groupingTimer=setTimeout(()=>{const box=$('listaTorneiAdmin');if(box&&!box.querySelector('.calendar-year'))groupTournaments()},160)}
function observeTournamentList(){
 const box=$('listaTorneiAdmin');if(!box||box.dataset.observerV8)return;box.dataset.observerV8='1';
 new MutationObserver(()=>{if(box.querySelector(':scope > .tournament-row')){box.dataset.calendarV8='';scheduleGrouping()}}).observe(box,{childList:true,subtree:true});scheduleGrouping();
}
function boot(){style();moveExisting();nav();observeTournamentList();scheduleGrouping();navigate(routeFromUrl());window.addEventListener('popstate',()=>navigate(routeFromUrl()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
