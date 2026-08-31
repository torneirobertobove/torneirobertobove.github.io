(function(){
  const w=window;
  w.creaTorneoAdmin=async function(dati={}){
    const sb=w.sb;
    if(!sb || typeof sb.from!=="function") throw new Error("Client Supabase non disponibile");
    dati=dati&&typeof dati==="object"?dati:{};
    const nome=String(dati.nome??w.document.getElementById("adminNomeTorneo")?.value??"Nuovo Torneo").trim()||"Nuovo Torneo";
    const data=String(dati.data??w.document.getElementById("adminDataTorneo")?.value??"").trim();
    const descrizione=String(dati.descrizione??w.document.getElementById("adminDescrizione")?.value??"").trim();
    const posti=Number(dati.posti??w.document.getElementById("adminPosti")?.value??8)||8;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error("Data torneo non valida: usare YYYY-MM-DD");
    const id=Date.now();
    const numeroGironi=Math.ceil(posti/4);
    const configurazione={coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:"gironiFinale",formatoTorneo:"gironiFinale",numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:"italiana",formulaFinale:"eliminazione_diretta",w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:numeroGironi*2,usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:"20:00",duration:30}};
    const payload={id,nome,data,data_torneo:data,ora_inizio:"20:00",posti,descrizione,formula:"gironiFinale",stato:"bozza",pubblicato:false,iscrizioni_chiuse:false,configurazione};
    const {data:row,error}=await sb.from("tornei").insert(payload).select("*").single();
    if(error) throw error;
    const torneo=row||payload;
    if(w.adminState){
      if(!Array.isArray(w.adminState.tornei)) w.adminState.tornei=[];
      w.adminState.tornei=[torneo,...w.adminState.tornei.filter(t=>String(t.id)!==String(torneo.id))];
      w.adminState.torneoSelezionato=torneo.id;
      if(typeof w.salvaAdminState==="function") w.salvaAdminState();
    }
    if(typeof w.renderAdmin==="function") w.renderAdmin();
    return torneo;
  };
  w.creaNuovoTorneo=w.creaTorneoAdmin;
  console.log("✅ admin-create-fix-v2 caricato");
})();
