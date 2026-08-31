/* Admin desktop v6: true single-page navigation */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const fn=n=>typeof window[n]==='function'?window[n]:null;
const call=(names,...args)=>{for(const n of names){const f=fn(n);if(f)return f(...args)}};
const selectedId=()=>window.getTorneoAdminCorrente?.()?.id??null;
const firstId=()=>selectedId()??document.querySelector('#listaTorneiAdmin .tournament-row')?.dataset?.torneoId??null;

function style(){if($('admin-v6-style'))return;const s=document.createElement('style');s.id='admin-v6-style';s.textContent=`
#areaAdmin .content{position:relative}
#areaAdmin .admin-page-shell{display:none!important;min-height:calc(100vh - 128px)}
#areaAdmin .admin-page-shell.active{display:block!important}
#areaAdmin .admin-page-shell>.page-inner{width:100%}
#areaAdmin .admin-page-shell .admin-view-title{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;padding:18px 20px;background:#12161b;border:1px solid #2a3139;border-radius:14px}
#areaAdmin .admin-view-shell-title{margin:0;font-size:22px}
#areaAdmin .admin-view-shell-sub{margin:5px 0 0;color:#8f9aa6;font-size:12px}
#areaAdmin .page-tools{display:flex;gap:8px;flex-wrap:wrap}
#areaAdmin .admin-page-shell .page-inner>.panel{margin-top:0}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace,
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace{display:block!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="coppie"],
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="iscritti"]{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .workspace-clean-section[data-section="iscritti"],
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .workspace-clean-section[data-section="coppie"]{display:block!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace .admin-section-actions{display:flex!important}
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace .admin-section-actions{display:none!important}
#areaAdmin .admin-page-shell[data-page="iscritti"] #workspace> .panel-content,
#areaAdmin .admin-page-shell[data-page="coppie"] #workspace> .panel-content{padding-top:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel{display:block!important}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel{border:0;background:transparent;margin:0}
#areaAdmin .admin-page-shell[data-page="config"] #configPanel .panel-content{border-top:0;padding:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel{display:block!important;margin:0}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel>summary,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel>summary{display:none}
#areaAdmin .admin-page-shell[data-page="news"] #newsPanel .panel-content,
#areaAdmin .admin-page-shell[data-page="sponsor"] #sponsorPanel .panel-content{border-top:0}
#areaAdmin .admin-page-shell[data-page="dashboard"] .page-title{display:flex}
#areaAdmin .admin-page-shell[data-page="dashboard"] .stats{display:grid}
#areaAdmin .admin-page-shell[data-page="dashboard"] .grid{display:grid}
#areaAdmin .admin-page-shell[data-page="dashboard"] .dashboard-extra{display:block}
#areaAdmin .month-group{border:1px solid #2a3139;border-radius:12px;margin-bottom:12px;overflow:hidden;background:#101419}
#areaAdmin .month-group>summary{cursor:pointer;list-style:none;padding:12px 14px;font-size:12px;font-weight:800;display:flex;justify-content:space-between}
#areaAdmin .month-group>summary::-webkit-details-marker{display:none}
#areaAdmin .month-group>summary:after{content:'＋';color:#8f9aa6}
#areaAdmin .month-group[open]>summary:after{content:'−'}
#areaAdmin .month-body{padding:0 14px 8px}
#areaAdmin .admin-page-shell[data-page="tabellone"] .tabellone-card{display:block}
`;
document.head.appendChild(s)}

function shell(page,title,sub){let c=$('admin-page-'+page);if(c)return c;c=document.createElement('div');c.id='admin-page-'+page;c.className='admin-page-shell';c.dataset.page=page;c.innerHTML='<div class="page-inner"><div class="admin-view-title"><div><h1 class="admin-view-shell-title"></h1><p class="admin-view-shell-sub"></p></div><div class="page-tools"></div></div></div>';c.querySelector('h1').textContent=title;c.querySelector('p').textContent=sub;document.querySelector('#areaAdmin .content')?.appendChild(c);return c}
function backButton(shellEl){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='← Tornei';b.onclick=()=>navigate('dashboard');shellEl.querySelector('.page-tools')?.appendChild(b)}

function moveExisting(){const content=document.querySelector('#areaAdmin .content');if(!content)return;
 const dash=shell('dashboard','Tornei','Panoramica dei tornei');
 const cfg=shell('config','Configurazione','Crea e configura il torneo');
 const isc=shell('iscritti','Iscritti','Richieste e partecipanti del torneo selezionato');
 const cop=shell('coppie','Accoppiamenti','Gestione delle coppie e delle sfide');
 const tab=shell('tabellone','Tabellone','Visualizzazione del torneo selezionato');
 const news=shell('news','News','Pubblica e gestisci le comunicazioni');
 const sp=shell('sponsor','Sponsor','Gestisci sponsor e materiali');
 [isc,cop,tab].forEach(x=>{if(!x.querySelector('.page-tools button'))backButton(x)});
 const direct=[...content.children].filter(e=>e.classList.contains('page-title')||e.classList.contains('stats')||e.classList.contains('grid'));
 direct.forEach(e=>dash.querySelector('.page-inner').appendChild(e));
 const cp=$('configPanel');if(cp&&!cp.parentElement.isSameNode(cfg.querySelector('.page-inner')))cfg.querySelector('.page-inner').appendChild(cp);
 const ws=$('workspace');if(ws&&!ws.parentElement.isSameNode(isc.querySelector('.page-inner'))){isc.querySelector('.page-inner').appendChild(ws);}
 const np=$('newsPanel');if(np&&!np.parentElement.isSameNode(news.querySelector('.page-inner')))news.querySelector('.page-inner').appendChild(np);
 const spn=$('sponsorPanel');if(spn&&!spn.parentElement.isSameNode(sp.querySelector('.page-inner')))sp.querySelector('.page-inner').appendChild(spn);
 prepareWorkspace();
}
function prepareWorkspace(){const g=$('gestioneTorneoAdmin');if(!g)return;g.querySelectorAll('#dettaglioTorneoAdmin,#richiesteIscrizione,#partecipantiAdmin,#schedaGiocatoreAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='iscritti'});g.querySelectorAll('#creaCoppieBox,#listaCoppieAdmin').forEach(e=>{e.classList.add('workspace-clean-section');e.dataset.section='coppie'});const a=[...g.children].find(e=>e.matches('div[style]'));if(a)a.classList.add('admin-section-actions');}

function nav(){document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{if(b.dataset.v6hook)return;b.dataset.v6hook='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const raw=b.dataset.nav||b.dataset.page;const map={dashboard:'dashboard',richiesteIscrizione:'iscritti',creaCoppieBox:'coppie',linkBoveGenerato:'tabellone',configPanel:'config'};navigate(map[raw]||raw)})});
 $('quickApprova')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('iscritti')});
 $('quickCoppie')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('coppie')});
 $('quickTabellone')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const id=selectedId()||firstId();const f=fn('apriBoveConTorneo')||fn('apriTabellone');if(f)f(id);else navigate('tabellone')});
 $('quickLink')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();call(['generaLinkBove','generaLinkPerId'],selectedId()||firstId())});
 document.querySelectorAll('#areaAdmin [data-action="create"]').forEach(b=>{if(b.dataset.v6create)return;b.dataset.v6create='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate('config')})});
}
function navigate(page){if(!page)return;moveExisting();const pages=['dashboard','iscritti','coppie','tabellone','config','news','sponsor'];pages.forEach(p=>$('admin-page-'+p)?.classList.toggle('active',p===page));const area=$('areaAdmin');area.className=area.className.replace(/\badmin-page-\S+/g,'');area.classList.add('admin-page-'+page);const labels={dashboard:'Tornei',iscritti:'Iscritti',coppie:'Accoppiamenti',tabellone:'Tabellone',config:'Configurazione',news:'News',sponsor:'Sponsor'};const top=area.querySelector('.topbar .breadcrumb b');if(top)top.textContent=labels[page];document.querySelectorAll('#areaAdmin .nav button').forEach(b=>{const raw=b.dataset.nav||b.dataset.page;const map={dashboard:'dashboard',richiesteIscrizione:'iscritti',creaCoppieBox:'coppie',linkBoveGenerato:'tabellone',configPanel:'config'};b.classList.toggle('active',(map[raw]||raw)===page)});if(page==='iscritti')call(['caricaRichiesteIscrizione']);if(page==='config'){$('configPanel')?.setAttribute('open','')}else{$('configPanel')?.removeAttribute('open')}}
function groupTournaments(){const box=$('listaTorneiAdmin');if(!box)return;const rows=[...box.querySelectorAll(':scope > .tournament-row')];if(!rows.length)return;const groups=new Map();rows.forEach(r=>{const txt=r.querySelector('.t-info small')?.textContent||'';const m=txt.match(/(\d{4})[-\/.](\d{1,2})/);const key=m?m[1]+'-'+String(m[2]).padStart(2,'0'):'Senza data';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)});box.innerHTML='';[...groups.entries()].sort((a,b)=>b[0].localeCompare(a[0])).forEach(([key,list],i)=>{const d=document.createElement('details');d.className='month-group';d.open=i===0;const s=document.createElement('summary');s.textContent=monthLabel(key);const body=document.createElement('div');body.className='month-body';list.forEach(r=>body.appendChild(r));d.append(s,body);box.appendChild(d)})}
function monthLabel(k){if(k==='Senza data')return k;const [y,m]=k.split('-');return ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'][+m]+' '+y}
function boot(){style();moveExisting();nav();groupTournaments();navigate('dashboard');new MutationObserver(()=>{moveExisting();nav();groupTournaments()}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();