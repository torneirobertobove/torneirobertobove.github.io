(()=>{'use strict';
function clearArchivedSelection(){
  const s=window.adminState||{};
  const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato));
  if(!t||String(t.stato||'').toLowerCase()!=='archiviato')return false;
  s.torneoSelezionato=null;
  if(Array.isArray(window.iscrizioniTorneo))window.iscrizioniTorneo=[];
  if(Array.isArray(window.partecipantiTorneo))window.partecipantiTorneo=[];
  if(Array.isArray(window.coppieTorneo))window.coppieTorneo=[];
  try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}
  return true;
}
function install(){
  const fn=window.chiudiTorneoStato;
  if(typeof fn!=='function'||fn.__cleanArchiveRefresh)return false;
  const wrapped=async function(){
    const result=await fn.apply(this,arguments);
    if(result===true){
      clearArchivedSelection();
      window.location.reload();
    }
    return result;
  };
  wrapped.__cleanArchiveRefresh=true;
  window.chiudiTorneoStato=wrapped;
  if(!window.__CLEAN_ARCHIVE_REFRESH_CAPTURE__){
    window.__CLEAN_ARCHIVE_REFRESH_CAPTURE__=true;
    document.addEventListener('click',e=>{
      const b=e.target?.closest?.('#closeTournament');
      if(!b)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      window.chiudiTorneoStato();
    },true);
  }
  return true;
}
function installRenderGuard(){
  const render=window.renderCleanAdmin;
  if(typeof render!=='function'||render.__archiveRenderGuard)return false;
  const wrapped=function(){
    clearArchivedSelection();
    return render.apply(this,arguments);
  };
  wrapped.__archiveRenderGuard=true;
  window.renderCleanAdmin=wrapped;
  clearArchivedSelection();
  return true;
}
function boot(){
  install();
  installRenderGuard();
  setTimeout(install,100);
  setTimeout(install,500);
  setTimeout(installRenderGuard,100);
  setTimeout(installRenderGuard,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();