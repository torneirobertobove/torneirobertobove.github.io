(()=>{'use strict';
const state=()=>window.adminState||{};
const consultation=()=>!!(window.__ARCHIVE_CONSULTATION__||window.__ARCHIVE_CONSULTATION_ID__);
const selected=()=>{const s=state();return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato)&&!t.__archiveCalendarMirror)||null};
function ensureArchiveCalendarMirror(){
  const s=state();
  if(!Array.isArray(s.tornei))return;
  const mirrors=s.tornei.filter(x=>x.__archiveCalendarMirror);
  if(!consultation()){
    if(mirrors.length){s.tornei=s.tornei.filter(x=>!x.__archiveCalendarMirror);window.adminState=s;try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}}
    return;
  }
  const t=selected();
  if(!t||String(t.stato||'').toLowerCase()!=='archiviato')return;
  if(mirrors.some(x=>String(x.id)===String(t.id)))return;
  const mirror=JSON.parse(JSON.stringify(t));
  mirror.stato='chiuso';
  mirror.__archiveCalendarMirror=true;
  s.tornei.push(mirror);
  window.adminState=s;
}
function boot(){ensureArchiveCalendarMirror();const root=document.getElementById('appContent');if(root&&!window.__ARCHIVE_CALENDAR_MIRROR_OBSERVER__){window.__ARCHIVE_CALENDAR_MIRROR_OBSERVER__=true;new MutationObserver(()=>requestAnimationFrame(ensureArchiveCalendarMirror)).observe(root,{childList:true,subtree:true})}document.addEventListener('click',e=>{const b=e.target.closest('#calendar');if(b)ensureArchiveCalendarMirror()},true);window.addEventListener('admin:rendered',ensureArchiveCalendarMirror);window.addEventListener('admin:render',ensureArchiveCalendarMirror);setInterval(ensureArchiveCalendarMirror,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
