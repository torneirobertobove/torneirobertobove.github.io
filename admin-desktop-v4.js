/* ADMIN DESKTOP V4 - gestionale tornei
   Calendario 2026-2028, UI glass grigio scuro e finestra creazione torneo.
*/
(function(){
  'use strict';
  const YEARS=[2026,2027,2028];
  const MONTHS=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const MONTH_SHORT=['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function style(){
    if($('admin-v4-style'))return;
    const s=document.createElement('style');s.id='admin-v4-style';
    s.textContent=`
      #areaAdmin{background:transparent!important}
      #areaAdmin .card,#areaAdmin .panel-box,#areaAdmin .stat,#areaAdmin .login-card{
        background:linear-gradient(145deg,rgba(48,54,62,.70),rgba(24,29,35,.88))!important;
        border-color:rgba(255,255,255,.13)!important;
        box-shadow:0 18px 50px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.05)!important;
        backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)
      }
      #listaTorneiAdmin{padding:0!important}
      .admin-calendar-v4{margin-top:14px;border:1px solid rgba(255,255,255,.13);border-radius:16px;overflow:hidden;background:rgba(20,24,29,.82);box-shadow:0 18px 55px rgba(0,0,0,.24)}
      .admin-calendar-v4-head{padding:15px 17px;border-bottom:1px solid rgba(255,255,255,.09);display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.025)}
      .admin-calendar-v4-head strong{font-size:14px}.admin-calendar-v4-head span{font-size:11px;color:#9ca8b5}
      .admin-calendar-v4-scroll{overflow-x:auto}
      .admin-calendar-v4-grid{display:grid;grid-template-columns:82px repeat(12,minmax(105px,1fr));min-width:1340px}
      .admin-calendar-v4-grid .head{padding:10px 7px;text-align:center;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#c5ccd4;background:#20252c;border-right:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.08)}
      .admin-calendar-v4-grid .year{display:flex;justify-content:center;align-items:flex-start;padding-top:14px;font-size:14px;font-weight:900;background:#1b2026;border-right:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.08)}
      .admin-calendar-v4-grid .cell{min-height:108px;padding:8px;background:rgba(32,37,44,.45);border-right:1px solid rgba(255,255,255,.055);border-bottom:1px solid rgba(255,255,255,.055)}
      .admin-calendar-v4-grid .cell.empty{background:rgba(25,29,34,.32)}
      .cal-item{display:block;width:100%;margin-bottom:6px;padding:8px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:linear-gradient(145deg,rgba(70,77,86,.74),rgba(35,41,48,.92));color:#fff;text-align:left;cursor:pointer}
      .cal-item:last-child{margin-bottom:0}.cal-item:hover{border-color:rgba(90,170,255,.50);background:linear-gradient(145deg,rgba(72,84,99,.82),rgba(35,42,50,.96))}
      .cal-day{font-size:10px;font-weight:900;color:#67b2ff}.cal-name{font-size:11px;font-weight:800;line-height:1.25;margin-top:3px}.cal-meta{font-size:9px;color:#aeb7c0;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cal-empty{font-size:9px;color:#606b76;text-align:center;padding-top:20px}
      .admin-calendar-v4-foot{padding:10px 14px;color:#8f9aa6;font-size:10px;border-top:1px solid rgba(255,255,255,.07)}
      .admin-new-modal{position:fixed;inset:0;z-index:10000;display:none;place-items:center;padding:20px;background:rgba(5,8,11,.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
      .admin-new-modal.open{display:grid}
      .admin-new-dialog{width:min(620px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:linear-gradient(145deg,#30363e,#191e24);box-shadow:0 35px 110px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.07)}
      .admin-new-head{display:flex;align-items:center;justify-content:space-between;padding:17px 19px;border-bottom:1px solid rgba(255,255,255,.09)}
      .admin-new-head h2{margin:0;font-size:16px}.admin-new-close{width:34px;height:34px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:rgba(255,255,255,.05);color:#fff;font-size:20px;cursor:pointer}
      .admin-new-body{padding:19px}.admin-new-hint{margin:0 0 14px;padding:10px 12px;border:1px solid rgba(90,170,255,.18);border-radius:10px;background:rgba(90,170,255,.07);font-size:11px;color:#c2d4e8}
      .admin-new-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.admin-new-field label{display:block;color:#9ca8b5;font-size:11px;margin:0 0 6px}.admin-new-field input,.admin-new-field select,.admin-new-field textarea{width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.13);background:rgba(5,8,12,.55);color:#fff;outline:none}.admin-new-field textarea{min-height:90px;resize:vertical}.admin-new-field input:focus,.admin-new-field select:focus,.admin-new-field textarea:focus{border-color:rgba(90,170,255,.7);box-shadow:0 0 0 3px rgba(90,170,255,.10)}
      .admin-new-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:15px;border-top:1px solid rgba(255,255,255,.09)}
      @media(max-width:700px){.admin-new-grid{grid-template-columns:1fr}.admin-calendar-v4-grid{grid-template-columns:70px repeat(12,minmax(120px,1fr));min-width:1510px}}
    `;
    document.head.appendChild(s);
  }

  function getTournaments(){return Array.isArray(window.adminState?.tornei)?window.adminState.tornei:[]}
  function info(t){
    const raw=t?.data_torneo||t?.data||t?.date||'';if(!raw)return null;
    const d=new Date(raw);if(Number.isNaN(d.getTime()))return null;
    return {y:d.getFullYear(),m:d.getMonth(),d:d.getDate()};
  }
  function renderCalendar(){
    const list=$('listaTorneiAdmin');if(!list)return;
    let wrap=$('admin-calendar-v4');if(!wrap){wrap=document.createElement('div');wrap.id='admin-calendar-v4';wrap.className='admin-calendar-v4';list.parentNode.insertBefore(wrap,list)}
    const map=new Map();getTournaments().forEach(t=>{const x=info(t);if(!x||!YEARS.includes(x.y))return;const k=x.y+'-'+x.m;(map.get(k)||map.set(k,[]).get(k)).push({t,x})});
    let h='<div class="admin-calendar-v4-head"><strong>Calendario tornei</strong><span>Anno · Mese · Giorno · Torneo</span></div><div class="admin-calendar-v4-scroll"><div class="admin-calendar-v4-grid"><div class="head">Anno</div>'+MONTHS.map(m=>'<div class="head">'+m+'</div>').join('');
    YEARS.forEach(y=>{h+='<div class="year">'+y+'</div>';for(let m=0;m<12;m++){const a=(map.get(y+'-'+m)||[]).sort((p,q)=>p.x.d-q.x.d);h+='<div class="cell">';if(!a.length)h+='<div class="cal-empty">—</div>';a.forEach(({t,x})=>{h+='<button type="button" class="cal-item" data-cal-id="'+esc(t.id)+'"><div class="cal-day">'+String(x.d).padStart(2,'0')+' '+MONTH_SHORT[m]+'</div><div class="cal-name">'+esc(t.nome||'Torneo senza nome')+'</div><div class="cal-meta">'+esc(t.stato||'bozza')+' · '+esc(t.posti||'')+' squadre</div></button>'});h+='</div>'}});
    h+='</div></div><div class="admin-calendar-v4-foot">Clicca un torneo per selezionarlo e aprire la gestione.</div>';wrap.innerHTML=h;
    list.style.display='none';
    wrap.querySelectorAll('[data-cal-id]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.calId;if(typeof window.selezionaTorneoAdmin==='function')window.selezionaTorneoAdmin(id);if(typeof window.openAdminPage==='function')window.openAdminPage('iscritti')}));
  }

  function ensureModal(){
    if($('admin-new-modal'))return;
    const m=document.createElement('div');m.id='admin-new-modal';m.className='admin-new-modal';
    m.innerHTML='<div class="admin-new-dialog" role="dialog" aria-modal="true"><div class="admin-new-head"><h2>🏆 Nuovo torneo</h2><button type="button" class="admin-new-close">×</button></div><div class="admin-new-body"><p class="admin-new-hint">Il nome e la data vengono inseriti qui e il torneo sarà salvato nella cella corretta del calendario.</p><div class="admin-new-grid"><div class="admin-new-field"><label>Nome torneo</label><input id="v4Nome" type="text" autocomplete="off" placeholder="Es. Torneo Estate Bove"></div><div class="admin-new-field"><label>Data torneo</label><input id="v4Data" type="date"></div><div class="admin-new-field"><label>Stato</label><select id="v4Stato"><option value="aperto">Iscrizioni aperte</option><option value="chiuso">Chiuso</option><option value="attivo">In corso</option></select></div><div class="admin-new-field"><label>Posti disponibili</label><select id="v4Posti"><option value="8">8</option><option value="12">12</option><option value="16">16</option><option value="20">20</option><option value="24">24</option></select></div></div><div class="admin-new-field" style="margin-top:12px"><label>Descrizione</label><textarea id="v4Desc" placeholder="Descrizione, regole, note..."></textarea></div><div class="admin-new-actions"><button type="button" class="btn admin-new-cancel">Annulla</button><button type="button" class="btn primary" id="v4Create">✓ Crea torneo</button></div></div></div>';
    document.body.appendChild(m);
    const close=()=>m.classList.remove('open');m.querySelector('.admin-new-close').onclick=close;m.querySelector('.admin-new-cancel').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    $('v4Create').onclick=async()=>{
      const nome=$('v4Nome').value.trim(),data=$('v4Data').value;
      if(!nome)return alert('Inserisci il nome del torneo.');
      if(!data)return alert('Inserisci la data del torneo.');
      [['adminNomeTorneo',nome],['adminDataTorneo',data],['adminStatoTorneo',$('v4Stato').value],['adminPosti',$('v4Posti').value],['adminDescrizione',$('v4Desc').value]].forEach(([id,v])=>{const e=$(id);if(e)e.value=v});
      if(typeof window.aggiornaGiocatoriAdmin==='function')window.aggiornaGiocatoriAdmin();
      close();
      if(typeof window.creaNuovoTorneo==='function')await window.creaNuovoTorneo();
      setTimeout(renderCalendar,300);setTimeout(renderCalendar,1000);
    };
  }
  function openModal(){ensureModal();const m=$('admin-new-modal');m.classList.add('open');const d=$('v4Data');if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);setTimeout(()=>$('v4Nome')?.focus(),40)}
  function bind(){
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-page="configurazione"]');if(!b)return;
      const text=(b.textContent||'').toLowerCase();
      if(text.includes('nuovo torneo')||text.includes('crea torneo')){e.preventDefault();e.stopImmediatePropagation();openModal()}
    },true);
  }
  function observe(){const box=$('listaTorneiAdmin');if(!box)return;new MutationObserver(()=>{clearTimeout(observe.t);observe.t=setTimeout(renderCalendar,100)}).observe(box,{childList:true,subtree:true});renderCalendar()}
  function boot(){style();ensureModal();bind();observe();setTimeout(renderCalendar,300);setTimeout(renderCalendar,1000);setTimeout(renderCalendar,2000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.__adminDesktopRender=renderCalendar;
})();
