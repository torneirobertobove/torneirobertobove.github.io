/* ADMIN CREATION REPAIR V1 - harden live tournament creation wizard */
(()=>{
'use strict';
const KEY='adminCreationRepairV1';
if(window[KEY])return;
window[KEY]=true;
const q=s=>document.querySelector(s);
const state={formula:'',cfg:{}};
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
function watch(){
 const box=q('#adminFlowV18');
 if(!box)return;
 box.addEventListener('input',remember,true);
 box.addEventListener('change',remember,true);
 const mo=new MutationObserver(()=>restore());
 mo.observe(box,{childList:true,subtree:true});
 restore();
}
function removeLegacy(){
 ['adminFlowV15','adminFlowV16','adminFlowV17'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
}
function ensure(){
 removeLegacy();
 const live=q('#adminFlowV18');
 if(live&&!live.dataset.creationRepair){live.dataset.creationRepair='1';watch();}
}
function open(e){
 const b=e.target&&e.target.closest?e.target.closest('[data-action="create"],button,[role="button"]'):null;
 if(!b)return;
 const text=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
 if(text.indexOf('nuovo torneo')<0&&text.indexOf('crea torneo')<0)return;
 if(typeof window.apriWizardTorneo!=='function')return;
 e.preventDefault();e.stopImmediatePropagation();
 removeLegacy();
 try{window.apriWizardTorneo();}catch(err){console.error('[CREATION REPAIR]',err);}
 setTimeout(ensure,0);
}
document.addEventListener('click',open,true);
const root=new MutationObserver(ensure);
root.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
window.addEventListener('load',ensure);
})();