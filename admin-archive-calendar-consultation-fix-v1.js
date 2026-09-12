(()=>{'use strict';
const state=()=>window.adminState||{};
const selected=()=>{const s=state();return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato)&&!t.__archiveCalendarMirror)||null};
function ensureArchiveCalendarMirror(){const s=state();if(!Array.isArray(s.tornei))return;const t=selected();if(!t||String(t.stato||'').toLowerCase()!=='archiviato')return;if(s.tornei.some(x=>x.__archiveCalendarMirror&&String(x.id)===String(t.id)))return;const mirror=JSON.parse(JSON.stringify(t));mirror.stato='chiuso';mirror.__archiveCalendarMirror=true;s.tornei.push(mirror)}
function boot(){ensureArchiveCalendarMirror();const root=document.getElementById('appContent');if(root&&!window.__ARCHIVE_CALENDAR_MIRROR_OBSERVER__){window.__ARCHIVE_CALENDAR_MIRROR_OBSERVER__=true;new MutationObserver(()=>requestAnimationFrame(ensureArchiveCalendarMirror)).observe(root,{childList:true,subtree:true})}document.addEventListener('click',e=>{const b=e.target.closest('#calendar');if(b)ensureArchiveCalendarMirror()},true);window.addEventListener('admin:rendered',ensureArchiveCalendarMirror);window.addEventListener('admin:render',ensureArchiveCalendarMirror);setInterval(ensureArchiveCalendarMirror,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
