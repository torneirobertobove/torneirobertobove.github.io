/* ADMIN NEWS CANVA V1 — ponte gratuita Admin -> Canva + locandina PNG gratuita. */
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
 const d=currentDraft(),g=d.generated||{};
 return `CREA LOCANDINA PADEL — NEXT POINT PADEL\n\nTipo: ${d.type}\nTitolo: ${g.title||d.title||'Da definire'}\n\nDati da mostrare:\n${d.data.map(x=>'- '+clean(x)).join('\n')||'- Nessun dato aggiuntivo'}\n\nTesto:\n${g.text||'Scrivere un testo breve e leggibile, senza inventare date, prezzi o nomi.'}\n\nCTA: ${g.cta||q('#naiCta')?.value||'Scopri di più'}\n\nStile: professionale, sportivo, moderno, elegante, alta leggibilità, formato verticale per social e sito. Usare esclusivamente elementi gratuiti Canva.`;
}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(x){}ta.remove();return ok}}
function wrapText(ctx,text,maxWidth){const words=String(text||'').split(/\s+/),lines=[];let line='';words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width<=maxWidth)line=test;else{if(line)lines.push(line);line=word}});if(line)lines.push(line);return lines}
function posterCanvas(){
 const d=currentDraft(),g=d.generated||{},c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
 const grad=x.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,'#0f766e');grad.addColorStop(.52,'#172033');grad.addColorStop(1,'#020617');x.fillStyle=grad;x.fillRect(0,0,c.width,c.height);
 x.globalAlpha=.12;for(let i=0;i<12;i++){x.beginPath();x.arc(900-i*75,180+i*95,180,0,Math.PI*2);x.strokeStyle='#fff';x.lineWidth=5;x.stroke()}x.globalAlpha=1;
 x.fillStyle='rgba(255,255,255,.15)';x.roundRect(65,65,950,80,40);x.fill();x.fillStyle='#fff';x.font='800 30px Arial';x.fillText('NEXT POINT PADEL',95,116);
 x.fillStyle='#fff';x.font='800 64px Arial';let y=265;wrapText(x,g.title||d.title||'NEWS NEXT POINT PADEL',900).slice(0,3).forEach(l=>{x.fillText(l,65,y);y+=72});
 x.fillStyle='rgba(255,255,255,.86)';x.font='600 30px Arial';const info=d.data.map(clean).filter(Boolean).slice(0,7);y+=35;info.forEach(v=>{const lines=wrapText(x,v,880);lines.slice(0,2).forEach(l=>{x.fillText(l,70,y);y+=39});y+=7});
 x.fillStyle='rgba(255,255,255,.82)';x.font='400 26px Arial';y=Math.max(y+25,760);wrapText(x,g.text||'',880).slice(0,7).forEach(l=>{x.fillText(l,70,y);y+=36});
 const cta=g.cta||q('#naiCta')?.value||'Scopri di più';x.fillStyle='#fff';x.roundRect(65,1175,Math.min(520,Math.max(280,x.measureText(cta).width+80)),78,39);x.fill();x.fillStyle='#172033';x.font='800 28px Arial';x.fillText(cta,105,1224);
 x.fillStyle='rgba(255,255,255,.6)';x.font='400 20px Arial';x.fillText('www.nextpointpadel.it',65,1300);
 return c;
}
function createFreePoster(download=true){const c=posterCanvas(),url=c.toDataURL('image/png');window.dispatchEvent(new CustomEvent('nai:poster-created',{detail:{dataUrl:url}}));const a=document.createElement('a');a.href=url;a.download='locandina-next-point-padel.png';if(download){document.body.appendChild(a);a.click();a.remove()}return url}
async function saveDesignUrl(url){const t=selected();if(!t||!url)return false;const sb=window.supabaseClient||window.sb;if(!sb)return false;const c=cfg(t),items=Array.isArray(c.news)?c.news:[],d=currentDraft(),generatedTitle=clean(d.generated?.title),inputTitle=clean(d.title);const match=items.find(n=>clean(n.titolo)===generatedTitle||clean(n.titolo)===inputTitle);if(!match)return false;const news=items.map(n=>String(n.id)===String(match.id)?{...n,canvaEditUrl:url,canvaUrl:url}:n);const {data,error}=await sb.from('tornei').update({configurazione:{...c,news}}).eq('id',t.id).select('id,configurazione').maybeSingle();if(!error&&data){t.configurazione=data.configurazione||{...c,news};try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}return true}return false}
function panel(){
 if(q('#naiCanvaPanel'))return;const pub=q('#naiPublish');if(!pub)return;
 const wrap=document.createElement('div');wrap.id='naiCanvaPanel';wrap.style.cssText='margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.05)';
 wrap.innerHTML='<div style="font-weight:800;margin-bottom:5px">🎨 Locandina gratuita</div><div style="font-size:12px;opacity:.82;line-height:1.45">Puoi creare subito una locandina PNG gratuita dal contenuto della News oppure usare Canva Gratis per rifinirla. Nessun servizio a pagamento necessario.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn primary" id="naiFreePoster">✨ Crea locandina PNG</button><button class="btn" id="naiCanvaOpen">🎨 Apri Canva</button><button class="btn" id="naiCanvaCopy">📋 Copia brief</button></div><div style="display:flex;gap:8px;margin-top:10px"><input id="naiCanvaUrl" class="input" placeholder="Incolla qui il link del progetto Canva"><button class="btn" id="naiCanvaSave">Collega</button></div><div id="naiCanvaStatus" class="notice" style="margin-top:8px"></div>';
 pub.parentNode.appendChild(wrap);
 q('#naiFreePoster').onclick=()=>{createFreePoster(true);q('#naiCanvaStatus').textContent='Locandina PNG creata, inserita nella News e scaricata gratuitamente. Pubblica la News per salvarla definitivamente.'};
 q('#naiCanvaOpen').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato. Canva sta per essere aperto: incollalo nel progetto.':'Apri Canva e usa il brief della News.';window.open('https://www.canva.com/create/posters/','_blank','noopener,noreferrer')};
 q('#naiCanvaCopy').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato negli appunti.':'Impossibile copiare automaticamente: usa il pulsante del browser.'};
 q('#naiCanvaSave').onclick=async()=>{const url=clean(q('#naiCanvaUrl')?.value);if(!/^https:\/\/(www\.)?canva\.com\//i.test(url)){q('#naiCanvaStatus').textContent='Inserisci un link Canva valido.';return}q('#naiCanvaSave').disabled=true;q('#naiCanvaStatus').textContent='Collegamento in corso…';const ok=await saveDesignUrl(url);q('#naiCanvaSave').disabled=false;q('#naiCanvaStatus').textContent=ok?'Progetto Canva collegato alla News.':'Salvataggio non riuscito: pubblica prima la News e poi collega il progetto.'};
}
const obs=new MutationObserver(()=>{if(q('#naiPublish'))panel()});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('admin:render',panel);setTimeout(panel,500);
})();
