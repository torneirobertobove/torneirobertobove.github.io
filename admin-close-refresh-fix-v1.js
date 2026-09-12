(()=>{'use strict';
function install(){
  const fn=window.chiudiTorneoStato;
  if(typeof fn!=='function'||fn.__cleanArchiveRefresh)return false;
  const wrapped=async function(){
    const result=await fn.apply(this,arguments);
    if(result===true){
      window.adminState=window.adminState||{};
      window.adminState.torneoSelezionato=null;
      if(Array.isArray(window.iscrizioniTorneo))window.iscrizioniTorneo=[];
      if(Array.isArray(window.partecipantiTorneo))window.partecipantiTorneo=[];
      if(Array.isArray(window.coppieTorneo))window.coppieTorneo=[];
      try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState))}catch(e){}
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
function boot(){if(!install()){setTimeout(install,100);setTimeout(install,500)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();