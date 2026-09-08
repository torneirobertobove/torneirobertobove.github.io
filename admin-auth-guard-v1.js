/* ADMIN AUTH GUARD V1 */
(function(){
  'use strict';
  const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
  const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
  function hideAdmin(){
    const area=document.getElementById('areaAdmin');
    if(area){ area.classList.add('hidden'); area.style.display='none'; }
    const login=document.getElementById('boxLoginAdmin');
    if(login){ login.classList.remove('hidden'); login.style.display='flex'; }
  }
  function showAdmin(){
    const area=document.getElementById('areaAdmin');
    if(area){ area.classList.remove('hidden'); area.style.display='flex'; }
  }
  async function guard(){
    hideAdmin();
    let client=window.supabaseClient||window.sb||window._supabase;
    if(!client && window.supabase && typeof window.supabase.createClient==='function'){
      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      window.supabaseClient=client;
    }
    if(!client||!client.auth)return;
    try{
      const sr=await client.auth.getSession();
      const session=sr&&sr.data?sr.data.session:null;
      if(!session){ hideAdmin(); return; }
      const pr=await client.from('profili').select('ruolo').eq('user_id',session.user.id).maybeSingle();
      const role=pr&&pr.data?String(pr.data.ruolo||'').trim().toLowerCase():'';
      if(role!=='admin'){
        await client.auth.signOut();
        hideAdmin();
        const msg=document.getElementById('loginMessaggio');
        if(msg)msg.textContent='Accesso riservato agli amministratori.';
        return;
      }
      showAdmin();
    }catch(err){
      console.error('[Admin Auth Guard] errore:',err);
      try{await client.auth.signOut();}catch(_){ }
      hideAdmin();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard,{once:true});
  else guard();
})();
