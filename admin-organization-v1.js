/* Admin organization v2: clean tournament calendar 2026-2028 + management pages */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const fn=n=>typeof window[n]==='function'?window[n]:null;
const call=(names,...args)=>{for(const n of names){const f=fn(n);if(f)return f(...args)}};
const selected=()=>window.getTorneoAdminCorrente?.()?.id??window.adminState?.torneoSelezionato??null;
const first=()=>selected()??window.adminState?.tornei?.[0]?.id??document.querySelector('#listaTorneiAdmin .tournament-row')?.dataset?.torneoId??null;
const pages={dashboard:['Tornei','Calendario tornei 2026 — 2027 — 2028'],iscritti:['Iscritti','Richieste e partecipanti'],coppie:['Accoppiamenti','Coppie e sfide'],tabellone:['Tabellone','Visualizzazione torneo'],config:['Configurazione','Regole e dati torneo'],news:['News','Comunicazioni'],sponsor:['Sponsor','Gestione sponsor'],links:['Link pubblici','Collegamenti pubblici']};
const MONTHS=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const TEST_EVENTS=[
 {date:'2026-01-17',name:'Torneo Test — Gennaio',status:'aperto'},
 {date:'2026-03-14',name:'Torneo Test — Marzo',status:'attivo'},
 {date:'2026-06-20',name:'Torneo Test — Giugno',status:'aperto'},
 {date:'2026-09-12',name:'Torneo Test — Settembre',status:'chiuso'},
 {date:'2026-12-19',name:'Torneo Test — Dicembre',status:'aperto'},
 {date:'2027-02-13',name:'Torneo Test — Febbraio',status:'aperto'},
 {date:'2027-05-22',name:'Torneo Test — Maggio',status:'attivo'},
 {date:'2027-08-21',name:'Torneo Test — Agosto',status:'aperto'},
 {date:'2027-11-13',name:'Torneo Test — Novembre',status:'chiuso'},
 {date:'2028-01-15',name:'Torneo Test — Gennaio',status:'aperto'},
 {date:'2028-04-08',name:'Torneo Test — Aprile',status:'attivo'},
 {date:'2028-07-15',name:'Torneo Test — Luglio',status:'aperto'},
 {date:'2028-10-14',name:'Torneo Test — Ottobre',status:'aperto'}
];
let built=false;
let catalogSignature='';
let observer=null;

function css(){
 if($('admin-org-v2-style'))return;
 const s=document.createElement('style');s.id='admin-org-v2-style';s.textContent=`
#areaAdmin.admin-organized .content{padding:22px;max-width:none}
#areaAdmin.admin-organized .org-page{display:none!important;max-width:1200px;margin:auto}
#areaAdmin.admin-organized .org-page.org-active{display:block!important}
#areaAdmin.admin-organized .org-head{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px;padding:16px 18px;background:rgba(25,30,37,.82);border:1px solid rgba(255,255,255,.10);border-radius:16px;box-shadow:0 14px 35px rgba(0,0,0,.16),inset 0 1px rgba(255,255,255,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
#areaAdmin.admin-organized .org-head h1{margin:0;font-size:22px;color:#fff}
#areaAdmin.admin-organized .org-head p{margin:4px 0 0;color:#9ca8b5;font-size:12px}
#areaAdmin.admin-organized .org-tools{display:flex;gap:8px;flex-wrap:wrap}
#areaAdmin.admin-organized .org-card{background:rgba(17,22,28,.82);border:1px solid rgba(255,255,255,.10);border-radius:16px;margin-bottom:12px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.14),inset 0 1px rgba(255,255,255,.035);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
#areaAdmin.admin-organized .org-card>summary{cursor:pointer;list-style:none;padding:15px 17px;font-weight:850;font-size:14px;display:flex;justify-content:space-between;align-items:center;color:#fff;background:linear-gradient(90deg,rgba(77,163,255,.08),rgba(255,255,255,.018))}
#areaAdmin.admin-organized .org-card>summary::-webkit-details-marker{display:none}
#areaAdmin.admin-organized .org-card>summary:after{content:'＋';color:#8f9aa6;font-size:17px}
#areaAdmin.admin-organized .org-card[open]>summary:after{content:'−'}
#areaAdmin.admin-organized .org-body{padding:12px;border-top:1px solid rgba(255,255,255,.07)}
#areaAdmin.admin-organized .org-page:not([data-page="dashboard"]) .page-title,#areaAdmin.admin-organized .org-page:not([data-page="dashboard"]) .stats{display:none!important}
#areaAdmin.admin-organized #workspace{display:none!important}
#areaAdmin.admin-organized #configPanel{display:none!important}
#areaAdmin.admin-organized #newsPanel,#areaAdmin.admin-organized #sponsorPanel{display:none!important}
#areaAdmin.admin-organized .org-tournament-select{width:100%;background:#0b0f13;color:#fff;border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:11px;margin-bottom:12px;outline:none}
#areaAdmin.admin-organized .org-empty{padding:22px;color:#8f9aa6;text-align:center;border:1px dashed rgba(255,255,255,.12);border-radius:11px}
#areaAdmin.admin-organized .year-group{border:1px solid rgba(255,255,255,.10);border-radius:14px;margin-bottom:12px;overflow:hidden;background:rgba(12,17,23,.62)}
#areaAdmin.admin-organized .year-group>summary{padding:14px 16px;cursor:pointer;font-weight:900;list-style:none;font-size:16px;color:#fff;background:linear-gradient(90deg,rgba(77,163,255,.13),rgba(255,255,255,.025))}
#areaAdmin.admin-organized .year-group>summary::-webkit-details-marker{display:none}
#areaAdmin.admin-organized .year-group>summary:after{content:'＋';float:right;color:#8f9aa6}
#areaAdmin.admin-organized .year-group[open]>summary:after{content:'−'}
#areaAdmin.admin-organized .year-body{padding:10px}
#areaAdmin.admin-organized .month-group{border:1px solid rgba(255,255,255,.075);border-radius:12px;margin:0 0 8px;overflow:hidden;background:rgba(255,255,255,.018)}
#areaAdmin.admin-organized .month-group:last-child{margin-bottom:0}
#areaAdmin.admin-organized .month-group>summary{padding:12px 14px;font-size:12px;font-weight:850;color:#e8edf2;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
#areaAdmin.admin-organized .month-group>summary::-webkit-details-marker{display:none}
#areaAdmin.admin-organized .month-group>summary:after{content:'＋';color:#7f8b97}
#areaAdmin.admin-organized .month-group[open]>summary:after{content:'−'}
#areaAdmin.admin-organized .month-body{padding:0 8px 8px}
#areaAdmin.admin-organized .month-empty{padding:11px 10px;color:#68737f;font-size:11px;font-style:italic}
#areaAdmin.admin-organized .calendar-event{display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:12px;padding:11px 10px;margin-top:7px;border:1px solid rgba(255,255,255,.065);border-radius:10px;background:rgba(255,255,255,.025);transition:.16s ease}
#areaAdmin.admin-organized .calendar-event:hover{background:rgba(77,163,255,.075);border-color:rgba(77,163,255,.18);transform:translateY(-1px)}
#areaAdmin.admin-organized .calendar-event.test-event{border-color:rgba(242,201,76,.16);background:rgba(242,201,76,.035)}
#areaAdmin.admin-organized .calendar-date{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:46px;border-right:1px solid rgba(255,255,255,.08);padding-right:10px}
#areaAdmin.admin-organized .calendar-date strong{font-size:21px;line-height:1;color:#fff}
#areaAdmin.admin-organized .calendar-date span{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#8f9aa6;margin-top:5px}
#areaAdmin.admin-organized .calendar-info{min-width:0}
#areaAdmin.admin-organized .calendar-info strong{display:block;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#areaAdmin.admin-organized .calendar-info small{display:block;margin-top:4px;color:#8f9aa6;font-size:10px}
#areaAdmin.admin-organized .calendar-status{display:inline-flex;margin-top:6px;padding:4px 7px;border-radius:999px;background:rgba(66,211,146,.10);color:#42d392;font-size:10px;font-weight:750}
#areaAdmin.admin-organized .calendar-status.closed{background:rgba(255,102,120,.10);color:#ff6678}
#areaAdmin.admin-organized .calendar-status.test{background:rgba(242,201,76,.10);color:#f2c94c}
#areaAdmin.admin-organized .calendar-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
#areaAdmin.admin-organized .calendar-actions .btn{padding:7px 9px!important;font-size:10px!important}
#areaAdmin.admin-organized .test-label{font-size:9px;color:#f2c94c;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
#areaAdmin.admin-organized .calendar-legend{display:flex;gap:14px;flex-wrap:wrap;padding:10px 12px;color:#8f9aa6;font-size:10px;border-top:1px solid rgba(255,255,255,.07)}
#areaAdmin.admin-organized .calendar-legend b{color:#f2c94c}
#areaAdmin.admin-organized .calendar-summary{display:flex;gap:8px;align-items:center;color:#8f9aa6;font-size:11px}
#areaAdmin.admin-organized .calendar-summary strong{color:#fff}
@media(max-width:760px){#areaAdmin.admin-organized .calendar-event{grid-template-columns:54px minmax(0,1fr)}#areaAdmin.admin-organized .calendar-actions{grid-column:2;justify-content:flex-start}.org-head{align-items:flex-start!important;flex-direction:column!important}}
@media(max-width:520px){#areaAdmin.admin-organized .content{padding:14px}#areaAdmin.admin-organized .calendar-event{gap:9px;padding:9px 7px}#areaAdmin.admin-organized .calendar-date{padding-right:7px}#areaAdmin.admin-organized .calendar-date strong{font-size:18px}}
`;
 document.head.appendChild(s);
}

function page(name){
 let p=$('org-page-'+name);if(p)return p;
 p=document.createElement('section');p.id='org-page-'+name;p.className='org-page';p.dataset.page=name;
 p.innerHTML='<div class="org-head"><div><h1></h1><p></p></div><div class="org-tools"></div></div><div class="org-content"></div>';
 p.querySelector('h1').textContent=pages[name][0];p.querySelector('p').textContent=pages[name][1];
 $('areaAdmin')?.querySelector('.content')?.appendChild(p);return p;
}

function backButton(el){
 if(el.querySelector('.page-back'))return;
 const b=document.createElement('button');b.type='button';b.className='btn page-back';b.textContent='← Tornei';b.addEventListener('click',()=>go('dashboard'));
 el.querySelector('.org-tools')?.appendChild(b);
}

function pagesBuild(){
 if(built)return;
 built=true;
 Object.keys(pages).forEach(page);
 const content=$('areaAdmin')?.querySelector('.content');if(!content)return;
 [...content.children].filter(e=>!e.classList.contains('org-page')&&!e.classList.contains('org-installed-hidden')).forEach(e=>{e.classList.add('org-installed-hidden');page('dashboard').querySelector('.org-content').appendChild(e)});
 const cfg=$('configPanel');if(cfg)page('config').querySelector('.org-content').appendChild(cfg);
 const ws=$('workspace');if(ws){const i=page('iscritti');const c=page('coppie');const g=$('gestioneTorneoAdmin');if(g){
   const ic=document.createElement('details');ic.className='org-card';ic.open=true;ic.innerHTML='<summary>👥 Gestione iscritti</summary><div class="org-body"></div>';
   ['dettaglioTorneoAdmin','richiesteIscrizione','partecipantiAdmin','schedaGiocatoreAdmin'].map($).filter(Boolean).forEach(e=>ic.querySelector('.org-body').appendChild(e));
   i.querySelector('.org-content').appendChild(ic);
   const cc=document.createElement('details');cc.className='org-card';cc.open=true;cc.innerHTML='<summary>🔀 Gestione accoppiamenti</summary><div class="org-body"></div>';
   ['creaCoppieBox','listaCoppieAdmin'].map($).filter(Boolean).forEach(e=>cc.querySelector('.org-body').appendChild(e));
   c.querySelector('.org-content').appendChild(cc);
   const actions=[...g.children].find(e=>e.matches('div[style]'));if(actions)i.querySelector('.org-content').prepend(actions);
 }}
 const np=$('newsPanel');if(np)page('news').querySelector('.org-content').appendChild(np);
 const sp=$('sponsorPanel');if(sp)page('sponsor').querySelector('.org-content').appendChild(sp);
 buildTournamentCatalog();buildNav();
}

function buildTournamentCatalog(){
 const box=$('listaTorneiAdmin');const host=page('dashboard').querySelector('.org-content');
 if(!box||box.dataset.orgCalendarMoved)return;
 box.dataset.orgCalendarMoved='1';
 const select=document.createElement('select');select.className='org-tournament-select';select.id='orgTournamentSelect';select.innerHTML='<option value="">Seleziona torneo...</option>';
 select.addEventListener('change',()=>{if(select.value)call(['selezionaTorneoAdmin'],select.value)});
 host.prepend(select);
 const card=document.createElement('details');card.className='org-card';card.open=true;
 card.innerHTML='<summary><span>🏆 Calendario tornei</span><span class="calendar-summary"><strong>2026 · 2027 · 2028</strong></span></summary><div class="org-body"></div>';
 card.querySelector('.org-body').appendChild(box);host.appendChild(card);
 const legend=document.createElement('div');legend.className='calendar-legend';legend.innerHTML='<span>📅 <b>Test</b> = torneo dimostrativo</span><span>12 mesi per ogni anno</span><span>Anno → Mese → Giorno</span>';card.querySelector('.org-body').appendChild(legend);
 catalog();
 observer=new MutationObserver(()=>scheduleCatalog());
 observer.observe(box,{childList:true,subtree:true});
}

let catalogTimer=0;
function scheduleCatalog(){clearTimeout(catalogTimer);catalogTimer=setTimeout(catalog,80)}

function normalizeRows(){
 const box=$('listaTorneiAdmin');
 if(!box)return [];
 return [...box.querySelectorAll(':scope > .tournament-row')].filter(r=>!r.dataset.testEvent);
}

function parseDate(row){
 const text=(row.querySelector('.t-info small')?.textContent||'')+' '+(row.dataset.date||'')+' '+(row.getAttribute('data-date')||'');
 let m=text.match(/(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
 if(m)return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
 return '';
}

function rowElement(row,date){
 const el=document.createElement('div');el.className='calendar-event';
 const day=date?new Date(date+'T12:00:00').getDate():'?';
 el.innerHTML=`<div class="calendar-date"><strong>${day}</strong><span>giorno</span></div><div class="calendar-info"></div><div class="calendar-actions"></div>`;
 const info=el.querySelector('.calendar-info');
 info.appendChild(row.querySelector('.t-info')?.cloneNode(true)||document.createTextNode('Torneo'));
 const actions=el.querySelector('.calendar-actions');
 row.querySelectorAll('.actions .btn').forEach(b=>actions.appendChild(b.cloneNode(true)));
 return el;
}

function testEventElement(event){
 const el=document.createElement('div');el.className='calendar-event test-event';el.dataset.testEvent='1';
 const d=new Date(event.date+'T12:00:00');
 el.innerHTML=`<div class="calendar-date"><strong>${d.getDate()}</strong><span>giorno</span></div><div class="calendar-info"><div class="test-label">TEST</div><strong>${event.name}</strong><small>${event.date}</small><span class="calendar-status test">${event.status}</span></div><div class="calendar-actions"></div>`;
 return el;
}

function catalog(){
 const box=$('listaTorneiAdmin');if(!box)return;
 const rows=normalizeRows();
 const items=[];
 rows.forEach(r=>{const d=parseDate(r);if(d)items.push({type:'real',row:r,date:d});});
 TEST_EVENTS.forEach(e=>items.push({type:'test',event:e,date:e.date}));
 const byYear=new Map();
 [2026,2027,2028].forEach(y=>byYear.set(y,[]));
 items.forEach(x=>{const y=Number(x.date.slice(0,4));if(byYear.has(y))byYear.get(y).push(x)});
 box.innerHTML='';
 const select=$('orgTournamentSelect');if(select)select.innerHTML='<option value="">Seleziona torneo...</option>';
 [...byYear.entries()].forEach(([year,list])=>{
   const yd=document.createElement('details');yd.className='year-group';yd.open=year===new Date().getFullYear();
   yd.innerHTML=`<summary>${year}<span class="calendar-summary">${list.length} tornei</span></summary><div class="year-body"></div>`;
   const months=new Map(MONTHS.map((m,i)=>[i,[]]));
   list.forEach(item=>months.get(Number(item.date.slice(5,7))-1).push(item));
   months.forEach((monthItems,mi)=>{
     const md=document.createElement('details');md.className='month-group';md.open=monthItems.length>0;
     md.innerHTML=`<summary>${MONTHS[mi]}<span class="calendar-summary">${monthItems.length}</span></summary><div class="month-body"></div>`;
     const body=md.querySelector('.month-body');
     if(!monthItems.length)body.innerHTML='<div class="month-empty">Nessun torneo programmato</div>';
     monthItems.sort((a,b)=>a.date.localeCompare(b.date)).forEach(item=>{
       if(item.type==='test')body.appendChild(testEventElement(item.event));
       else {
         body.appendChild(rowElement(item.row,item.date));
         const id=item.row.dataset.torneoId||item.row.querySelector('[data-torneo-id]')?.dataset?.torneoId||'';
         if(select&&id){const o=document.createElement('option');o.value=id;o.textContent=`${item.row.querySelector('.t-info strong')?.textContent||'Torneo'} — ${item.date}`;select.appendChild(o)}
       }
     });
     yd.querySelector('.year-body').appendChild(md);
   });
   box.appendChild(yd);
 });
}

function buildNav(){
 const navs=$('areaAdmin')?.querySelectorAll('.sidebar .nav');if(!navs?.length)return;
 const base=navs[0];
 const map=[['dashboard','🏆 Tornei'],['iscritti','👥 Iscritti'],['coppie','🔀 Accoppiamenti'],['tabellone','📋 Tabellone'],['config','⚙️ Configurazione'],['news','📰 News'],['sponsor','⭐ Sponsor'],['links','🔗 Link pubblici']];
 base.innerHTML='';
 map.forEach(([k,label])=>{const b=document.createElement('button');b.type='button';b.dataset.orgPage=k;b.dataset.page=k;b.textContent=label;b.onclick=()=>go(k);base.appendChild(b)});
 navs[1]?.remove();
 // Mantiene compatibilità con i pulsanti data-page della pagina originale.
 document.querySelectorAll('#areaAdmin [data-page]').forEach(b=>{
   if(b.dataset.page==='configurazione')b.dataset.page='config';
   if(b.dataset.page==='link')b.dataset.page='links';
 });
}

function tabellone(){
 const p=page('tabellone');const c=p.querySelector('.org-content');if(c.dataset.ready)return;c.dataset.ready='1';
 const b=document.createElement('button');b.className='btn primary';b.type='button';b.textContent='📋 Apri tabellone del torneo selezionato';b.onclick=()=>call(['apriBoveConTorneo','apriTabellone'],selected()||first());c.appendChild(b);
}

function go(k){
 if(!pages[k])k='dashboard';
 if(k==='tabellone')tabellone();
 Object.keys(pages).forEach(x=>page(x).classList.toggle('org-active',x===k));
 $('areaAdmin')?.classList.add('admin-organized');
 document.querySelectorAll('#areaAdmin .sidebar .nav button').forEach(b=>b.classList.toggle('active',b.dataset.orgPage===k));
 const top=$('areaAdmin')?.querySelector('.breadcrumb b');if(top)top.textContent=pages[k][0];
 if(k==='iscritti')call(['caricaRichiesteIscrizione']);
 if(k==='dashboard')scheduleCatalog();
}

function boot(){
 css();pagesBuild();go('dashboard');
 window.addEventListener('hashchange',()=>{const k=location.hash.slice(1);if(pages[k])go(k)});
 const k=location.hash.slice(1);if(pages[k])go(k);
 setInterval(()=>{if($('areaAdmin')&&!$('areaAdmin').classList.contains('hidden'))scheduleCatalog()},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
