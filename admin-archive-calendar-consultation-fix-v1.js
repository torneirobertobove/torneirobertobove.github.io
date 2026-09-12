(()=>{
'use strict';
/* Archived tournaments are handled directly by admin-calendar-v1.js during
 * explicit archive consultation. No mirror, duplicate object or status
 * mutation is created here.
 *
 * During archive consultation the real tournament board remains available:
 * the tournament is opened read-only in Bove.html, using its existing id.
 */
function archivedConsultation(){
  const s=window.adminState||{};
  const id=window.__ARCHIVE_CONSULTATION_ID__;
  if(!window.__ARCHIVE_CONSULTATION__||id==null)return null;
  const t=(s.tornei||[]).find(x=>String(x.id)===String(id));
  return t&&String(t.stato||'').toLowerCase()==='archiviato'?t:null;
}
function openArchivedBoard(t){
  window.open('Bove.html?idTorneo='+encodeURIComponent(t.id),'_blank','noopener');
}
function enableArchiveBoardActions(){
  const t=archivedConsultation();
  if(!t)return;
  ['bracket','sideTabellone'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.disabled=false;b.removeAttribute('aria-disabled');}
  });
}
function boot(){
  enableArchiveBoardActions();
  document.addEventListener('click',e=>{
    const b=e.target instanceof Element?e.target.closest('#bracket,#sideTabellone'):null;
    const t=archivedConsultation();
    if(!b||!t)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openArchivedBoard(t);
  },true);
  new MutationObserver(enableArchiveBoardActions).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
