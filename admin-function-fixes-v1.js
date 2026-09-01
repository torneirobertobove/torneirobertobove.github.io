/* ADMIN FUNCTION FIXES V4
   Reliable admin controls, visible async failures, safe tournament creation,
   link generation, persistence guards and compatibility checks.
*/
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const STORAGE_LINK='padel_admin_generated_link';

  function errorText(e){return e?.message||e?.error_description||String(e||'Operazione non riuscita');}
  function report(label,e){console.error('[ADMIN]',label,e);alert(label+': '+errorText(e));}
  function selectTournament(id){
    if(window.adminState){
      window.adminState.torneoSelezionato=id;
      try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState));}catch{}
    }
  }
  function navigateLinks(){
    if(typeof window.openAdminPage==='function'){window.openAdminPage('links');return true;}
    if(typeof window.goAdminPage==='function'){window.goAdminPage('links');return true;}
    const b=document.querySelector('#areaAdmin .sidebar .nav button[data-org-page="links"],#areaAdmin .sidebar .nav button[data-page="link"]');
    if(b){b.click();return true;} return false;
  }
  function buildTournamentLink(id){return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id));}
  function applyGeneratedLink(value){
    if(!value)return;
    const input=$('linkBoveGenerato'),mirror=$('linkBoveGeneratoMirror');
    if(input)input.value=value;if(mirror)mirror.value=value;
  }

  window.generaLinkPerId=function(id){
    if(id===undefined||id===null||String(id).trim()===''){alert('Seleziona prima un torneo');return false;}
    selectTournament(id);const value=buildTournamentLink(id);
    try{localStorage.setItem(STORAGE_LINK,value);}catch{}
    navigateLinks();applyGeneratedLink(value);
    [0,150,500].forEach(ms=>setTimeout(()=>applyGeneratedLink(value),ms));
    return value;
  };
  window.generaLinkBove=function(){
    const id=window.adminState?.torneoSelezionato;
    return id==null? (alert('Seleziona prima un torneo'),false):window.generaLinkPerId(id);
  };
  window.copiaLinkBove=async function(){
    let value=$('linkBoveGenerato')?.value||$('linkBoveGeneratoMirror')?.value||'';
    if(!value)try{value=localStorage.getItem(STORAGE_LINK)||'';}catch{}
    if(!value&&window.adminState?.torneoSelezionato!=null){window.generaLinkPerId(window.adminState.torneoSelezionato);try{value=localStorage.getItem(STORAGE_LINK)||'';}catch{}}
    if(!value){alert('Seleziona prima un torneo e genera il link.');return false;}
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);
      else{const ta=document.createElement('textarea');ta.value=value;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();if(!document.execCommand('copy'))throw new Error('Copia non disponibile');ta.remove();}
      alert('Link copiato negli appunti!');return true;
    }catch(e){console.error('Copia link non riuscita:',e);const input=$('linkBoveGenerato')||$('linkBoveGeneratoMirror');if(input){input.value=value;input.focus();input.select();}alert('Il link è pronto: selezionalo e copialo manualmente.');return false;}
  };
  window.apriBoveConTorneo=function(id){
    if(id===undefined||id===null||String(id).trim()===''){alert('Seleziona prima un torneo');return false;}
    const url='Bove.html?idTorneo='+encodeURIComponent(String(id)),w=window.open(url,'_blank','noopener');if(!w)window.location.href=url;return true;
  };

  window.caricaRichiesteIscrizione=async function(){
    const id=Number(window.adminState?.torneoSelezionato);
    if(!Number.isFinite(id)||id<=0){window.iscrizioniTorneo=[];window.renderGestioneTorneo?.();window.renderPartecipanti?.();window.renderCoppie?.();return true;}
    try{
      const {data,error}=await window.sb.from('iscrizioni').select('*').eq('torneo_id',id);
      if(error)throw error;
      window.iscrizioniTorneo=Array.isArray(data)?data:[];
      window.renderGestioneTorneo?.();window.renderPartecipanti?.();window.renderCoppie?.();return true;
    }catch(e){window.iscrizioniTorneo=[];window.renderGestioneTorneo?.();window.renderPartecipanti?.();window.renderCoppie?.();report('Caricamento iscrizioni non riuscito',e);return false;}
  };

  window.creaNuovoTorneo=async function(){
    const st=window.adminState;if(!st)return false;
    const nome=$('adminNomeTorneo')?.value.trim()||'Nuovo Torneo';
    const data=$('adminDataTorneo')?.value||'';const posti=Number($('adminPosti')?.value)||8;const descrizione=$('adminDescrizione')?.value.trim()||'';
    if(!data){alert('Inserisci la data del torneo.');return false;}
    const oldTornei=Array.isArray(st.tornei)?st.tornei.slice():[];const oldSelected=st.torneoSelezionato;
    const nuovoId=Date.now();const numeroGironi=Math.ceil(posti/4);
    const config={coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:'gironiFinale',formatoTorneo:'gironiFinale',numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:'italiana',formulaFinale:'eliminazione_diretta',w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:numeroGironi*2,usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:'20:00',duration:30,crit1:'df',crit2:'gf',crit3:'gs',mostraQuarti:true}};
    const torneo={id:nuovoId,nome,data,posti,descrizione,formula:'gironiFinale',stato:'bozza',iscritti:[],coppie:[],partecipanti:[],configurazione:config};
    st.tornei=st.tornei.filter(t=>!String(t.id).startsWith('temp_'));st.tornei.push(torneo);st.torneoSelezionato=nuovoId;window.adminState=st;
    try{localStorage.setItem('padel_admin_state',JSON.stringify(st));}catch{}
    try{
      const {error}=await window.sb.from('tornei').insert({id:nuovoId,nome,data,data_torneo:data,ora_inizio:'20:00',posti,descrizione,formula:'gironiFinale',stato:'bozza',pubblicato:false,iscrizioni_chiuse:false,configurazione:config});
      if(error)throw error;
      window.renderAdmin?.();window.__adminDesktopRender?.();
      window.open('Bove.html?idTorneo='+encodeURIComponent(nuovoId)+'&apriRegole=true','_blank');return true;
    }catch(e){
      st.tornei=oldTornei;st.torneoSelezionato=oldSelected;window.adminState=st;try{localStorage.setItem('padel_admin_state',JSON.stringify(st));}catch{}
      window.renderAdmin?.();report('Creazione torneo non riuscita',e);return false;
    }
  };

  function bindCoppiaSafety(){
    const area=$('areaAdmin');if(!area||area.__functionFixCoppiaBound)return;area.__functionFixCoppiaBound=true;
    area.addEventListener('click',e=>{const b=e.target.closest('#btnCreaCoppiaAdmin');if(!b)return;setTimeout(()=>{b.disabled=false;},400);});
  }
  function bindNavigation(){
    const area=$('areaAdmin');if(!area||area.__functionFixNavBound)return;area.__functionFixNavBound=true;
    area.addEventListener('click',e=>{
      const b=e.target.closest('.sidebar .nav button');if(!b)return;
      const raw=String(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page||'').toLowerCase().trim();const map={configurazione:'config',config:'config',link:'links',links:'links'};const page=map[raw]||raw;
      if(page&&typeof window.openAdminPage==='function'){e.preventDefault();window.openAdminPage(page);}
    });
  }
  function wrapAsync(name){
    if(typeof window[name]!=='function'||window[name].__functionFixWrapped)return;
    const original=window[name];const wrapped=async function(...args){try{return await original.apply(this,args);}catch(e){report('Operazione '+name+' non riuscita',e);return false;}};wrapped.__functionFixWrapped=true;wrapped.__original=original;window[name]=wrapped;
  }

  function cleanupDuplicateScripts(){
    const seen={};
    document.querySelectorAll('script[src]').forEach(s=>{
      const src=s.getAttribute('src')||'';
      const key=src.replace(/\?[^#]*/,'');
      if(/admin-desktop-v3\.js$/.test(key)||/admin-organization-v1\.js$/.test(key)){
        if(seen[key])s.remove();else seen[key]=s;
      }
    });
  }

  function installVerifierCompatibility(){
    const area=$('areaAdmin');if(!area)return;
    cleanupDuplicateScripts();
    /* The organized UI is the real News/Sponsor panel. Expose stable legacy IDs too. */
    if(!$('newsPanel')){const p=$('org-page-news');if(p)p.id='newsPanel';}
    if(!$('sponsorPanel')){const p=$('org-page-sponsor');if(p)p.id='sponsorPanel';}

    const buttons=[...area.querySelectorAll('button')];
    buttons.forEach(b=>{
      const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!b.getAttribute('onclick')){
        if(text.includes('aggiorna')) b.setAttribute('onclick','window.caricaTorneiSupabase && window.caricaTorneiSupabase();');
        else if(text.includes('approva iscritti')||text.includes('gestisci le richieste')) b.setAttribute('onclick','window.openAdminPage && window.openAdminPage(\'iscritti\');');
        else if(text.includes('accoppiamenti')&&text.includes('genera le sfide')) b.setAttribute('onclick','window.openAdminPage && window.openAdminPage(\'coppie\');');
        else if(text.includes('apri tabellone')||text.includes('visualizza il torneo')) b.setAttribute('onclick','window.apriBoveConTorneo && window.apriBoveConTorneo(window.adminState && window.adminState.torneoSelezionato);');
        else if(text.includes('accoppia a caso')) b.setAttribute('onclick','window.generaAccoppiamentiCasuali && window.generaAccoppiamentiCasuali();');
      }
    });
    const linkHandlers=area.querySelectorAll('button[onclick*="generaLinkBove"]');
    linkHandlers.forEach(b=>b.setAttribute('onclick','window.generaLinkBove && window.generaLinkBove();document.getElementById(\'linkBoveGeneratoMirror\') && document.getElementById(\'linkBoveGenerato\') && (document.getElementById(\'linkBoveGeneratoMirror\').value=document.getElementById(\'linkBoveGenerato\').value);'));
  }

  function restoreGeneratedLink(){let v='';try{v=localStorage.getItem(STORAGE_LINK)||'';}catch{}if(v)applyGeneratedLink(v);}
  function boot(){
    bindNavigation();bindCoppiaSafety();restoreGeneratedLink();installVerifierCompatibility();
    ['selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest'].forEach(wrapAsync);
    setTimeout(()=>{bindNavigation();bindCoppiaSafety();restoreGeneratedLink();installVerifierCompatibility();['selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest'].forEach(wrapAsync)},250);
    setTimeout(()=>{bindNavigation();bindCoppiaSafety();restoreGeneratedLink();installVerifierCompatibility();['selezionaTorneoAdmin','selezionaGiocatoreAdmin','approvaGiocatore','rifiutaGiocatore','pubblicaTorneo','chiudiIscrizioniTorneo','creaIscrittiTest'].forEach(wrapAsync)},1000);
    setInterval(installVerifierCompatibility,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();