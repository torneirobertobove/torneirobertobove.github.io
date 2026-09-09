/* ADMIN COMUNICAZIONI V4 — News / Sponsor / WhatsApp. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const selected=()=>window.getTorneoAdminCorrente?.()||((state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const cfgOf=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};

async function saveCfg(t,cfg){
 const sb=window.supabaseClient||window.sb;
 if(!sb||!t){alert('Torneo o connessione Supabase non disponibile.');return false}
 const cleanCfg={...(cfg||{})};
 const {data,error}=await sb.from('tornei').update({configurazione:cleanCfg}).eq('id',t.id).select('id,configurazione').maybeSingle();
 if(error){console.error('Errore salvataggio configurazione:',error);alert('Errore salvataggio: '+error.message);return false}
 if(!data){alert('Configurazione non salvata: il torneo selezionato non è stato aggiornato.');return false}
 t.configurazione=data.configurazione||cleanCfg;
 window.adminState=state();
 try{localStorage.setItem('padel_admin_state',JSON.stringify(state()))}catch(e){}
 return true
}

async function loadGlobalSponsors(){
 const sb=window.supabaseClient||window.sb;
 if(!sb)return [];
 const {data,error}=await sb.from('sponsor').select('id,nome,immagine,video,link').order('id',{ascending:true});
 if(error){console.error('Errore caricamento sponsor:',error);alert('Errore caricamento sponsor: '+error.message);return []}
 return data||[];
}

function shell(title,sub,body){const root=$('appContent');if(!root)return;root.innerHTML=`<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><button class="btn" id="comBack">← Torna al torneo</button></div>${body}`;$('comBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'))}

function news(){const t=selected();if(!t){alert('Seleziona prima un torneo');return}const c=cfgOf(t),items=Array.isArray(c.news)?c.news:[];shell('News',`${esc(t.nome)} · ID ${esc(t.id)}`,`<div class="card feature-card"><div class="card-head"><div><h2>Gestione News</h2><span class="notice">Pubblica e gestisci le comunicazioni del torneo</span></div></div><div class="card-body"><div class="section-grid"><div class="feature-form"><label>Titolo</label><input id="newsTitle" class="input" placeholder="Titolo della news"><label>Testo</label><textarea id="newsText" class="input" rows="6" placeholder="Testo della comunicazione"></textarea><button class="btn primary" id="newsSave">＋ Pubblica news</button></div><div><h3>News del torneo</h3><div id="newsList" class="feature-list">${items.length?items.map((n,i)=>`<div class="list-item"><strong>${esc(n.titolo)}</strong><small>${esc(n.testo)}</small><button class="btn small danger" data-news-del="${i}">Elimina</button></div>`).join(''):'<div class="empty">Nessuna news pubblicata.</div>'}</div></div></div></div></div>`);$('newsSave').onclick=async()=>{const titolo=$('newsTitle')?.value.trim(),testo=$('newsText')?.value.trim();if(!titolo||!testo){alert('Inserisci titolo e testo della news.');return}const next=[...items,{id:'news-'+Date.now(),titolo,testo,data:new Date().toISOString()}];if(await saveCfg(t,{...c,news:next}))news()};document.querySelectorAll('[data-news-del]').forEach(b=>b.onclick=async()=>{const next=items.filter((_,i)=>i!==Number(b.dataset.newsDel));if(await saveCfg(t,{...c,news:next}))news()})}

async function sponsor(){
 const items=await loadGlobalSponsors();
 shell('Sponsor','Sponsor globali · visibili in tutti i tabelloni',`<div class="card feature-card"><div class="card-head"><div><h2>Gestione Sponsor</h2><span class="notice">Gli sponsor sono globali e vengono mostrati in ogni tabellone.</span></div></div><div class="card-body"><div class="section-grid"><div class="feature-form"><label>Nome sponsor</label><input id="sponsorName" class="input" placeholder="Nome sponsor"><label>Link sponsor</label><input id="sponsorUrl" class="input" placeholder="https://..."><button class="btn primary" id="sponsorSave">＋ Aggiungi sponsor</button></div><div><h3>Sponsor globali</h3><div id="sponsorList" class="feature-list">${items.length?items.map(n=>`<div class="list-item" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><strong>${esc(n.nome||'')}</strong><small style="flex:1;min-width:220px">${n.link?`<a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">${esc(n.link)}</a>`:'Nessun link'}</small><button type="button" class="btn small danger" data-sponsor-del="${esc(n.id)}">Elimina</button></div>`).join(''):'<div class="empty">Nessuno sponsor configurato.</div>'}</div></div></div></div>`);
 $('sponsorSave').onclick=async()=>{
   const nome=$('sponsorName')?.value.trim(),link=$('sponsorUrl')?.value.trim();
   if(!nome){alert('Inserisci il nome dello sponsor.');return}
   const sb=window.supabaseClient||window.sb;
   if(!sb){alert('Connessione Supabase non disponibile.');return}
   const {error}=await sb.from('sponsor').insert({nome,link});
   if(error){console.error('Errore inserimento sponsor:',error);alert('Errore salvataggio sponsor: '+error.message);return}
   sponsor();
 };
 document.querySelectorAll('[data-sponsor-del]').forEach(b=>b.onclick=async()=>{
   const sb=window.supabaseClient||window.sb;
   if(!sb)return;
   const {error}=await sb.from('sponsor').delete().eq('id',b.dataset.sponsorDel);
   if(error){console.error('Errore eliminazione sponsor:',error);alert('Errore eliminazione sponsor: '+error.message);return}
   sponsor();
 });
}

function whatsapp(){const t=selected();if(!t){alert('Seleziona prima un torneo');return}const link=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);shell('WhatsApp',`${esc(t.nome)} · ID ${esc(t.id)}`,`<div class="card feature-card"><div class="card-head"><div><h2>Comunicazioni WhatsApp</h2><span class="notice">Messaggio pronto con il link del torneo selezionato</span></div></div><div class="card-body"><label>Messaggio</label><textarea id="waText" class="input" rows="6">Ciao! Ti invitiamo al torneo ${esc(t.nome)} del ${esc(t.data||t.data_torneo||'')}.\n\n${esc(link)}</textarea><div class="admin-feature-actions"><button class="btn primary" id="waOpen">📱 Apri WhatsApp</button><button class="btn" id="waCopy">📋 Copia link torneo</button></div><div class="notice" style="margin-top:14px">Il link è sempre riferito al torneo attualmente selezionato.</div></div></div>`);$('waOpen').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent($('waText')?.value||''),'_blank');$('waCopy').onclick=()=>navigator.clipboard?.writeText(link).then(()=>alert('Link copiato negli appunti.'))}
function bindComLinks(){document.querySelectorAll('[data-com-page]').forEach(b=>{if(b.dataset.comBound)return;b.dataset.comBound='1';b.addEventListener('click',()=>{document.getElementById('mobileOverlay')?.classList.remove('open');const p=b.dataset.comPage;if(p==='news')news();else if(p==='sponsor')sponsor();else if(p==='whatsapp')whatsapp()})})}
function bindSidebar(){document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(b=>{if(b.dataset.sidebarBound)return;b.dataset.sidebarBound='1';b.addEventListener('click',async()=>{const page=b.dataset.page;if(!page)return;document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(typeof window.openAdminPage==='function')await window.openAdminPage(page)})})}
function bindAll(){bindSidebar();bindComLinks()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAll,{once:true});else bindAll();
window.openAdminComPage=p=>p==='news'?news():p==='sponsor'?sponsor():whatsapp();
})();