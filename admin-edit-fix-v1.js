(function(){
  const w=window;
  const client=()=>w.sb || (typeof sb !== "undefined" ? sb : null);

  w.modificaTorneoAdmin=async function(id, dati){
    const db=client();
    if(!db || typeof db.from!=="function") throw new Error("Client Supabase non disponibile");

    const currentId=id ?? w.adminState?.torneoSelezionato;
    if(currentId===undefined || currentId===null || currentId==="") throw new Error("Nessun torneo selezionato");

    const t=(w.adminState?.tornei||[]).find(x=>String(x.id)===String(currentId));
    if(!t) throw new Error("Torneo non trovato: "+currentId);

    dati=dati&&typeof dati==="object"?dati:{};
    const nome=String(dati.nome ?? w.document.getElementById("adminNomeTorneo")?.value ?? t.nome ?? "").trim() || t.nome;
    const data=String(dati.data ?? w.document.getElementById("adminDataTorneo")?.value ?? t.data ?? "").trim();
    const descrizione=String(dati.descrizione ?? w.document.getElementById("adminDescrizione")?.value ?? t.descrizione ?? "").trim();
    const posti=Number(dati.posti ?? w.document.getElementById("adminPosti")?.value ?? t.posti) || t.posti;
    const stato=String(dati.stato ?? w.document.getElementById("adminStatoTorneo")?.value ?? t.stato ?? "bozza");

    if(!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error("Data torneo non valida: usare YYYY-MM-DD");

    const patch={nome,data,data_torneo:data,posti,descrizione,stato};
    const {data:row,error}=await db.from("tornei").update(patch).eq("id",currentId).select("*").single();
    if(error) throw error;

    const updated=row || {...t,...patch};
    if(w.adminState){
      w.adminState.tornei=(w.adminState.tornei||[]).map(x=>String(x.id)===String(currentId)?updated:x);
      w.adminState.torneoSelezionato=updated.id;
      if(typeof w.salvaAdminState==="function") w.salvaAdminState();
    }
    if(typeof w.renderAdmin==="function") w.renderAdmin();
    return updated;
  };

  w.salvaTorneoAdmin=w.modificaTorneoAdmin;
  console.log("✅ admin-edit-fix-v1 caricato");
})();
