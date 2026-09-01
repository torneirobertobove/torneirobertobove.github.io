const sb = window.supabase.createClient(
  "https://iybjvtmfaupgthqqsngd.supabase.co",
  "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
  { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }
);

let adminState = {
  adminLoggato:false,
  adminEmail:"",
  torneoSelezionato:null,
  tornei:[],
  sponsor:[],
  news:[]
};

// API globali usate dalla console di verifica e dai moduli admin.
window.sb = sb;
window.adminState = adminState;

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
    window.adminState=adminState;
  }catch(e){ console.error("Errore caricamento stato admin:",e); }
}

function getTorneoAdminCorrente(){
  if(!Array.isArray(adminState.tornei)) return null;
  return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null;
}
window.getTorneoAdminCorrente=getTorneoAdminCorrente;

function aggiornaGiocatoriAdmin(){
  const squadre=Number(document.getElementById("adminPosti")?.value)||8;
  const campo=document.getElementById("adminGiocatori");
  if(campo) campo.value=squadre*2;
}
window.aggiornaGiocatoriAdmin=aggiornaGiocatoriAdmin;

async function caricaTorneiSupabase(){
  try{
    const {data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});
    if(error) throw error;
    if(Array.isArray(data)) adminState.tornei=data;
    window.adminState=adminState;
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
    window.adminState=adminState;
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
  if(box){box.textContent=testo;box.style.color=colore||"inherit";}
}

function apriRegoleNuovoTorneo(){
  const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
  const data=document.getElementById("adminDataTorneo")?.value||"";
  const posti=Number(document.getElementById("adminPosti")?.value)||8;
  const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
  const tempId="temp_"+Date.now();
  const torneoTemp={id:tempId,nome,data,posti,descrizione,formula:"gironiFinale",stato:"bozza",iscritti:[],coppie:[],partecipanti:[],configurazione:{rules:{numeroSquadre:posti,numeroGironi:Math.ceil(posti/4),squadrePerGirone:4}}};
  adminState.tornei.push(torneoTemp); adminState.torneoSelezionato=tempId; window.adminState=adminState; salvaAdminState();
  window.open("Bove.html?idTorneo="+encodeURIComponent(tempId)+"&apriRegole=true","_blank");
}
window.apriRegoleNuovoTorneo=apriRegoleNuovoTorneo;

async function creaNuovoTorneo(){
  const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
  const data=document.getElementById("adminDataTorneo")?.value||"";
  const posti=Number(document.getElementById("adminPosti")?.value)||8;
  const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
  const nuovoId=Date.now();
  const numeroGironi=Math.ceil(posti/4);
  const nuovoTorneo={id:nuovoId,nome,data,posti,descrizione,formula:"gironiFinale",stato:"bozza",iscritti:[],coppie:[],partecipanti:[],configurazione:{coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:"gironiFinale",formatoTorneo:"gironiFinale",numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:"italiana",formulaFinale:"eliminazione_diretta",w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:numeroGironi*2,usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:"20:00",duration:30,crit1:"df",crit2:"gf",crit3:"gs",mostraQuarti:true}}};
  adminState.tornei=adminState.tornei.filter(t=>!String(t.id).startsWith("temp_"));
  adminState.tornei.push(nuovoTorneo); adminState.torneoSelezionato=nuovoId; window.adminState=adminState; salvaAdminState();
  const {error}=await sb.from("tornei").insert({id:nuovoId,nome,data,data_torneo:data,ora_inizio:"20:00",posti,descrizione,formula:"gironiFinale",stato:"bozza",pubblicato:false,iscrizioni_chiuse:false,configurazione:nuovoTorneo.configurazione});
  if(error){ console.error(error); alert("Errore salvataggio torneo su Supabase"); return; }
  renderAdmin();
  window.open("Bove.html?idTorneo="+encodeURIComponent(nuovoId)+"&apriRegole=true","_blank");
}
window.creaNuovoTorneo=creaNuovoTorneo;

function renderListaTornei(){
  const box=document.getElementById("listaTorneiAdmin"); if(!box)return;
  if(!adminState.tornei.length){box.innerHTML='<p class="notice">Nessun torneo creato.</p>';return;}
  box.innerHTML=adminState.tornei.map(t=>`<div class="tournament-row ${String(t.id)===String(adminState.torneoSelezionato)?'selected':''}" data-torneo-id="${escapeHtml(t.id)}" data-date="${escapeHtml(t.data||'')}">
    <div class="t-info"><strong>${escapeHtml(t.nome||"Torneo senza nome")}</strong><small>${escapeHtml(t.data||"-")} · ${t.posti||"-"} squadre</small><span class="status ${t.stato==='chiuso'?'closed':''}">● ${escapeHtml(t.stato||"bozza")}</span></div>
    <div class="actions"><button class="btn" onclick="selezionaTorneoAdmin(${JSON.stringify(t.id)})">Gestisci</button><button class="btn" onclick="generaLinkPerId(${JSON.stringify(t.id)})">🔗</button></div>
  </div>`).join("");
}
window.renderListaTornei=renderListaTornei;

function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

async function selezionaTorneoAdmin(id){
  const torneo=adminState.tornei.find(t=>String(t.id)===String(id));
  if(!torneo){alert("Torneo non trovato.");return;}
  adminState.torneoSelezionato=torneo.id; window.adminState=adminState; salvaAdminState();
  document.getElementById("gestioneTorneoAdmin")?.classList.remove("hidden");
  await caricaRichiesteIscrizione(); renderAdmin();
}
window.selezionaTorneoAdmin=selezionaTorneoAdmin;

function apriRegoleTorneoAdmin(id){
  if(!adminState.tornei.some(t=>String(t.id)===String(id))){alert("Torneo non trovato");return;}
  adminState.torneoSelezionato=id; window.adminState=adminState; salvaAdminState(); window.open("Bove.html?idTorneo="+encodeURIComponent(id)+"&apriRegole=true","_blank");
}
window.apriRegoleTorneoAdmin=apriRegoleTorneoAdmin;

async function eliminaTorneoAdmin(id){
  if(!confirm("Vuoi davvero eliminare questo torneo?"))return;
  const {error}=await sb.from("tornei").delete().eq("id",id);
  if(error){alert("Errore eliminazione torneo");console.error(error);return;}
  adminState.tornei=adminState.tornei.filter(t=>String(t.id)!==String(id));
  if(String(adminState.torneoSelezionato)===String(id))adminState.torneoSelezionato=null;
  window.adminState=adminState; salvaAdminState(); renderAdmin();
}
window.eliminaTorneoAdmin=eliminaTorneoAdmin;

async function pubblicaTorneo(){
  const t=getTorneoAdminCorrente(); if(!t){alert("Seleziona prima un torneo");return;}
  const {error}=await sb.from("tornei").update({pubblicato:true,stato:"attivo"}).eq("id",t.id);
  if(error){alert("Errore pubblicazione torneo");return;}
  t.pubblicato=true;t.stato="attivo";window.adminState=adminState;salvaAdminState();renderAdmin();alert("Torneo pubblicato con successo!");
}
window.pubblicaTorneo=pubblicaTorneo;

async function chiudiIscrizioniTorneo(){
  const t=getTorneoAdminCorrente(); if(!t){alert("Seleziona prima un torneo");return;}
  const {error}=await sb.from("tornei").update({iscrizioni_chiuse:true,stato:t.stato==='bozza'?'chiuso':t.stato}).eq("id",t.id);
  if(error){alert("Errore chiusura iscrizioni");return;}
  t.iscrizioni_chiuse=true;if(t.stato==='bozza')t.stato='chiuso';window.adminState=adminState;salvaAdminState();renderAdmin();alert("Iscrizioni chiuse.");
}
window.chiudiIscrizioniTorneo=chiudiIscrizioniTorneo;

async function caricaRichiesteIscrizione(){
  const id=Number(adminState.torneoSelezionato); if(!Number.isFinite(id)||id<=0){window.iscrizioniTorneo=[];renderGestioneTorneo();renderPartecipanti();renderCoppie();return;}
  try{
    const {data,error}=await sb.from("iscrizioni").select("*").eq("torneo_id",id);
    if(error)throw error;
    window.iscrizioniTorneo=Array.isArray(data)?data:[];
    renderGestioneTorneo();renderPartecipanti();renderCoppie();
  }catch(e){console.error("Errore caricamento iscrizioni:",e);}
}
window.caricaRichiesteIscrizione=caricaRichiesteIscrizione;

function renderGestioneTorneo(){
  const box=document.getElementById("dettaglioTorneoAdmin"), card=document.getElementById("gestioneTorneoAdmin"); if(!box||!card)return;
  const t=getTorneoAdminCorrente(); if(!t){card.classList.add("hidden");box.innerHTML="";return;}
  card.classList.remove("hidden");
  const r=t.configurazione?.rules||t.rules||{};
  box.innerHTML=`<div class="admin-detail"><h3>${escapeHtml(t.nome||"Torneo")}</h3><p>📅 ${escapeHtml(t.data||"-")} · 👥 ${t.posti||r.numeroSquadre||0} squadre · 🏆 ${escapeHtml(r.tipoTorneo||t.formula||"-")}</p><p>Stato: <b>${escapeHtml(t.stato||"bozza")}</b> · Pubblicato: ${t.pubblicato?'Sì':'No'} · Iscrizioni: ${t.iscrizioni_chiuse?'Chiuse':'aperte'}</p></div>`;
  const req=document.getElementById("richiesteIscrizione");
  if(req){req.innerHTML=window.iscrizioniTorneo.length?window.iscrizioniTorneo.map(g=>`<div class="lista-item"><b>${escapeHtml(g.nome_giocatore||g.nome||"Giocatore")}</b><br><small>${escapeHtml(g.email||"-")}</small><br><span class="badge">${escapeHtml(g.stato||"in attesa")}</span><br><button class="btn" onclick="selezionaGiocatoreAdmin(${g.id})">Gestisci</button></div>`).join(""):'<p class="notice">Nessuna richiesta di iscrizione.</p>';}
}
window.renderGestioneTorneo=renderGestioneTorneo;

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
window.selezionaGiocatoreAdmin=selezionaGiocatoreAdmin;

async function approvaGiocatore(){
  const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
  if(!id){alert("Nessun giocatore selezionato");return;}
  const {data,error}=await sb.from("iscrizioni").update({stato:"approvato",approvato:true}).eq("id",id).select("*").single();
  if(error){alert("Errore approvazione: "+error.message);return;}
  window.giocatoreSelezionatoCorrente=data;chiudiSchedaGiocatore();await caricaRichiesteIscrizione();
}
window.approvaGiocatore=approvaGiocatore;

async function rifiutaGiocatore(){
  const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;
  if(!id){alert("Nessun giocatore selezionato.");return;}
  const {error}=await sb.from("iscrizioni").update({stato:"rifiutato",approvato:false}).eq("id",id);
  if(error){alert("Errore durante il rifiuto: "+error.message);return;}
  chiudiSchedaGiocatore();await caricaRichiesteIscrizione();
}
window.rifiutaGiocatore=rifiutaGiocatore;
function chiudiSchedaGiocatore(){const s=document.getElementById("schedaGiocatoreAdmin");if(s){s.classList.add("hidden");delete s.dataset.giocatoreId;}}
window.chiudiSchedaGiocatore=chiudiSchedaGiocatore;

function renderPartecipanti(){
  const box=document.getElementById("partecipantiAdmin");if(!box)return;
  const ok=window.iscrizioniTorneo.filter(g=>g&&(g.stato==="approvato"||g.approvato===true));
  box.innerHTML=ok.length?ok.map(g=>`<div class="lista-item">✅ <b>${escapeHtml(g.nome_giocatore||g.nome||"Partecipante")}</b> — ${escapeHtml(g.email||"-")}</div>`).join(""):"<p class=\"notice\">Nessun partecipante approvato.</p>";
}
window.renderPartecipanti=renderPartecipanti;

function renderCoppie(){
  const box=document.getElementById("creaCoppieBox"),list=document.getElementById("listaCoppieAdmin");if(!box)return;
  const t=getTorneoAdminCorrente();if(!t){box.innerHTML='<p class="notice">Nessun torneo selezionato.</p>';if(list)list.innerHTML="";return;}
  if(!Array.isArray(t.coppie))t.coppie=[];if(!t.configurazione)t.configurazione={};if(!Array.isArray(t.configurazione.coppie))t.configurazione.coppie=t.coppie;
  const approved=window.iscrizioniTorneo.filter(g=>g&&(g.stato==="approvato"||g.approvato===true));
  const used=new Set(t.coppie.flatMap(c=>[c?.giocatore1?.id,c?.giocatore2?.id].filter(x=>x!=null).map(String)));
  const available=approved.filter(g=>!used.has(String(g.id)));
  const name=g=>escapeHtml([g?.nome,g?.cognome].filter(Boolean).join(" ")||g?.nome_giocatore||g?.email||"Giocatore");
  box.innerHTML=available.length>=2?`<div class="pair-form"><p><b>Giocatori approvati:</b> ${approved.length} · <b>Coppie:</b> ${t.coppie.length}</p><select id="adminCoppiaGiocatore1"><option value="">Primo giocatore</option>${available.map(g=>`<option value="${g.id}">${name(g)}</option>`).join("")}</select><select id="adminCoppiaGiocatore2"><option value="">Secondo giocatore</option>${available.map(g=>`<option value="${g.id}">${name(g)}</option>`).join("")}</select><button class="btn primary" id="btnCreaCoppiaAdmin" type="button">＋ Crea coppia</button></div>`:`<p class="notice">${approved.length<2?'Servono almeno due giocatori approvati.':'Tutti i giocatori approvati sono già assegnati.'}</p>`;
  if(list)list.innerHTML=t.coppie.length?t.coppie.map((c,i)=>`<div class="lista-item"><b>Coppia ${i+1}</b><br>👤 ${name(c.giocatore1)}<br>👤 ${name(c.giocatore2)}</div>`).join(""):"<p class=\"notice\">Nessuna coppia creata.</p>";
  document.getElementById("btnCreaCoppiaAdmin")?.addEventListener("click",async()=>{
    const id1=document.getElementById("adminCoppiaGiocatore1")?.value,id2=document.getElementById("adminCoppiaGiocatore2")?.value;if(!id1||!id2||id1===id2){alert("Seleziona due giocatori diversi.");return;}
    const g1=approved.find(g=>String(g.id)===String(id1)),g2=approved.find(g=>String(g.id)===String(id2));if(!g1||!g2)return;
    t.coppie.push({id:Date.now(),giocatore1:{id:g1.id,nome:g1.nome||"",cognome:g1.cognome||"",nome_giocatore:g1.nome_giocatore||"",email:g1.email||""},giocatore2:{id:g2.id,nome:g2.nome||"",cognome:g2.cognome||"",nome_giocatore:g2.nome_giocatore||"",email:g2.email||""}});t.configurazione.coppie=t.coppie;adminState.tornei[adminState.tornei.findIndex(x=>String(x.id)===String(t.id))]=t;window.adminState=adminState;salvaAdminState();
    const result=await sb.from("tornei").update({configurazione:t.configurazione}).eq("id",t.id);if(result.error)console.error(result.error);renderCoppie();syncDashboard();
  });
}
window.renderCoppie=renderCoppie;

function inviaWhatsAppTutti(){const msg=document.getElementById("messaggioWhatsApp")?.value.trim();if(!msg){alert("Scrivi un messaggio");return;}window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg),"_blank");}
window.inviaWhatsAppTutti=inviaWhatsAppTutti;
function inviaWhatsAppApprovati(){inviaWhatsAppTutti();}
window.inviaWhatsAppApprovati=inviaWhatsAppApprovati;
function generaLinkBove(){const t=getTorneoAdminCorrente();if(!t){alert("Seleziona prima un torneo");return;}const input=document.getElementById("linkBoveGenerato");if(input)input.value=location.origin+"/Bove.html?idTorneo="+encodeURIComponent(t.id);}
window.generaLinkBove=generaLinkBove;
function generaLinkPerId(id){adminState.torneoSelezionato=id;window.adminState=adminState;salvaAdminState();generaLinkBove();openWorkspace("link");}
window.generaLinkPerId=generaLinkPerId;
function copiaLinkBove(){const input=document.getElementById("linkBoveGenerato");if(!input?.value){generaLinkBove();}if(input?.value)navigator.clipboard?.writeText(input.value).then(()=>alert("Link copiato negli appunti!"));}
window.copiaLinkBove=copiaLinkBove;
function apriBoveConTorneo(id){const n=Number(id);if(!Number.isFinite(n)||!n){alert("Seleziona prima un torneo");return;}window.open("Bove.html?idTorneo="+encodeURIComponent(n),"_blank");}
window.apriBoveConTorneo=apriBoveConTorneo;

async function creaNews(){const titolo=document.getElementById("newsTitolo")?.value.trim(),testo=document.getElementById("newsTesto")?.value.trim(),immagine=document.getElementById("newsImmagine")?.value.trim();if(!titolo||!testo){alert("Inserisci titolo e testo della news");return;}adminState.news.unshift({id:Date.now(),titolo,testo,immagine,data:new Date().toLocaleDateString("it-IT")});window.adminState=adminState;salvaAdminState();caricaNewsAdmin();["newsTitolo","newsTesto","newsImmagine"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});}
window.creaNews=creaNews;
function caricaNewsAdmin(){const box=document.getElementById("listaNewsAdmin");if(!box)return;box.innerHTML=adminState.news.length?adminState.news.map(n=>`<div class="lista-item"><b>${escapeHtml(n.titolo)}</b><small> · ${escapeHtml(n.data||"")}</small><p>${escapeHtml(n.testo)}</p>${n.immagine?`<img src="${escapeHtml(n.immagine)}" style="max-width:100%;border-radius:8px">`:""}<button class="btn" onclick="eliminaNews(${n.id})">Elimina</button></div>`).join(""):"<p class=\"notice\">Nessuna news pubblicata.</p>";}
window.caricaNewsAdmin=caricaNewsAdmin;
function eliminaNews(id){adminState.news=adminState.news.filter(n=>Number(n.id)!==Number(id));window.adminState=adminState;salvaAdminState();caricaNewsAdmin();}
window.eliminaNews=eliminaNews;

async function salvaSponsor(){const nome=document.getElementById("sponsorNome")?.value.trim(),immagine=document.getElementById("sponsorImmagine")?.value.trim(),video=document.getElementById("sponsorVideo")?.value.trim(),link=document.getElementById("sponsorLink")?.value.trim();if(!nome){alert("Inserisci il nome dello sponsor");return;}adminState.sponsor.push({id:Date.now(),nome,immagine,video,link});window.adminState=adminState;salvaAdminState();caricaSponsorAdmin();["sponsorNome","sponsorImmagine","sponsorVideo","sponsorLink"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});}
window.salvaSponsor=salvaSponsor;
function caricaSponsorAdmin(){const box=document.getElementById("listaSponsorAdmin");if(!box)return;box.innerHTML=adminState.sponsor.length?adminState.sponsor.map(s=>`<div class="lista-item"><b>${escapeHtml(s.nome)}</b>${s.link?`<br><a href="${escapeHtml(s.link)}" target="_blank">Apri link</a>`:""}<button class="btn" onclick="eliminaSponsor(${s.id})">Elimina</button></div>`).join(""):"<p class=\"notice\">Nessun sponsor registrato.</p>";}
window.caricaSponsorAdmin=caricaSponsorAdmin;
function eliminaSponsor(id){adminState.sponsor=adminState.sponsor.filter(s=>Number(s.id)!==Number(id));window.adminState=adminState;salvaAdminState();caricaSponsorAdmin();}
window.eliminaSponsor=eliminaSponsor;

async function creaIscrittiTest(){const t=getTorneoAdminCorrente();if(!t){alert("Seleziona prima un torneo");return;}const rows=[{torneo_id:t.id,nome:"Test Giocatore 1",email:"test1@padel.it",telefono:"3331112233",livello:"Intermedio",stato:"approvato",approvato:true},{torneo_id:t.id,nome:"Test Giocatore 2",email:"test2@padel.it",telefono:"3332223344",livello:"Avanzato",stato:"in attesa",approvato:false}];for(const r of rows){const {error}=await sb.from("iscrizioni").insert(r);if(error)console.error(error);}await caricaRichiesteIscrizione();}
window.creaIscrittiTest=creaIscrittiTest;

function renderAdmin(){renderListaTornei();renderGestioneTorneo();renderPartecipanti();renderCoppie();caricaSponsorAdmin();caricaNewsAdmin();syncDashboard();}
window.renderAdmin=renderAdmin;

function syncDashboard(){
  const active=adminState.tornei.filter(t=>!String(t.stato||"").toLowerCase().includes("chius")).length;
  const pending=window.iscrizioniTorneo.filter(g=>g?.stato!=="approvato"&&g?.approvato!==true).length;
  const approved=window.iscrizioniTorneo.filter(g=>g?.stato==="approvato"||g?.approvato===true).length;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set("statTornei",active);set("statIscritti",approved+pending);set("statApprovare",pending);set("statTabelloni",adminState.tornei.length);
  const email=document.getElementById("adminEmailMini");if(email)email.textContent=adminState.adminEmail||"Amministratore";
}
window.syncDashboard=syncDashboard;

function openWorkspace(section){
  const w=document.getElementById("workspace");if(w)w.open=true;
  if(section)document.getElementById(section)?.scrollIntoView({behavior:"smooth",block:"start"});
}
window.openWorkspace=openWorkspace;

function wireDashboard(){
  document.getElementById("btnLoginAdmin")?.addEventListener("click",loginAdmin);
  document.getElementById("btnAggiorna")?.addEventListener("click",async()=>{await caricaTorneiSupabase();await caricaRichiesteIscrizione();renderAdmin();});
  caricaAdminState();
  if(adminState.adminLoggato){document.getElementById("boxLoginAdmin")?.classList.add("hidden");document.getElementById("areaAdmin")?.classList.remove("hidden");}
  aggiornaGiocatoriAdmin();
  if(adminState.adminLoggato){caricaTorneiSupabase();caricaRichiesteIscrizione();}
}

document.addEventListener("DOMContentLoaded",wireDashboard);
