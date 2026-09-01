/* ADMIN FUNCTION FIXES V1
   Concrete repairs for controls that can appear clickable but fail to produce
   the expected action. Loaded after the admin modules so it can safely wrap
   the public admin API without changing the existing UI structure.
*/
(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  const call=(name,...args)=>typeof window[name]==='function'?window[name](...args):undefined;

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
    return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(id);
  }

  // FIX: the old implementation called openWorkspace("link"), while the
  // organized admin page is keyed as "links". Generate + navigate together.
  window.generaLinkPerId=function(id){
    selectTournament(id);
    const input=$('linkBoveGenerato');
    const mirror=$('linkBoveGeneratoMirror');
    const value=buildTournamentLink(id);
    if(input) input.value=value;
    if(mirror) mirror.value=value;
    navigateLinks();
    setTimeout(()=>{($('linkBoveGenerato')||$('linkBoveGeneratoMirror'))?.scrollIntoView({behavior:'smooth',block:'center'});},80);
  };

  // FIX: clipboard must have a fallback and must never silently fail when
  // navigator.clipboard is unavailable (common on non-secure/local contexts).
  window.copiaLinkBove=async function(){
    const input=$('linkBoveGenerato');
    if(!input?.value){
      const id=window.adminState?.torneoSelezionato;
      if(id!=null) window.generaLinkPerId(id);
    }
    const value=$('linkBoveGenerato')?.value||$('linkBoveGeneratoMirror')?.value||'';
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
      if(input){input.focus();input.select();}
      alert('Il link è pronto: selezionalo e copialo manualmente.');
      return false;
    }
  };

  // FIX: opening Bove must work with numeric ids and string ids alike.
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

  // FIX: guarantee sidebar navigation for every admin page, including the
  // legacy aliases required by older markup.
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

  function boot(){
    bindNavigation();
    setTimeout(bindNavigation,250);
    setTimeout(bindNavigation,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
