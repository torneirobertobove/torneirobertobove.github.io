(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const state=()=>window.adminState||{};
const parseDate=v=>{if(!v)return null;const s=String(v).slice(0,10);const d=new Date(s+'T00:00:00');return Number.isNaN(d.getTime())?null:d};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const tournamentDate=t=>t?.data||t?.data_torneo||null;
const allTournaments=()=>Array.isArray(state().tornei)?state().tornei:[];
let cursor=new Date();
let selectedDay=null;
function monthName(d){return d.toLocaleDateString('it-IT',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase())}
function tournamentsByDay(){const m=new Map();for(const t of allTournaments()){const d=parseDate(tournamentDate(t));if(!d)continue;const k=iso(d);if(!m.has(k))m.set(k,[]);m.get(k).push(t)}return m}
function renderCalendar(){
 const root=$('appContent');if(!root)return;
 const map=tournamentsByDay();
 const y=cursor.getFullYear(),m=cursor.getMonth();
 const first=new Date(y,m,1),start=(first.getDay()+6)%7;
 const days=new Date(y,m+1,0).getDate();
 const prevDays=new Date(y,m,0).getDate();
 let cells='';
 for(let i=0;i<42;i++){
   const n=i-start+1;
   let d,other=false;
   if(n<1){d=new Date(y,m-1,prevDays+n);other=true}else if(n>days){d=new Date(y,m+1,n-days);other=true}else d=new Date(y,m,n);
   const key=iso(d),list=map.get(key)||[],has=list.length>0;
   const sel=selectedDay===key?' selected':'';
   cells+=`<button type="button" class="agenda-day${other?' other-month':''}${has?' has-tournament':''}${sel}" data-calendar-day="${key}"><span class="day-number">${d.getDate()}</span>${has?`<span class="day-events">${list.slice(0,3).map(t=>`<span class="day-event" title="${esc(t.nome||'Torneo')}"></span>`).join('')}${list.length>3?'<span class="more-events">+</span>':''}</span><span class="day-count">${list.length} ${list.length===1?'torneo':'tornei'}</span>`:''}</button>`;
 }
 const today=iso(new Date());
 const selectedList=selectedDay?(map.get(selectedDay)||[]):[];
 const monthList=[];for(const t of allTournaments()){const d=parseDate(tournamentDate(t));if(d&&d.getFullYear()===y&&d.getMonth()===m)monthList.push({t,d})}
 monthList.sort((a,b)=>a.d-b.d);
 root.innerHTML=`<div class="page-head"><div><h1>Calendario</h1><p>Agenda tornei · i giorni con torneo sono evidenziati</p></div><button class="btn" id="calendarToday">Oggi</button></div><div class="agenda-shell"><div class="agenda-toolbar"><button class="btn" id="calendarPrev">‹</button><div class="agenda-month">${monthName(cursor)}</div><button class="btn" id="calendarNext">›</button></div><div class="agenda-week"><span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span></div><div class="agenda-grid">${cells}</div><div class="agenda-legend"><span><i class="agenda-dot"></i> Giorno con torneo</span><span>${monthList.length} tornei nel mese</span></div></div>${selectedDay?`<div class="card agenda-selected"><div class="card-head"><h2>Agenda del ${new Date(selectedDay+'T00:00:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h2></div><div class="card-body">${selectedList.length?selectedList.map(tournamentCard).join(''):'<div class="empty">Nessun torneo in questa giornata.</div>'}</div></div>`:''}<div class="card agenda-list"><div class="card-head"><h2>Agenda del mese</h2><span class="notice">${monthList.length} ${monthList.length===1?'torneo':'tornei'}</span></div><div class="card-body">${monthList.length?monthList.map(x=>tournamentRow(x.t, x.d, today)).join(''):'<div class="empty">Nessun torneo programmato in questo mese.</div>'}</div></div>`;
 bind();
}
function tournamentCard(t){const d=parseDate(tournamentDate(t));const selected=String(t.id)===String(state().torneoSelezionato);return `<div class="agenda-card${selected?' current':''}"><div class="agenda-card-date"><strong>${d?d.toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'-'}</strong></div><div><strong>${esc(t.nome||'Torneo')}</strong><div class="agenda-meta">${esc(t.ora_inizio||'')} ${t.posti?`· ${esc(t.posti)} squadre`:''} · ID ${esc(t.id)}</div></div></div>`}
function tournamentRow(t,d,today){const selected=String(t.id)===String(state().torneoSelezionato);const key=iso(d);return `<button type="button" class="agenda-row${selected?' current':''}${key===today?' today':''}" data-calendar-open="${esc(t.id)}"><span class="agenda-row-date"><b>${d.getDate()}</b><small>${d.toLocaleDateString('it-IT',{weekday:'short'}).replace('.','')}</small></span><span class="agenda-row-main"><strong>${esc(t.nome||'Torneo')}</strong><small>${esc(t.ora_inizio||'')} ${t.posti?`· ${esc(t.posti)} squadre`:''}</small></span><span class="agenda-row-id">ID ${esc(t.id)}</span></button>`}
function bind(){
 $('calendarPrev')?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);selectedDay=null;renderCalendar()});
 $('calendarNext')?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);selectedDay=null;renderCalendar()});
 $('calendarToday')?.addEventListener('click',()=>{const d=new Date();cursor=new Date(d.getFullYear(),d.getMonth(),1);selectedDay=iso(d);renderCalendar()});
 document.querySelectorAll('[data-calendar-day]').forEach(b=>b.addEventListener('click',()=>{selectedDay=b.dataset.calendarDay;renderCalendar()}));
 document.querySelectorAll('[data-calendar-open]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.calendarOpen;const s=state();s.torneoSelezionato=id;try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){};window.openAdminPage?.('torneo')}));
}
window.openAdminCalendar=()=>{const t=allTournaments().find(x=>String(x.id)===String(state().torneoSelezionato));const d=t?parseDate(tournamentDate(t)):new Date();cursor=new Date((d||new Date()).getFullYear(),(d||new Date()).getMonth(),1);selectedDay=t&&d?iso(d):null;renderCalendar()};
document.addEventListener('click',e=>{const b=e.target.closest('#calendar');if(b){e.preventDefault();window.openAdminCalendar?.()}});
})();
