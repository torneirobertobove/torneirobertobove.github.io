/* ADMIN AUTH GUARD V6 - clean layout */
(function(){
'use strict';
const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
function getClient(){let client=window.supabaseClient||window.sb;if(!client&&window.supabase&&typeof window.supabase.createClient==='function'){client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);window.supabaseClient=client;window.sb=client}return client}
function hide(){const a=document.getElementById('areaAdmin');if(a){a.classList.add('hidden');a.style.display='none'}}
function show(){const a=document.getElementById('areaAdmin');if(a){a.classList.remove('hidden');a.style.display='flex'}}
async function logout(){hide();try{await getClient()?.auth?.signOut()}catch(e){console.error(e)}window.location.replace('index.html')}
function installLogout(){window.logoutAdmin=logout;document.addEventListener('click',e=>{const b=e.target?.closest?.('button,a,[role="button"]');if(!b)return;const text=String(b.textContent||'').trim().toLowerCase();if(text==='esci'||text==='logout'||b.id?.toLowerCase().includes('logout')){e.preventDefault();e.stopImmediatePropagation();logout()}},true)}
async function guard(){hide();const client=getClient();if(!client?.auth){window.location.replace('index.html');return}try{const{data}=await client.auth.getSession();const session=data?.session;if(!session){window.location.replace('index.html');return}const{data:profile}=await client.from('profili').select('ruolo').eq('user_id',session.user.id).maybeSingle();if(String(profile?.ruolo||'').trim().toLowerCase()!=='admin'){await client.auth.signOut();window.location.replace('index.html');return}show();window.adminState=window.adminState||{};window.adminState.adminLoggato=true;window.adminState.adminEmail=session.user.email||'Admin';window.salvaAdminState?.();window.renderCleanAdmin?.()}catch(e){console.error('[Admin Auth Guard]',e);try{await client.auth.signOut()}catch(_){}window.location.replace('index.html')}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installLogout();guard()},{once:true});else{installLogout();guard()}
})();
