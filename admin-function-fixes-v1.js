/* ADMIN FLOW FIX V18 - activate complete tournament creation flow */
(()=>{
'use strict';
const FORMULE=[
 ['italiana',"🇮🇹 Torneo all'italiana"],
 ['gironiFinale','🏆 Gironi + Fase Finale'],
 ['eliminazione','⚔️ Eliminazione Diretta'],
 ['svizzero','🇨🇭 Torneo Svizzero'],
 ['americano','🎾 Americano Padel'],
 ['mexicano','🇲🇽 Mexicano Padel'],
 ['king','👑 King of the Court'],
 ['short','⏱ Short Format'],
 ['manuale','⚙️ Torneo Personalizzato']
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
function stop(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
function css(){
 if($('adminFlowV18Style'))return;
 const s=document.createElement('style');s.id='adminFlowV18Style';
 s.textContent=`
 #adminFlowV18{position:fixed;inset:0;background:rgba(5,8,12,.78);backdrop-filter:blur(8px);z-index:99999;display:grid;place-items:center;padding:24px}
 #adminFlowV18 .af-card{width:min(800px,96vw);max-height:92vh;overflow:auto;background:#151b22;color:#eef2f6;border:1px solid rgba(255,255,255,.15);border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.55);padding:24px}
 #adminFlowV18 .af-muted{color:#9ca8b5;font-size:13px;line-height:1.5}
 #adminFlowV18 .af-current{margin:12px 0 18px;padding:10px 14px;border-radius:10px;background:#0b1016;border:1px solid rgba(77,163,255,.25);color:#8ec7ff;font-weight:700}
 #adminFlowV18 .af-step{display:none}.af-step.active{display:block!important}
 #adminFlowV18 .af-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 #adminFlowV18 label{display:block;color:#9ca8b5;font-size:11px;margin:0 0 6px}
 #adminFlowV18 input,#adminFlowV18 select,#adminFlowV18 textarea{width:100%;box-sizing:border-box;background:#0b1016;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:11px}
 #adminFlowV18 input[readonly]{opacity:.9}
 #adminFlowV18 textarea{min-height:90px;resize:vertical}
 #adminFlowV18 .af-formulas{display:grid;grid-template-columns:1fr 1fr;gap:9px}
 #adminFlowV18 .af-formula{padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#0d131a;cursor:pointer;text-align:left;color:#eef2f6;font-weight:700}
 #adminFlowV18 .af-formula.sel{border-color:#4da3ff;box-shadow:0 0 0 2px rgba(77,163,255,.18)}
 #adminFlowV18 .af-config{margin-top:14px;padding:14px;background:#0b1016;border:1px solid rgba(255,255,255,.1);border-radius:10px}
 #adminFlowV18 .af-config-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 #adminFlowV18 .af-actions{display:flex;justify-content:space-between;gap:8px;margin-top:22px;border-top:1px solid rgba(255,255,255,.09);padding-top:16px}
 #adminFlowV18 button{cursor:pointer;border:1px solid rgba(255,255,255,.14);background:#252d37;color:#fff;border-radius:9px;padding:10px 14px;font-weight:700}
 #adminFlowV18 .primary{background:#4da3ff;color:#07111a;border-color:#4da3ff}
 #adminFlowV18 .af-badge{display:inline-block;padding:5px 9px;border-radius:20px;background:rgba(77,163,255,.13);color:#8ec7ff;font-size:11px;margin-bottom:12px}
 #adminFlowV18 .af-summary{background:#0b1016;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px;line-height:1.7}
 #adminFlowV18 .af-number{max-width:260px}
 #adminFlowV18 .af-result{font-size:22px;font-weight:800;margin:8px 0 4px}
 @media(max-width:650px){#adminFlowV18 .af-grid,#adminFlowV18 .af-formulas,#adminFlowV18 .af-config-grid{grid-template-columns:1fr}}
 `;
 document.head.appendChild(s)
}
const CONFIG={
 italiana:{title:"Torneo all'italiana",desc:'Tutti contro tutti. Il numero di turni e la gestione dei campi vengono configurati prima della creazione.',fields:[['turni','Turni','number',1,20,1],['campi','Campi','number',1,20,1]]},
 gironiFinale:{title:'Gironi + Fase Finale',desc:'Fase a gironi seguita dalla fase finale. I parametri vengono salvati nella configurazione del torneo.',fields:[['numeroGironi','Numero gironi','number',1,20,1],['squadrePerGirone','Squadre per girone','number',2,12,1],['formulaFinale','Fase finale','select',['eliminazione','Eliminazione diretta'],['playoff','Playoff']]]},
 eliminazione:{title:'Eliminazione Diretta',desc:'Tabellone a eliminazione diretta con eventuale gestione delle posizioni.',fields:[['turni','Turni','number',1,10,1],['ripescaggi','Ripescaggi','select',['no','No'],['si','Sì']]]},
 svizzero:{title:'Torneo Svizzero',desc:'Turni svizzeri con numero di turni definito in fase di creazione.',fields:[['turni','Turni svizzeri','number',1,20,1],['criterio','Criterio','select',['punti','Punti'],['ranking','Ranking']]]},
 americano:{title:'Americano Padel',desc:'Formula individuale a coppie variabili. Le partite e i punti vengono gestiti dalla formula.',fields:[['turni','Turni','number',1,20,1],['puntiPartita','Punti partita','number',1,100,1]]},
 mexicano:{title:'Mexicano Padel',desc:'Formula con accoppiamenti determinati in base alla classifica aggiornata dopo ogni turno.',fields:[['turni','Turni','number',1,20,1],['puntiPartita','Punti partita','number',1,100,1]]},
 king:{title:'King of the Court',desc:'Rotazione dei giocatori sui campi con classifica aggiornata turno per turno.',fields:[['turni','Turni','number',1,20,1],['campi','Campi','number',1,20,1]]},
 short:{title:'Short Format',desc:'Formato rapido con durata ridotta e numero di turni configurabile.',fields:[['turni','Turni','number',1,20,1],['durata','Durata partita (min)','number',5,120,5]]},
 manuale:{title:'Torneo Personalizzato',desc:'Configurazione libera dei parametri principali del torneo.',fields:[['turni','Turni','number',1,50,1],['campi','Campi','number',1,50,1],['noteFormula','Note','text']]} 
};
function defaultConfig(key){
 const c=CONFIG[key]||CONFIG.manuale;
 const out={formula:key};
 (c.fields||[]).forEach(f=>{out[f[0]]=f[2]==='number'?f[3]:(f[2]==='select'?f[3][0]: '')});
 return out;
}
function renderFormulaConfig(key,host){
 const c=CONFIG[key]||CONFIG.manuale;
 host.innerHTML=`<div class="af-config"><b>${esc(c.title)}</b><p class="af-muted">${esc(c.desc)}</p><div class="af-config-grid">${(c.fields||[]).map(f=>{
   if(f[2]==='select')return `<div><label>${esc(f[1])}</label><select data-cfg="${esc(f[0])}">${f.slice(3).map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select></div>`;
   return `<div><label>${esc(f[1])}</label><input data-cfg="${esc(f[0])}" type="${f[2]==='number'?'number':'text'}"${f[2]==='number'?` min="${f[3]}" max="${f[4]}" step="${f[5]||1}" value="${f[3]}"`:''}></div>`;
 }).join('')}</div></div>`;
}
function readFormulaConfig(host,key){
 const out=defaultConfig(key);
 host.querySelectorAll('[data-cfg]').forEach(el=>{out[el.dataset.cfg]=el.type==='number'?(Number(el.value)||0):el.value});
 return out;
}
function openWizard(){
 if($('adminFlowV18'))$('adminFlowV18').remove();
 css();
 let selFormula='';
 let formulaConfig={};
 const ov=document.createElement('div');ov.id='adminFlowV18';
 ov.innerHTML=`<div class="af-card">
 <h2 id="afTitle">🏆 Nuovo torneo</h2>
 <div class="af-muted" style="margin-bottom:8px">Dati torneo → numero squadre → giocatori calcolati → scelta formula → configurazione formula → riepilogo → creazione</div>
 <div class="af-current">Torneo: <span id="afCurrentName">Nuovo torneo</span></div>
 <div class="af-step active" data-s="1"><span class="af-badge">1 · Dati torneo</span><div class="af-grid"><div><label>Nome torneo</label><input id="afNome" placeholder="Nome torneo"></div><div><label>Data</label><input id="afData" type="date"></div></div><div style="margin-top:12px"><label>Descrizione</label><textarea id="afDescrizione" placeholder="Descrizione del torneo"></textarea></div></div>
 <div class="af-step" data-s="2"><span class="af-badge">2 · Numero squadre</span><p class="af-muted">Torneo: <b id="afStep2Name"></b></p><div class="af-number"><label>Numero squadre</label><select id="afPosti"><option value="8">8</option><option value="12">12</option><option value="16">16</option><option value="20">20</option><option value="24">24</option></select></div><p class="af-muted" style="margin-top:12px">Il valore scelto viene usato per il calcolo automatico dei giocatori.</p></div>
 <div class="af-step" data-s="3"><span class="af-badge">3 · Giocatori calcolati</span><div class="af-summary"><b id="afStep3Name"></b><div class="af-result"><span id="afGiocOut">0</span> giocatori necessari</div><div>Numero squadre: <b id="afSquadreOut">0</b></div><p class="af-muted">Calcolo automatico: 2 giocatori per squadra. Il valore non è modificabile manualmente.</p></div></div>
 <div class="af-step" data-s="4"><span class="af-badge">4 · Scelta formula</span><p class="af-muted">Torneo: <b id="afStep4Name"></b></p><div class="af-formulas">${FORMULE.map(([v,t])=>`<button type="button" class="af-formula" data-f="${v}">${t}</button>`).join('')}</div></div>
 <div class="af-step" data-s="5"><span class="af-badge">5 · Configurazione formula</span><div class="af-summary"><b id="afStep5Name"></b><br><b id="afFormulaName">Nessuna formula</b><div id="afFormulaConfig"></div></div></div>
 <div class="af-step" data-s="6"><span class="af-badge">6 · Riepilogo</span><div id="afSummary" class="af-summary"></div></div>
 <div class="af-step" data-s="7"><span class="af-badge">7 · Creazione</span><div class="af-summary"><b id="afStep7Name"></b><p>Controlla i dati e premi <b>Crea torneo</b>. Il torneo verrà salvato come bozza nell'archivio Admin.</p><div id="afCreateStatus" class="af-muted"></div></div></div>
 <div class="af-actions"><button type="button" id="afBack">Indietro</button><div><button type="button" id="afCancel">Annulla</button> <button type="button" class="primary" id="afNext">Avanti</button></div></div>
 </div>`;
 document.body.appendChild(ov);
 const posti=$('afPosti'),nomeInput=$('afNome'),steps=[...ov.querySelectorAll('.af-step')];
 const gioc=document.createElement('input');gioc.id='afGiocatori';gioc.type='hidden';ov.appendChild(gioc);
 let step=1;
 const updateName=()=>{const n=nomeInput.value.trim()||'Nuovo torneo';$('afCurrentName').textContent=n;$('afTitle').textContent='🏆 '+n;$('afStep2Name').textContent=n;$('afStep3Name').textContent=n;$('afStep4Name').textContent=n;$('afStep5Name').textContent=n;$('afStep7Name').textContent=n};
 const updatePlayers=()=>{const n=Number(posti.value)||0;const g=n*2;gioc.value=g;$('afSquadreOut').textContent=n;$('afGiocOut').textContent=g};
 const show=n=>{
  step=Math.max(1,Math.min(7,n));updateName();updatePlayers();
  steps.forEach(x=>x.classList.toggle('active',Number(x.dataset.s)===step));
  $('afBack').style.visibility=step===1?'hidden':'visible';
  $('afNext').textContent=step===7?'Crea torneo':'Avanti';
  if(step===5 && selFormula){$('afFormulaName').textContent=(FORMULE.find(x=>x[0]===selFormula)||[])[1]||selFormula;renderFormulaConfig(selFormula,$('afFormulaConfig'));}
  if(step===6){const cfg=formulaConfig;const cfgText=Object.keys(cfg).filter(k=>k!=='formula').map(k=>`${esc(k)}: ${esc(cfg[k])}`).join('<br>');$('afSummary').innerHTML=`<b>${esc(nomeInput.value.trim()||'Nuovo torneo')}</b><br>Data: ${esc($('afData').value||'-')}<br>Squadre: ${esc(posti.value)}<br>Giocatori: ${esc(gioc.value)}<br>Formula: ${esc((FORMULE.find(x=>x[0]===selFormula)||[])[1]||'nessuna')}<br><br><b>Configurazione formula</b><br>${cfgText||'Nessuna configurazione'}`;}
 };
 nomeInput.addEventListener('input',updateName);posti.addEventListener('change',updatePlayers);
 ov.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{ov.querySelectorAll('[data-f]').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');selFormula=b.dataset.f;formulaConfig=defaultConfig(selFormula);$('afFormulaName').textContent=(FORMULE.find(x=>x[0]===selFormula)||[])[1]||selFormula;}));
 $('afBack').onclick=()=>show(step-1);$('afCancel').onclick=()=>ov.remove();
 $('afNext').onclick=async()=>{
  if(step===1){if(!nomeInput.value.trim()){alert('Inserisci il nome del torneo.');return}if(!$('afData').value){alert('Inserisci la data del torneo.');return}}
  if(step===2&&!Number(posti.value)){alert('Seleziona il numero di squadre.');return}
  if(step===4&&!selFormula){alert('Seleziona una formula.');return}
  if(step===5){if(!selFormula){alert('Seleziona una formula.');return}formulaConfig=readFormulaConfig($('afFormulaConfig'),selFormula)}
  if(step<7){show(step+1);return}
  $('afNext').disabled=true;$('afCreateStatus').textContent='Salvataggio in corso…';
  try{await create({selFormula,formulaConfig,close:()=>{ov.remove()}})}catch(e){$('afCreateStatus').textContent='';$('afNext').disabled=false;alert('Creazione torneo non riuscita: '+(e.message||e))}
 };
 updateName();updatePlayers();show(1)
}
async function create({selFormula,formulaConfig,close}){
 const nome=$('afNome').value.trim(),data=$('afData').value,posti=Number($('afPosti').value)||8,descrizione=$('afDescrizione').value.trim(),id=Date.now(),numeroGironi=Math.max(1,Math.ceil(posti/4));
 const configurazione={nomeTorneo:nome,dataTorneo:data,coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:'',formatoTorneo:'',numeroSquadre:posti,numeroGiocatori:posti*2,numeroGironi,squadrePerGirone:4,formulaGironi:'',formulaFinale:'',formulaScelta:selFormula||'',formulaConfig:formulaConfig||{}}};
 try{
  if(!window.sb)throw Error('Supabase non disponibile');
  const r=await window.sb.from('tornei').upsert({id,nome,data,data_torneo:data,posti,descrizione,formula:selFormula||null,stato:'bozza',pubblicato:false,iscrizioni_chiuse:false,configurazione},{onConflict:'id'});
  if(r.error)throw r.error;
  try{localStorage.setItem('torneoState',JSON.stringify({idTorneo:id,nomeTorneo:nome,dataTorneo:data,formato:posti,partecipanti:[],coppie:[],rules:{...configurazione.rules}}))}catch{}
  if(typeof close==='function')close();
  await ritornaDashboard(id)
 }catch(e){console.error('[ADMIN FLOW V18]',e);throw e}
}
async function ritornaDashboard(id){try{if(typeof window.openAdminPage==='function')window.openAdminPage('dashboard');if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();if(typeof window.selezionaTorneoAdmin==='function')await window.selezionaTorneoAdmin(id);else if(typeof window.renderAdmin==='function')window.renderAdmin();const row=document.querySelector('#listaTorneiAdmin .tournament-row.selected');if(row)row.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){console.error('[ADMIN FLOW V18] dashboard refresh',e);if(typeof window.openAdminPage==='function')window.openAdminPage('dashboard')}}
function bind(){
 if(document.documentElement.dataset.adminCreateBound==='v18')return;document.documentElement.dataset.adminCreateBound='v18';
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return;const area=document.getElementById('areaAdmin');if(area&&!area.contains(b))return;const txt=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();const createButton=txt.includes('nuovo torneo')||txt.includes('＋ crea torneo')||txt.includes('+ crea torneo');if(createButton){stop(e);openWizard()}},true)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
window.apriWizardTorneo=openWizard;
})();
/* Deploy workflow compatibility marker */