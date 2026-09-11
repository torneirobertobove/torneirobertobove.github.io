/* ADMIN NEWS CANVA V1 — ponte gratuita Admin -> Canva, brief automatico e collegamento design. */
(()=>{
'use strict';
const q=s=>document.querySelector(s);
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const selected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
const cfg=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
function currentDraft(){
 const type=q('#naiType')?.value||'Comunicazione';
 const title=q('#naiTitle')?.value||'';
 const data=[q('#naiDate')?.value,q('#naiTime')?.value,q('#naiLocation')?.value,q('#naiPairs')?.value,q('#naiLevel')?.value,q('#naiFee')?.value,q('#naiDeadline')?.value,q('#naiOffer')?.value,q('#naiProduct')?.value,q('#naiPrice')?.value].filter(Boolean);
 const poster=q('#naiPreview')?.querySelector('.nai-poster');
 const copy=poster?.querySelector('.nai-copy');
 return {type,title,data,generated:{title:copy?.querySelector('h2')?.textContent||'',text:copy?.querySelector('p')?.textContent||'',cta:copy?.querySelector('.nai-cta')?.textContent||''}};
}
function brief(){
 const d=currentDraft();
 const g=d.generated||{};
 return `CREA LOCANDINA PADEL — NEXT POINT PADEL\n\nTipo: ${d.type}\nTitolo: ${g.title||d.title||'Da definire'}\n\nDati da mostrare:\n${d.data.map(x=>'- '+clean(x)).join('\n')||'- Nessun dato aggiuntivo'}\n\nTesto:\n${g.text||'Scrivere un testo breve e leggibile, senza inventare date, prezzi o nomi.'}\n\nCTA: ${g.cta||q('#naiCta')?.value||'Scopri di più'}\n\nStile: professionale, sportivo, moderno, elegante, alta leggibilità, fotografia/visual padel, formato verticale per social e sito. Usare esclusivamente elementi gratuiti Canva.`;
}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(x){}ta.remove();return ok}}
async function saveDesignUrl(url){const t=selected();if(!t||!url)return false;const sb=window.supabaseClient||window.sb;if(!sb)return false;const c=cfg(t),items=Array.isArray(c.news)?c.news:[],title=clean(q('#naiTitle')?.value)||clean(q('#naiPreview h2')?.textContent);
 if(!title)return false;
 const match=items.find(n=>clean(n.titolo)===title);
 if(!match)return false;
 const news=items.map(n=>String(n.id)===String(match.id)?{...n,canvaEditUrl:url,canvaUrl:url}:n);
 const {data,error}=await sb.from('tornei').update({configurazione:{...c,news}}).eq('id',t.id).select('id,configurazione').maybeSingle();
 if(!error&&data){t.configurazione=data.configurazione||{...c,news};try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}return true}return false;
}
function panel(){
 if(q('#naiCanvaPanel'))return;
 const pub=q('#naiPublish');if(!pub)return;
 const wrap=document.createElement('div');wrap.id='naiCanvaPanel';wrap.style.cssText='margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.05)';
 wrap.innerHTML='<div style="font-weight:800;margin-bottom:5px">🎨 Locandina Canva</div><div style="font-size:12px;opacity:.8;line-height:1.45">Prepara automaticamente il brief con i dati della News, apri Canva Gratis e crea la grafica. Poi puoi collegare qui il progetto Canva alla News.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="naiCanvaOpen">🎨 Apri Canva</button><button class="btn" id="naiCanvaCopy">📋 Copia brief</button></div><div style="display:flex;gap:8px;margin-top:10px"><input id="naiCanvaUrl" class="input" placeholder="Incolla qui il link del progetto Canva"><button class="btn" id="naiCanvaSave">Collega</button></div><div id="naiCanvaStatus" class="notice" style="margin-top:8px"></div>';
 pub.parentNode.appendChild(wrap);
 q('#naiCanvaOpen').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato. Canva sta per essere aperto: incollalo nel prompt/design brief.':'Apri Canva e usa il brief mostrato nella sezione.';window.open('https://www.canva.com/create/posters/','_blank','noopener,noreferrer')};
 q('#naiCanvaCopy').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato negli appunti.':'Impossibile copiare automaticamente: seleziona il testo dal browser.'};
 q('#naiCanvaSave').onclick=async()=>{const url=clean(q('#naiCanvaUrl')?.value);if(!/^https:\/\/(www\.)?canva\.com\//i.test(url)){q('#naiCanvaStatus').textContent='Inserisci un link Canva valido.';return}q('#naiCanvaSave').disabled=true;q('#naiCanvaStatus').textContent='Collegamento in corso…';const ok=await saveDesignUrl(url);q('#naiCanvaSave').disabled=false;q('#naiCanvaStatus').textContent=ok?'Progetto Canva collegato alla News.':'Salvataggio non riuscito: salva prima la News con lo stesso titolo, poi collega il progetto Canva.'};
}
const obs=new MutationObserver(()=>{if(q('#naiPublish'))panel()});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('admin:render',panel);setTimeout(panel,500);
})();
