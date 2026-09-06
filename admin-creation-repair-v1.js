/* ADMIN CREATION REPAIR V3 - harden live tournament creation wizard */
(()=>{
'use strict';
const KEY='adminCreationRepairV3';
if(window[KEY])return;
window[KEY]=true;
const q=s=>document.querySelector(s);
const state={cfg:{}};
function remember(){
 const box=q('#afFormulaConfig');
 if(!box)return;
 box.querySelectorAll('[data-cfg]').forEach(el=>{state.cfg[el.dataset.cfg]=el.value;});
}
function restore(){
 const box=q('#afFormulaConfig');
 if(!box)return;
 box.querySelectorAll('[data-cfg]').forEach(el=>{
  if(Object.prototype.hasOwnProperty.call(state.cfg,el.dataset.cfg))el.value=state.cfg[el.dataset.cfg];
 });
}
function removeLegacy(){
 ['adminFlowV15','adminFlowV16','adminFlowV17'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
}
function readCfg(){
 remember();
 const out={};
 Object.keys(state.cfg).forEach(k=>{const v=state.cfg[k];out[k]=/^(turni|campi|numeroGironi|squadrePerGirone|puntiPartita|durata)$/.test(k)?(Number(v)||0):v;});
 return out;
}
function formula(){
 const b=q('#adminFlowV18 .af-formula.sel');
 return b?String(b.dataset.f||''):'';
}
function formulaName(){
 const b=q('#adminFlowV18 .af-formula.sel');
 return b?(b.textContent||'').replace(/\s+/g,' ').trim():'';
}
function replaceCreateButton(){
 const live=q('#adminFlowV18');
 if(!live)return;
 const status=q('#afCreateStatus');
 const buttons=[...live.querySelectorAll('#afNext')];
 if(!buttons.length)return;
 const b=buttons[0];
 const active=live.querySelector('.af-step.active');
 if(!active||active.dataset.s!=='7')return;
 if(b.dataset.creationV3==='1')return;
 const clone=b.cloneNode(true);
 clone.dataset.creationV3='1';
 clone.type='button';
 clone.textContent='Crea torneo';
 b.replaceWith(clone);
 clone.addEventListener('click',save,false);
 if(status)status.textContent='Pronto per la creazione.';
}
async function save(e){
 e.preventDefault();e.stopPropagation();
 const live=q('#adminFlowV18');
 if(!live)return;
 const btn=e.currentTarget;
 const status=q('#afCreateStatus');
 const nome=(q('#afNome')?.value||'').trim();
 const data=q('#afData')?.value||'';
 const posti=Number(q('#afPosti')?.value)||0;
 const giocatori=posti*2;
 const sel=formula();
 const cfg=readCfg();
 if(!nome){if(status)status.textContent='Errore: inserisci il nome del torneo.';return;}
 if(!data){if(status)status.textContent='Errore: inserisci la data del torneo.';return;}
 if(!posti){if(status)status.textContent='Errore: seleziona il numero di squadre.';return;}
 if(!sel){if(status)status.textContent='Errore: seleziona una formula.';return;}
 if(btn)btn.disabled=true;
 if(status)status.textContent='Salvataggio torneo...';
 try{
  const client=window.sb||window.supabaseClient;
  if(!client||typeof client.from!=='function')throw new Error('Client Supabase non disponibile');
  const id=Date.now();
  const numeroGironi=Number(cfg.numeroGironi)||0;
  const squadraPerGirone=Number(cfg.squadrePerGirone)||4;
  const rules={
   locked:false,
   tipoTorneo:'',
   formatoTorneo:'',
   numeroSquadre:posti,
   numeroGiocatori:giocatori,
   numeroGironi:numeroGironi,
   squadrePerGirone:squadraPerGirone,
   formulaGironi:'',
   formulaFinale:cfg.formulaFinale||'',
   formulaScelta:sel,
   formulaConfig:cfg
  };
  const record={
   id:id,
   nome:nome,
   data:data,
   data_torneo:data,
   posti:posti,
   descrizione:q('#afDescrizione')?.value||'',
   formula:sel,
   stato:'bozza',
   pubblicato:false,
   iscrizioni_chiuse:false,
   configurazione:{
    nomeTorneo:nome,
    dataTorneo:data,
    coppie:[],
    partecipanti:[],
    rules:rules
   }
  };
  const result=await client.from('tornei').insert(record).select().single();
  if(result&&result.error)throw result.error;
  if(status)status.textContent='Torneo creato correttamente.';
  try{
   if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();
  }catch(refreshErr){console.warn('[CREATION REPAIR V3] refresh',refreshErr);}
  setTimeout(()=>{if(live&&live.parentNode)live.remove();},350);
 }catch(err){
  console.error('[CREATION REPAIR V3] save',err);
  if(status)status.textContent='Errore creazione: '+(err?.message||err);
  if(btn)btn.disabled=false;
 }
}
function watch(){
 const box=q('#adminFlowV18');
 if(!box)return;
 if(box.dataset.creationRepair==='3')return;
 box.dataset.creationRepair='3';
 box.addEventListener('input',remember,true);
 box.addEventListener('change',remember,true);
 const mo=new MutationObserver(()=>{restore();replaceCreateButton();});
 mo.observe(box,{childList:true,subtree:true});
 restore();
 replaceCreateButton();
}
function ensure(){
 removeLegacy();
 const live=q('#adminFlowV18');
 if(live)watch();
}
function open(e){
 const b=e.target&&e.target.closest?e.target.closest('[data-action="create"],button,[role="button"]'):null;
 if(!b)return;
 if(b.closest('#adminFlowV18'))return;
 const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
 if(text.indexOf('nuovo torneo')<0&&text.indexOf('crea torneo')<0)return;
 if(typeof window.apriWizardTorneo!=='function')return;
 e.preventDefault();e.stopImmediatePropagation();
 removeLegacy();
 try{window.apriWizardTorneo();}catch(err){console.error('[CREATION REPAIR V3]',err);}
 setTimeout(ensure,0);
}
document.addEventListener('click',open,true);
const root=new MutationObserver(ensure);
root.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
window.addEventListener('load',ensure);
})();