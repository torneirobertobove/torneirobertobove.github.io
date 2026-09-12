(()=>{'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const selected=()=>window.getTorneoAdminCorrente?.()||((state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null);
const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
function installWhatsAppButtonStyle(){
  if(document.getElementById('waCompactButtonsStyle'))return;
  const style=document.createElement('style');
  style.id='waCompactButtonsStyle';
  style.textContent=`
    #waCreateGroup,#waCopyAll,#waOpen{
      display:inline-flex !important;
      visibility:visible !important;
      opacity:1 !important;
      align-items:center !important;
      justify-content:center !important;
      width:auto !important;
      min-width:0 !important;
      height:32px !important;
      min-height:32px !important;
      max-height:32px !important;
      padding:5px 10px !important;
      margin:0 !important;
      border-radius:7px !important;
      font-size:12px !important;
      line-height:1 !important;
      font-weight:500 !important;
      white-space:nowrap !important;
      box-sizing:border-box !important;
      transition:none !important;
    }
    #waCreateGroup{background:rgba(37,99,235,.82) !important;border:1px solid rgba(147,197,253,.35) !important;}
    #waCopyAll,#waOpen{background:rgba(51,65,85,.78) !important;border:1px solid rgba(148,163,184,.30) !important;}
    #waCreateGroup:hover,#waCopyAll:hover,#waOpen:hover{transform:none !important;filter:brightness(1.08) !important;}
    .admin-feature-actions:has(#waCreateGroup){display:flex !important;align-items:center !important;gap:7px !important;flex-wrap:wrap !important;min-height:32px !important;opacity:1 !important;visibility:visible !important;}
  `;
  (document.head||document.documentElement).appendChild(style);
}
installWhatsAppButtonStyle();
function normalPhone(v){let x=String(v??'').trim().replace(/[^0-9+]/g,'');if(x.startsWith('00'))x='+'+x.slice(2);if(x.startsWith('+'))return x.slice(1);if(x.startsWith('39')&&x.length>=11)return x;if(x.startsWith('3')&&x.length===10)return '39'+x;return x.replace(/^0+/,'')}
function findPhone(obj){const re=/(telefono|tel|cellulare|cell|mobile|phone|whatsapp|numero)/i,seen=new Set();function walk(v,k){if(v==null)return '';if(typeof v==='string'||typeof v==='number'){if(re.test(String(k||''))){const p=normalPhone(v);if(p.length>=8)return p}return ''}if(typeof v!=='object'||seen.has(v))return '';seen.add(v);for(const key of Object.keys(v)){const p=walk(v[key],key);if(p)return p}return ''}return walk(obj,'')}
function participantName(p){return p?.nome_giocatore||p?.nominativo||[p?.nome,p?.cognome].filter(Boolean).join(' ').trim()||p?.email||'Partecipante'}
async function getParticipants(t){const cfg=t?.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};let rows=Array.isArray(cfg.partecipanti)?cfg.partecipanti:[];if(!rows.length&&Array.isArray(t?.partecipanti))rows=t.partecipanti;if(!rows.length){const sb=window.supabaseClient||window.sb;if(sb){const r=await sb.from('iscrizioni').select('*');if(!r.error&&Array.isArray(r.data)){const id=String(t.id);rows=r.data.filter(x=>Object.keys(x||{}).some(k=>/torneo.?id|id.?torneo|tournament.?id/i.test(k)&&String(x[k])===id))}}}const out=[],seen=new Set();for(const p of rows){const phone=findPhone(p);if(!phone||seen.has(phone))continue;seen.add(phone);out.push({name:participantName(p),phone})}return out}
function latestPoster(t){const cfg=t?.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};const items=Array.isArray(cfg.news)?cfg.news:[];return items.filter(n=>n&&n.immagine&&/^(data:image\/|https?:\/\/)/i.test(String(n.immagine))).sort((a,b)=>new Date(b.data||0)-new Date(a.data||0))[0]||null}
function buildBoveLink(t){try{return new URL('Bove.html?idTorneo='+encodeURIComponent(t.id),location.href).href}catch(e){return location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id)}}
function buildMessage(t){const link=buildBoveLink(t);return `🎾 TORNEO ${t.nome||''}\n\nNEXT POINT PADEL\n\nCiao!\n\nIl tabellone del torneo è disponibile.\n\n👉 ${link}\n\n📌 NOTA DI INGRESSO\nPresentarsi 15 minuti prima dell'orario della propria partita.\n\nBuon torneo! 🎾`}
async function copyText(text){try{await navigator.clipboard.writeText(text);alert('Copiato negli appunti.')}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}}
function openWhatsAppMessage(){window.open('https://wa.me/?text='+encodeURIComponent($('waText')?.value||''),'_blank')}
async function creaGruppoWhatsApp(people){if(!people.length){alert('Nessun iscritto approvato disponibile per creare il gruppo.');return}await copyText(people.map(p=>'+'+p.phone).join('\n'));openWhatsAppMessage()}
function shell(t,people){const root=$('appContent');if(!root)return;const msg=buildMessage(t);const poster=latestPoster(t);const posterHtml=poster?`<div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(148,163,184,.18)"><div style="font-weight:600;margin-bottom:10px">Locandina del torneo</div><img id="waPosterImage" src="${esc(poster.immagine)}" alt="Locandina ${esc(t.nome)}" style="display:block;width:min(100%,560px);max-height:700px;object-fit:contain;border-radius:10px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.25)"><div class="admin-feature-actions" style="margin-top:10px"><button type="button" class="btn" id="waPosterOpen">Apri locandina</button></div><div class="notice" style="margin-top:8px">La locandina viene mostrata insieme alla comunicazione. WhatsApp Web non permette al collegamento wa.me di allegare automaticamente un'immagine: per inviarla, aprila e allegala nella chat.</div></div>`:'<div class="notice" style="margin-top:18px">Nessuna locandina pubblicata trovata per questo torneo.</div>';
root.innerHTML=`<div class="page-head"><div><h1>WhatsApp</h1><p>${esc(t.nome)} · ${people.length} iscritti approvati</p></div><button class="btn" id="comBack">← Torna al torneo</button></div><div class="card feature-card"><div class="card-head"><div><h2>Gruppo WhatsApp del torneo</h2><span class="notice">Iscritti approvati, numeri e messaggio del torneo sono pronti automaticamente</span></div></div><div class="card-body"><div class="admin-feature-actions"><button type="button" class="btn primary" id="waCreateGroup">➕ Crea gruppo WhatsApp</button><button type="button" class="btn" id="waCopyAll">📋 Copia tutti i numeri</button><button type="button" class="btn" id="waOpen">📱 Apri WhatsApp</button></div><label style="display:block;margin-top:18px">Messaggio</label><textarea id="waText" class="input" rows="10">${esc(msg)}</textarea><div class="admin-feature-actions" style="margin-top:10px"><button type="button" class="btn" id="waCopyMessage">📋 Copia messaggio</button></div>${posterHtml}<h3 style="margin-top:24px">Iscritti approvati</h3><div id="waPeople" class="feature-list">${people.length?people.map((p,i)=>`<div class="list-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><strong>${i+1}. ${esc(p.name)}</strong><span style="margin-left:8px">+${esc(p.phone)}</span></div><div style="display:flex;gap:8px"><button type="button" class="btn small" data-wa-send="${esc(p.phone)}">📱 Invia</button><button type="button" class="btn small" data-wa-copy="${esc(p.phone)}">📋 Copia</button></div></div>`).join(''):'<div class="empty">Nessun iscritto approvato trovato.</div>'}</div><div class="notice" style="margin-top:16px">Il pulsante “Crea gruppo WhatsApp” copia automaticamente tutti i numeri e apre WhatsApp con il messaggio del torneo già pronto. Per completare il gruppo, seleziona i contatti copiati e conferma la creazione direttamente in WhatsApp.</div></div></div>`;installWhatsAppButtonStyle();$('comBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));$('waCreateGroup')?.addEventListener('click',()=>creaGruppoWhatsApp(people));$('waCopyAll')?.addEventListener('click',()=>copyText(people.map(p=>'+'+p.phone).join('\n')));$('waCopyMessage')?.addEventListener('click',()=>copyText($('waText')?.value||''));$('waOpen')?.addEventListener('click',openWhatsAppMessage);$('waPosterOpen')?.addEventListener('click',()=>{if(poster?.immagine)window.open(poster.immagine,'_blank')});document.querySelectorAll('[data-wa-copy]').forEach(b=>b.addEventListener('click',()=>copyText('+'+b.dataset.waCopy)));document.querySelectorAll('[data-wa-send]').forEach(b=>b.addEventListener('click',()=>window.open('https://wa.me/'+b.dataset.waSend+'?text='+encodeURIComponent($('waText')?.value||''),'_blank')))}
async function whatsappOverride(){const t=selected();if(!t){alert('Seleziona prima un torneo');return}const people=await getParticipants(t);shell(t,people)}
window.whatsappOverride=whatsappOverride;
window.__waCanonicalActive=true;
let previousOpenAdminComPage=null;
function bind(){document.querySelectorAll('[data-com-page="whatsapp"]').forEach(old=>{if(old.dataset.waOverrideBound)return;const b=old.cloneNode(true);old.replaceWith(b);b.dataset.waOverrideBound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');whatsappOverride()})});if(!window.__waComRouterBound){window.__waComRouterBound=true;previousOpenAdminComPage=window.openAdminComPage;window.openAdminComPage=p=>p==='whatsapp'?whatsappOverride():previousOpenAdminComPage?.(p)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();