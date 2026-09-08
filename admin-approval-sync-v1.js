(()=>{'use strict';
async function sync(id,approved){
  const t=window.adminState?.tornei?.find(x=>String(x.id)===String(window.adminState?.torneoSelezionato));
  if(!t)return false;
  const r=await window.sb.from('iscrizioni').update({stato:approved?'approvato':'rifiutato',approvato:approved}).eq('id',Number(id)).select('*').single();
  if(r.error){alert('Errore aggiornamento iscrizione: '+r.error.message);return false}
  if(approved&&r.data){
    const cfg=t.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
    const old=Array.isArray(cfg.partecipanti)?[...cfg.partecipanti]:[];
    const key=p=>String(p?.id??p?.user_id??p?.email??p?.nome_giocatore??p?.nome??'');
    if(!old.some(p=>key(p)===key(r.data)))old.push(r.data);
    cfg.partecipanti=old;
    const u=await window.sb.from('tornei').update({configurazione:cfg}).eq('id',t.id);
    if(u.error){
      console.error(u.error);
      alert('Iscrizione approvata, ma sincronizzazione partecipante non riuscita: '+u.error.message);
      return false;
    }
    t.configurazione=cfg;
    t.partecipanti=old;
  }
  await window.caricaRichiesteIscrizione?.();
  window.renderCleanAdmin?.();
  return true;
}
document.addEventListener('click',e=>{
  const b=e.target?.closest?.('[data-ok],[data-no]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  sync(b.dataset.ok??b.dataset.no,b.hasAttribute('data-ok')).catch(err=>{console.error(err);alert('Operazione non riuscita.')});
},true);
window.approvaIscrizioneCentralizzata=sync;
})();
