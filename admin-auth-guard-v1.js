/* ADMIN AUTH GUARD V5 */
(function(){
  'use strict';
  const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
  const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';

  function getClient(){
    let client=window.supabaseClient||window.sb||window._supabase;
    if(!client && window.supabase && typeof window.supabase.createClient==='function'){
      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      window.supabaseClient=client;
    }
    return client;
  }

  function hideAdmin(){
    const area=document.getElementById('areaAdmin');
    if(area){ area.classList.add('hidden'); area.style.display='none'; }
  }

  function showAdmin(){
    const area=document.getElementById('areaAdmin');
    if(area){ area.classList.remove('hidden'); area.style.display='flex'; }
  }

  function goOut(){
    window.location.replace('index.html');
  }

  async function performLogout(){
    hideAdmin();
    const client=getClient();
    try{ if(client && client.auth) await client.auth.signOut(); }catch(err){ console.error('[Admin Auth Guard] logout:',err); }
    goOut();
  }

  function installLogoutOverride(){
    window.logoutAdmin=performLogout;

    /* Intercept the real Esci button before any legacy handler can show
       an intermediate "sessione terminata" screen. */
    document.addEventListener('click',function(e){
      const target=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
      if(!target)return;
      const text=String(target.textContent||target.innerText||'').replace(/\s+/g,' ').trim().toLowerCase();
      const id=String(target.id||'').toLowerCase();
      const action=String(target.getAttribute('onclick')||'').toLowerCase();
      if(text==='esci'||text==='logout'||text.indexOf('esci ')===0||text.endsWith(' esci')||id.indexOf('logout')>=0||action.indexOf('logout')>=0){
        e.preventDefault();
        e.stopImmediatePropagation();
        performLogout();
      }
    },true);
  }

  async function guard(){
    hideAdmin();
    const client=getClient();
    if(!client||!client.auth){ goOut(); return; }
    try{
      const sr=await client.auth.getSession();
      const session=sr&&sr.data?sr.data.session:null;
      if(!session){ goOut(); return; }
      const pr=await client.from('profili').select('ruolo').eq('user_id',session.user.id).maybeSingle();
      const role=pr&&pr.data?String(pr.data.ruolo||'').trim().toLowerCase():'';
      if(role!=='admin'){
        try{await client.auth.signOut();}catch(_){ }
        goOut();
        return;
      }
      showAdmin();
    }catch(err){
      console.error('[Admin Auth Guard] errore:',err);
      try{await client.auth.signOut();}catch(_){ }
      goOut();
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      installLogoutOverride();
      guard();
    },{once:true});
  }else{
    installLogoutOverride();
    guard();
  }
})();
