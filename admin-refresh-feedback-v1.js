(()=>{'use strict';
function install(){
  const fn=window.refreshCleanAdmin;
  if(typeof fn!=='function'||fn.__refreshFeedback)return false;
  const wrapped=async function(){
    const buttons=[document.getElementById('topRefresh'),document.getElementById('sideRefresh')].filter(Boolean);
    buttons.forEach(b=>{b.disabled=true;b.textContent='↻ Aggiornamento…';b.setAttribute('aria-busy','true')});
    try{
      const s=window.adminState;
      const selected=Array.isArray(s?.tornei)?s.tornei.find(t=>String(t.id)===String(s.torneoSelezionato)&&!t.__archiveCalendarMirror):null;
      if(selected&&String(selected.stato||'').toLowerCase()==='archiviato'){
        s.tornei=s.tornei.filter(t=>!(t.__archiveCalendarMirror&&String(t.id)===String(selected.id)));
        s.torneoSelezionato=null;
        window.adminState=s;
        if(typeof window.salvaAdminState==='function')window.salvaAdminState();
        else localStorage.setItem('padel_admin_state',JSON.stringify(s));
        window.iscrizioniTorneo=[];
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
