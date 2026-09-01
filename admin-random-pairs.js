/* Random pairing for Admin Tornei — keeps manual pairing available. */
(function(){
  'use strict';

  const SUPABASE_URL = 'https://iybjvtmfaupgthqqsngd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
  let sb = null;
  let observer = null;
  let timer = 0;

  function exposeGlobals(client){
    if(client){ window.sb=client; window.supabaseClient=client; }
    if(window.adminState && typeof window.adminState==='object') window.adminState=window.adminState;
  }
  exposeGlobals(window.sb||null);

  function navigate(k){
    k=(k==='configurazione'||k==='config')?'config':(k==='link'||k==='links'?'links':k);
    if(typeof window.goAdminPage==='function') return window.goAdminPage(k);
    if(typeof window.adminGoPage==='function') return window.adminGoPage(k);
    if(typeof window.openAdminPage==='function') return window.openAdminPage(k);
    const target=document.getElementById('org-page-'+k),area=document.getElementById('areaAdmin');
    if(target&&area){area.querySelectorAll('.org-page').forEach(p=>p.classList.remove('org-active'));target.classList.add('org-active');}
    if(location.hash.slice(1)!==k) history.replaceState(null,'','#'+k);
  }

  function repairNavigation(){
    const area=document.getElementById('areaAdmin');
    if(!area) return;
    area.querySelectorAll('.sidebar .nav button,[data-page]').forEach(button=>{
      const raw=String(button.dataset.page||button.dataset.orgPage||'').toLowerCase().trim();
      const canonical=raw==='configurazione'||raw==='config'?'config':raw==='link'||raw==='links'?'links':raw;
      if(canonical!=='config'&&canonical!=='links') return;
      button.dataset.page=canonical;
      button.dataset.orgPage=canonical;
      button.setAttribute('onclick',"window.openAdminPage && window.openAdminPage('"+canonical+"')");
      button.onclick=function(){navigate(canonical);};
    });
  }

  function getClient(){
    if(sb)return sb;
    if(window.supabaseClient)return(sb=window.supabaseClient);
    if(window.sb)return(sb=window.sb);
    if(window.supabase?.createClient)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    exposeGlobals(sb); return sb;
  }

  function currentTournament(){
    if(typeof window.getTorneoAdminCorrente==='function')return window.getTorneoAdminCorrente();
    const state=window.adminState;if(!state?.tornei)return null;
    return state.tornei.find(t=>String(t.id)===String(state.torneoSelezionato))||null;
  }
  function approvedPlayers(){return Array.isArray(window.iscrizioniTorneo)?window.iscrizioniTorneo.filter(g=>g&&(g.stato==='approvato'||g.approvato===true)):[];}
  function playerName(g){return String(g?.nome_giocatore||[g?.nome,g?.cognome].filter(Boolean).join(' ')||g?.nome||'Giocatore').trim();}
  function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function isClosed(t){return t&&(t.iscrizioni_chiuse===true||t.stato==='chiuso');}
  function buildPair(a,b){return{id:Date.now()+Math.random(),giocatore1:{id:a.id,nome:a.nome||'',cognome:a.cognome||'',nome_giocatore:a.nome_giocatore||'',email:a.email||''},giocatore2:{id:b.id,nome:b.nome||'',cognome:b.cognome||'',nome_giocatore:b.nome_giocatore||'',email:b.email||''},generata_casualmente:true,metodo:'casuale'};}

  async function generaAccoppiamentiCasuali(){
    const t=currentTournament();if(!t){alert('Seleziona prima un torneo.');return;}
    if(!isClosed(t)){alert('Gli accoppiamenti casuali sono disponibili solo dopo la chiusura delle iscrizioni.');return;}
    const players=approvedPlayers();if(players.length<2){alert('Servono almeno 2 partecipanti approvati per creare le coppie.');return;}
    if(Array.isArray(t.coppie)&&t.coppie.length){if(!confirm('Esistono già accoppiamenti. Vuoi sostituirli con un nuovo sorteggio casuale?'))return;}
    const shuffled=shuffle(players),pairs=[];for(let i=0;i+1<shuffled.length;i+=2)pairs.push(buildPair(shuffled[i],shuffled[i+1]));
    const bye=shuffled.length%2?shuffled[shuffled.length-1]:null;if(!t.configurazione)t.configurazione={};
    t.coppie=pairs;t.configurazione.coppie=pairs;t.configurazione.accoppiamentoCasuale={generato:true,metodo:'casuale',generatoIl:new Date().toISOString(),partecipanti:shuffled.map(g=>g.id),bye:bye?{id:bye.id,nome:playerName(bye)}:null};
    try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState));}catch(e){console.error(e);}
    const client=getClient();if(client){const{error}=await client.from('tornei').update({configurazione:t.configurazione}).eq('id',t.id);if(error){console.error('Errore salvataggio accoppiamenti casuali:',error);alert('Le coppie sono state generate localmente, ma non è stato possibile salvarle su Supabase.');}}
    if(typeof window.renderCoppie==='function')window.renderCoppie();if(typeof window.syncDashboard==='function')window.syncDashboard();
    alert('Sorteggio completato!\n\nCoppie generate: '+pairs.length+(bye?'\n\n⚠️ Partecipante rimasto senza coppia: '+playerName(bye):''));
  }
  window.generaAccoppiamentiCasuali=generaAccoppiamentiCasuali;

  function addButton(){
    const box=document.getElementById('creaCoppieBox');if(!box)return;let wrap=document.getElementById('randomPairingTools');
    if(!wrap){wrap=document.createElement('div');wrap.id='randomPairingTools';wrap.setAttribute('data-admin-test','random-pairing');wrap.style.cssText='margin:0 0 14px;padding:13px;border:1px solid rgba(242,201,76,.18);border-radius:11px;background:rgba(242,201,76,.045);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';box.prepend(wrap);}
    const t=currentTournament(),closed=isClosed(t),count=approvedPlayers().length;wrap.innerHTML='';
    const info=document.createElement('div');info.innerHTML='<strong style="display:block;color:#fff;font-size:12px">🎲 Accoppiamento casuale</strong><span style="display:block;color:#9ca8b5;font-size:10px;margin-top:4px">'+(closed?'Sorteggia automaticamente i partecipanti approvati.':'Chiudi prima le iscrizioni per abilitare il sorteggio.')+' · '+count+' partecipanti approvati</span>';
    const button=document.createElement('button');button.type='button';button.id='btnAccoppiamentoCasuale';button.className='btn';button.setAttribute('data-random-pairing','true');button.setAttribute('data-admin-test','random-pairing-button');button.textContent='🎲 Accoppia a caso';button.disabled=!closed||count<2;button.style.cssText='white-space:nowrap;border-color:rgba(242,201,76,.35);'+(closed?'color:#f2c94c;background:rgba(242,201,76,.08);':'opacity:.45;cursor:not-allowed;');button.title=closed?'Genera coppie casuali':'Disponibile dopo la chiusura delle iscrizioni';button.addEventListener('click',generaAccoppiamentiCasuali);wrap.appendChild(info);wrap.appendChild(button);
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{addButton();repairNavigation();},80);}
  function init(){exposeGlobals(window.sb||window.supabaseClient||null);getClient();addButton();repairNavigation();const box=document.getElementById('creaCoppieBox');if(box&&!observer){observer=new MutationObserver(schedule);observer.observe(box,{childList:true,subtree:true});}setTimeout(()=>{addButton();repairNavigation();},300);setTimeout(()=>{addButton();repairNavigation();},1000);setTimeout(()=>{addButton();repairNavigation();},2000);}
  document.addEventListener('DOMContentLoaded',init);window.addEventListener('load',init);setTimeout(init,500);
})();
