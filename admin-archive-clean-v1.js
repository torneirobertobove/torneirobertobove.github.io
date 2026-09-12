(()=>{
'use strict';

const state=()=>window.adminState||{};
const archived=()=> (state().tornei||[]).filter(t=>String(t.stato||'').toLowerCase()==='archiviato');
const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

function monthName(m){return ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'][m]||''}
function dateOf(t){const d=new Date(t.data_torneo||t.data||t.created_at||Date.now());return Number.isNaN(d.getTime())?new Date(0):d}

function removeDuplicateArchiveButtons(){
  document.querySelectorAll('#adminArchiveOpen,[data-admin-archive],button').forEach(el=>{
    if(el.id==='archiveCleanButton')return;
    const txt=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(txt==='archivio tornei'||txt==='📦 archivio tornei'||txt.includes('archivio tornei'))el.remove();
  });
}

function renderArchivePanel(){
  let panel=document.getElementById('archiveCleanPanel');
  if(!panel){
    panel=document.createElement('div');
    panel.id='archiveCleanPanel';
    panel.style.cssText='position:fixed;top:72px;right:18px;z-index:10000;width:min(440px,calc(100vw - 36px));max-height:76vh;overflow:auto;display:none;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px;color:#fff;box-shadow:0 22px 60px rgba(0,0,0,.4);backdrop-filter:blur(16px)';
    document.body.appendChild(panel);
  }
  const groups={};
  archived().sort((a,b)=>dateOf(b)-dateOf(a)).forEach(t=>{
    const d=dateOf(t),y=d.getFullYear(),m=d.getMonth();
    (groups[y]??={})[m]??=[];
    groups[y][m].push(t);
  });
  let html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:16px;font-weight:800">📦 Archivio Tornei</div><button id="archiveCleanClose" type="button" style="border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer">×</button></div>';
  const years=Object.keys(groups).sort((a,b)=>Number(b)-Number(a));
  if(!years.length){html+='<div style="opacity:.7;padding:14px 4px">Nessun torneo archiviato.</div>'}
  years.forEach(y=>{
    html+='<div style="margin-top:12px;font-size:14px;font-weight:800;opacity:.9">'+y+'</div>';
    Object.keys(groups[y]).sort((a,b)=>Number(b)-Number(a)).forEach(m=>{
      html+='<div style="margin-top:7px;margin-bottom:5px;font-size:12px;font-weight:700;opacity:.65">'+monthName(Number(m))+'</div>';
      groups[y][m].forEach(t=>{
        const d=dateOf(t);
        html+='<button type="button" class="archiveCleanItem" data-id="'+esc(t.id)+'" style="display:block;width:100%;text-align:left;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:10px 12px;margin:5px 0;cursor:pointer"><strong>'+esc(t.nome||'Torneo')+'</strong><span style="display:block;font-size:11px;opacity:.65;margin-top:3px">'+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+'</span></button>';
      });
    });
  });
  panel.innerHTML=html;
  panel.querySelector('#archiveCleanClose')?.addEventListener('click',()=>panel.style.display='none');
  panel.querySelectorAll('.archiveCleanItem').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.id;
    if(typeof window.selezionaTorneoAdmin==='function')window.selezionaTorneoAdmin(id);
    panel.style.display='none';
  }));
  return panel;
}

function ensureButton(){
  removeDuplicateArchiveButtons();
  const actions=document.querySelector('.topbar-actions');
  if(!actions)return;
  let b=document.getElementById('archiveCleanButton');
  if(!b){
    b=document.createElement('button');
    b.type='button';
    b.id='archiveCleanButton';
    b.className='btn';
    b.textContent='📦 Archivio Tornei';
    b.style.cssText='white-space:nowrap';
    actions.insertBefore(b,actions.firstChild||null);
    b.addEventListener('click',()=>{
      const p=renderArchivePanel();
      p.style.display=p.style.display==='none'||!p.style.display?'block':'none';
    });
  }
}

function hideArchivedFromSelectors(){
  const list=archived().map(t=>String(t.id));
  document.querySelectorAll('select').forEach(sel=>{
    [...sel.options].forEach(opt=>{
      if(list.includes(String(opt.value)))opt.remove();
    });
  });
}

function refresh(){
  ensureButton();
  hideArchivedFromSelectors();
  if(document.getElementById('archiveCleanPanel')?.style.display==='block')renderArchivePanel();
}

function boot(){
  refresh();
  setTimeout(refresh,100);
  setTimeout(refresh,500);
  setTimeout(refresh,1200);
  const root=document.getElementById('appContent');
  if(root&&!window.__ARCHIVE_CLEAN_OBSERVER__){
    window.__ARCHIVE_CLEAN_OBSERVER__=true;
    new MutationObserver(()=>requestAnimationFrame(refresh)).observe(root,{childList:true,subtree:true});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('admin:rendered',refresh);
window.addEventListener('admin:render',refresh);
})();
