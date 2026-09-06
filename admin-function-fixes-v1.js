/* ADMIN FUNCTION FIXES V10 - restore real New Tournament flow */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const STORAGE_LINK='padel_admin_generated_link';
const FORMULE=[
 ['italiana','🇮🇹 Torneo all\'italiana'],
 ['gironiFinale','🏆 Gironi + Fase Finale'],
 ['eliminazione','⚔️ Eliminazione Diretta'],
 ['svizzero','🇨🇭 Torneo Svizzero'],
 ['americano','🎾 Americano Padel'],
 ['mexicano','🇲🇽 Mexicano Padel'],
 ['king','👑 King of the Court'],
 ['short','⏱ Short Format'],
 ['manuale','⚙️ Torneo Personalizzato']
];
function report(label,e){console.error('[ADMIN]',label,e);alert(label+': '+(e?.message||e?.error_description||String(e||'Operazione non riuscita')))}
function selectTournament(id){if(window.adminState){window.adminState.torneoSelezionato=id;try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState))}catch{}}}
function buildTournamentLink(id){return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id))}
function applyGeneratedLink(v){if(!v)return;const a=$('linkBoveGenerato'),b=$('linkBoveGeneratoMirror');if(a)a.value=v;if(b)b.value=v}
window.generaLinkPerId=function(id){if(id==null||String(id).trim()===''){alert('Seleziona prima un torneo');return false}selectTournament(id);const v=buildTournamentLink(id);try{localStorage.setItem(STORAGE_LINK,v)}catch{};if(typeof window.openAdminPage==='function')window.openAdminPage('links');applyGeneratedLink(v);return v};
window.generaLinkBove=function(){const id=window.adminState?.torneoSelezionato;return id==null?(alert('Seleziona prima un torneo'),false):window.generaLinkPerId(id)};
window.copiaLinkBove=async function(){let v=$('linkBoveGenerato')?.value||$('linkBoveGeneratoMirror')?.value||'';if(!v)try{v=localStorage.getItem(STORAGE_LINK)||''}catch{};if(!v){alert('Seleziona prima un torneo e genera il link.');return false}try{await navigator.clipboard?.writeText(v);alert('Link copiato negli appunti!');return true}catch{const i=$('linkBoveGenerato')||$('linkBoveGeneratoMirror');if(i){i.value=v;i.focus();i.select()}return false}};
window.apriBoveConTorneo=function(id){if(id==null||String(id).trim()===''){alert('Seleziona prima un torneo');return false}window.location.href='Bove.html?idTorneo='+encodeURIComponent(String(id));return true};
window.inviaWhatsAppTutti=function(){const msg=$('messaggioWhatsApp')?.value.trim();if(!msg){alert('Scrivi un messaggio');return false}window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(msg),'_blank','noopener');return true};
window.inviaWhatsAppApprovati=window.inviaWhatsAppTutti;
async function createPair(){if(typeof window.generaAccoppiamentiCasuali==='function')return window.generaAccoppiamentiCasuali();if(typeof window.generaCoppieAdmin==='function'&&window.generaCoppieAdmin!==window.creaCoppieAdmin)return window.generaCoppieAdmin();if(typeof window.generaCoppie==='function')return window.generaCoppie();if(typeof window.openAdminPage==='function')return window.openAdminPage('coppie');return false}
window.creaCoppieAdmin=window.creaCoppieAdmin||createPair;window.creaCoppia=window.creaCoppia||createPair;
function getConfigPage(){return document.querySelector('#admin-page-config, #org-page-config, #page-config, #page-configurazione, .admin-page[data-page="config"]')}
function getConfigHost(){const p=getConfigPage();return p?.querySelector('.page-inner,.org-content,.panel-content')||p||document.querySelector('#configTorneoAdmin')}
function ensureNewTournamentUI(){
 const host=getConfigHost();if(!host)return false;
 let box=$('adminNewTournamentFlow');
 if(box&&box.isConnected)return true;
 box=document.createElement('div');box.id='adminNewTournamentFlow';box.className='admin-card';
 box.style.cssText='margin:0 0 18px;padding:20px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(20,25,31,.82);';
 box.innerHTML=`<h2 style="margin:0 0 6px">🏆 Nuovo torneo</h2><p style="margin:0 0 18px;opacity:.72;font-size:13px">Dati torneo → numero squadre → giocatori calcolati → scelta formula → configurazione formula.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label>Nome torneo</label><input id="adminNomeTorneo" type="text" placeholder="Nome torneo"></div><div><label>Data</label><input id="adminDataTorneo" type="date"></div><div><label>Numero squadre</label><select id="adminPosti"><option value="8">8</option><option value="12">12</option><option value="16">16</option><option value="20">20</option><option value="24">24</option></select></div><div><label>Giocatori calcolati</label><input id="adminGiocatori" type="number" readonly></div></div><div style="margin-top:12px"><label>Formula torneo</label><select id="adminFormulaTorneo" style="width:100%"></select></div><div style="margin-top:12px"><label>Descrizione</label><textarea id="adminDescrizione" rows="3" placeholder="Descrizione, regole, note..."></textarea></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button type="button" class="btn primary" id="adminConfigFormulaBtn">⚙️ Configura formula in Bove</button><button type="button" class="btn" id="adminCreaTorneoBtn">＋ Crea torneo</button></div>`;
 host.prepend(box);
 const sel=$('adminFormulaTorneo');FORMULE.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o)});
 const posti=$('adminPosti'),gioc=$('adminGiocatori');const update=()=>{if(gioc)gioc.value=(Number(posti?.value)||8)*2};posti?.addEventListener('change',update);update();
 $('adminCreaTorneoBtn').addEventListener('click',()=>window.creaNuovoTorneo&&window.creaNuovoTorneo());
 $('adminConfigFormulaBtn').addEventListener('click',()=>window.configuraFormulaNuovoTorneo&&window.configuraFormulaNuovoTorneo());
 return true;
}
window.configuraFormulaNuovoTorneo=function(){
 const nome=$('adminNomeTorneo')?.value.trim()||'Nuovo Torneo',data=$('adminDataTorneo')?.value||'',posti=Number($('adminPosti')?.value)||8,descrizione=$('adminDescrizione')?.value.trim()||'',formula=$('adminFormulaTorneo')?.value||'italiana';
 if(!data){alert('Inserisci la data del torneo.');return false}
 const id='temp_'+Date.now(),numeroGironi=Math.ceil(posti/4);
 const t={id,nome,data,posti,descrizione,formula,stato:'bozza',iscritti:[],coppie:[],partecipanti:[],configurazione:{coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:formula,formatoTorneo:formula,numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:'tuttiControTutti',formulaFinale:'eliminazioneDiretta',w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:Math.max(2,numeroGironi*2),usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:'20:00',duration:30,crit1:'df',crit2:'gf',crit3:'gs',mostraQuarti:true}}};
 try{localStorage.setItem('padel_admin_new_torneo',JSON.stringify(t))}catch{}
 const payload=encodeURIComponent(JSON.stringify(t));window.open('Bove.html?torneo='+payload+'&apriRegole=true','_blank','noopener');return true;
};
window.creaNuovoTorneo=async function(){
 const st=window.adminState;if(!st){alert('Stato amministratore non disponibile.');return false}
 const nome=$('adminNomeTorneo')?.value.trim()||'Nuovo Torneo',data=$('adminDataTorneo')?.value||'',posti=Number($('adminPosti')?.value)||8,descrizione=$('adminDescrizione')?.value.trim()||'',formula=$('adminFormulaTorneo')?.value||'italiana';
 if(!data){alert('Inserisci la data del torneo.');return false}
 const id=Date.now(),numeroGironi=Math.ceil(posti/4);const config={coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:formula,formatoTorneo:formula,numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:'tuttiControTutti',formulaFinale:'eliminazioneDiretta',w:3,d:1,l:0,qualificatePerGirone:2,numeroQualificateFinali:Math.max(2,numeroGironi*2),usaQuarti:true,usaSemifinali:true,usaFinale:true,killerPoint:false,rigori:true,tempoSupplementare:true,garaAndataRitorno:false,start:'20:00',duration:30,crit1:'df',crit2:'gf',crit3:'gs',mostraQuarti:true}};
 const t={id,nome,data,posti,descrizione,formula,stato:'bozza',iscritti:[],coppie:[],partecipanti:[],configurazione:config};
 const old=Array.isArray(st.tornei)?st.tornei.slice():[];const sel=st.torneoSelezionato;st.tornei=st.tornei.filter(x=>!String(x.id).startsWith('temp_'));st.tornei.push(t);st.torneoSelezionato=id;window.adminState=st;
 try{localStorage.setItem('padel_admin_state',JSON.stringify(st));const {error}=await window.sb.from('tornei').insert({id,nome,data,data_torneo:data,ora_inizio:'20:00',posti,descrizione,formula,stato:'bozza',pubblicato:false,iscrizioni_chiuse:false,configurazione:config});if(error)throw error;window.renderAdmin?.();window.__adminDesktopRender?.();const payload=encodeURIComponent(JSON.stringify(t));window.open('Bove.html?torneo='+payload+'&apriRegole=true','_blank','noopener');return true}catch(e){st.tornei=old;st.torneoSelezionato=sel;window.adminState=st;report('Creazione torneo non riuscita',e);return false}
};
window.apriRegoleNuovoTorneo=function(){
 if(typeof window.openAdminPage==='function')window.openAdminPage('config');
 setTimeout(ensureNewTournamentUI,30);setTimeout(ensureNewTournamentUI,200);setTimeout(ensureNewTournamentUI,700);return true;
};
function compatibility(){const area=$('areaAdmin');if(!area)return;area.querySelectorAll('button').forEach(b=>{const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(text.includes('nuovo torneo')||text.includes('crea torneo'))b.onclick=()=>window.apriRegoleNuovoTorneo();});applyGeneratedLink(localStorage.getItem(STORAGE_LINK)||'')}
function boot(){compatibility();setTimeout(compatibility,300);setTimeout(compatibility,1000);setTimeout(ensureNewTournamentUI,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
