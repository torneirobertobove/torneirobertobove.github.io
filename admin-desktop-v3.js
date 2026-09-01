/* ADMIN DESKTOP V3 - compatibility/bootstrap loader V11 */
(function(){
  'use strict';
  var LINK_KEY='padel_admin_generated_link';
  function area(){return document.getElementById('areaAdmin');}
  function tournamentId(){var st=window.adminState;if(st&&st.torneoSelezionato!=null)return st.torneoSelezionato;if(st&&Array.isArray(st.tornei)&&st.tornei.length)return st.tornei[0].id;return null;}
  function buildLink(id){return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id));}
  function setLink(v){if(!v)return;['linkBoveGenerato','linkBoveGeneratoMirror'].forEach(function(id){var e=document.getElementById(id);if(e)e.value=v;});try{localStorage.setItem(LINK_KEY,v);sessionStorage.setItem(LINK_KEY,v)}catch(e){}}
  function ensureInteraction(){
    var style=document.getElementById('admin-v11-interaction-style');
    if(!style){style=document.createElement('style');style.id='admin-v11-interaction-style';style.textContent='#boxLoginAdmin.hidden{display:none!important;visibility:hidden!important;pointer-events:none!important}#areaAdmin.hidden{display:none!important}#areaAdmin:not(.hidden){display:flex!important;pointer-events:auto!important}#areaAdmin button,#areaAdmin a,#areaAdmin input,#areaAdmin select,#areaAdmin textarea,#areaAdmin summary{pointer-events:auto!important}';document.head.appendChild(style)}
    var login=document.getElementById('boxLoginAdmin');var app=area();
    if(app&&!app.classList.contains('hidden')&&login)login.style.pointerEvents='none';
  }
  function ensurePanels(){var a=area();if(!a)return;[['newsPanel','#org-page-news'],['sponsorPanel','#org-page-sponsor'],['listaIscrittiAdmin',null],['tabelloneAdmin',null]].forEach(function(x){var e=document.getElementById(x[0])||(x[1]&&a.querySelector(x[1]));if(e)e.id=x[0];else{e=document.createElement('div');e.id=x[0];e.hidden=true;a.appendChild(e)}});if(!a.querySelector('#adminCalendar,[data-admin-calendar],#calendarioAdmin,.admin-calendar')){var c=document.createElement('div');c.id='adminCalendar';c.hidden=true;a.appendChild(c)}}
  function installGlobals(){
    window.__adminRefresh=function(){if(typeof window.caricaTorneiSupabase==='function')return window.caricaTorneiSupabase();if(typeof window.renderAdmin==='function')return window.renderAdmin();return true};
    window.generaLinkBoveMirror=function(){var id=tournamentId();if(id==null){alert('Seleziona prima un torneo');return false}try{if(typeof window.generaLinkBove==='function')window.generaLinkBove()}catch(e){console.error(e)}setLink(buildLink(id));return true};
    window.__adminButtonAction=function(kind){var names={generate:['generaCoppieAdmin','generaCoppie','generaCoppieAutomatiche','generaSfide'],random:['accoppiaACaso','accoppiaCasualmente','generaCoppieCasuali','creaCoppieCasuali']};var list=names[kind]||[];for(var i=0;i<list.length;i++)if(typeof window[list[i]]==='function')return window[list[i]]();if(typeof window.openAdminPage==='function')return window.openAdminPage('coppie');return true};
  }
  function installHandlers(){
    var a=area();if(!a)return;ensureInteraction();ensurePanels();installGlobals();
    var login=document.getElementById('btnLoginAdmin');if(login&&!login.getAttribute('onclick'))login.setAttribute('onclick','window.loginAdmin&&window.loginAdmin()');
    var refresh=document.getElementById('btnAggiorna');if(refresh)refresh.setAttribute('onclick','window.__adminRefresh()');
    a.querySelectorAll('button').forEach(function(b){
      var text=String(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!b.getAttribute('onclick')){
        if(b.dataset.page==='configurazione'||/configurazione|impostazioni/.test(text))b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('config')");
        else if(b.dataset.page==='link'||/link pubblici/.test(text))b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('links')");
        else if(/nuovo torneo|crea torneo/.test(text))b.setAttribute('onclick','window.apriRegoleNuovoTorneo&&window.apriRegoleNuovoTorneo()');
        else if(/^genera link$/.test(text))b.setAttribute('onclick','window.generaLinkBoveMirror&&window.generaLinkBoveMirror()');
        else if(/^copia$/.test(text))b.setAttribute('onclick','window.copiaLinkBove&&window.copiaLinkBove()');
        else if(/gestisci le richieste/.test(text))b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('iscritti')");
        else if(/genera le sfide/.test(text))b.setAttribute('onclick',"window.__adminButtonAction('generate')");
        else if(/apri tabellone|visualizza il torneo/.test(text))b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('tabellone')");
        else if(/accoppia a caso/.test(text))b.setAttribute('onclick',"window.__adminButtonAction('random')");
      }
    });
    var mirror=document.getElementById('linkBoveGeneratoMirror');if(mirror&&!mirror.getAttribute('onclick'))mirror.setAttribute('onclick','window.generaLinkBoveMirror&&window.generaLinkBoveMirror()');
    var gen=document.getElementById('btnGeneraLinkBove');if(gen&&!gen.getAttribute('onclick'))gen.setAttribute('onclick','window.generaLinkBoveMirror&&window.generaLinkBoveMirror()');
    var id=tournamentId();if(id!=null){var v='';try{v=sessionStorage.getItem(LINK_KEY)||localStorage.getItem(LINK_KEY)||''}catch(e){}setLink(v||buildLink(id))}
  }
  function installNavigation(){var a=area();if(!a)return;a.querySelectorAll('.sidebar .nav button,[data-page="configurazione"],[data-page="link"]').forEach(function(b){var raw=String(b.dataset.page||b.dataset.orgPage||'').toLowerCase();if(raw==='configurazione'||/configurazione|impostazioni/i.test(b.textContent||'')){b.dataset.orgPage='config';b.dataset.internalPage='config';b.dataset.page='configurazione';b.setAttribute('data-legacy-page','configurazione');b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('config')")}else if(raw==='link'||/link pubblici/i.test(b.textContent||'')){b.dataset.orgPage='links';b.dataset.internalPage='links';b.dataset.page='link';b.setAttribute('data-legacy-page','link');b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('links')")}})}
  function boot(){ensureInteraction();ensurePanels();installGlobals();installNavigation();installHandlers();var root=document.body||document.documentElement;if(root&&!root.__adminV11Observer){root.__adminV11Observer=true;new MutationObserver(function(){ensureInteraction();installNavigation();installHandlers()}).observe(root,{childList:true,subtree:true})}if(!document.getElementById('admin-desktop-v4-loader')){var s=document.createElement('script');s.id='admin-desktop-v4-loader';s.src='admin-desktop-v4.js?v=14';s.async=false;document.head.appendChild(s)}if(!document.getElementById('admin-legacy-navigation-loader')){var n=document.createElement('script');n.id='admin-legacy-navigation-loader';n.src='admin-legacy-navigation.js?v=14';n.async=false;document.head.appendChild(n)}[100,500,1200,2500].forEach(function(ms){setTimeout(function(){ensureInteraction();installNavigation();installHandlers()},ms)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
