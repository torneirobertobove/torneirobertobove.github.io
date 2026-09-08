/* TORNEI PUBLICI V3 - APERTI IMMEDIATI / ARCHIVIO CHIUSI */
(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
function esc(v){return String(v==null?'':v).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function idVal(v){return Number(v);}
function aperto(t){return (t.pubblicato===true||t.stato==='attivo') && t.iscrizioni_chiuse!==true && t.stato!=='chiuso';}
function chiuso(t){return t.iscrizioni_chiuse===true || t.stato==='chiuso';}
function card(t,closed){
 const id=idVal(t.id);
 return `<div class="torneo-item"><h3>🏆 ${esc(t.nome||'Torneo')}</h3><p>📅 ${esc(t.data||'-')}</p><p>🎾 Formula: ${esc(t.formula||t.configurazione?.rules?.tipoTorneo||'Padel')}</p><p>📌 ${closed?'Torneo concluso':'Iscrizioni aperte'}</p>${closed?`<button class="btn-apri" onclick="apriTorneoPubblico(${id})">👁 VEDI TORNEO</button>`:`<button class="btn-iscriviti" onclick="vaiIscrizione(${id})">ISCRIVITI</button><button class="btn-apri" onclick="apriTorneoPubblico(${id})">🚀 APRI TORNEO</button>`}</div>`;
}
function installMenu(aperti){
 const section=document.getElementById('tornei'); if(!section)return;
 document.getElementById('menuTorneiDaFare')?.remove();
 const box=document.createElement('div'); box.id='menuTorneiDaFare';
 box.style.cssText='margin-bottom:18px;background:rgba(0,0,0,.20);padding:14px;border-radius:14px;';
 box.innerHTML=`<details><summary style="cursor:pointer;font-weight:bold;font-size:16px;padding:4px">📋 Tornei ancora da fare (${aperti.length})</summary><div style="margin-top:12px"><select id="selectTorneiDaFare" style="width:100%;padding:12px;border-radius:10px;border:0;font-weight:bold"><option value="">Seleziona un torneo...</option>${aperti.map(t=>`<option value="${idVal(t.id)}">${esc(t.nome||'Torneo')} — ${esc(t.data||'-')}</option>`).join('')}</select><div id="azioniTorneoSelezionato" style="margin-top:10px"></div></div></details>`;
 const list=document.getElementById('lista-tornei'); section.insertBefore(box,list||null);
 document.getElementById('selectTorneiDaFare')?.addEventListener('change',function(){
   const id=this.value, target=document.getElementById('azioniTorneoSelezionato'); if(!target)return;
   target.innerHTML=id?`<button class="btn-iscriviti" onclick="vaiIscrizione(${Number(id)})">ISCRIVITI AL TORNEO</button><button class="btn-apri" onclick="apriTorneoPubblico(${Number(id)})">🚀 APRI TORNEO</button>`:'';
 });
}
function installArchivio(chiusi){
 const section=document.getElementById('tornei'); if(!section)return;
 document.getElementById('archivioTornei')?.remove();
 const box=document.createElement('div'); box.id='archivioTornei'; box.style.cssText='margin-top:20px;';
 box.innerHTML=`<details><summary style="cursor:pointer;font-weight:bold;font-size:16px;padding:12px;background:rgba(0,0,0,.20);border-radius:12px">🗄️ Archivio tornei chiusi (${chiusi.length})</summary><div style="margin-top:12px">${chiusi.length?chiusi.map(t=>card(t,true)).join(''):'<div class="news-item">Nessun torneo chiuso in archivio.</div>'}</div></details>`;
 section.appendChild(box);
}
async function run(){
 if(typeof supabase==='undefined')return;
 const client=supabase.createClient(URL_SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const box=document.getElementById('lista-tornei'); if(!box)return;
 const {data,error}=await client.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione').order('data',{ascending:true});
 if(error){console.error('[PUBLIC TOURNAMENTS]',error);box.innerHTML='<div class="torneo-item">❌ Errore caricamento tornei</div>';return;}
 const aperti=(data||[]).filter(aperto), chiusi=(data||[]).filter(chiuso);
 box.innerHTML=aperti.length?aperti.map(t=>card(t,false)).join(''):'<div class="torneo-item">Nessun torneo aperto al momento.</div>';
 installMenu(aperti); installArchivio(chiusi);
}
window.apriTorneoPubblico=function(id){if(!id){alert('Torneo non valido');return;}window.location.href='Bove.html?idTorneo='+encodeURIComponent(id);};
window.addEventListener('load',function(){setTimeout(run,0);});
})();