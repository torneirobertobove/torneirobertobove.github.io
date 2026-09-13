(()=>{
'use strict';

/*
 * FIX RADICALE:
 * adminState.tornei deve CONTENERE anche gli archiviati, perché l'Archivio
 * li usa. Il normale Gestione torneo invece deve ricevere al renderer solo
 * i tornei non archiviati.
 *
 * Non tocchiamo Supabase, non cancelliamo dati e non manipoliamo il DOM dopo
 * il render: filtriamo la sorgente esattamente durante renderCleanAdmin().
 */
const archived=t=>String(t?.stato||'').toLowerCase()==='archiviato';

function patchRender(){
  if(typeof window.renderCleanAdmin!=='function')return;
  if(window.__ARCHIVE_SELECTOR_SOURCE_PATCH__)return;

  const original=window.renderCleanAdmin;
  window.__ARCHIVE_SELECTOR_SOURCE_PATCH__=true;

  window.renderCleanAdmin=function(){
    const s=window.adminState||{};
    const consultation=!!window.__ARCHIVE_CONSULTATION__;

    /* In consultazione l'archiviato deve restare visibile. */
    if(consultation)return original.apply(this,arguments);

    const originalList=Array.isArray(s.tornei)?s.tornei:null;

    try{
      /* Il renderer admin-layout-v2.js costruisce la tendina direttamente da
         state().tornei: qui gli passiamo quindi la proiezione corretta. */
      if(originalList){
        s.tornei=originalList.filter(t=>!archived(t));
      }
      return original.apply(this,arguments);
    }finally{
      /* L'archivio continua ad avere tutti i tornei in memoria. */
      if(originalList)s.tornei=originalList;
      window.adminState=s;
    }
  };
}

function boot(){
  patchRender();
  setTimeout(patchRender,100);
  setTimeout(patchRender,500);
  setTimeout(patchRender,1200);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

window.addEventListener('admin:rendered',patchRender);
window.addEventListener('admin:render',patchRender);
})();
