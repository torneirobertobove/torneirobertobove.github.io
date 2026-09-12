(()=>{
'use strict';
function archived(t){return String(t?.stato||'').toLowerCase()==='archiviato'}
function consultation(){return !!(window.__ARCHIVE_CONSULTATION__||window.__ARCHIVE_CONSULTATION_ID__)}
function clearArchivedSelection(){
  if(consultation())return false;
  const s=window.adminState||{};
  const id=s.torneoSelezionato;
  if(id==null)return false;
  const t=Array.isArray(s.tornei)?s.tornei.find(x=>String(x.id)===String(id)):null;
  if(!archived(t))return false;
  s.torneoSelezionato=null;
  window.adminState=s;
  window.iscrizioniTorneo=[];
  try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}
  return true
}
function installRenderGuard(){
  const fn=window.renderCleanAdmin;
  if(typeof fn!=='function'||fn.__archiveSelectionGuard)return false;
  const wrapped=function(){
    clearArchivedSelection();
    const out=fn.apply(this,arguments);
    if(typeof window.hideArchivedFromSelectors==='function')window.hideArchivedFromSelectors();
    return out;
  };
  wrapped.__archiveSelectionGuard=true;
  window.renderCleanAdmin=wrapped;
  return true;
}
function installSelectGuard(){
  const fn=window.selezionaTorneoAdmin;
  if(typeof fn!=='function'||fn.__archiveSelectionGuard)return false;
  const wrapped=async function(id){
    if(!consultation()){
      const s=window.adminState||{};
      const t=Array.isArray(s.tornei)?s.tornei.find(x=>String(x.id)===String(id)):null;
      if(archived(t)){
        clearArchivedSelection();
        return false;
      }
    }
    return fn.apply(this,arguments);
  };
  wrapped.__archiveSelectionGuard=true;
  window.selezionaTorneoAdmin=wrapped;
  return true;
}
function boot(){
  installRenderGuard();
  installSelectGuard();
  setTimeout(installRenderGuard,100);
  setTimeout(installSelectGuard,100);
  setTimeout(installRenderGuard,500);
  setTimeout(installSelectGuard,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
