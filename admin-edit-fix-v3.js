(function(){
  const w=window;
  const db=()=>w.sb || (typeof sb !== "undefined" ? sb : null);

  w.modificaTorneoAdmin=async function(id,dati={}){
    const client=db();
    if(!client || typeof client.from!=="function") throw new Error("Client Supabase non disponibile");

    const currentId=id ?? (typeof adminState !== "undefined" ? adminState.torneoSelezionato : null);
    if(currentId===undefined || currentId===null || currentId==="") throw new Error("Nessun torneo selezionato");

    const lista=(typeof adminState !== "undefined" && Array.isArray(adminState.tornei)) ? adminState.tornei : [];
    const t=lista.find(x=>String(x.id)===String(currentId));
    if(!t) throw new Error("Torneo non trovato: "+currentId);

    dati=dati&&typeof dati==="object"?dati:{};
    const nome=String(dati.nome ?? t.nome ?? "").trim() || t.nome;
    const data=String(dati.data ?? t.data ?? "").trim();
    const descrizione=String(dati.descrizione ?? t.descrizione ?? "").trim();
    const posti=Number(dati.posti ?? t.posti);
    const stato=String(dati.stato ?? t.stato ?? "bozza");

    if(!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error("Data torneo non valida: usare YYYY-MM-DD");
    if(!Number.isFinite(posti) || posti<1) throw new Error("Posti non validi");

    const patch={nome,data,data_torneo:data,posti,descrizione,stato};
    const {data:updated,error}=await client.from("tornei").update(patch).eq("id",currentId).select("*").single();
    if(error) throw error;
    if(!updated) throw new Error("Torneo non aggiornato");

    if(typeof adminState !== "undefined"){
      adminState.tornei=adminState.tornei.map(x=>String(x.id)===String(currentId)?updated:x);
      adminState.torneoSelezionato=updated.id;
      if(typeof salvaAdminState==="function") salvaAdminState();
    }
    if(typeof renderAdmin==="function") renderAdmin();
    console.log("✅ modificaTorneoAdmin v4 salvata:",updated);
    return updated;
  };

  w.salvaTorneoAdmin=w.modificaTorneoAdmin;
  console.log("✅ admin-edit-fix-v4 caricato");
})();
