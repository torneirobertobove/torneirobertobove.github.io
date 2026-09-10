(()=>{'use strict';

function bindSponsorLogoPreview(){
  const input=document.getElementById('sponsorLogo');
  if(!input||input.dataset.logoPreviewBound)return;

  input.dataset.logoPreviewBound='1';

  const wrap=document.createElement('div');
  wrap.id='sponsorLogoPreview';
  wrap.style.cssText='margin-top:10px;width:180px;height:90px;border:1px solid rgba(148,163,184,.35);border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  const img=document.createElement('img');
  img.alt='Anteprima logo sponsor';
  img.style.cssText='max-width:100%;max-height:100%;object-fit:contain;display:none;';

  wrap.appendChild(img);
  input.insertAdjacentElement('afterend',wrap);

  input.addEventListener('change',()=>{
    const file=input.files?.[0];

    if(!file){
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];

    if(!allowed.includes(file.type)){
      alert('Il logo deve essere un file PNG, JPG, WEBP o SVG.');
      input.value='';
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    if(file.size>2*1024*1024){
      alert('Il logo è troppo grande. Usa un file massimo di 2 MB.');
      input.value='';
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    const reader=new FileReader();

    reader.onload=()=>{
      img.src=String(reader.result||'');
      img.style.display='block';
    };

    reader.readAsDataURL(file);
  });
}

const observer=new MutationObserver(bindSponsorLogoPreview);
observer.observe(document.body,{childList:true,subtree:true});
bindSponsorLogoPreview();

function selectedTournament(){
  const s=window.adminState||{};

  return window.getTorneoAdminCorrente?.()||
    ((s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null);
}

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function normalPhone(v){
  let x=String(v??'').trim().replace(/[^0-9+]/g,'');

  if(x.startsWith('00'))x='+'+x.slice(2);
  if(x.startsWith('+'))return x.slice(1);
  if(x.startsWith('39')&&x.length>=11)return x;
  if(x.startsWith('3')&&x.length===10)return '39'+x;

  return x.replace(/^0+/,'');
}

function findPhone(obj){
  const re=/(telefono|tel|cellulare|cell|mobile|phone|whatsapp|numero)/i;
  const seen=new Set();

  function walk(v,k){
    if(v==null)return '';

    if(typeof v==='string'||typeof v==='number'){
      if(re.test(String(k||''))){
        const p=normalPhone(v);
        if(p.length>=8)return p;
      }
      return '';
    }

    if(typeof v!=='object')return '';
    if(seen.has(v))return '';

    seen.add(v);

    for(const key of Object.keys(v)){
      const p=walk(v[key],key);
      if(p)return p;
    }

    return '';
  }

  return walk(obj,'');
}

function participantName(p){
  return p?.nome_giocatore||
    p?.nome||
    p?.nominativo||
    [p?.nome,p?.cognome].filter(Boolean).join(' ')||
    p?.email||
    'Partecipante';
}

async function getParticipants(t){
  const cfg=t?.configurazione&&typeof t.configurazione==='object'
    ?t.configurazione
    :{};

  let rows=Array.isArray(cfg.partecipanti)?cfg.partecipanti:[];

  if(!rows.length&&Array.isArray(t?.partecipanti)){
    rows=t.partecipanti;
  }

  if(!rows.length){
    const sb=window.supabaseClient||window.sb;

    if(sb){
      const r=await sb.from('iscrizioni').select('*');

      if(!r.error&&Array.isArray(r.data)){
        const id=String(t.id);

        rows=r.data.filter(x=>Object.keys(x||{}).some(k=>
          /torneo.?id|id.?torneo|tournament.?id/i.test(k)&&String(x[k])===id
        ));
      }
    }
  }

  const out=[];
  const seen=new Set();

  for(const p of rows){
    const phone=findPhone(p);

    if(!phone||seen.has(phone))continue;

    seen.add(phone);
    out.push({name:participantName(p),phone});
  }

  return out;
}

function buildWhatsAppMessage(t){
  const link=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);
  const note="Presentarsi 15 minuti prima dell'orario della propria partita.";

  return `🎾 TORNEO ${t.nome||''}

NEXT POINT PADEL

Ciao!

Il tabellone del torneo è disponibile.

👉 ${link}

📌 NOTA DI INGRESSO
${note}

Buon torneo! 🎾`;
}
      function copyText(text){
  if(navigator.clipboard?.writeText){
    return navigator.clipboard.writeText(text);
  }

  const ta=document.createElement('textarea');
  ta.value=text;
  ta.style.position='fixed';
  ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();

  return Promise.resolve();
}

async function whatsappAuto(){
  const t=selectedTournament();

  if(!t){
    alert('Seleziona prima un torneo');
    return;
  }

  const participants=await getParticipants(t);
  const msg=buildWhatsAppMessage(t);
  const root=document.getElementById('appContent');

  if(!root)return;

  root.innerHTML=`
    <div class="page-head">
      <div>
        <h1>WhatsApp</h1>
        <p>${esc(t.nome)} · ${participants.length} partecipanti approvati</p>
      </div>
      <button class="btn" id="waBack">← Torna al torneo</button>
    </div>

    <div class="card feature-card">
      <div class="card-head">
        <div>
          <h2>Gruppo WhatsApp del torneo</h2>
          <span class="notice">Partecipanti, messaggio e tabellone preparati automaticamente</span>
        </div>
      </div>

      <div class="card-body">
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
          <button type="button" class="btn primary" id="waCreateGroup">➕ Crea gruppo WhatsApp</button>
          <button type="button" class="btn" id="waCopyNumbers">📋 Copia tutti i numeri</button>
          <button type="button" class="btn" id="waOpen">📱 Apri WhatsApp</button>
        </div>

        <div class="notice" style="margin-bottom:18px">
          <strong>Crea gruppo:</strong> copia automaticamente tutti i numeri dei partecipanti e apre WhatsApp. La creazione del gruppo e l'aggiunta dei partecipanti vengono completate direttamente in WhatsApp.
        </div>

        <label>Messaggio del gruppo</label>

        <textarea id="waText" class="input" rows="10">${esc(msg)}</textarea>

        <h3 style="margin-top:20px">Partecipanti approvati</h3>

        <div class="feature-list">
          ${participants.length
            ?participants.map((p,i)=>`
              <div class="list-item" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <div style="flex:1">
                  <strong>${i+1}. ${esc(p.name)}</strong>
                  <small style="display:block;margin-top:3px">+${esc(p.phone)}</small>
                </div>
                <button type="button" class="btn small" data-wa-copy="${esc(p.phone)}">📋 Copia</button>
              </div>
            `).join('')
            :'<div class="empty">Nessun numero di telefono trovato nei partecipanti approvati.</div>'}
        </div>

        <div class="notice" style="margin-top:18px">
          <strong>Come funziona:</strong> premi “Crea gruppo WhatsApp”, completa la creazione del gruppo in WhatsApp e poi invia il messaggio già preparato.
        </div>
      </div>
    </div>
  `;

  const copyNumbers=async()=>{
    const numbers=participants.map(p=>'+'+p.phone).join('\n');

    if(!numbers){
      alert('Nessun numero di telefono trovato nei partecipanti approvati.');
      return false;
    }

    await copyText(numbers);
    return true;
  };

  document.getElementById('waBack')?.addEventListener(
    'click',
    ()=>window.openAdminPage?.('torneo')
  );

  document.getElementById('waCreateGroup')?.addEventListener(
    'click',
    async()=>{
      try{
        const copied=await copyNumbers();
        if(!copied)return;

        window.open('https://web.whatsapp.com/','_blank','noopener');
        alert('Numeri copiati. In WhatsApp crea il nuovo gruppo e incolla i numeri nella selezione dei partecipanti.');
      }catch(e){
        console.error(e);
        alert('Impossibile preparare il gruppo WhatsApp.');
      }
    }
  );

  document.getElementById('waCopyNumbers')?.addEventListener(
    'click',
    async()=>{
      try{
        const copied=await copyNumbers();
        if(copied)alert('Numeri dei partecipanti copiati.');
      }catch(e){
        console.error(e);
        alert('Impossibile copiare i numeri.');
      }
    }
  );

  document.querySelectorAll('[data-wa-copy]').forEach(b=>{
    b.addEventListener('click',async()=>{
      try{
        await copyText('+'+b.dataset.waCopy);
        b.textContent='✓ Copiato';

        setTimeout(()=>{
          b.textContent='📋 Copia';
        },1200);
      }catch(e){
        console.error(e);
      }
    });
  });

  document.getElementById('waOpen')?.addEventListener(
    'click',
    ()=>{
      const text=document.getElementById('waText')?.value||msg;

      window.open(
        'https://wa.me/?text='+encodeURIComponent(text),
        '_blank',
        'noopener'
      );
    }
  );
}

const oldOpen=window.openAdminComPage;

window.openAdminComPage=p=>
  p==='whatsapp'
    ?whatsappAuto()
    :oldOpen?.(p);

document.addEventListener(
  'click',
  e=>{
    const b=e.target?.closest?.('[data-com-page="whatsapp"]');

    if(!b)return;

    e.preventDefault();
    e.stopImmediatePropagation();

    whatsappAuto().catch(err=>{
      console.error(err);
      alert('Errore caricamento WhatsApp: '+(err?.message||err));
    });
  },
  true
);

})();
