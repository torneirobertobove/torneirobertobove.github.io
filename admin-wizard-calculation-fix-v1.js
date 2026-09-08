/* ADMIN WIZARD CALCULATION FIX V1
 * Restore historical initial values for the Italian-style group phase.
 * Bove.html uses 4 teams per group and two courts per group; a 4-team
 * round-robin group has 6 matches, scheduled over 3 slots with 2 courts.
 * This patch changes only the displayed initial configuration values.
 */
(()=>{
'use strict';
function applyHistoricalDefaults(){
  const wizard=document.getElementById('adminFlowV18');
  if(!wizard)return;
  const formula=wizard.querySelector('.af-formula.sel')?.dataset.f;
  if(formula!=='italiana')return;
  const host=document.getElementById('afFormulaConfig');
  if(!host)return;
  const turni=host.querySelector('[data-cfg="turni"]');
  const campi=host.querySelector('[data-cfg="campi"]');
  if(turni)turni.value='3';
  if(campi)campi.value='2';
}
function bind(){
  document.addEventListener('click',()=>setTimeout(applyHistoricalDefaults,0),false);
  new MutationObserver(()=>setTimeout(applyHistoricalDefaults,0)).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();
