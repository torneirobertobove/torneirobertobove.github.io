(()=>{
'use strict';
const client=()=>window.supabaseClient||window.sb;
const deep=v=>{try{return JSON.parse(JSON.stringify(v??{}))}catch(e){return {}}};
const idFromUrl=()=>new URLSearchParams(location.search).get('idTorneo')||new URLSearchParams(location.search).get('torneo');
async function saveBove(){
 const c=client(),s=window.state,id=s?.idTorneo||idFromUrl();
 if(!c||!id){alert('Torneo non disponibile.');return false}
 const cfg=deep(s); const r=s?.rules||{};
 const payload={configurazione:cfg,nome:s?.nomeTorneo||undefined,data_torneo:s?.dataTorneo||undefined,posti:Number(r.numeroSquadre)||undefined,formula:r.formulaScelta||s?.formula||undefined};
 Object.keys(payload).forEach(k=>payload[k]===undefined&&delete payload[k]);
 const {data,error}=await c.from('tornei').update(payload).eq('id',id).select('*').single();
 if(error){console.error(error);alert('Salvataggio torneo non riuscito: '+error.message);return false}
 try{localStorage.setItem('torneoState',JSON.stringify(s))}catch(e){}
 alert('Torneo salvato su Supabase.'); return !!data;
}
async function archiveBove(){
 const c=client(),s=window.state,id=s?.idTorneo||idFromUrl(); if(!c||!id){alert('Torneo non disponibile.');return false}
 if(!confirm('Confermi la chiusura definitiva e l\'archiviazione del torneo?'))return false;
 if(!(await saveBove()))return false;
 const {error}=await c.from('tornei').update({stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false}).eq('id',id);
 if(error){alert('Archiviazione non riuscita: '+error.message);return false}
 if(s){s.stato='archiviato';s.iscrizioni_chiuse=true}
 alert('Torneo archiviato correttamente.');return true;
}
async function deleteBove(){
 const c=client(),id=window.state?.idTorneo||idFromUrl(); if(!c||!id){alert('Torneo non disponibile.');return false}
 if(!confirm('ATTENZIONE: eliminare definitivamente questo torneo?'))return false;
 const {error}=await c.from('tornei').delete().eq('id',id); if(error){alert('Eliminazione non riuscita: '+error.message);return false}
 try{localStorage.removeItem('torneoState');localStorage.removeItem('savedTeams')}catch(e){}
 location.href='admin.html'; return true;
}
function closeMenu(){const m=document.getElementById('menuComandi');if(m){m.style.display='none';m.classList.remove('open')}else if(typeof window.toggleMenu==='function')window.toggleMenu()}
function injectBove(){
 const m=document.getElementById('menuComandi');if(!m||m.dataset.controlsReady)return false;m.dataset.controlsReady='1';
 const old=[...m.querySelectorAll('button')].find(b=>/salva/i.test(b.textContent||''));
 if(old){old.textContent='💾 Salva Torneo';old.onclick=()=>window.salvaTorneoBove()}
 const add=(id,text,fn)=>{if(document.getElementById(id))return;const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;b.onclick=fn;m.appendChild(b)};
 add('boveCloseTournamentMenu','✖️ Chiudi',closeMenu);add('boveArchiveTournament','📦 Archivia Torneo',()=>window.archiviaTorneoBove());add('boveDeleteTournament','🗑️ Elimina Torneo',()=>window.eliminaTorneoBove());
 return true;
}
function adminState(){return window.adminState||{}}
function selectedAdmin(){const s=adminState();return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null}
async function saveAdmin(){const c=client(),t=selectedAdmin();if(!c||!t){alert('Seleziona prima un torneo.');return false}
 const p={nome:t.nome,data:t.data||null,data_torneo:t.data_torneo||t.data||null,descrizione:t.descrizione||null,posti:t.posti==null?null:Number(t.posti),stato:t.stato||'bozza',pubblicato:t.pubblicato===true,iscrizioni_chiuse:t.iscrizioni_chiuse===true,formula:t.formula||null,configurazione:deep(t.configurazione)};
 const {data,error}=await c.from('tornei').update(p).eq('id',t.id).select('*').single();if(error){alert('Salvataggio torneo non riuscito: '+error.message);return false}
 Object.assign(t,data||{});try{localStorage.setItem('padel_admin_state',JSON.stringify(adminState()))}catch(e){} if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();alert('Torneo salvato su Supabase.');return true}
async function archiveAdmin(){const c=client(),t=selectedAdmin();if(!c||!t){alert('Seleziona prima un torneo.');return false}if(!confirm('Confermi l\'archiviazione del torneo "'+(t.nome||'Torneo')+'"?'))return false;const {data,error}=await c.from('tornei').update({stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false}).eq('id',t.id).select('*').single();if(error){alert('Archiviazione non riuscita: '+error.message);return false}Object.assign(t,data||{});try{localStorage.setItem('padel_admin_state',JSON.stringify(adminState()))}catch(e){}if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();return true}
async function deleteAdmin(){const c=client(),t=selectedAdmin();if(!c||!t){alert('Seleziona prima un torneo.');return false}if(!confirm('ATTENZIONE: eliminare definitivamente il torneo "'+(t.nome||'Torneo')+'"?'))return false;const {error}=await c.from('tornei').delete().eq('id',t.id);if(error){alert('Eliminazione non riuscita: '+error.message);return false}const s=adminState();s.tornei=(s.tornei||[]).filter(x=>String(x.id)!==String(t.id));s.torneoSelezionato='';try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();return true}
function archiveBox(){let box=document.getElementById('archivioTorneiBox');if(box)return box;box=document.createElement('div');box.id='archivioTorneiBox';box.style.cssText='position:fixed;top:76px;right:18px;z-index:9999;display:none;max-width:420px;max-height:70vh;overflow:auto;background:rgba(15,23,42,.97);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35)';document.body.appendChild(box);return box}
function renderArchive(){const s=adminState(),arr=(s.tornei||[]).filter(t=>t.stato==='archiviato');const box=archiveBox();if(!arr.length){box.innerHTML='<b>📦 Archivio Tornei</b><div style="margin-top:10px;opacity:.75">Nessun torneo archiviato.</div>';return}const groups={};arr.forEach(t=>{const d=new Date(t.data_torneo||t.data||t.created_at||Date.now());const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');(groups[y]??=[]).push({t,m,day})});let h='<div style="display:flex;justify-content:space-between;align-items:center"><b>📦 Archivio Tornei</b><button id="chiudiArchivio" style="border:0;background:none;color:#fff;font-size:18px">✕</button></div>';Object.keys(groups).sort((a,b)=>b-a).forEach(y=>{h+=`<div style="margin-top:12px;font-weight:700">${y}</div>`;const ms={};groups[y].forEach(x=>(ms[x.m]??=[]).push(x));Object.keys(ms).sort((a,b)=>b-a).forEach(m=>{h+=`<div style="margin:6px 0 4px;opacity:.8">${m}</div>`;ms[m].sort((a,b)=>b.day-a.day).forEach(x=>{h+=`<button data-open-arch="${String(x.t.id).replace(/"/g,'&quot;')}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06);color:#fff">${x.day}/${m}/${y} — ${String(x.t.nome||'Torneo').replace(/</g,'&lt;')}</button>`})})});box.innerHTML=h;box.querySelector('#chiudiArchivio').onclick=()=>box.style.display='none';box.querySelectorAll('[data-open-arch]').forEach(b=>b.onclick=()=>location.href='Bove.html?idTorneo='+encodeURIComponent(b.dataset.openArch))}
function injectAdmin(){const s=adminState();if(!Array.isArray(s.tornei))return false;const root=document.getElementById('appContent')||document.body;let bar=document.getElementById('tournamentControlsAdmin');if(!bar){bar=document.createElement('div');bar.id='tournamentControlsAdmin';bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:10px 0';root.prepend(bar)}const t=selectedAdmin();bar.innerHTML='';const mk=(id,text,fn)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='btn action-tile';b.textContent=text;b.onclick=fn;bar.appendChild(b)};mk('adminSaveTournament','💾 Salva Torneo',()=>window.salvaTorneoAdmin());mk('adminArchiveTournament','📦 Archivia Torneo',()=>window.archiviaTorneoAdmin());mk('adminDeleteTournament','🗑️ Elimina Torneo',()=>window.eliminaTorneoAdmin());mk('adminArchiveList','📦 Archivi Tornei',()=>{const b=archiveBox();renderArchive();b.style.display=b.style.display==='none'?'block':'none'});if(!t)bar.style.display='none';return true}
window.salvaTorneoBove=saveBove;window.archiviaTorneoBove=archiveBove;window.eliminaTorneoBove=deleteBove;window.salvaTorneoAdmin=saveAdmin;window.archiviaTorneoAdmin=archiveAdmin;window.eliminaTorneoAdmin=deleteAdmin;
function boot(){if(document.getElementById('menuComandi'))injectBove();if(document.getElementById('appContent')){injectAdmin();renderArchive()} }
new MutationObserver(()=>{if(document.getElementById('menuComandi'))injectBove();if(document.getElementById('appContent'))injectAdmin()}).observe(document.documentElement,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();