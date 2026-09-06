/* ADMIN FLOW FIX - minimal and isolated.
   This file must not intercept navigation or rewrite unrelated buttons.
   It only provides the new-tournament handoff used by the existing Admin UI. */
(()=>{
'use strict';

window.creaNuovoTorneo=async function(){
  const st=window.adminState;
  if(!st){
    console.error('[ADMIN FLOW] adminState non disponibile');
    return false;
  }

  const byId=id=>document.getElementById(id);
  const nome=byId('adminNomeTorneo')?.value.trim()||'Nuovo Torneo';
  const data=byId('adminDataTorneo')?.value||'';
  const posti=Number(byId('adminPosti')?.value)||8;
  const descrizione=byId('adminDescrizione')?.value.trim()||'';

  if(!data){
    alert('Inserisci la data del torneo.');
    return false;
  }

  const old=Array.isArray(st.tornei)?st.tornei.slice():[];
  const oldSelected=st.torneoSelezionato;
  const id=Date.now();
  const numeroGironi=Math.max(1,Math.ceil(posti/4));

  const configurazione={
    coppie:[],
    partecipanti:[],
    rules:{
      locked:false,
      tipoTorneo:'',
      formatoTorneo:'',
      numeroSquadre:posti,
      numeroGironi,
      squadrePerGirone:4,
      formulaGironi:'',
      formulaFinale:''
    }
  };

  const torneo={
    id,
    nome,
    data,
    posti,
    descrizione,
    formula:'',
    stato:'bozza',
    iscritti:[],
    coppie:[],
    partecipanti:[],
    configurazione
  };

  st.tornei=(Array.isArray(st.tornei)?st.tornei:[])
    .filter(t=>!String(t.id).startsWith('temp_'));
  st.tornei.push(torneo);
  st.torneoSelezionato=id;
  window.adminState=st;

  try{
    localStorage.setItem('padel_admin_state',JSON.stringify(st));
  }catch(e){
    console.warn('[ADMIN FLOW] localStorage non disponibile',e);
  }

  try{
    if(!window.sb) throw new Error('Connessione Supabase non disponibile');

    const {error}=await window.sb.from('tornei').insert({
      id,
      nome,
      data,
      data_torneo:data,
      ora_inizio:null,
      posti,
      descrizione,
      formula:null,
      stato:'bozza',
      pubblicato:false,
      iscrizioni_chiuse:false,
      configurazione
    });

    if(error) throw error;

    if(typeof window.renderAdmin==='function') window.renderAdmin();

    const url='Bove.html?torneo='+encodeURIComponent(JSON.stringify(torneo))+'&apriRegole=true';
    window.open(url,'_blank');
    return true;
  }catch(e){
    st.tornei=old;
    st.torneoSelezionato=oldSelected;
    window.adminState=st;
    try{localStorage.setItem('padel_admin_state',JSON.stringify(st));}catch{}
    if(typeof window.renderAdmin==='function') window.renderAdmin();
    console.error('[ADMIN FLOW] Creazione torneo non riuscita',e);
    alert('Creazione torneo non riuscita: '+(e?.message||e));
    return false;
  }
};

/* Legacy button compatibility: only redirect the old function name.
   No event listeners, no polling, no DOM rewriting. */
window.apriRegoleNuovoTorneo=window.creaNuovoTorneo;
})();
