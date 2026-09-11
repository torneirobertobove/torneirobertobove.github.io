(()=>{
'use strict';

function getClient(){return window.supabaseClient||window.sb||null}
function getSelectedTournament(){const s=window.adminState||{};return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null}
function escapeHtml(v){return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}

async function chiudiTorneoStato(){
  const t=getSelectedTournament();
  if(!t){alert('Seleziona prima un torneo.');return false}
  if(String(t.stato||'').toLowerCase()==='concluso'){
    alert('Il torneo è già concluso.');
    return true;
  }
  if(!confirm('Confermi la chiusura del torneo "'+(t.nome||'Torneo')+'"?\n\nLo stato verrà impostato su CONCLUSO e le iscrizioni verranno chiuse.'))return false;
  const client=getClient();
  if(!client){alert('Connessione Supabase non disponibile.');return false}
  try{
    const {data,error}=await client.from('tornei').update({stato:'concluso',iscrizioni_chiuse:true}).eq('id',t.id).select('*').single();
    if(error)throw error;
    if(Array.isArray(window.adminState?.tornei)){
      const i=window.adminState.tornei.findIndex(x=>String(x.id)===String(t.id));
      if(i>=0)window.adminState.tornei[i]=data||{...t,stato:'concluso',iscrizioni_chiuse:true};
    }
    try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
    alert('Torneo chiuso correttamente. Stato: CONCLUSO.');
    if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
    return true;
  }catch(e){
    console.error('Errore chiusura torneo:',e);
    alert('Chiusura torneo non riuscita: '+(e?.message||e));
    return false;
  }
}
window.chiudiTorneoStato=chiudiTorneoStato;

function install(){
  const render=window.renderCleanAdmin;
  if(typeof render!=='function')return false;
  if(render.__closeTournamentWrapped)return true;
  const wrapped=function(){
    const result=render.apply(this,arguments);
    setTimeout(injectButton,0);
    return result;
  };
  wrapped.__closeTournamentWrapped=true;
  window.renderCleanAdmin=wrapped;
  return true;
}

function injectButton(){
  const root=document.getElementById('appContent');
  if(!root)return;
  const operations=[...root.querySelectorAll('.action-grid')].find(x=>x.querySelector('#publish')&&x.querySelector('#closeReg'));
  if(!operations||operations.querySelector('#closeTournament'))return;
  const t=getSelectedTournament();
  if(!t)return;
  const closed=String(t.stato||'').toLowerCase()==='concluso';
  const b=document.createElement('button');
  b.type='button';
  b.className='btn action-tile';
  b.id='closeTournament';
  b.innerHTML=closed?'🏁 <strong>Torneo concluso</strong><span>Stato: concluso</span>':'🏁 <strong>Chiudi torneo</strong><span>Imposta lo stato su concluso</span>';
  if(closed)b.disabled=true;
  else b.addEventListener('click',chiudiTorneoStato);
  operations.appendChild(b);
}

function removeExtraArchiveButton(){
  const button=document.getElementById('adminArchiveOpen');
  if(button)button.remove();
}

function boot(){
  removeExtraArchiveButton();
  if(install())injectButton();
  setTimeout(()=>{removeExtraArchiveButton();install();injectButton()},100);
  setTimeout(()=>{removeExtraArchiveButton();install();injectButton()},500);
  const root=document.getElementById('appContent');
  if(root&&!window.__BOVE_ARCHIVE_BUTTON_FIX__){
    window.__BOVE_ARCHIVE_BUTTON_FIX__=true;
    new MutationObserver(removeExtraArchiveButton).observe(root,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('admin:rendered',()=>{removeExtraArchiveButton();install();injectButton()});
})();
