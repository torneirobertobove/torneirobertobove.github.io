/* ADMIN AUTH GUARD V3 */
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
    const login=document.getElementById('boxLoginAdmin');
    if(login){ login.classList.add('hidden'); login.style.display='none'; }
  }

  function showAdmin(){
    const area=document.getElementById('areaAdmin');
    if(area){ area.classList.remove('hidden'); area.style.display='flex'; }
    const login=document.getElementById('boxLoginAdmin');
    if(login){ login.classList.add('hidden'); login.style.display='none'; }
  }

  function goOut(){
    window.location.replace('Bove.html');
  }

  function installLogoutOverride(){
    const client=getClient();
    window.logoutAdmin=async function(){
      hideAdmin();
      try{ if(client && client.auth) await client.auth.signOut(); }catch(err){ console.error('[Admin Auth Guard] logout:',err); }
      goOut();
    };
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
