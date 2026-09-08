/* TORNEO FLOW PUBLIC FIX V2 */
(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
function esc(v){return String(v==null?'':v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
async function run(){
 if(typeof supabase==='undefined')return;
 const sb=supabase.createClient(URL_SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const box=document.getElementById('lista-tornei'); if(!box)return;
 const {data,error}=await sb.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione').order('data',{ascending:true});
 if(error){console.error('[PUBLIC FLOW] ',error);return;}
 const visible=(data||[]).filter(t=>t.pubblicato===true || t.stato==='attivo');
 if(!visible.length){box.innerHTML='<div class="torneo-item">Nessun torneo disponibile</div>';return;}
 box.innerHTML=visible.map(t=>{
   const closed=t.iscrizioni_chiuse===true || t.stato==='chiuso';
   return `<div class="torneo-item"><h3>🏆 ${esc(t.nome||'Torneo')}</h3><p>📅 ${esc(t.data||'-')}</p><p>🎾 Formula: ${esc(t.formula||t.configurazione?.rules?.tipoTorneo||'Padel')}</p><p>📌 ${closed?'Iscrizioni chiuse':'Iscrizioni aperte'}</p><button class="btn-iscriviti" ${closed?'disabled':''} onclick="vaiIscrizione(${Number(t.id)})">${closed?'ISCRIZIONI CHIUSE':'ISCRIVITI'}</button></div>`;
 }).join('');
}
window.addEventListener('load',function(){setTimeout(run,0);});
})();