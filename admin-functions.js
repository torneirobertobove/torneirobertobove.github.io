const sb = window.supabase.createClient(
  "https://iybjvtmfaupgthqqsngd.supabase.co",
  "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
  { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }
);

// Unica istanza Supabase condivisa da tutti gli script admin.
window.sb = sb;
window.supabaseClient = sb;

let adminState = {
  adminLoggato:false,
  adminEmail:"",
  torneoSelezionato:null,
  tornei:[],
  sponsor:[],
  news:[]
};

const ADMIN_STORAGE = "padel_admin_state";
window.iscrizioniTorneo = [];
window.giocatoreSelezionatoCorrente = null;

function salvaAdminState(){
  try{ localStorage.setItem(ADMIN_STORAGE, JSON.stringify(adminState)); }
  catch(e){ console.error("Errore salvataggio stato admin:",e); }
}

function caricaAdminState(){
  try{
    const raw=localStorage.getItem(ADMIN_STORAGE);
    if(!raw) return;
    adminState={...adminState,...JSON.parse(raw)};
    if(!Array.isArray(adminState.tornei)) adminState.tornei=[];
    if(!Array.isArray(adminState.sponsor)) adminState.sponsor=[];
    if(!Array.isArray(adminState.news)) adminState.news=[];
  }catch(e){ console.error("Errore caricamento stato admin:",e); }
}

function getTorneoAdminCorrente(){
  if(!Array.isArray(adminState.tornei)) return null;
  return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null;
}

function aggiornaGiocatoriAdmin(){
  const squadre=Number(document.getElementById("adminPosti")?.value)||8;
  const campo=document.getElementById("adminGiocatori");
  if(campo) campo.value=squadre*2;
}

async function caricaTorneiSupabase(){
  try{
    const {data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});
    if(error) throw error;
    if(Array.isArray(data)) adminState.tornei=data;
    salvaAdminState();
    renderAdmin();
  }catch(e){ console.error("Errore caricamento tornei Supabase:",e); }
}

async function loginAdmin(){
  try{
    const {data,error}=await sb.auth.getSession();
    if(error) throw error;
    const session=data?.session;
    if(!session){
      const email=document.getElementById("adminEmail")?.value?.trim();
      const password=document.getElementById("adminPassword")?.value||"";
      if(!email||!password){ mostraLoginMessaggio("Inserisci email e password.","#ff6678"); return; }
      const result=await sb.auth.signInWithPassword({email,password});
      if(result.error) throw result.error;
    }
    const session2=(await sb.auth.getSession()).data.session;
    adminState.adminLoggato=true;
    adminState.adminEmail=session2?.user?.email||"Admin";
    salvaAdminState();
    document.getElementById("boxLoginAdmin")?.classList.add("hidden");
    document.getElementById("areaAdmin")?.classList.remove("hidden");
    await caricaTorneiSupabase();
    await caricaRichiesteIscrizione();
    renderAdmin();
  }catch(e){
    console.error("Errore login:",e);
    mostraLoginMessaggio(e?.message||"Accesso non riuscito.","#ff6678");
  }
}

function mostraLoginMessaggio(msg,color){
  const el=document.getElementById("loginMessaggio");
  if(el){el.textContent=msg;el.style.color=color||"#fff";}
}

function setupAdmin(){
  caricaAdminState();
  const emailMini=document.getElementById("adminEmailMini");
  if(emailMini) emailMini.textContent=adminState.adminEmail||"Amministratore";
  const login=document.getElementById("btnLoginAdmin");
  if(login) login.addEventListener("click",loginAdmin);
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setupAdmin);
else setupAdmin();
