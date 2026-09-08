/* ADMIN AUTH GUARD V7 - clean layout */
(function(){'use strict';
const U='https://iybjvtmfaupgthqqsngd.supabase.co',K='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
function client(){return window.supabaseClient||window.sb||(window.supabase?.createClient?window.supabase.createClient(U,K):null)}
function hide(){const a=document.getElementById('areaAdmin');if(a){a.classList.add('hidden');a.style.display='none'}}
function show(){const a=document.getElementById('areaAdmin');if(a){a.classList.remove('hidden');a.style.display='flex'}}
async function logout(){hide();try{await client()?.auth?.signOut()}catch(e){}location.replace('index.html')}
function bindLogout(){window.logoutAdmin=logout}
async function guard(){hide();const c=client();if(!c?.auth){location.replace('index.html');return}try{const{data}=await c.auth.getSession(),s=data?.session;if(!s){location.replace('index.html');return}const{data:p}=await c.from('profili').select('ruolo').eq('user_id',s.user.id).maybeSingle();if(String(p?.ruolo||'').trim().toLowerCase()!=='admin'){await c.auth.signOut();location.replace('index.html');return}show();const a=window.adminState||{};a.adminLoggato=true;a.adminEmail=s.user.email||'Admin';a.tornei=Array.isArray(a.tornei)?a.tornei:[];window.adminState=a;window.salvaAdminState?.();await window.caricaTorneiSupabase?.();await window.caricaRichiesteIscrizione?.();window.renderCleanAdmin?.()}catch(e){console.error('[Admin Auth Guard]',e);try{await c.auth.signOut()}catch(_){}location.replace('index.html')}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindLogout();guard()},{once:true});else{bindLogout();guard()}
})();
