/* Admin create fix: loaded separately if needed. */
(function(){
  if(typeof window==='undefined'||!window.sb)return;
  window.creaTorneoAdmin=async function(dati={}){
    const nome=String(dati.nome??'Nuovo Torneo').trim()||'Nuovo Torneo';
    const data=String(dati.data??'').trim();
    const posti=Number(dati.posti)||8;
    const descrizione=String(dati.descrizione??'').trim();
    if(!data){console.error('creaTorneoAdmin: data torneo obbligatoria');return null;}
    const id=Date.now();
    const numeroGironi=Math.ceil(posti/4);
    const configurazione={coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:'gironiFinale',formatoTorneo:'gironiFinale',numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:'italiana',formulaFinale:'eliminazione_diretta',w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:numeroGironi*2,usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:'20:00',duration:30}};
    const t={id,nome,data,posti,descrizione,formula:'gironiFinale',stato:'bozza',iscritti:[],coppie:[],partecipanti:[],configurazione};
    const r=await window.sb.from('tornei').insert({id,nome,data,data_torneo:data,ora_inizio:'20:00',posti,descrizione,formula:'gironiFinale',stato:'bozza',pubblicato:false,iscrizioni_chiuse:false,configurazione});
    if(r.error){console.error(r.error);return null;}
    if(window.adminState){window.adminState.tornei=Array.isArray(window.adminState.tornei)?window.adminState.tornei:[];window.adminState.tornei.unshift(t);window.adminState.torneoSelezionato=id;window.salvaAdminState?.();}
    window.renderAdmin?.();
    return t;
  };
})();
