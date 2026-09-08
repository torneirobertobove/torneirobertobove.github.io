/* ADMIN WIZARD CALCULATION FIX V2
 * Apply only historically supported automatic defaults in the tournament wizard.
 * No layout, tournament engine, participants, pairs, bracket or calendar changes.
 */
(()=>{
'use strict';
function applyHistoricalDefaults(){
  const wizard=document.getElementById('adminFlowV18');
  if(!wizard)return;
  const formula=wizard.querySelector('.af-formula.sel')?.dataset.f;
  if(!formula)return;
  const host=document.getElementById('afFormulaConfig');
  if(!host)return;
  const posti=Number(document.getElementById('afPosti')?.value)||8;
  const gruppi=Math.max(1,Math.ceil(posti/4));
  const set=(key,value)=>{
    const el=host.querySelector('[data-cfg="'+key+'"]');
    if(el)el.value=String(value);
  };
  switch(formula){
    case 'italiana':
      // Historical engine: 4 teams/group, 6 matches/group, 3 slots, 2 courts/group.
      set('turni',3);
      set('campi',gruppi*2);
      break;
    case 'gironiFinale':
      // Historical group structure: 4 teams per group.
      set('numeroGironi',gruppi);
      set('squadrePerGirone',4);
      break;
    case 'eliminazione':
      // KO rounds are determined by the number of teams.
      set('turni',Math.ceil(Math.log2(posti)));
      break;
    case 'svizzero':
      // Historical engine uses 5 Swiss rounds.
      set('turni',5);
      break;
    default:
      // Americano/Mexicano/King/Short/Manuale do not get invented fixed values here.
      // Their existing configurable defaults remain untouched until their historical
      // scheduling rule is explicitly recovered.
      break;
  }
}
function bind(){
  document.addEventListener('click',()=>setTimeout(applyHistoricalDefaults,0),false);
  new MutationObserver(()=>setTimeout(applyHistoricalDefaults,0)).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();
