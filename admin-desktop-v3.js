/* Admin desktop: agganci compatibili con funzioni originali */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const fn=n=>typeof window[n]==='function'?window[n]:null;
const call=(names,...args)=>{for(const n of names){const f=fn(n);if(f)return f(...args)}};
function id(){return window.adminState?.torneoSelezionato??window.getTorneoAdminCorrente?.()?.id??null}
function selectedOrFirst(){return id()??window.adminState?.tornei?.[0]?.id??null}
function open(id){const e=$(id);if(!e)return false;e.classList.remove('hidden');if('open'in e)e.open=true;e.scrollIntoView?.({behavior:'smooth',block:'start'});return true}
function wire(root=document){root.querySelectorAll('button').forEach(b=>{if(b.dataset.adminHook)return;b.dataset.adminHook='1';b.addEventListener('click',e=>{if(!b.closest('#areaAdmin'))return;const t=(b.innerText||'').trim();const oc=b.getAttribute('onclick');if(oc)return; e.preventDefault();e.stopPropagation();
if(b.id==='btnAggiorna'||t==='↻ Aggiorna')return Promise.resolve(call(['caricaTorneiSupabase'])).then(()=>call(['caricaRichiesteIscrizione'])).then(()=>call(['renderAdmin']));
if(b.dataset.action==='create'||/Nuovo torneo/.test(t))return open('configPanel');
if(t==='＋ Crea torneo'||t==='Crea torneo')return call(['creaNuovoTorneo']);
if(b.id==='quickApprova'||/Approva iscritti/.test(t))return open('richiesteIscrizione')||open('gestioneTorneoAdmin');
if(b.id==='quickCoppie'||/^🔀\s*Accoppiamenti/.test(t))return open('creaCoppieBox')||open('gestioneTorneoAdmin');
if(b.id==='quickTabellone'||/Apri tabellone/.test(t))return call(['apriBoveConTorneo','apriTabellone'],selectedOrFirst());
if(b.id==='quickLink'||/Copia link/.test(t))return call(['generaLinkBove','generaLinkPerId'],selectedOrFirst());
if(/Regole/.test(t))return call(['apriRegoleNuovoTorneo','apriRegoleTorneoAdmin'],selectedOrFirst());
if(t==='📢 Pubblica'||t==='Pubblica')return call(['pubblicaTorneo']);
if(/Chiudi iscrizioni/.test(t))return call(['chiudiIscrizioniTorneo']);
if(/Aggiorna iscritti/.test(t))return call(['caricaRichiesteIscrizione']);
if(/Iscritti test/.test(t))return call(['creaIscrittiTest']);
if(/Crea coppia/.test(t))return call(['creaCoppiaAdmin']);
if(/Approva/.test(t))return call(['approvaGiocatore']);
if(/Rifiuta/.test(t))return call(['rifiutaGiocatore']);
});});}
function boot(){wire();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)wire(n)}))).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
document.addEventListener('submit',e=>{if(e.target.closest?.('#areaAdmin'))e.preventDefault()},true);
})();