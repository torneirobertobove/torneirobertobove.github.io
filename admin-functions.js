<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Desktop V3 - Padel Manager</title>
    <!-- Libreria Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <!-- CSS Avanzato integrato -->
    <style>
        :root{--desktop-bg:#171b20;--desktop-bg-deep:#0d1116;--desktop-panel:rgba(32,38,46,.72);--desktop-panel2:rgba(39,46,55,.62);--desktop-border:rgba(255,255,255,.11);--desktop-border-light:rgba(255,255,255,.17);--desktop-text:#f1f4f7;--desktop-muted:#a5afb9;--desktop-accent:#4da3ff;--desktop-green:#42d392;--desktop-red:#ff6678;--desktop-yellow:#f2c94c;--desktop-blur:20px}
        html,body{background:radial-gradient(circle at 15% 5%,rgba(85,105,125,.20),transparent 30%),radial-gradient(circle at 85% 10%,rgba(77,163,255,.12),transparent 28%),linear-gradient(135deg,#242a31 0%,#181d23 45%,#0d1116 100%)!important;color:var(--desktop-text)!important;margin:0;padding:0;min-height:100vh}
        .desktop-app{display:flex;min-height:100vh;margin:0;min-width:0;background:transparent;color:var(--desktop-text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .desktop-sidebar{width:255px;background:rgba(13,17,22,.76);border-right:1px solid var(--desktop-border);padding:22px 14px;display:flex;flex-direction:column;flex-shrink:0;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:inset -1px 0 rgba(255,255,255,.025),12px 0 50px rgba(0,0,0,.16)}
        .desktop-brand{display:flex;align-items:center;gap:12px;padding:4px 10px 25px}.desktop-brand-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(77,163,255,.23),rgba(77,163,255,.07));border:1px solid rgba(77,163,255,.24);font-size:21px;box-shadow:inset 0 1px rgba(255,255,255,.10)}.desktop-brand strong{display:block;font-size:15px;color:#fff}.desktop-brand span{font-size:11px;color:var(--desktop-muted)}
        .desktop-nav-section{margin:18px 8px 7px;color:#78838e;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.desktop-nav button{width:100%;border:1px solid transparent;background:transparent!important;color:#aeb7c0!important;padding:12px;border-radius:11px;text-align:left;display:flex;align-items:center;gap:11px;margin:3px 0;transition:.18s ease;box-shadow:none!important;cursor:pointer}
        .desktop-nav button:hover{background:rgba(255,255,255,.055)!important;color:#fff!important}.desktop-nav button.active{background:linear-gradient(90deg,rgba(77,163,255,.19),rgba(77,163,255,.055))!important;border-color:rgba(77,163,255,.16)!important;color:#fff!important;box-shadow:inset 3px 0 var(--desktop-accent),0 5px 18px rgba(0,0,0,.12)!important}
        .desktop-sidebar-bottom{margin-top:auto;padding:14px 8px 0;border-top:1px solid var(--desktop-border);font-size:12px;color:var(--desktop-muted)}
        .desktop-main{flex:1;min-width:0}
        .desktop-topbar{height:72px;border-bottom:1px solid var(--desktop-border);display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:rgba(20,25,31,.62);backdrop-filter:blur(20px);position:sticky;top:0;z-index:5;box-shadow:0 2px 20px rgba(0,0,0,.12)}
        .desktop-breadcrumb{color:var(--desktop-muted);font-size:13px}.desktop-breadcrumb b{color:#fff}
        .desktop-top-actions{display:flex;gap:10px;align-items:center}
        .desktop-content{padding:28px;max-width:1450px;margin:auto}
        .desktop-page-title{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}
        .desktop-page-title h1{margin:0 0 6px;font-size:28px;color:#fff}
        .desktop-page-title p{margin:0;color:var(--desktop-muted);font-size:13px}
        .desktop-btn{border:1px solid var(--desktop-border)!important;background:rgba(255,255,255,.055)!important;color:#edf1f5!important;border-radius:10px!important;padding:10px 14px!important;font-weight:700;font-size:12px!important;cursor:pointer}
        .desktop-btn:hover{background:rgba(255,255,255,.10)!important;border-color:var(--desktop-border-light)!important}
        .desktop-btn.primary{background:linear-gradient(135deg,#5aaaff,#348de8)!important;color:#06101a!important;box-shadow:0 8px 24px rgba(77,163,255,.18)}
        .desktop-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
        .desktop-stat{background:linear-gradient(145deg,rgba(43,50,59,.72),rgba(22,27,33,.78));border:1px solid var(--desktop-border);border-radius:16px;padding:18px;box-shadow:0 12px 35px rgba(0,0,0,.14);backdrop-filter:blur(var(--desktop-blur))}
        .desktop-stat-label{color:var(--desktop-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
        .desktop-stat-value{font-size:27px;font-weight:800;margin-top:8px;color:#fff}
        .desktop-stat-note{font-size:11px;color:var(--desktop-green);margin-top:5px}
        .desktop-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:18px}
        .desktop-card{background:rgba(25,31,38,.72);border:1px solid var(--desktop-border);border-radius:17px;overflow:hidden;box-shadow:0 16px 45px rgba(0,0,0,.16);backdrop-filter:blur(var(--desktop-blur))}
        .desktop-card-head{display:flex;justify-content:space-between;align-items:center;padding:18px;border-bottom:1px solid var(--desktop-border);background:rgba(255,255,255,.018)}
        .desktop-card-head h2{font-size:14px;margin:0;color:#fff}
        .desktop-card-head span{font-size:11px;color:var(--desktop-muted)}
        .desktop-card-body{padding:18px}
        .hidden{display:none!important}
        
        /* ELENCO TORNEI */
        #listaTorneiAdmin{display:grid;gap:10px;padding:4px!important}
        #listaTorneiAdmin .month-group{margin:0 0 14px!important;background:rgba(18,23,29,.76)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:14px!important;overflow:hidden!important}
        #listaTorneiAdmin .month-group>summary{padding:13px 15px!important;background:rgba(255,255,255,.025)!important;color:#f1f4f7!important;border-bottom:1px solid rgba(255,255,255,.07)!important;cursor:pointer}
        #listaTorneiAdmin .tournament-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:16px!important;padding:15px 16px!important;background:rgba(8,12,17,.34)!important;border:1px solid rgba(255,255,255,.075)!important;border-radius:11px!important;margin-bottom:8px}
        #listaTorneiAdmin .tournament-row.selected{background:rgba(77,163,255,.11)!important;border-color:rgba(77,163,255,.25)!important;box-shadow:inset 3px 0 var(--desktop-accent),0 8px 22px rgba(0,0,0,.12)!important}
        #listaTorneiAdmin .t-info strong{display:block!important;font-size:14px!important;color:#fff!important;margin-bottom:8px!important}
        #listaTorneiAdmin .t-info small{display:inline-flex!important;padding:5px 9px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:8px!important;color:#c4cdd6!important;font-size:11px!important}
        .status{display:inline-flex;align-items:center;gap:6px;font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(66,211,146,.11);color:var(--desktop-green);margin-top:5px}
        .status.closed{background:rgba(255,102,120,.11);color:var(--desktop-red)}
        
        input, select, textarea{background:rgba(5,8,12,.42)!important;color:#fff!important;border:1px solid var(--desktop-border)!important;padding:8px 12px;border-radius:8px;width:100%;box-sizing:border-box;margin-bottom:10px}
        .lista-item{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);padding:10px;border-radius:8px;margin-bottom:8px}
        .notice{color:var(--desktop-muted);font-style:italic;text-align:center;padding:10px}
    </style>
</head>
<body>
    <div class="desktop-app">
        <!-- Sidebar -->
        <aside class="desktop-sidebar">
            <div class="desktop-brand">
                <div class="desktop-brand-icon">🏆</div>
                <div>
                    <strong>Padel Manager</strong>
                    <span>Admin Desktop V3</span>
                </div>
            </div>
            
            <div class="desktop-nav-section">Menu Principale</div>
            <nav class="desktop-nav">
                <button class="active" data-nav="dashboard" onclick="openWorkspace('dashboard')">📊 Dashboard</button>
                <button data-nav="gestione" onclick="openWorkspace('gestioneTorneoAdmin')">🎾 Gestione Torneo</button>
                <button data-nav="configurazione" onclick="openWorkspace('configPanel')">⚙️ Nuovo Torneo</button>
            </nav>

            <div class="desktop-sidebar-bottom">
                <span id="adminEmailMini">Amministratore</span>
            </div>
        </aside>

        <!-- Main Area -->
        <main class="desktop-main">
            <header class="desktop-topbar">
                <div class="desktop-breadcrumb">Pannello di Controllo &gt; <b id="current-view-title">Dashboard</b></div>
                <div class="desktop-top-actions">
                    <button class="desktop-btn" id="btnAggiorna">🔄 Aggiorna</button>
                    <button class="desktop-btn primary" data-action="create">+ Nuovo Torneo</button>
                </div>
            </header>

            <div class="desktop-content">
                <div class="desktop-page-title">
                    <div>
                        <h1>Panoramica Tornei</h1>
                        <p>Gestione integrata Supabase & V15 Engine.</p>
                    </div>
                </div>

                <!-- Box Login Admin (se non autenticato) -->
                <div id="boxLoginAdmin" class="desktop-card" style="margin-bottom:20px; padding:20px;">
                    <h2>Accesso Amministratore</h2>
                    <p class="desktop-muted">Effettua il login per gestire i tornei su Supabase.</p>
                    <input type="email" id="adminEmail" placeholder="Email admin">
                    <input type="password" id="adminPassword" placeholder="Password">
                    <button class="desktop-btn primary" id="btnLoginAdmin" type="button">Accedi</button>
                    <div id="loginMessaggio" style="margin-top:10px; font-size:12px;"></div>
                </div>

                <!-- Area Admin Principale -->
                <div id="areaAdmin" class="hidden">
                    <!-- Statistiche -->
                    <div class="desktop-stats">
                        <div class="desktop-stat">
                            <div class="desktop-stat-label">Tornei Attivi</div>
                            <div class="desktop-stat-value" id="statTornei">0</div>
                        </div>
                        <div class="desktop-stat">
                            <div class="desktop-stat-label">Iscritti Totali</div>
                            <div class="desktop-stat-value" id="statIscritti">0</div>
                        </div>
                        <div class="desktop-stat">
                            <div class="desktop-stat-label">Da Approvare</div>
                            <div class="desktop-stat-value" id="statApprovare">0</div>
                        </div>
                        <div class="desktop-stat">
                            <div class="desktop-stat-label">Tabelloni</div>
                            <div class="desktop-stat-value" id="statTabelloni">0</div>
                        </div>
                    </div>

                    <!-- Griglia Elementi -->
                    <div class="desktop-grid">
                        <div class="desktop-card">
                            <div class="desktop-card-head">
                                <h2>Elenco Tornei</h2>
                                <span id="admin-status">Connesso</span>
                            </div>
                            <div class="desktop-card-body">
                                <div id="listaTorneiAdmin"></div>
                            </div>
                        </div>

                        <!-- Configurazione Nuovo Torneo -->
                        <div class="desktop-card">
                            <div class="desktop-card-head">
                                <h2>Crea / Configura Torneo</h2>
                            </div>
                            <div class="desktop-card-body">
                                <details id="configPanel" open>
                                    <summary style="cursor:pointer; font-weight:bold; margin-bottom:10px;">Parametri Torneo</summary>
                                    <label>Nome Torneo</label>
                                    <input type="text" id="adminNomeTorneo" value="Torneo Padel Green Park">
                                    <label>Data</label>
                                    <input type="date" id="adminDataTorneo">
                                    <label>Numero Squadre</label>
                                    <select id="adminPosti">
                                        <option value="8" selected>8 Squadre</option>
                                        <option value="12">12 Squadre</option>
                                        <option value="16">16 Squadre</option>
                                    </select>
                                    <label>Giocatori Totali stimati</label>
                                    <input type="text" id="adminGiocatori" readonly value="16">
                                    <label>Descrizione / Note</label>
                                    <textarea id="adminDescrizione">Formula gironi + fasi finali Gold/Silver</textarea>
                                    <input type="hidden" id="adminStatoTorneo" value="attivo">
                                    <div style="display:flex; gap:10px; margin-top:10px;">
                                        <button class="desktop-btn primary" type="button" onclick="creaNuovoTorneo()">Salva su Supabase</button>
                                        <button class="desktop-btn" type="button" onclick="apriRegoleNuovoTorneo()">Apri in Bove.html</button>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>

                    <!-- Sezione Gestione Torneo Selezionato -->
                    <div id="gestioneTorneoAdmin" class="desktop-card hidden" style="margin-top:20px;">
                        <div class="desktop-card-head">
                            <h2>Dettaglio Torneo & Iscrizioni</h2>
                        </div>
                        <div class="desktop-card-body">
                            <div id="dettaglioTorneoAdmin"></div>
                            <div style="display:flex; gap:10px; margin:15px 0;">
                                <button class="desktop-btn primary" type="button" onclick="pubblicaTorneo()">Pubblica Torneo</button>
                                <button class="desktop-btn" type="button" onclick="chiudiIscrizioniTorneo()">Chiudi Iscrizioni</button>
                                <button class="desktop-btn" type="button" onclick="apriBoveConTorneo()">Apri Tabellone Bove</button>
                            </div>

                            <h3>Richieste di Iscrizione</h3>
                            <div id="richiesteIscrizione"></div>

                            <h3 style="margin-top:20px;">Gestione Coppie</h3>
                            <div id="creaCoppieBox"></div>
                            <div id="listaCoppieAdmin" style="margin-top:10px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Script Logica Completa (admin-functions.js) -->
    <script>
    (function(){
    "use strict";

    if(!window.supabase||typeof window.supabase.createClient!=="function"){
        console.error("Supabase non disponibile.");
        return;
    }

    const sb=window.supabase.createClient(
        "https://iybjvtmfaupgthqqsngd.supabase.co",
        "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
        {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
    );

    window.sb=sb;
    window.supabaseClient=sb;

    let adminState={
        adminLoggato:false,
        adminEmail:"",
        torneoSelezionato:null,
        tornei:[],
        sponsor:[],
        news:[]
    };

    const ADMIN_STORAGE="padel_admin_state";
    window.iscrizioniTorneo=[];
    window.giocatoreSelezionatoCorrente=null;

    function salvaAdminState(){
        try{localStorage.setItem(ADMIN_STORAGE,JSON.stringify(adminState));}catch(e){}
    }

    function caricaAdminState(){
        try{
            const raw=localStorage.getItem(ADMIN_STORAGE);
            if(!raw)return;
            const parsed=JSON.parse(raw);
            if(parsed&&typeof parsed==="object")adminState={...adminState,...parsed};
        }catch(e){}
    }

    function getTorneoAdminCorrente(){
        if(!Array.isArray(adminState.tornei))return null;
        return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null;
    }

    function aggiornaGiocatoriAdmin(){
        const squadre=Number(document.getElementById("adminPosti")?.value)||8;
        const campo=document.getElementById("adminGiocatori");
        if(campo)campo.value=squadre*2;
    }

    function creaUrlBove(t,apriRegole=false){
        if(!t?.id)return"";
        if(String(t.id).startsWith("temp_")){
            const payload=encodeURIComponent(JSON.stringify(t));
            return"Bove.html?torneo="+payload+(apriRegole?"&apriRegole=true":"");
        }
        return"Bove.html?idTorneo="+encodeURIComponent(String(t.id))+(apriRegole?"&apriRegole=true":"");
    }

    async function caricaTorneiSupabase(){
        try{
            const{data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});
            if(error)throw error;
            if(Array.isArray(data))adminState.tornei=data;
            salvaAdminState();
            renderAdmin();
        }catch(e){console.error(e);}
    }

    async function loginAdmin(){
        try{
            const{data,error}=await sb.auth.getSession();
            let session=data?.session;
            if(!session){
                const email=document.getElementById("adminEmail")?.value?.trim()||"";
                const password=document.getElementById("adminPassword")?.value||"";
                if(!email||!password){mostraLoginMessaggio("Inserisci credenziali","#ff6678");return;}
                const result=await sb.auth.signInWithPassword({email,password});
                if(result.error)throw result.error;
                session=result.data?.session||null;
            }
            adminState.adminLoggato=true;
            adminState.adminEmail=session.user?.email||"Amministratore";
            salvaAdminState();
            document.getElementById("boxLoginAdmin")?.classList.add("hidden");
            document.getElementById("areaAdmin")?.classList.remove("hidden");
            renderAdmin();
            await caricaTorneiSupabase();
            await caricaRichiesteIscrizione();
            renderAdmin();
        }catch(e){mostraLoginMessaggio(e?.message||"Accesso fallito","#ff6678");}
    }
    window.loginAdmin=loginAdmin;

    function mostraLoginMessaggio(testo,colore){
        const box=document.getElementById("loginMessaggio");
        if(box){box.textContent=testo;box.style.color=colore;}
    }

    function apriRegoleNuovoTorneo(){
        const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
        const data=document.getElementById("adminDataTorneo")?.value||"";
        const posti=Number(document.getElementById("adminPosti")?.value)||8;
        const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
        const tempId="temp_"+Date.now();
        const torneoTemp={id:tempId,nome,data,posti,descrizione,stato:"bozza",configurazione:{rules:{numeroSquadre:posti,numeroGironi:Math.ceil(posti/4)}}};
        adminState.tornei.push(torneoTemp);
        adminState.torneoSelezionato=tempId;
        salvaAdminState();
        window.open(creaUrlBove(torneoTemp,true),"_blank");
    }
    window.apriRegoleNuovoTorneo=apriRegoleNuovoTorneo;

    async function creaNuovoTorneo(){
        const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo";
        const data=document.getElementById("adminDataTorneo")?.value||"";
        const posti=Number(document.getElementById("adminPosti")?.value)||8;
        const descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";
        const nuovoId=Date.now();
        const nuovoTorneo={id:nuovoId,nome,data,posti,descrizione,stato:"attivo",pubblicato:false,configurazione:{coppie:[],rules:{numeroSquadre:posti,numeroGironi:Math.ceil(posti/4)}}};
        adminState.tornei.push(nuovoTorneo);
        adminState.torneoSelezionato=nuovoId;
        salvaAdminState();
        try{
            await sb.from("tornei").insert({id:nuovoId,nome,data,posti,descrizione,stato:"attivo",pubblicato:false,configurazione:nuovoTorneo.configurazione});
            renderAdmin();
            window.open(creaUrlBove(nuovoTorneo,true),"_blank");
        }catch(e){alert("Errore Supabase: "+e.message);}
    }
    window.creaNuovoTorneo=creaNuovoTorneo;

    function renderListaTornei(){
        const box=document.getElementById("listaTorneiAdmin");
        if(!box)return;
        if(!adminState.tornei.length){box.innerHTML='<p class="notice">Nessun torneo.</p>';return;}
        box.innerHTML=`<details class="month-group" open><summary>Tornei recenti</summary><div style="padding:10px;">`+
        adminState.tornei.map(t=>`
        <div class="tournament-row ${String(t.id)===String(adminState.torneoSelezionato)?"selected":""}">
            <div class="t-info">
                <strong>${escapeHtml(t.nome||"Torneo")}</strong>
                <small>${escapeHtml(t.data||"-")} · ${t.posti||8} squadre</small>
                <div class="status ${t.stato==="chiuso"?"closed":""}">● ${escapeHtml(t.stato||"bozza")}</div>
            </div>
            <div>
                <button class="desktop-btn" onclick="selezionaTorneoAdmin(${JSON.stringify(t.id)})">Gestisci</button>
            </div>
        </div>`).join("")+`</div></details>`;
    }

    function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
    window.escapeHtml=escapeHtml;

    async function selezionaTorneoAdmin(id){
        const torneo=adminState.tornei.find(t=>String(t.id)===String(id));
        if(!torneo)return;
        adminState.torneoSelezionato=torneo.id;
        salvaAdminState();
        document.getElementById("gestioneTorneoAdmin")?.classList.remove("hidden");
        await caricaRichiesteIscrizione();
        renderAdmin();
    }
    window.selezionaTorneoAdmin=selezionaTorneoAdmin;

    async function pubblicaTorneo(){
        const t=getTorneoAdminCorrente();
        if(!t)return;
        await sb.from("tornei").update({pubblicato:true,stato:"attivo"}).eq("id",t.id);
        t.pubblicato=true; t.stato="attivo";
        salvaAdminState(); renderAdmin(); alert("Pubblicato!");
    }
    window.pubblicaTorneo=pubblicaTorneo;

    async function chiudiIscrizioniTorneo(){
        const t=getTorneoAdminCorrente();
        if(!t)return;
        await sb.from("tornei").update({iscrizioni_chiuse:true}).eq("id",t.id);
        t.iscrizioni_chiuse=true;
        salvaAdminState(); renderAdmin(); alert("Iscrizioni chiuse.");
    }
    window.chiudiIscrizioniTorneo=chiudiIscrizioniTorneo;

    async function caricaRichiesteIscrizione(){
        const id=Number(adminState.torneoSelezionato);
        if(!Number.isFinite(id))return;
        try{
            const{data}=await sb.from("iscrizioni").select("*").eq("torneo_id",id);
            window.iscrizioniTorneo=Array.isArray(data)?data:[];
            renderGestioneTorneo();
            renderPartecipanti();
            renderCoppie();
        }catch(e){window.iscrizioniTorneo=[];}
    }
    window.caricaRichiesteIscrizione=caricaRichiesteIscrizione;

    function renderGestioneTorneo(){
        const box=document.getElementById("dettaglioTorneoAdmin");
        const t=getTorneoAdminCorrente();
        if(!box||!t)return;
        box.innerHTML=`<div class="lista-item"><b>${escapeHtml(t.nome)}</b><br><small>${t.data||"-"} · Posti: ${t.posti||8}</small></div>`;
        const req=document.getElementById("richiesteIscrizione");
        if(req){
            req.innerHTML=window.iscrizioniTorneo.length?window.iscrizioniTorneo.map(g=>`
            <div class="lista-item"><b>${escapeHtml(g.nome_giocatore||g.nome||"Giocatore")}</b> — <span class="status">${g.stato||"in attesa"}</span></div>`).join(""):'<p class="notice">Nessuna richiesta.</p>';
        }
    }
    window.renderGestioneTorneo=renderGestioneTorneo;

    function renderPartecipanti(){}
    function renderCoppie(){
        const box=document.getElementById("creaCoppieBox");
        if(box)box.innerHTML='<p class="notice">Gestione coppie attiva.</p>';
    }

    function apriBoveConTorneo(id){
        const t=getTorneoAdminCorrente()||adminState.tornei[0];
        if(!t){alert("Seleziona un torneo");return;}
        window.open(creaUrlBove(t,false),"_blank");
    }
    window.apriBoveConTorneo=apriBoveConTorneo;

    function renderAdmin(){
        renderListaTornei();
        renderGestioneTorneo();
        syncDashboard();
    }
    window.renderAdmin=renderAdmin;

    function syncDashboard(){
        const active=adminState.tornei.length;
        const statTornei=document.getElementById("statTornei");
        if(statTornei)statTornei.textContent=active;
        const email=document.getElementById("adminEmailMini");
        if(email)email.textContent=adminState.adminEmail||"Amministratore";
    }
    window.syncDashboard=syncDashboard;

    window.openWorkspace=function(sec){
        if(sec==="dashboard")return;
        document.getElementById(sec)?.scrollIntoView({behavior:"smooth"});
    };

    function wireDashboard(){
        document.getElementById("btnLoginAdmin")?.addEventListener("click",loginAdmin);
        document.getElementById("btnAggiorna")?.addEventListener("click",async()=>{
            await caricaTorneiSupabase();
            renderAdmin();
        });
        caricaAdminState();
        if(adminState.adminLoggato){
            document.getElementById("boxLoginAdmin")?.classList.add("hidden");
            document.getElementById("areaAdmin")?.classList.remove("hidden");
            caricaTorneiSupabase();
        }
        aggiornaGiocatoriAdmin();
        document.getElementById("adminPosti")?.addEventListener("change",aggiornaGiocatoriAdmin);
    }

    document.addEventListener("DOMContentLoaded",wireDashboard);
    })();
    </script>
</body>
</html>
