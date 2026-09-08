/* ADMIN TOURNAMENT MANAGEMENT V1 */
(function(){
'use strict';
function call(name){if(typeof window[name]!=='function'){alert('Funzione non disponibile: '+name);return false;}return window[name].apply(window,Array.prototype.slice.call(arguments,1));}
function selected(){try{return JSON.parse(localStorage.getItem('padel_admin_state')||'{}').torneoSelezionato||null;}catch(e){return null;}}
function install(){
 const card=document.getElementById('gestioneTorneoAdmin');
 const detail=document.getElementById('dettaglioTorneoAdmin');
 if(!card||!detail||document.getElementById('azioniGestioneTorneo'))return;
 const bar=document.getElementById('azioniGestioneTorneo');
 bar.innerHTML='';
 const id=selected();
 if(!id)return;
 const mk=(text,cls,fn)=>{const b=document.createElement('button');b.className='btn '+(cls||'');b.textContent=text;b.onclick=fn;return b;};
 bar.appendChild(mk('📥 Carica iscritti','',()=>{call('caricaRichiesteIscrizione');if(typeof window.openAdminPage==='function')window.openAdminPage('iscritti');}));
 bar.appendChild(mk('🔒 Chiudi iscrizioni','danger',()=>call('chiudiIscrizioniAdmin')));
 bar.appendChild(mk('📢 Pubblica torneo','primary',()=>call('pubblicaTorneoAdmin')));
 bar.appendChild(mk('📋 Apri tabellone','',()=>{if(typeof window.openAdminPage==='function')window.openAdminPage('tabellone');call('renderTabellone');}));
 bar.appendChild(mk('🔗 Link pubblico','',()=>call('generaLinkAdmin',id)));
 bar.appendChild(mk('🌐 Apri torneo','',()=>call('apriBoveAdmin',id)));
 bar.appendChild(mk('🗑 Elimina','danger',()=>call('eliminaTorneoAdmin',id)));
}
function ensure(){
 const card=document.getElementById('gestioneTorneoAdmin');
 if(!card)return;
 let bar=document.getElementById('azioniGestioneTorneo');
 if(!bar){bar=document.createElement('div');bar.id='azioniGestioneTorneo';bar.className='toolbar';card.appendChild(bar);}
 install();
}
function start(){ensure();new MutationObserver(ensure).observe(document.body,{subtree:true,childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();