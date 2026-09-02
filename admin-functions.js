const sb = window.supabase.createClient(
  "https://iybjvtmfaupgthqqsngd.supabase.co",
  "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
  { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }
);

// Unica istanza Supabase condivisa da tutti gli script admin.
window.sb = sb;
window.supabaseClient = sb;

let adminState = {
  adminLoggato:false,
  adminEmail:"",
  torneoSelezionato:null,
  tornei:[],
  sponsor:[],
  news:[]
};

const ADMIN_STORAGE = "padel_admin_state";
window.iscrizioniTorneo = [];
window.giocatoreSelezionatoCorrente = null;

function salvaAdminState(){
  try{ localStorage.setItem(ADMIN_STORAGE, JSON.stringify(adminState)); }
  catch(e){ console.error("Errore salvataggio stato admin:",e); }
}

function caricaAdminState(){
  try{
    const raw=localStorage.getItem(ADMIN_STORAGE);
    if(!raw) return;
    adminState={...adminState,...JSON.parse(raw)};
    if(!Array.isArray(adminState.tornei)) adminState.tornei=[];
    if(!Array.isArray(adminState.sponsor)) adminState.sponsor=[];
    if(!Array.isArray(adminState.news)) adminState.news=[];
  }catch(e){ console.error("Errore caricamento stato admin:",e); }
}

function getTorneoAdminCorrente(){
  if(!Array.isArray(adminState.tornei)) return null;
  return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null;
}

function aggiornaGiocatoriAdmin(){
  const squadre=Number(document.getElementById("adminPosti")?.value)||8;
  const campo=document.getElementById("adminGiocatori");
  if(campo) campo.value=squadre*2;
}

function creaUrlBove(t,apriRegole=false){
  if(!t?.id){ return ""; }
  const id=encodeURIComponent(String(t.id));
  const separatore=apriRegole ? "&" : "?";
  return "Bove.html?idTorneo="+id+separatore+(apriRegole?"apriRegole=true":"");
}

async function caricaTorneiSupabase(){
  try{
    const {data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});
    if(error) throw error;
    if(Array.isArray(data)) adminState.tornei=data;
    salvaAdminState();
    renderAdmin();
  }catch(e){ console.error("Errore caricamento tornei Supabase:",e); }
}

async function loginAdmin(){
  try{
    const {data,error}=await sb.auth.getSession();
    if(error) throw error;
    const session=data?.session;
    if(!session){
      const email=document.getElementById("adminEmail")?.value?.trim();
      const password=document.getElementById("adminPassword")?.value||"";
      if(!email||!password){ mostraLoginMessaggio("Inserisci email e password.","#ff6678"); return; }
      const result=await sb.auth.signInWithPassword({email,password});
      if(result.error) throw result.error;
    }
    const session2=(await sb.auth.getSession()).data.session;
    adminState.adminLoggato=true;
    adminState.adminEmail=session2?.user?.email||"Admin";
    salvaAdminState();
    document.getElementById("boxLoginAdmin")?.classList.add("hidden");
    document.getElementById("areaAdmin")?.classList.remove("hidden");
    await caricaTorneiSupabase();
    await caricaRichiesteIscrizione();
    renderAdmin();
  }catch(e){
    console.error("Errore login:",e);
    mostraLoginMessaggio(e?.message||"Accesso non riuscito.","#ff6678");
  }
}
window.loginAdmin=loginAdmin;

function mostraLoginMessaggio(testo,colore){
  const box=document.getElementById("loginMessaggio");
  if(box) box.textContent=testo, box.style.color=colore||"inherit";
}

function apriRegoleNuovoTorneo(){
  const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
  const data=document.getElementById("adminDataTorneo")?.value||"";
  const posti=Number(document.getElementById("adminPosti")?.value)||8;
  const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
  const tempId="temp_"+Date.now();
  const torneoTemp={id:tempId,nome,data,posti,descrizione,formula:"",stato:"bozza",iscritti:[],coppie:[],partecipanti:[],configurazione:{rules:{numeroSquadre:posti,numeroGironi:Math.ceil(posti/4),squadrePerGirone:4}}};
  adminState.tornei.push(torneoTemp); adminState.torneoSelezionato=tempId; salvaAdminState();
  window.open(creaUrlBove(torneoTemp,true),"_blank");
}

async function creaNuovoTorneo(){
  const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
  const data=document.getElementById("adminDataTorneo")?.value||"";
  const posti=Number(document.getElementById("adminPosti")?.value)||8;
  const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
  const nuovoId=Date.now();
  const numeroGironi=Math.ceil(posti/4);
  // Admin crea solo l'anagrafica. Formula e regole operative restano a Bove.
  const nuovoTorneo={id:nuovoId,nome,data,posti,descrizione,formula:"",stato:"bozza",iscritti:[],coppie:[],partecipanti:[],configurazione:{coppie:[],partecipanti:[],rules:{numeroSquadre:posti,numeroGironi,squadrePerGirone:4}}};
  adminState.tornei=adminState.tornei.filter(t=>!String(t.id).startsWith("temp_"));
  adminState.tornei.push(nuovoTorneo); adminState.torneoSelezionato=nuovoId; salvaAdminState();
  const {error}=await sb.from("tornei").insert({id:nuovoId,nome,data,data_torneo:data,ora_inizio:null,posti,descrizione,formula:null,stato:"bozza",pubblicato:false,iscrizioni_chiuse:false,configurazione:nuovoTorneo.configurazione});
  if(error){ console.error(error); alert("Errore salvataggio torneo su Supabase"); return; }
  renderAdmin();
  window.open(creaUrlBove(nuovoTorneo,true),"_blank");
}

function renderListaTornei(){
  const box=document.getElementById("listaTorneiAdmin"); if(!box)return;
  if(!adminState.tornei.length){box.innerHTML='<p class="notice">Nessun torneo creato.</p>';return;}
  box.innerHTML=adminState.tornei.map(t=>`<div class="tournament-row ${String(t.id)===String(adminState.torneoSelezionato)?'selected':''}">
    <div class="t-info"><strong>${escapeHtml(t.nome||"Torneo senza nome")}</strong><small>${escapeHtml(t.data||"-")} · ${t.posti||"-"} squadre</small><span class="status ${t.stato==='chiuso'?'closed':''}">● ${escapeHtml(t.stato||"bozza")}</span></div>
    <div class="actions"><button class="btn" onclick="selezionaTorneoAdmin(${JSON.stringify(t.id)})">Gestisci</button><button class="btn" onclick="generaLinkPerId(${JSON.stringify(t.id)})">🔗</button></div>
  </div>`).join("");
}

function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

async function selezionaTorneoAdmin(id){
  const torneo=adminState.tornei.find(t=>String(t.id)===String(id));
  if(!torneo){alert("Torneo non trovato.");return;}
  adminState.torneoSelezionato=torneo.id; salvaAdminState();
  document.getElementById("gestioneTorneoAdmin")?.classList.remove("hidden");
  await caricaRichiesteIscrizione(); renderAdmin();
}

function apriRegoleTorneoAdmin(id){
  const torneo=adminState.tornei.find(t=>String(t.id)===String(id));
  if(!torneo){alert("Torneo non trovato");return;}
  adminState.torneoSelezionato=id; salvaAdminState(); window.open(creaUrlBove(torneo,true),"_blank");
}

async function eliminaTorneoAdmin(id){
  if(!confirm("Vuoi davvero eliminare questo torneo?"))return;
  const {error}=await sb.from("tornei").delete().eq("id",id);
  if(error){alert("Errore eliminazione torneo");console.error(error);return;}
  adminState.tornei=adminState.tornei.filter(t=>String(t.id)!==String(id));
  if(String(adminState.torneoSelezionato)===String(id))adminState.torneoSelezionato=null;
  salvaAdminState(); renderAdmin();
}

async function pubblicaTorneo(){
  const t=getTorneoAdminCorrente(); if(!t){alert("Seleziona prima un torneo");return;}
  const {error}=await sb.from("tornei").update({pubblicato:true,stato:"attivo"}).eq("id",t.id);
  if(error){alert("Errore pubblicazione torneo");return;}
  t.pubblicato=true;t.stato="attivo";salvaAdminState();renderAdmin();alert("Torneo pubblicato con successo!");
}

async function chiudiIscrizioniTorneo(){
  const t=getTorneoAdminCorrente(); if(!t){alert("Seleziona prima un torneo");return;}
  const {error}=await sb.from("tornei").update({iscrizioni_chiuse:true}).eq("id",t.id);
  if(error){alert("Errore chiusura iscrizioni");return;}
  t.iscrizioni_chiuse=true;salvaAdminState();renderAdmin();alert("Iscrizioni chiuse.");
}

async function caricaRichiesteIscrizione(){
  const id=Number(adminState.torneoSelezionato); if(!Number.isFinite(id)||id<=0){window.iscrizioniTorneo=[];renderGestioneTorneo();renderPartecipanti();renderCoppie();return;}
  try{
    let {data,error}=await sb.from("iscrizioni").select("*").eq("torneo_id",id);
    if(error)throw error;
    window.iscrizioniTorneo=Array.isArray(data)?data:[];
    renderGestioneTorneo();renderPartecipanti();renderCoppie();
  }catch(e){console.error("Errore caricamento iscrizioni:",e);}
}

function renderGestioneTorneo(){
  const box=document.getElementById("dettaglioTorneoAdmin"), card=document.getElementById("gestioneTorneoAdmin"); if(!box||!card)return;
  const t=getTorneoAdminCorrente(); if(!t){card.classList.add("hidden");box.innerHTML="";return;}
  card.classList.remove("hidden");
  const r=t.configurazione?.rules||t.rules||{};
  box.innerHTML=`<div class="admin-detail"><h3>${escapeHtml(t.nome||"Torneo")}</h3><p>📅 ${escapeHtml(t.data||"-")} · 👥 ${t.posti||r.numeroSquadre||0} squadre · 🏆 ${escapeHtml(r.tipoTorneo||t.formula||"da configurare in Bove")}</p><p>Stato: <b>${escapeHtml(t.stato||"bozza")}</b> · Pubblicato: ${t.pubblicato?'Sì':'No'} · Iscrizioni: ${t.iscrizioni_chiuse?'Chiuse':'aperte'}</p></div>`;
  const req=document.getElementById("richiesteIscrizione");
  if(req){req.innerHTML=window.iscrizioniTorneo.length?window.iscrizioniTorneo.map(g=>`<div class="lista-item"><b>${escapeHtml(g.nome_giocatore||g.nome||"Giocatore")}</b><br><small>${escapeHtml(g.email||"-")}</small><br><span class="badge">${escapeHtml(g.stato||"in attesa")}</span><br><button class="btn" onclick="selezionaGiocatoreAdmin(${g.id})">Gestisci</button></div>`).join(""):'<p class="notice">Nessuna richiesta di iscrizione.</p>';}
}

async function selezionaGiocatoreAdmin(id){
  const {data,error}=await sb.from("iscrizioni").select("*").eq("id",id).single();
  if(error||!data){alert("Giocatore non trovato.");return;}
  window.giocatoreSelezionatoCorrente=data;const s=document.getElementById("schedaGiocatoreAdmin");if(s){s.classList.remove("hidden");s.dataset.giocatoreId=data.id;}
  document.getElementById("adminNomeGiocatore").value=data.nome_giocatore||data.nome||"";
  document.getElementById("adminEmailGiocatore").value=data.email||"";
  document.getElementById("adminTelefonoGiocatore").value=data.telefono||"";
  document.getElementById("adminLivelloGiocatore").value=data.livello||"-";
  document.getElementById("adminNotaGiocatore").value=data.note||"";
}

async function approvaGiocatore(){
  const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
  if(!id){alert("Nessun giocatore selezionato");return;}
  const {data,error}=await sb.from("iscrizioni").update({stato:"approvato",approvato:true}).eq("id",id).select("*").single();
  if(error){alert("Errore approvazione: "+error.message);return;}
  window.giocatoreSelezionatoCorrente=data;chiudiSchedaGiocatore();await caricaRichiesteIscrizione();
}

async function rifiutaGiocatore(){
  const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
  if(!id){alert("Nessun giocatore selezionato.");return;}
  const {error}=await sb.from("iscrizioni").update({stato:"rifiutato",approvato:false}).eq("id",id);
  if(error){alert("Errore durante il rifiuto: "+error.message);return;}
  chiudiSchedaGiocatore();await caricaRichiesteIscrizione();
}
