(()=>{'use strict';
function install(){
  const fn=window.refreshCleanAdmin;
  if(typeof fn!=='function'||fn.__refreshFeedback)return false;
  const wrapped=async function(){
    const buttons=[document.getElementById('topRefresh'),document.getElementById('sideRefresh')].filter(Boolean);
    buttons.forEach(b=>{b.disabled=true;b.textContent='↻ Aggiornamento…';b.setAttribute('aria-busy','true')});
    try{
      if(window.__ARCHIVE_CONSULTATION__){
        const s=window.adminState||{};
        s.torneoSelezionato=null;
        window.adminState=s;
        window.__ARCHIVE_CONSULTATION__=false;
        window.__ARCHIVE_CONSULTATION_ID__=null;
        window.iscrizioniTorneo=[];
        if(typeof window.salvaAdminState==='function')window.salvaAdminState();
      }
      return await fn.apply(this,arguments)
    }finally{
      requestAnimationFrame(()=>buttons.forEach(b=>{b.disabled=false;b.textContent='↻ Aggiorna';b.removeAttribute('aria-busy')}));
    }
  };
  wrapped.__refreshFeedback=true;
  window.refreshCleanAdmin=wrapped;
  return true;
}
function boot(){install();setTimeout(install,100);setTimeout(install,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
