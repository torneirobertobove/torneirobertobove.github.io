/* ADMIN FUNCTION FIXES V2
   Concrete repairs for admin controls: reliable navigation/link generation,
   clipboard fallback, and visible handling of rejected async actions.
*/
(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  const STORAGE_LINK='padel_admin_generated_link';

  function selectTournament(id){
    if(window.adminState){
      window.adminState.torneoSelezionato=id;
      try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState));}catch{}
    }
  }

  function navigateLinks(){
    if(typeof window.openAdminPage==='function'){
      window.openAdminPage('links');
      return true;
    }
    if(typeof window.goAdminPage==='function'){
      window.goAdminPage('links');
      return true;
    }
    const button=document.querySelector('#areaAdmin .sidebar .nav button[data-org-page="links"],#areaAdmin .sidebar .nav button[data-page="link"]');
    if(button){button.click();return true;}
    return false;
  }

  function buildTournamentLink(id){
    return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id));
  }

  function applyGeneratedLink(value){
    const input=$('linkBoveGenerato');
    const mirror=$('linkBoveGeneratoMirror');
    if(input) input.value=value;
    if(mirror) mirror.value=value;
    const target=input||mirror;
    if(target) target.scrollIntoView({behavior:'smooth',block:'center'});
  }

  // Generate the link first in state, then navigate. The target input can be
  // rendered only after navigation, so the value is applied again afterwards.
  window.generaLinkPerId=function(id){
    if(id===undefined||id===null||String(id).trim()===''){
      alert('Seleziona prima un torneo');
      return false;
    }
    selectTournament(id);
    const value=buildTournamentLink(id);
    try{localStorage.setItem(STORAGE_LINK,value);}catch{}
    navigateLinks();
    applyGeneratedLink(value);
    setTimeout(()=>applyGeneratedLink(value),0);
    setTimeout(()=>applyGeneratedLink(value),150);
    setTimeout(()=>applyGeneratedLink(value),500);
    return value;
  };

  window.generaLinkBove=function(){
    const id=window.adminState?.torneoSelezionato;
    if(id===undefined||id===null||String(id).trim()===''){
      alert('Seleziona prima un torneo');
      return false;
    }
    return window.generaLinkPerId(id);
  };

  window.copiaLinkBove=async function(){
    let value=$('linkBoveGenerato')?.value||$('linkBoveGeneratoMirror')?.value||'';
    if(!value){
      try{value=localStorage.getItem(STORAGE_LINK)||'';}catch{}
    }
    if(!value){
      const id=window.adminState?.torneoSelezionato;
      if(id!=null){window.generaLinkPerId(id);try{value=localStorage.getItem(STORAGE_LINK)||'';}catch{}}
    }
    if(!value){alert('Seleziona prima un torneo e genera il link.');return false;}

    try{
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(value);
      }else{
        const ta=document.createElement('textarea');
        ta.value=value;ta.setAttribute('readonly','');
        ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();
        const ok=document.execCommand('copy');
        ta.remove();
        if(!ok) throw new Error('Copia non disponibile');
      }
      alert('Link copiato negli appunti!');
      return true;
    }catch(e){
      console.error('Copia link non riuscita:',e);
      const input=$('linkBoveGenerato')||$('linkBoveGeneratoMirror');
      if(input){input.value=value;input.focus();input.select();}
      alert('Il link è pronto: selezionalo e copialo manualmente.');
      return false;
    }
  };

  window.apriBoveConTorneo=function(id){
    if(id===undefined||id===null||String(id).trim()===''){
      alert('Seleziona prima un torneo');
      return false;
    }
    const url='Bove.html?idTorneo='+encodeURIComponent(String(id));
    const w=window.open(url,'_blank','noopener');
    if(!w) window.location.href=url;
    return true;
  };

  function bindNavigation(){
    const area=$('areaAdmin');
    if(!area||area.__functionFixNavBound)return;
    area.__functionFixNavBound=true;
    area.addEventListener('click',e=>{
      const button=e.target.closest('.sidebar .nav button');
      if(!button)return;
      const raw=String(button.dataset.orgPage||button.dataset.internalPage||button.dataset.page||'').toLowerCase().trim();
      const map={configurazione:'config',config:'config',link:'links',links:'links'};
      const page=map[raw]||raw;
      if(!page)return;
      if(typeof window.openAdminPage==='function'){
        e.preventDefault();
        window.openAdminPage(page);
      }
    });
  }

  function bindCoppiaSafety(){
    const area=$('areaAdmin');
    if(!area||area.__functionFixCoppiaBound)return;
    area.__functionFixCoppiaBound=true;
    area.addEventListener('click',e=>{
      const b=e.target.closest('#btnCreaCoppiaAdmin');
      if(!b)return;
      setTimeout(()=>{
        b.disabled=false;
      },400);
    });
  }

  function wrapAsync(name){
    if(typeof window[name]!=='function'||window[name].__functionFixWrapped)return;
    const original=window[name];
    const wrapped=async function(...args){
      try{return await original.apply(this,args);}
      catch(e){
        console.error('Errore funzione admin '+name+':',e);
        alert((e&&e.message)?('Operazione non riuscita: '+e.message):'Operazione non riuscita. Controlla i dati e riprova.');
        return false;
      }
    };
    wrapped.__functionFixWrapped=true;
    wrapped.__original=original;
    window[name]=wrapped;
  }

  function restoreGeneratedLink(){
    let value='';
    try{value=localStorage.getItem(STORAGE_LINK)||'';}catch{}
    if(value) applyGeneratedLink(value);
  }

  function boot(){
    bindNavigation();
    bindCoppiaSafety();
    ['creaNuovoTorneo','selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest','creaNews','salvaSponsor'].forEach(wrapAsync);
    restoreGeneratedLink();
    setTimeout(()=>{bindNavigation();bindCoppiaSafety();restoreGeneratedLink();['creaNuovoTorneo','selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest','creaNews','salvaSponsor'].forEach(wrapAsync)},250);
    setTimeout(()=>{bindNavigation();bindCoppiaSafety();restoreGeneratedLink();['creaNuovoTorneo','selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest','creaNews','salvaSponsor'].forEach(wrapAsync)},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
