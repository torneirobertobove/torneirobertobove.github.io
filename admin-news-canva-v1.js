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
function tournamentData(t){
 const c=cfg(t),r=c.rules||c.regole||{};
 return {
  title:clean(t?.nome||t?.nomeTorneo||c.nomeTorneo),
  date:clean(t?.data_torneo||t?.data||t?.dataTorneo||c.data_torneo||c.data||r.data),
  time:clean(t?.ora_inizio||t?.ora||t?.oraInizio||c.ora_inizio||c.ora||r.start),
  location:clean(t?.luogo||t?.location||t?.sede||c.luogo||c.location||c.sede),
  teams:clean(r.numeroSquadre||c.numeroSquadre||t?.numeroSquadre),
  level:clean(r.livello||c.livello||t?.livello),
  fee:clean(t?.quota||t?.quotaIscrizione||c.quota||c.quotaIscrizione),
  deadline:clean(t?.scadenza_iscrizioni||t?.scadenza||c.scadenza_iscrizioni||c.scadenza),
  description:clean(t?.descrizione||c.descrizione)
 };
}
function autoFillTournament(){
 const t=selected();if(!t)return false;
 const d=tournamentData(t);
 const set=(id,value)=>{const el=q('#'+id);if(el&&value)el.value=value};
 set('naiType','Torneo');set('naiTitle',d.title);set('naiDate',d.date);set('naiTime',d.time);set('naiLocation',d.location);set('naiPairs',d.teams);set('naiLevel',d.level);set('naiFee',d.fee);set('naiDeadline',d.deadline);set('naiOffer',d.description);
 return true;
}
function wrapText(ctx,text,maxWidth){const words=String(text||'').split(/\s+/),lines=[];let line='';words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width<=maxWidth)line=test;else{if(line)lines.push(line);line=word}});if(line)lines.push(line);return lines}
function drawPadelVisual(x){
 x.save();x.globalAlpha=.92;
 const g=x.createLinearGradient(0,210,0,760);g.addColorStop(0,'rgba(15,118,110,.02)');g.addColorStop(1,'rgba(15,118,110,.32)');x.fillStyle=g;x.fillRect(0,190,1080,610);
 x.save();x.translate(540,500);x.rotate(-.08);
 x.fillStyle='rgba(255,255,255,.13)';x.beginPath();x.moveTo(-390,-210);x.lineTo(390,-210);x.lineTo(300,250);x.lineTo(-300,250);x.closePath();x.fill();
 x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=5;x.stroke();
 x.beginPath();x.moveTo(0,-210);x.lineTo(0,250);x.moveTo(-390,-20);x.lineTo(390,-20);x.stroke();
 x.strokeStyle='rgba(255,255,255,.32)';x.lineWidth=3;x.strokeRect(-300,-165,600,165);x.strokeRect(-300,-165,600,330);
 x.fillStyle='rgba(2,6,23,.65)';x.fillRect(-305,-8,610,18);
 x.restore();
 const player=(px,py,s,flip)=>{x.save();x.translate(px,py);if(flip)x.scale(-1,1);x.fillStyle='rgba(255,255,255,.86)';x.beginPath();x.arc(0,-95*s,28*s,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(-32*s,-62*s);x.lineTo(34*s,-62*s);x.lineTo(48*s,55*s);x.lineTo(-48*s,55*s);x.closePath();x.fill();x.lineWidth=14*s;x.strokeStyle='rgba(255,255,255,.86)';x.beginPath();x.moveTo(-24*s,50*s);x.lineTo(-58*s,120*s);x.moveTo(25*s,50*s);x.lineTo(55*s,120*s);x.stroke();x.lineWidth=10*s;x.beginPath();x.moveTo(30*s,-35*s);x.lineTo(82*s,-90*s);x.stroke();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=5*s;x.beginPath();x.arc(103*s,-112*s,28*s,0,Math.PI*2);x.stroke();x.restore()};
 player(225,660,1.0,false);player(820,590,.82,true);
 x.fillStyle='#fff';x.globalAlpha=.85;[[760,360],[470,610],[900,690]].forEach(([bx,by])=>{x.beginPath();x.arc(bx,by,10,0,Math.PI*2);x.fill()});x.restore();
}
const POSTER_IMAGE_URL='locandina.jpg';
let posterPhotoPromise=null;
function loadPosterPhoto(){
 if(posterPhotoPromise)return posterPhotoPromise;
 posterPhotoPromise=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=POSTER_IMAGE_URL;});
 return posterPhotoPromise;
}
function drawPosterPhoto(ctx,img){
 const area={x:0,y:235,w:1080,h:560};
 ctx.save();ctx.beginPath();ctx.rect(area.x,area.y,area.w,area.h);ctx.clip();
 const scale=Math.max(area.w/img.width,area.h/img.height),w=img.width*scale,h=img.height*scale,dx=area.x+(area.w-w)/2,dy=area.y+(area.h-h)/2;
 ctx.drawImage(img,dx,dy,w,h);
 const overlay=ctx.createLinearGradient(0,235,0,795);overlay.addColorStop(0,'rgba(2,6,23,.02)');overlay.addColorStop(.55,'rgba(2,6,23,.04)');overlay.addColorStop(1,'rgba(2,6,23,.82)');ctx.fillStyle=overlay;ctx.fillRect(area.x,area.y,area.w,area.h);
 ctx.restore();
}
function drawPosterText(ctx,text,x,y,maxWidth,maxLines,fontSize,lineHeight,weight='600',color='rgba(255,255,255,.92)'){
 ctx.fillStyle=color;ctx.font=`${weight} ${fontSize}px Arial`;const lines=wrapText(ctx,text,maxWidth).slice(0,maxLines);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;
}
async function posterCanvas(){
 const d=currentDraft(),g=d.generated||{},c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
 const grad=x.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,'#071b2a');grad.addColorStop(.52,'#0b3040');grad.addColorStop(1,'#031018');x.fillStyle=grad;x.fillRect(0,0,c.width,c.height);
 const photo=await loadPosterPhoto();
 if(photo)drawPosterPhoto(x,photo);else drawPadelVisual(x);
 x.fillStyle='rgba(3,16,24,.94)';x.fillRect(0,0,1080,235);
 x.fillStyle='rgba(255,255,255,.10)';x.fillRect(0,230,1080,5);
 x.fillStyle='#fff';x.font='800 28px Arial';x.fillText('NEXT POINT PADEL',70,78);
 x.fillStyle='rgba(255,255,255,.68)';x.font='600 18px Arial';x.fillText('TORNEO',70,112);
 let title=clean(g.title||d.title||'TORNEO NEXT POINT PADEL');
 x.font='800 58px Arial';const titleLines=wrapText(x,title,940).slice(0,2);titleLines.forEach((line,i)=>x.fillText(line,70,165+i*60));
 const date=clean(q('#naiDate')?.value),time=clean(q('#naiTime')?.value),location=clean(q('#naiLocation')?.value);
 const meta=[date,time,location].filter(Boolean).join('  •  ');
 if(meta){x.fillStyle='rgba(255,255,255,.88)';x.font='600 22px Arial';x.fillText(meta,70,220)}
 const info=[];
 const pairs=clean(q('#naiPairs')?.value),level=clean(q('#naiLevel')?.value),fee=clean(q('#naiFee')?.value),deadline=clean(q('#naiDeadline')?.value);
 if(pairs)info.push(`${pairs} squadre`);
 if(level)info.push(level);
 if(fee)info.push(fee);
 if(deadline)info.push(`Iscrizioni entro ${deadline}`);
 x.fillStyle='rgba(255,255,255,.94)';x.roundRect(55,830,970,205,26);x.fill();
 x.fillStyle='#082331';x.font='800 24px Arial';x.fillText('INFORMAZIONI TORNEO',85,875);
 x.fillStyle='rgba(8,35,49,.82)';x.font='600 27px Arial';let iy=920;info.slice(0,4).forEach(v=>{const lines=wrapText(x,v,880).slice(0,1);lines.forEach(line=>{x.fillText('• '+line,88,iy);iy+=38})});
 const text=clean(g.text||q('#naiOffer')?.value||'');
 if(text){x.fillStyle='rgba(255,255,255,.90)';x.font='400 23px Arial';wrapText(x,text,900).slice(0,2).forEach((line,i)=>x.fillText(line,70,1080+i*31))}
 const cta=clean(g.cta||q('#naiCta')?.value||'Scopri di più');
 const ctaW=Math.min(650,Math.max(320,x.measureText(cta).width+90));x.fillStyle='#fff';x.roundRect(55,1150,ctaW,76,38);x.fill();x.fillStyle='#082331';x.font='800 27px Arial';x.fillText(cta,100,1199);
 x.fillStyle='rgba(255,255,255,.62)';x.font='400 19px Arial';x.fillText('NEXT POINT PADEL',70,1288);
 return c;
}
async function createFreePoster(download=true){const c=await posterCanvas(),url=c.toDataURL('image/png');window.dispatchEvent(new CustomEvent('nai:poster-created',{detail:{dataUrl:url}}));const a=document.createElement('a');a.href=url;a.download='locandina-next-point-padel.png';if(download){document.body.appendChild(a);a.click();a.remove()}return url}
async function createAutomaticTournamentPoster(){
 const status=q('#naiCanvaStatus'),auto=q('#naiAutoPoster'),generate=q('#naiGenerate');
 if(!selected()){if(status)status.textContent='Seleziona prima un torneo.';return}
 auto.disabled=true;if(status)status.textContent='Preparo automaticamente i dati del torneo…';
 autoFillTournament();
 if(generate){generate.click();let tries=0;await new Promise(resolve=>{const timer=setInterval(()=>{tries++;if(!generate.disabled||tries>80){clearInterval(timer);resolve()}},100)});}
 await createFreePoster(true);if(status)status.textContent='Locandina automatica creata con locandina.jpg: dati del torneo e contenuto inseriti. Pubblica la News per salvarla definitivamente.';auto.disabled=false;
}
async function saveDesignUrl(url){const t=selected();if(!t||!url)return false;const sb=window.supabaseClient||window.sb;if(!sb)return false;const c=cfg(t),items=Array.isArray(c.news)?c.news:[],d=currentDraft(),generatedTitle=clean(d.generated?.title),inputTitle=clean(d.title);const match=items.find(n=>clean(n.titolo)===generatedTitle||clean(n.titolo)===inputTitle);if(!match)return false;const news=items.map(n=>String(n.id)===String(match.id)?{...n,canvaEditUrl:url,canvaUrl:url}:n);const {data,error}=await sb.from('tornei').update({configurazione:{...c,news}}).eq('id',t.id).select('id,configurazione').maybeSingle();if(!error&&data){t.configurazione=data.configurazione||{...c,news};try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}return true}return false}
function panel(){
 if(q('#naiCanvaPanel'))return;const pub=q('#naiPublish');if(!pub)return;
 const wrap=document.createElement('div');wrap.id='naiCanvaPanel';wrap.style.cssText='margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.05)';
 wrap.innerHTML='<div style="font-weight:800;margin-bottom:5px">🎨 Locandina gratuita automatica</div><div style="font-size:12px;opacity:.82;line-height:1.45">Un solo click può preparare i dati del torneo, generare il contenuto e creare una locandina PNG gratuita con visual padel. Nessun servizio a pagamento necessario.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn primary" id="naiAutoPoster">⚡ Crea locandina dal torneo</button><button class="btn" id="naiFreePoster">✨ Crea PNG dal contenuto</button><button class="btn" id="naiCanvaOpen">🎨 Apri Canva</button><button class="btn" id="naiCanvaCopy">📋 Copia brief</button></div><div style="display:flex;gap:8px;margin-top:10px"><input id="naiCanvaUrl" class="input" placeholder="Incolla qui il link del progetto Canva"><button class="btn" id="naiCanvaSave">Collega</button></div><div id="naiCanvaStatus" class="notice" style="margin-top:8px"></div>';
 pub.parentNode.appendChild(wrap);
 q('#naiAutoPoster').onclick=createAutomaticTournamentPoster;
 q('#naiFreePoster').onclick=async()=>{await createFreePoster(true);q('#naiCanvaStatus').textContent='Locandina PNG creata, inserita nella News e scaricata gratuitamente. Pubblica la News per salvarla definitivamente.'};
 q('#naiCanvaOpen').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato. Canva sta per essere aperto: incollalo nel progetto.':'Apri Canva e usa il brief della News.';window.open('https://www.canva.com/create/posters/','_blank','noopener,noreferrer')};
 q('#naiCanvaCopy').onclick=async()=>{const ok=await copyText(brief());q('#naiCanvaStatus').textContent=ok?'Brief copiato negli appunti.':'Impossibile copiare automaticamente: usa il pulsante del browser.'};
 q('#naiCanvaSave').onclick=async()=>{const url=clean(q('#naiCanvaUrl')?.value);if(!/^https:\/\/(www\.)?canva\.com\//i.test(url)){q('#naiCanvaStatus').textContent='Inserisci un link Canva valido.';return}q('#naiCanvaSave').disabled=true;q('#naiCanvaStatus').textContent='Collegamento in corso…';const ok=await saveDesignUrl(url);q('#naiCanvaSave').disabled=false;q('#naiCanvaStatus').textContent=ok?'Progetto Canva collegato alla News.':'Salvataggio non riuscito: pubblica prima la News e poi collega il progetto.'};
}
const obs=new MutationObserver(()=>{if(q('#naiPublish'))panel()});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('admin:render',panel);setTimeout(panel,500);
})();
