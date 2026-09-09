/* SPONSOR GLOBAL FIX
   Gli sponsor sono comuni a tutti i tornei.
   Non modifica funzioni di partecipanti, coppie, tabellone o calendario.
*/
(()=>{
'use strict';
const URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
const client=window.supabaseClient||window.sb||window.supabase?.createClient(URL,KEY);
if(!client)return;
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
async function getTornei(){const {data,error}=await client.from('tornei').select('id,configurazione');if(error)throw error;return Array.isArray(data)?data:[]}
function collect(rows){const out=[],seen=new Set();(rows||[]).forEach(t=>{const list=Array.isArray(t?.configurazione?.sponsor)?t.configurazione.sponsor:[];list.forEach(s=>{const nome=String(s?.nome||'').trim(),url=String(s?.url||'').trim(),descrizione=String(s?.descrizione||'').trim();if(!nome)return;const key=String(s?.id||'')||nome+'|'+url;if(seen.has(key))return;seen.add(key);out.push({id:String(s?.id||('sponsor-'+nome+'-'+url)),nome,url,descrizione})})});return out}
async function saveAll(rows,sponsors){for(const t of rows){const cfg={...(t.configurazione||{}),sponsor:sponsors};const {error}=await client.from('tornei').update({configurazione:cfg}).eq('id',t.id);if(error)throw error}}
function renderAdmin(sponsors){
 const root=document.getElementById('appContent');if(!root)return;
 root.innerHTML=`<div class="page-head"><div><h1>Sponsor</h1><p>Sponsor globali dell'app · visibili in tutti i tornei</p></div><button class="btn" id="globalSponsorBack">← Torna al torneo</button></div><div class="card feature-card"><div class="card-head"><div><h2>Gestione Sponsor</h2><span class="notice">Questi sponsor vengono visualizzati in ogni tabellone.</span></div></div><div class="card-body"><div class="section-grid"><div class="feature-form"><label>Nome sponsor</label><input id="globalSponsorName" class="input" placeholder="Nome sponsor"><label>Link sponsor</label><input id="globalSponsorUrl" class="input" placeholder="https://..."><label>Descrizione</label><textarea id="globalSponsorText" class="input" rows="4" placeholder="Descrizione o messaggio"></textarea><button class="btn primary" id="globalSponsorSave">＋ Aggiungi sponsor</button></div><div><h3>Sponsor globali</h3><div id="globalSponsorList" class="feature-list">${sponsors.length?sponsors.map((s,i)=>`<div class="list-item"><strong>${esc(s.nome)}</strong><small>${esc(s.descrizione||'')}${s.url?' · '+esc(s.url):''}</small><button class="btn small danger" data-global-sponsor-del="${i}">Elimina</button></div>`).join(''):'<div class="empty">Nessuno sponsor configurato.</div>'}</div></div></div></div></div>`;
 document.getElementById('globalSponsorBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));
 document.getElementById('globalSponsorSave')?.addEventListener('click',async()=>{const nome=document.getElementById('globalSponsorName')?.value.trim(),url=document.getElementById('globalSponsorUrl')?.value.trim(),descrizione=document.getElementById('globalSponsorText')?.value.trim();if(!nome){alert('Inserisci il nome dello sponsor.');return}try{const rows=await getTornei(),all=collect(rows),next=[...all,{id:'sponsor-'+Date.now(),nome,url,descrizione}];await saveAll(rows,next);renderAdmin(next)}catch(e){console.error(e);alert('Errore salvataggio sponsor: '+(e?.message||e))}});
 document.querySelectorAll('[data-global-sponsor-del]').forEach(b=>b.addEventListener('click',async()=>{try{const rows=await getTornei(),all=collect(rows),next=all.filter((_,i)=>i!==Number(b.dataset.globalSponsorDel));await saveAll(rows,next);renderAdmin(next)}catch(e){console.error(e);alert('Errore eliminazione sponsor: '+(e?.message||e))}}));
}
async function openGlobalAdmin(){try{const rows=await getTornei(),sponsors=collect(rows);renderAdmin(sponsors);if(rows.length&&sponsors.length)await saveAll(rows,sponsors)}catch(e){console.error('SPONSOR GLOBAL ADMIN:',e);alert('Impossibile caricare gli sponsor: '+(e?.message||e))}}
function hookAdmin(){document.querySelectorAll('[data-com-page="sponsor"]').forEach(b=>{if(b.dataset.globalSponsorBound)return;b.dataset.globalSponsorBound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');openGlobalAdmin()},true)});}
if(location.pathname.endsWith('admin.html')){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hookAdmin,{once:true});else hookAdmin();}

/* ==========================================================
   CAROSELLO SPONSOR TABELLONE
   Solo presentazione pubblicitaria: nessuna funzione torneo viene toccata.
   ========================================================== */
function renderBoardGlobal(){
 const banner=document.getElementById('tabelloneSponsor');if(!banner)return false;
 const track=banner.querySelector('.sponsor-track');if(!track)return false;
 if(banner.dataset.globalCarouselInstalled)return true;
 banner.dataset.globalCarouselInstalled='1';

 const style=document.createElement('style');
 style.id='sponsorGlobalCarouselStyle';
 style.textContent=`
 #tabelloneSponsor{position:relative;overflow:hidden;width:100%;margin:30px auto 10px;padding:18px 14px 14px;box-sizing:border-box;border-radius:18px;background:linear-gradient(180deg,rgba(3,12,25,.58),rgba(3,12,25,.72)),url('https://commons.wikimedia.org/wiki/Special:FilePath/Padel%20court.jpg') center/cover no-repeat;box-shadow:0 12px 30px rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.24)}
 #tabelloneSponsor:before{content:'PADEL  •  TOURNAMENT  •  SPONSORS';display:block;width:max-content;max-width:100%;margin:0 auto 12px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);color:#fff;font-size:10px;font-weight:900;letter-spacing:1.5px}
 #tabelloneSponsor:after{content:'●';position:absolute;top:14px;right:18px;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:11px;color:#dfff3f;background:rgba(30,45,20,.72);border:2px solid rgba(255,255,255,.65);box-shadow:0 2px 8px rgba(0,0,0,.25)}
 #tabelloneSponsor .sponsor-title{position:relative;color:#fff;font-size:14px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;text-shadow:0 2px 8px #000}
 #tabelloneSponsor .sponsor-window{position:relative;width:100%;max-width:760px;margin:auto;overflow:hidden;border-radius:16px;background:rgba(5,12,22,.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.38)}
 #tabelloneSponsor .sponsor-track{display:flex;align-items:stretch;justify-content:flex-start;gap:14px;width:100%;min-width:100%;padding:12px;box-sizing:border-box;transition:transform .7s cubic-bezier(.22,.61,.36,1)}
 #tabelloneSponsor .sponsor-item{flex:0 0 100%;min-height:92px;padding:14px 22px;border-radius:13px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.9);color:#111827;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.2)}
 #tabelloneSponsor .sponsor-item:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.25)}
 #tabelloneSponsor .sponsor-name{font-weight:900;font-size:22px;line-height:1.15;letter-spacing:.2px}
 #tabelloneSponsor .sponsor-desc{font-size:12px;max-width:620px;margin-top:7px;line-height:1.35;text-align:center;color:#374151}
 #tabelloneSponsor .sponsor-empty{padding:18px;color:#fff;font-size:12px;text-align:center}
 @media(max-width:600px){#tabelloneSponsor{margin-top:22px;padding:15px 9px 10px;border-radius:15px}#tabelloneSponsor:before{font-size:8px;letter-spacing:1px}#tabelloneSponsor .sponsor-item{min-height:82px;padding:12px 14px}#tabelloneSponsor .sponsor-name{font-size:18px}#tabelloneSponsor .sponsor-desc{font-size:11px}}
 `;
 document.head.appendChild(style);

 async function load(){
   try{
     const sponsors=collect(await getTornei());
     if(!sponsors.length){track.innerHTML='<div class="sponsor-empty">Nessuno sponsor configurato</div>';return}
     const cards=sponsors.map(s=>{const inner=`<span class="sponsor-name">${esc(s.nome)}</span>${s.descrizione?`<span class="sponsor-desc">${esc(s.descrizione)}</span>`:''}`;return s.url?`<a class="sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="sponsor-item">${inner}</div>`}).join('');
     track.innerHTML=cards;
     const items=[...track.querySelectorAll('.sponsor-item')];
     let index=0;
     const move=()=>{if(items.length<2){track.style.transform='translateX(0)';return}index=(index+1)%items.length;track.style.transform=`translateX(calc(-${index} * (100% + 14px)))`};
     if(items.length>1){move();setInterval(move,4500)}
   }catch(e){console.error('SPONSOR GLOBAL TABELLONE:',e);track.innerHTML='<div class="sponsor-empty">Sponsor non disponibili</div>'}
 }
 load();
 return true;
}
if(!location.pathname.endsWith('admin.html')){let n=0;const timer=setInterval(()=>{n++;if(renderBoardGlobal()||n>=120)clearInterval(timer)},500)}
})();
