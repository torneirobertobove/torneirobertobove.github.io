(function(){
"use strict";

if(!window.supabase||typeof window.supabase.createClient!=="function"){
console.error("Supabase non disponibile: verificare il caricamento di @supabase/supabase-js.");
document.addEventListener("DOMContentLoaded",function(){
var box=document.getElementById("loginMessaggio");
if(box){
box.textContent="Servizio Supabase non disponibile. Ricarica la pagina.";
box.style.color="#ff6678";
}
});
return;
}

const sb=window.supabase.createClient(
"https://iybjvtmfaupgthqqsngd.supabase.co",
"sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);

window.sb=sb;
window.supabaseClient=sb;

let adminState={
adminLoggato:false,
adminEmail:"",
torneoSelezionato:null,
tornei:[],
sponsor:[],
news:[]
};

const ADMIN_STORAGE="padel_admin_state";
window.iscrizioniTorneo=[];
window.giocatoreSelezionatoCorrente=null;

function salvaAdminState(){
try{localStorage.setItem(ADMIN_STORAGE,JSON.stringify(adminState));}
catch(e){console.error("Errore salvataggio stato admin:",e);}
}

function caricaAdminState(){
try{
const raw=localStorage.getItem(ADMIN_STORAGE);
if(!raw)return;
const parsed=JSON.parse(raw);
if(parsed&&typeof parsed==="object")adminState={...adminState,...parsed};
if(!Array.isArray(adminState.tornei))adminState.tornei=[];
if(!Array.isArray(adminState.sponsor))adminState.sponsor=[];
if(!Array.isArray(adminState.news))adminState.news=[];
}catch(e){console.error("Errore caricamento stato admin:",e);}
}

function getTorneoAdminCorrente(){
if(!Array.isArray(adminState.tornei))return null;
return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null;
}

function aggiornaGiocatoriAdmin(){
const squadre=Number(document.getElementById("adminPosti")?.value)||8;
const campo=document.getElementById("adminGiocatori");
if(campo)campo.value=squadre*2;
}

function creaUrlBove(t,apriRegole=false){
if(!t?.id)return"";
if(String(t.id).startsWith("temp_")){
const payload=encodeURIComponent(JSON.stringify(t));
return"Bove.html?torneo="+payload+(apriRegole?"&apriRegole=true":"");
}
const id=encodeURIComponent(String(t.id));
return"Bove.html?idTorneo="+id+(apriRegole?"&apriRegole=true":"");
}

async function caricaTorneiSupabase(){
try{
const{data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});
if(error)throw error;
if(Array.isArray(data))adminState.tornei=data;
salvaAdminState();
renderAdmin();
}catch(e){console.error("Errore caricamento tornei Supabase:",e);}
}

async function loginAdmin(){
try{
const{data,error}=await sb.auth.getSession();
if(error)throw error;

let session=data?.session;

if(!session){
const email=document.getElementById("adminEmail")?.value?.trim()||"";
const password=document.getElementById("adminPassword")?.value||"";

if(!email||!password){
mostraLoginMessaggio("Inserisci email e password.","#ff6678");
return;
}

const result=await sb.auth.signInWithPassword({email,password});
if(result.error)throw result.error;
session=result.data?.session||null;
}

if(!session)throw new Error("Sessione amministratore non disponibile.");

adminState.adminLoggato=true;
adminState.adminEmail=session.user?.email||"Amministratore";
salvaAdminState();

document.getElementById("boxLoginAdmin")?.classList.add("hidden");
document.getElementById("areaAdmin")?.classList.remove("hidden");

renderAdmin();

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
if(box){
box.textContent=testo;
box.style.color=colore||"inherit";
}
}

function apriRegoleNuovoTorneo(){
const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
const data=document.getElementById("adminDataTorneo")?.value||"";
const posti=Number(document.getElementById("adminPosti")?.value)||8;
const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
const stato=document.getElementById("adminStatoTorneo")?.value||"bozza";
const tempId="temp_"+Date.now();

const torneoTemp={
id:tempId,
nome,
data,
posti,
descrizione,
formula:"",
stato,
iscritti:[],
coppie:[],
partecipanti:[],
configurazione:{
rules:{
numeroSquadre:posti,
numeroGironi:Math.ceil(posti/4),
squadrePerGirone:4
}
}
};

adminState.tornei.push(torneoTemp);
adminState.torneoSelezionato=tempId;
salvaAdminState();
window.open(creaUrlBove(torneoTemp,true),"_blank");
}

async function creaNuovoTorneo(){
const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
const data=document.getElementById("adminDataTorneo")?.value||"";
const posti=Number(document.getElementById("adminPosti")?.value)||8;
const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
const stato=document.getElementById("adminStatoTorneo")?.value||"bozza";
const nuovoId=Date.now();
const numeroGironi=Math.ceil(posti/4);

const nuovoTorneo={
id:nuovoId,
nome,
data,
posti,
descrizione,
formula:"",
stato,
iscritti:[],
coppie:[],
partecipanti:[],
configurazione:{
coppie:[],
partecipanti:[],
rules:{
numeroSquadre:posti,
numeroGironi,
squadrePerGirone:4
}
}
};

adminState.tornei=adminState.tornei.filter(t=>!String(t.id).startsWith("temp_"));
adminState.tornei.push(nuovoTorneo);
adminState.torneoSelezionato=nuovoId;
salvaAdminState();

try{
const{error}=await sb.from("tornei").insert({
id:nuovoId,
nome,
data,
data_torneo:data,
ora_inizio:null,
posti,
descrizione,
formula:null,
stato,
pubblicato:false,
iscrizioni_chiuse:false,
configurazione:nuovoTorneo.configurazione
});

if(error)throw error;

renderAdmin();
window.open(creaUrlBove(nuovoTorneo,true),"_blank");

}catch(e){
console.error("Errore creazione torneo:",e);
alert("Errore salvataggio torneo su Supabase: "+(e?.message||e));
}
}

function renderListaTornei(){
const box=document.getElementById("listaTorneiAdmin");
if(!box)return;

if(!adminState.tornei.length){
box.innerHTML='<p class="notice">Nessun torneo creato.</p>';
return;
}

box.innerHTML=adminState.tornei.map(t=>`
<div class="tournament-row ${String(t.id)===String(adminState.torneoSelezionato)?"selected":""}">
<div class="t-info">
<strong>${escapeHtml(t.nome||"Torneo senza nome")}</strong>
<small>${escapeHtml(t.data||"-")} · ${t.posti||"-"} squadre</small>
<span class="status ${t.stato==="chiuso"?"closed":""}">● ${escapeHtml(t.stato||"bozza")}</span>
</div>
<div class="actions">
<button class="btn" type="button" onclick="selezionaTorneoAdmin(${JSON.stringify(t.id)})">Gestisci</button>
<button class="btn" type="button" onclick="generaLinkPerId(${JSON.stringify(t.id)})">🔗</button>
</div>
</div>
`).join("");
}

function escapeHtml(v){
return String(v).replace(/[&<>'"]/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
"'":"&#39;",
'"':"&quot;"
}[c]));
}

async function selezionaTorneoAdmin(id){
const torneo=adminState.tornei.find(t=>String(t.id)===String(id));

if(!torneo){
alert("Torneo non trovato.");
return;
}

adminState.torneoSelezionato=torneo.id;
salvaAdminState();

document.getElementById("gestioneTorneoAdmin")?.classList.remove("hidden");

await caricaRichiesteIscrizione();
renderAdmin();

window.openAdminPage?.("iscritti");
}

function apriRegoleTorneoAdmin(id){
const torneo=adminState.tornei.find(t=>String(t.id)===String(id));

if(!torneo){
alert("Torneo non trovato");
return;
}

adminState.torneoSelezionato=id;
salvaAdminState();

window.open(creaUrlBove(torneo,true),"_blank");
}

async function eliminaTorneoAdmin(id){
if(!confirm("Vuoi davvero eliminare questo torneo?"))return;

const{error}=await sb.from("tornei").delete().eq("id",id);

if(error){
alert("Errore eliminazione torneo: "+error.message);
console.error(error);
return;
}

adminState.tornei=adminState.tornei.filter(t=>String(t.id)!==String(id));

if(String(adminState.torneoSelezionato)===String(id)){
adminState.torneoSelezionato=null;
}

salvaAdminState();
renderAdmin();
}

async function pubblicaTorneo(){
const t=getTorneoAdminCorrente();

if(!t){
alert("Seleziona prima un torneo");
return;
}

const{error}=await sb.from("tornei").update({
pubblicato:true,
stato:"attivo"
}).eq("id",t.id);

if(error){
alert("Errore pubblicazione torneo: "+error.message);
return;
}

t.pubblicato=true;
t.stato="attivo";

salvaAdminState();
renderAdmin();
alert("Torneo pubblicato con successo!");
}

async function chiudiIscrizioniTorneo(){
const t=getTorneoAdminCorrente();

if(!t){
alert("Seleziona prima un torneo");
return;
}

const{error}=await sb.from("tornei").update({
iscrizioni_chiuse:true
}).eq("id",t.id);

if(error){
alert("Errore chiusura iscrizioni: "+error.message);
return;
}

t.iscrizioni_chiuse=true;

salvaAdminState();
renderAdmin();
alert("Iscrizioni chiuse.");
}

async function caricaRichiesteIscrizione(){
const id=Number(adminState.torneoSelezionato);

if(!Number.isFinite(id)||id<=0){
window.iscrizioniTorneo=[];
renderGestioneTorneo();
renderPartecipanti();
renderCoppie();
return;
}

try{
const{data,error}=await sb.from("iscrizioni").select("*").eq("torneo_id",id);

if(error)throw error;

window.iscrizioniTorneo=Array.isArray(data)?data:[];

renderGestioneTorneo();
renderPartecipanti();
renderCoppie();

}catch(e){
console.error("Errore caricamento iscrizioni:",e);
window.iscrizioniTorneo=[];
renderGestioneTorneo();
renderPartecipanti();
renderCoppie();
}
}

function renderGestioneTorneo(){
const box=document.getElementById("dettaglioTorneoAdmin");
const card=document.getElementById("gestioneTorneoAdmin");

if(!box||!card)return;

const t=getTorneoAdminCorrente();

if(!t){
card.classList.add("hidden");
box.innerHTML="";
return;
}

card.classList.remove("hidden");

const r=t.configurazione?.rules||t.rules||{};

box.innerHTML=`
<div class="admin-detail">
<h3>${escapeHtml(t.nome||"Torneo")}</h3>
<p>📅 ${escapeHtml(t.data||"-")} · 👥 ${t.posti||r.numeroSquadre||0} squadre · 🏆 ${escapeHtml(r.tipoTorneo||t.formula||"da configurare in Bove")}</p>
<p>Stato: <b>${escapeHtml(t.stato||"bozza")}</b> · Pubblicato: ${t.pubblicato?"Sì":"No"} · Iscrizioni: ${t.iscrizioni_chiuse?"Chiuse":"aperte"}</p>
</div>
`;

const req=document.getElementById("richiesteIscrizione");

if(req){
req.innerHTML=window.iscrizioniTorneo.length
?window.iscrizioniTorneo.map(g=>`
<div class="lista-item">
<b>${escapeHtml(g.nome_giocatore||g.nome||"Giocatore")}</b><br>
<small>${escapeHtml(g.email||"-")}</small><br>
<span class="badge">${escapeHtml(g.stato||"in attesa")}</span><br>
<button class="btn" type="button" onclick="selezionaGiocatoreAdmin(${JSON.stringify(g.id)})">Gestisci</button>
</div>
`).join("")
:'<p class="notice">Nessuna richiesta di iscrizione.</p>';
}
}

async function selezionaGiocatoreAdmin(id){
try{
const{data,error}=await sb.from("iscrizioni").select("*").eq("id",id).single();

if(error||!data){
alert("Giocatore non trovato.");
return;
}

window.giocatoreSelezionatoCorrente=data;

const s=document.getElementById("schedaGiocatoreAdmin");

if(s){
s.classList.remove("hidden");
s.dataset.giocatoreId=data.id;
}

const setValue=(elementId,value)=>{
const el=document.getElementById(elementId);
if(el)el.value=value;
};

setValue("adminNomeGiocatore",data.nome_giocatore||data.nome||"");
setValue("adminEmailGiocatore",data.email||"");
setValue("adminTelefonoGiocatore",data.telefono||"");
setValue("adminLivelloGiocatore",data.livello||"-");
setValue("adminNotaGiocatore",data.note||"");

if(!s){
console.info("Giocatore selezionato:",data);
}

}catch(e){
console.error("Errore selezione giocatore:",e);
alert("Errore caricamento giocatore: "+(e?.message||e));
}
}

async function approvaGiocatore(){
const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;

if(!id){
alert("Nessun giocatore selezionato");
return;
}

const{data,error}=await sb.from("iscrizioni").update({
stato:"approvato",
approvato:true
}).eq("id",id).select("*").single();

if(error){
alert("Errore approvazione: "+error.message);
return;
}

window.giocatoreSelezionatoCorrente=data;
chiudiSchedaGiocatore();
await caricaRichiesteIscrizione();
}

async function rifiutaGiocatore(){
const id=window.giocatoreSelezionatoCorrente?.id||document.getElementById("schedaGiocatoreAdmin")?.dataset?.giocatoreId;

if(!id){
alert("Nessun giocatore selezionato.");
return;
}

const{error}=await sb.from("iscrizioni").update({
stato:"rifiutato",
approvato:false
}).eq("id",id);

if(error){
alert("Errore durante il rifiuto: "+error.message);
return;
}

chiudiSchedaGiocatore();
await caricaRichiesteIscrizione();
}

function chiudiSchedaGiocatore(){
const s=document.getElementById("schedaGiocatoreAdmin");

if(s){
s.classList.add("hidden");
delete s.dataset.giocatoreId;
}

window.giocatoreSelezionatoCorrente=null;
}

function renderPartecipanti(){
const box=document.getElementById("partecipantiAdmin");
if(!box)return;

const ok=Array.isArray(window.iscrizioniTorneo)
?window.iscrizioniTorneo.filter(g=>g&&(g.stato==="approvato"||g.approvato===true))
:[];

box.innerHTML=ok.length
?ok.map(g=>`
<div class="lista-item">
✅ <b>${escapeHtml(g.nome_giocatore||g.nome||"Partecipante")}</b> — ${escapeHtml(g.email||"-")}
</div>
`).join("")
:'<p class="notice">Nessun partecipante approvato.</p>';
}

function renderCoppie(){
const box=document.getElementById("creaCoppieBox");
const list=document.getElementById("listaCoppieAdmin");

if(!box)return;

const t=getTorneoAdminCorrente();

if(!t){
box.innerHTML='<p class="notice">Nessun torneo selezionato.</p>';
if(list)list.innerHTML="";
return;
}

if(!Array.isArray(t.coppie))t.coppie=[];
if(!t.configurazione)t.configurazione={};
if(!Array.isArray(t.configurazione.coppie))t.configurazione.coppie=t.coppie;

const approved=Array.isArray(window.iscrizioniTorneo)
?window.iscrizioniTorneo.filter(g=>g&&(g.stato==="approvato"||g.approvato===true))
:[];

const used=new Set(
t.coppie.flatMap(c=>[
c?.giocatore1?.id,
c?.giocatore2?.id
].filter(x=>x!=null).map(String))
);

const available=approved.filter(g=>!used.has(String(g.id)));

const name=g=>escapeHtml(
[g?.nome,g?.cognome].filter(Boolean).join(" ")||
g?.nome_giocatore||
g?.email||
"Giocatore"
);

box.innerHTML=available.length>=2
?`
<div class="pair-form">
<p><b>Giocatori approvati:</b> ${approved.length} · <b>Coppie:</b> ${t.coppie.length}</p>

<select id="adminCoppiaGiocatore1">
<option value="">Primo giocatore</option>
${available.map(g=>`<option value="${escapeHtml(g.id)}">${name(g)}</option>`).join("")}
</select>

<select id="adminCoppiaGiocatore2">
<option value="">Secondo giocatore</option>
${available.map(g=>`<option value="${escapeHtml(g.id)}">${name(g)}</option>`).join("")}
</select>

<button class="btn primary" id="btnCreaCoppiaAdmin" type="button">＋ Crea coppia</button>
</div>
`
:`<p class="notice">${
approved.length<2
?"Servono almeno due giocatori approvati."
:"Tutti i giocatori approvati sono già assegnati."
}</p>`;

if(list){
list.innerHTML=t.coppie.length
?t.coppie.map((c,i)=>`
<div class="lista-item">
<b>Coppia ${i+1}</b><br>
👤 ${name(c.giocatore1)}<br>
👤 ${name(c.giocatore2)}
</div>
`).join("")
:'<p class="notice">Nessuna coppia creata.</p>';
}

document.getElementById("btnCreaCoppiaAdmin")?.addEventListener("click",async()=>{
const id1=document.getElementById("adminCoppiaGiocatore1")?.value||"";
const id2=document.getElementById("adminCoppiaGiocatore2")?.value||"";

if(!id1||!id2||id1===id2){
alert("Seleziona due giocatori diversi.");
return;
}

const g1=approved.find(g=>String(g.id)===String(id1));
const g2=approved.find(g=>String(g.id)===String(id2));

if(!g1||!g2)return;

t.coppie.push({
id:Date.now(),
giocatore1:{
id:g1.id,
nome:g1.nome||"",
cognome:g1.cognome||"",
nome_giocatore:g1.nome_giocatore||"",
email:g1.email||""
},
giocatore2:{
id:g2.id,
nome:g2.nome||"",
cognome:g2.cognome||"",
nome_giocatore:g2.nome_giocatore||"",
email:g2.email||""
}
});

t.configurazione.coppie=t.coppie;

const index=adminState.tornei.findIndex(x=>String(x.id)===String(t.id));

if(index>=0)adminState.tornei[index]=t;

salvaAdminState();

const result=await sb.from("tornei").update({
configurazione:t.configurazione
}).eq("id",t.id);

if(result.error)console.error(result.error);

renderCoppie();
syncDashboard();
});
}

function inviaWhatsAppTutti(){
const msg=document.getElementById("messaggioWhatsApp")?.value.trim()||"";

if(!msg){
alert("Scrivi un messaggio");
return;
}

window.open(
"https://api.whatsapp.com/send?text="+encodeURIComponent(msg),
"_blank"
);
}

function inviaWhatsAppApprovati(){
inviaWhatsAppTutti();
}

function generaLinkBove(){
let t=getTorneoAdminCorrente();

if(!t){
t=adminState.tornei.find(x=>String(x.id)===String(adminState.torneoSelezionato))||
adminState.tornei[0]||
null;
}

if(!t){
alert("Seleziona prima un torneo");
return"";
}

adminState.torneoSelezionato=t.id;
salvaAdminState();

const url=location.origin+"/"+creaUrlBove(t,false);

const input=document.getElementById("linkBoveGenerato");
if(input)input.value=url;

const mirror=document.getElementById("linkBoveGeneratoMirror");
if(mirror)mirror.value=url;

return url;
}

function generaLinkPerId(id){
const torneo=adminState.tornei.find(t=>String(t.id)===String(id));

if(!torneo){
alert("Torneo non trovato.");
return;
}

adminState.torneoSelezionato=torneo.id;
salvaAdminState();

generaLinkBove();
window.openAdminPage?.("link");
}

function copiaLinkBove(){
const input=document.getElementById("linkBoveGenerato");

if(!input?.value)generaLinkBove();

const value=input?.value||"";

if(!value)return;

if(navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){
navigator.clipboard.writeText(value)
.then(()=>alert("Link copiato negli appunti!"))
.catch(()=>copiaLinkFallback(value));
}else{
copiaLinkFallback(value);
}
}

function copiaLinkFallback(value){
try{
const temp=document.createElement("textarea");
temp.value=value;
temp.style.position="fixed";
temp.style.opacity="0";
document.body.appendChild(temp);
temp.select();
document.execCommand("copy");
temp.remove();
alert("Link copiato negli appunti!");
}catch(e){
console.error("Errore copia link:",e);
}
}

function apriBoveConTorneo(id){
let torneo=null;

if(id!=null){
torneo=adminState.tornei.find(x=>String(x.id)===String(id))||null;
}

if(!torneo){
torneo=getTorneoAdminCorrente()||
adminState.tornei[0]||
null;
}

if(!torneo){
alert("Seleziona prima un torneo");
return;
}

adminState.torneoSelezionato=torneo.id;
salvaAdminState();

window.open(creaUrlBove(torneo,false),"_blank");
}

async function creaNews(){
const titolo=document.getElementById("newsTitolo")?.value.trim()||"";
const testo=document.getElementById("newsTesto")?.value.trim()||"";
const immagine=document.getElementById("newsImmagine")?.value.trim()||"";

if(!titolo||!testo){
alert("Inserisci titolo e testo della news");
return;
}

adminState.news.unshift({
id:Date.now(),
titolo,
testo,
immagine,
data:new Date().toLocaleDateString("it-IT")
});

salvaAdminState();
caricaNewsAdmin();

["newsTitolo","newsTesto","newsImmagine"].forEach(id=>{
const e=document.getElementById(id);
if(e)e.value="";
});
}

function caricaNewsAdmin(){
const box=document.getElementById("listaNewsAdmin");
if(!box)return;

box.innerHTML=adminState.news.length
?adminState.news.map(n=>`
<div class="lista-item">
<b>${escapeHtml(n.titolo)}</b>
<small> · ${escapeHtml(n.data||"")}</small>
<p>${escapeHtml(n.testo)}</p>
${n.immagine?`<img src="${escapeHtml(n.immagine)}" style="max-width:100%;border-radius:8px" alt="">`:""}
<button class="btn" type="button" onclick="eliminaNews(${JSON.stringify(n.id)})">Elimina</button>
</div>
`).join("")
:'<p class="notice">Nessuna news pubblicata.</p>';
}

function eliminaNews(id){
adminState.news=adminState.news.filter(n=>Number(n.id)!==Number(id));
salvaAdminState();
caricaNewsAdmin();
}

async function salvaSponsor(){
const nome=document.getElementById("sponsorNome")?.value.trim()||"";
const immagine=document.getElementById("sponsorImmagine")?.value.trim()||"";
const video=document.getElementById("sponsorVideo")?.value.trim()||"";
const link=document.getElementById("sponsorLink")?.value.trim()||"";

if(!nome){
alert("Inserisci il nome dello sponsor");
return;
}

adminState.sponsor.push({
id:Date.now(),
nome,
immagine,
video,
link
});

salvaAdminState();
caricaSponsorAdmin();

["sponsorNome","sponsorImmagine","sponsorVideo","sponsorLink"].forEach(id=>{
const e=document.getElementById(id);
if(e)e.value="";
});
}

function caricaSponsorAdmin(){
const box=document.getElementById("listaSponsorAdmin");
if(!box)return;

box.innerHTML=adminState.sponsor.length
?adminState.sponsor.map(s=>`
<div class="lista-item">
<b>${escapeHtml(s.nome)}</b>
${s.link?`<br><a href="${escapeHtml(s.link)}" target="_blank" rel="noopener noreferrer">Apri link</a>`:""}
<button class="btn" type="button" onclick="eliminaSponsor(${JSON.stringify(s.id)})">Elimina</button>
</div>
`).join("")
:'<p class="notice">Nessun sponsor registrato.</p>';
}

function eliminaSponsor(id){
adminState.sponsor=adminState.sponsor.filter(s=>Number(s.id)!==Number(id));
salvaAdminState();
caricaSponsorAdmin();
}

async function creaIscrittiTest(){
const t=getTorneoAdminCorrente();

if(!t){
alert("Seleziona prima un torneo");
return;
}

const rows=[
{
torneo_id:t.id,
nome:"Test Giocatore 1",
email:"test1@padel.it",
telefono:"3331112233",
livello:"Intermedio",
stato:"approvato",
approvato:true
},
{
torneo_id:t.id,
nome:"Test Giocatore 2",
email:"test2@padel.it",
telefono:"3332223344",
livello:"Avanzato",
stato:"in attesa",
approvato:false
}
];

for(const r of rows){
const{error}=await sb.from("iscrizioni").insert(r);
if(error)console.error(error);
}

await caricaRichiesteIscrizione();
}

function renderAdmin(){
renderListaTornei();
renderGestioneTorneo();
renderPartecipanti();
renderCoppie();
caricaSponsorAdmin();
caricaNewsAdmin();
syncDashboard();
}

function syncDashboard(){
const active=adminState.tornei.filter(
t=>!String(t.stato||"").toLowerCase().includes("chius")
).length;

const iscrizioni=Array.isArray(window.iscrizioniTorneo)
?window.iscrizioniTorneo:[];

const pending=iscrizioni.filter(
g=>g?.stato!=="approvato"&&g?.approvato!==true
).length;

const approved=iscrizioni.filter(
g=>g?.stato==="approvato"||g?.approvato===true
).length;

const statTornei=document.getElementById("statTornei");
if(statTornei)statTornei.textContent=active;

const statIscritti=document.getElementById("statIscritti");
if(statIscritti)statIscritti.textContent=approved+pending;

const statApprovare=document.getElementById("statApprovare");
if(statApprovare)statApprovare.textContent=pending;

const statTabelloni=document.getElementById("statTabelloni");
if(statTabelloni)statTabelloni.textContent=adminState.tornei.length;

const email=document.getElementById("adminEmailMini");
if(email)email.textContent=adminState.adminEmail||"Amministratore";
}

function openWorkspace(section){
const w=document.getElementById("workspace");
if(w)w.open=true;

if(section){
document.getElementById(section)?.scrollIntoView({
behavior:"smooth",
block:"start"
});
}
}

function wireDashboard(){
const loginButton=document.getElementById("btnLoginAdmin");

if(loginButton){
loginButton.addEventListener("click",loginAdmin);
}

const aggiorna=document.getElementById("btnAggiorna");

if(aggiorna){
aggiorna.addEventListener("click",async()=>{
await caricaTorneiSupabase();
await caricaRichiesteIscrizione();
renderAdmin();
});
}

document.querySelectorAll("[data-action='create']").forEach(b=>{
b.addEventListener("click",()=>{
const panel=document.getElementById("configPanel");

if(panel){
panel.open=true;
panel.scrollIntoView({behavior:"smooth"});
}else{
window.openAdminPage?.("configurazione");
}
});
});

document.querySelectorAll("[data-nav]").forEach(b=>{
b.addEventListener("click",()=>{
const target=b.dataset.nav;

if(
target==="iscritti"||
target==="coppie"||
target==="gestione"
){
document.getElementById("gestioneTorneoAdmin")?.classList.remove("hidden");
}

openWorkspace(target);
});
});

document.getElementById("quickApprova")?.addEventListener(
"click",
()=>openWorkspace("richiesteIscrizione")
);

document.getElementById("quickCoppie")?.addEventListener(
"click",
()=>openWorkspace("creaCoppieBox")
);

document.getElementById("quickTabellone")?.addEventListener(
"click",
()=>apriBoveConTorneo(
adminState.torneoSelezionato||
adminState.tornei[0]?.id
)
);

document.getElementById("quickLink")?.addEventListener(
"click",
()=>{
generaLinkBove();
window.openAdminPage?.("link");
}
);

caricaAdminState();

if(adminState.adminLoggato){
document.getElementById("boxLoginAdmin")?.classList.add("hidden");
document.getElementById("areaAdmin")?.classList.remove("hidden");
}

aggiornaGiocatoriAdmin();

const posti=document.getElementById("adminPosti");

if(posti){
posti.addEventListener("change",aggiornaGiocatoriAdmin);
posti.addEventListener("input",aggiornaGiocatoriAdmin);
}

if(adminState.adminLoggato){
caricaTorneiSupabase();
caricaRichiesteIscrizione();
}else{
renderAdmin();
}
}

window.salvaAdminState=salvaAdminState;
window.caricaAdminState=caricaAdminState;
window.getTorneoAdminCorrente=getTorneoAdminCorrente;
window.aggiornaGiocatoriAdmin=aggiornaGiocatoriAdmin;
window.creaUrlBove=creaUrlBove;
window.caricaTorneiSupabase=caricaTorneiSupabase;
window.apriRegoleNuovoTorneo=apriRegoleNuovoTorneo;
window.creaNuovoTorneo=creaNuovoTorneo;
window.renderListaTornei=renderListaTornei;
window.escapeHtml=escapeHtml;
window.selezionaTorneoAdmin=selezionaTorneoAdmin;
window.apriRegoleTorneoAdmin=apriRegoleTorneoAdmin;
window.eliminaTorneoAdmin=eliminaTorneoAdmin;
window.pubblicaTorneo=pubblicaTorneo;
window.chiudiIscrizioniTorneo=chiudiIscrizioniTorneo;
window.caricaRichiesteIscrizione=caricaRichiesteIscrizione;
window.renderGestioneTorneo=renderGestioneTorneo;
window.selezionaGiocatoreAdmin=selezionaGiocatoreAdmin;
window.approvaGiocatore=approvaGiocatore;
window.rifiutaGiocatore=rifiutaGiocatore;
window.chiudiSchedaGiocatore=chiudiSchedaGiocatore;
window.renderPartecipanti=renderPartecipanti;
window.renderCoppie=renderCoppie;
window.inviaWhatsAppTutti=inviaWhatsAppTutti;
window.inviaWhatsAppApprovati=inviaWhatsAppApprovati;
window.generaLinkBove=generaLinkBove;
window.generaLinkPerId=generaLinkPerId;
window.copiaLinkBove=copiaLinkBove;
window.apriBoveConTorneo=apriBoveConTorneo;
window.creaNews=creaNews;
window.caricaNewsAdmin=caricaNewsAdmin;
window.eliminaNews=eliminaNews;
window.salvaSponsor=salvaSponsor;
window.caricaSponsorAdmin=caricaSponsorAdmin;
window.eliminaSponsor=eliminaSponsor;
window.creaIscrittiTest=creaIscrittiTest;
window.renderAdmin=renderAdmin;
window.syncDashboard=syncDashboard;
window.openWorkspace=openWorkspace;
window.wireDashboard=wireDashboard;

document.addEventListener("DOMContentLoaded",wireDashboard);

})();
